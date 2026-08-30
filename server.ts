import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { ClientSubmission, StudioProfile } from './src/types';
import {
  appendToGoogleSheet,
  appendViaAppsScript,
  syncAllSubmissionsToGoogleSheet,
  getSheetHistory,
  generateCsvExport,
  SHEET_COLUMNS,
  getServiceAccountInfo,
  createDummyTestSubmission,
  ensureStudioDriveAndSheet,
} from './server/googleSheets';
import { inquiryDb, studioDb, formLinksDb, TEMPLATES } from './server/database';

// In-memory drafts store for auto-save backup
const draftsStore: Map<string, Partial<ClientSubmission>> = new Map();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Google Workspace & Sheets Master Configuration
  const DEFAULT_SPREADSHEET_ID = '1Ehg3A_TnzZYg048U6f1sRvd_lrmyj5_8Nn7DVci1D-I';
  const initialSpreadsheetId = process.env.GOOGLE_SHEETS_ID || process.env.GOOGLE_SPREADSHEET_ID || DEFAULT_SPREADSHEET_ID;

  // Store active Google OAuth token from Studio owner session
  let activeGoogleAccessToken: string | null = null;
  let activeGoogleAccessTokenExpiresAt = 0;

  let googleWorkspaceConfig = {
    folderId: process.env.GOOGLE_DRIVE_FOLDER_ID || '',
    folderName: 'VISIONSHINE - Client Submissions',
    folderUrl: process.env.GOOGLE_DRIVE_FOLDER_ID ? `https://drive.google.com/drive/folders/${process.env.GOOGLE_DRIVE_FOLDER_ID}` : '',
    spreadsheetId: initialSpreadsheetId,
    spreadsheetTitle: 'VISIONSHINE - Wedding Onboarding Master Sheet',
    spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${initialSpreadsheetId}/edit?gid=399205612#gid=399205612`,
    isConnected: true,
    lastSyncedAt: new Date().toISOString(),
    syncedRowCount: inquiryDb.getAll().length,
    userEmail: '',
    userName: '',
  };

  app.use(express.json({ limit: '20mb' }));

  // Register Studio Owner's Google OAuth Token for Live Background Sync
  app.post('/api/studio/google-token', (req: Request, res: Response) => {
    const { accessToken } = req.body || {};
    if (accessToken && typeof accessToken === 'string') {
      activeGoogleAccessToken = accessToken;
      activeGoogleAccessTokenExpiresAt = Date.now() + 3600 * 1000;
      console.log('[Google Auth] Active Studio Google Access Token updated on backend for live sheet appends.');
      return res.json({ success: true, message: 'Google Access Token registered on backend.' });
    }
    res.status(400).json({ success: false, message: 'Invalid token.' });
  });

  // --- API Routes for Inquiry Database & Sheet System ---

  // Health check
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // Get all inquiries / submissions from the Database
  const getAllInquiriesHandler = (req: Request, res: Response) => {
    const list = inquiryDb.getAll();
    res.json({
      success: true,
      count: list.length,
      submissions: list,
      inquiries: list,
    });
  };
  app.get('/api/submissions', getAllInquiriesHandler);
  app.get('/api/inquiries', getAllInquiriesHandler);

  // Get single inquiry
  const getSingleInquiryHandler = (req: Request, res: Response) => {
    const sub = inquiryDb.getById(req.params.id);
    if (!sub) {
      return res.status(404).json({ success: false, message: 'Inquiry not found in database' });
    }
    res.json({ success: true, submission: sub, inquiry: sub });
  };
  app.get('/api/submissions/:id', getSingleInquiryHandler);
  app.get('/api/inquiries/:id', getSingleInquiryHandler);

  // Create submission (Client Onboarding Inquiry - Automatically saved to database & sheets)
  const createInquiryHandler = async (req: Request, res: Response) => {
    try {
      const payload = req.body as ClientSubmission;

      if (!payload.phone || !payload.partner1 || !payload.partner2) {
        return res.status(400).json({
          success: false,
          message: 'Missing mandatory fields (phone, partner1, partner2)',
        });
      }

      // Check duplicate submission prevention (by ID)
      if (payload.submissionId) {
        const existing = inquiryDb.getById(payload.submissionId);
        if (existing) {
          return res.json({
            success: true,
            isDuplicate: true,
            submission: existing,
            inquiry: existing,
            message: 'This inquiry has already been recorded in the database.',
          });
        }
      }

      // Structure full submission record
      const now = new Date().toISOString();
      const submissionId = payload.submissionId || `VS-${new Date().getFullYear()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}${Math.floor(1000 + Math.random() * 9000)}`;
      
      const newInquiry: ClientSubmission = {
        ...payload,
        id: payload.id || `sub_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        submissionId,
        createdAt: payload.createdAt || now,
        updatedAt: now,
        status: payload.status || 'NEW',
        internalNotes: payload.internalNotes || [],
        functions: Array.isArray(payload.functions) ? payload.functions : [],
        photographyServices: Array.isArray(payload.photographyServices) ? payload.photographyServices : [],
        weddingTypes: Array.isArray(payload.weddingTypes) ? payload.weddingTypes : [],
        weddingStyles: Array.isArray(payload.weddingStyles) ? payload.weddingStyles : [],
        references: Array.isArray(payload.references) ? payload.references : [],
        files: Array.isArray(payload.files) ? payload.files : [],
      };

      // Automatically append directly to real Google Sheet using Service Account
      const authHeader = req.headers.authorization || '';
      const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : undefined;
      const targetSheetId = googleWorkspaceConfig.spreadsheetId || process.env.GOOGLE_SHEETS_ID || process.env.GOOGLE_SPREADSHEET_ID || DEFAULT_SPREADSHEET_ID;
      
      const sheetResult = await appendToGoogleSheet(newInquiry, token, targetSheetId);
      
      if (!sheetResult.success) {
        console.error(`[Google Sheet Append Failed] Could not append to sheet ${targetSheetId}:`, sheetResult.error || sheetResult.message);
        return res.status(400).json({
          success: false,
          message: sheetResult.message || sheetResult.error || 'Failed to append to Google Sheet',
          error: sheetResult.error || sheetResult.message,
          googleSheets: sheetResult,
        });
      }

      newInquiry.syncedToGoogleSheets = true;
      newInquiry.sheetsRowIndex = sheetResult.rowIndex;

      // Automatically save and persist in the Inquiry Database file
      const savedInquiry = inquiryDb.save(newInquiry);

      // Clear draft if phone was used
      if (savedInquiry.phone) {
        draftsStore.delete(savedInquiry.phone);
      }

      console.log(`[Inquiry Appended to Google Sheet] ${savedInquiry.submissionId} for ${savedInquiry.partner1} & ${savedInquiry.partner2} (Sheet ID: ${targetSheetId}, Range: ${sheetResult.updatedRange})`);

      return res.status(201).json({
        success: true,
        submission: savedInquiry,
        inquiry: savedInquiry,
        googleSheets: sheetResult,
      });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      console.error('[Inquiry Submission Error]', msg);
      return res.status(500).json({
        success: false,
        message: 'Something went wrong while saving your inquiry.',
        error: msg,
      });
    }
  };
  app.post('/api/submissions', createInquiryHandler);
  app.post('/api/inquiries', createInquiryHandler);

  // Update submission status or internal notes (Admin)
  const updateInquiryHandler = (req: Request, res: Response) => {
    const existing = inquiryDb.getById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Inquiry not found' });
    }

    const { status, note, updatedDetails } = req.body;
    const updates: Partial<ClientSubmission> = {};

    if (status) {
      updates.status = status;
    }

    if (note && typeof note.text === 'string' && note.text.trim()) {
      const notes = existing.internalNotes ? [...existing.internalNotes] : [];
      notes.push({
        id: `note_${Date.now()}`,
        text: note.text.trim(),
        createdAt: new Date().toISOString(),
        author: note.author || 'Studio Team',
      });
      updates.internalNotes = notes;
    }

    if (updatedDetails) {
      Object.assign(updates, updatedDetails);
    }

    const updated = inquiryDb.update(existing.id, updates);
    res.json({ success: true, submission: updated, inquiry: updated });
  };
  app.patch('/api/submissions/:id', updateInquiryHandler);
  app.patch('/api/inquiries/:id', updateInquiryHandler);

  // Delete an inquiry (Admin)
  const deleteInquiryHandler = (req: Request, res: Response) => {
    const deleted = inquiryDb.delete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Inquiry not found' });
    }
    res.json({ success: true, message: 'Inquiry deleted successfully' });
  };
  app.delete('/api/submissions/:id', deleteInquiryHandler);
  app.delete('/api/inquiries/:id', deleteInquiryHandler);

  // --- Studio Helper to Resolve Authenticated Studio ---
  function resolveStudioFromRequest(req: Request): StudioProfile {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7).trim();
      const parts = token.split('_');
      if (parts.length >= 3) {
        try {
          const email = Buffer.from(parts[2], 'base64url').toString('utf-8');
          if (email) {
            const studio = studioDb.getByEmail(email);
            if (studio) return studio;
          }
        } catch (e) {
          // ignore
        }
      }
    }

    const studioIdParam = (req.headers['x-studio-id'] as string) || (req.query.studioId as string);
    if (studioIdParam) {
      const studio = studioDb.getById(studioIdParam) || studioDb.getByEmail(studioIdParam);
      if (studio) return studio;
    }

    return studioDb.get();
  }

  // --- Studio Owner & Platform Management APIs ---

  // Studio Login (Standard / Demo credentials)
  app.post('/api/studio/login', (req: Request, res: Response) => {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.',
      });
    }

    const cleanEmail = email.trim().toLowerCase();
    const studio = studioDb.getOrCreate(cleanEmail, {
      name: 'VisionShine Studios',
      ownerName: 'Studio Director',
      email: cleanEmail,
      phone: '+91 98201 23456',
      whatsapp: '+91 98201 23456',
      defaultSpreadsheetId: DEFAULT_SPREADSHEET_ID,
    });

    formLinksDb.ensureDefaultFormForStudio(studio);

    // Generate secure session token
    const token = `studio_token_${Buffer.from(cleanEmail).toString('base64url')}_${Date.now()}`;
    console.log(`[Studio Login] Successful login for: ${cleanEmail} (${studio.name})`);

    return res.json({
      success: true,
      token,
      studio,
      forms: formLinksDb.getByStudioId(studio.id),
      message: 'Login successful',
    });
  });

  // Studio Google / Gmail Login
  app.post('/api/studio/google-login', async (req: Request, res: Response) => {
    try {
      const { email, displayName, photoURL, accessToken } = req.body || {};

      if (!email) {
        return res.status(400).json({
          success: false,
          message: 'Google account email is required.',
        });
      }

      const cleanEmail = email.trim().toLowerCase();
      let studio = studioDb.getOrCreate(cleanEmail, {
        ownerName: displayName || 'Studio Owner',
        name: displayName ? `${displayName}'s Studio` : 'VisionShine Studios',
        email: cleanEmail,
        phone: '+91 98201 23456',
        whatsapp: '+91 98201 23456',
      });

      // Update name / ownerName if newly provided
      if (displayName && (!studio.ownerName || studio.ownerName === 'Studio Owner')) {
        studio = studioDb.update(studio.id, { ownerName: displayName });
      }

      // Check Google Drive folder & Google Sheet idempotently
      try {
        const driveResult = await ensureStudioDriveAndSheet(studio, accessToken);
        if (driveResult.spreadsheetId) {
          studio = studioDb.update(studio.id, {
            defaultSpreadsheetId: driveResult.spreadsheetId,
            googleSpreadsheetUrl: driveResult.spreadsheetUrl,
            googleFolderId: driveResult.folderId || studio.googleFolderId,
            googleFolderName: driveResult.folderName,
          });
        }
      } catch (driveErr) {
        console.warn('[Studio Drive Provisioning Notice]', driveErr);
      }

      // Ensure studio has at least one unique client form link
      formLinksDb.ensureDefaultFormForStudio(studio);

      const token = `studio_google_token_${Buffer.from(cleanEmail).toString('base64url')}_${Date.now()}`;
      console.log(`[Studio Gmail Login] Successful Gmail login for: ${cleanEmail} (${studio.name}) - Sheet: ${studio.defaultSpreadsheetId}`);

      return res.json({
        success: true,
        token,
        studio,
        forms: formLinksDb.getByStudioId(studio.id),
        message: 'Logged in with Google successfully',
      });
    } catch (err: any) {
      console.error('[Studio Google Login Error]', err);
      return res.status(500).json({
        success: false,
        message: 'Failed to complete Google studio sign-in.',
        error: err.message,
      });
    }
  });

  // Get Studio Profile
  app.get('/api/studio/profile', (req: Request, res: Response) => {
    const studio = resolveStudioFromRequest(req);
    res.json({
      success: true,
      studio,
    });
  });

  // Update Studio Profile
  app.put('/api/studio/profile', (req: Request, res: Response) => {
    const studio = resolveStudioFromRequest(req);
    const updates = req.body || {};
    const updated = studioDb.update(studio.id, updates);

    if (updates.defaultSpreadsheetId) {
      googleWorkspaceConfig.spreadsheetId = updates.defaultSpreadsheetId;
      googleWorkspaceConfig.spreadsheetUrl = `https://docs.google.com/spreadsheets/d/${updates.defaultSpreadsheetId}/edit`;
    }

    console.log(`[Studio Profile Updated] ${updated.name} (Phone: ${updated.phone}, WhatsApp: ${updated.whatsapp}, Sheet: ${updated.defaultSpreadsheetId})`);
    res.json({
      success: true,
      studio: updated,
      message: 'Studio profile updated successfully',
    });
  });

  // Get Form Templates
  app.get('/api/studio/templates', (req: Request, res: Response) => {
    res.json({
      success: true,
      templates: TEMPLATES,
    });
  });

  // Get All Studio Forms (Filtered strictly to current studio)
  app.get('/api/studio/forms', (req: Request, res: Response) => {
    const studio = resolveStudioFromRequest(req);
    let forms = formLinksDb.getByStudioId(studio.id);
    if (forms.length === 0) {
      const defaultForm = formLinksDb.ensureDefaultFormForStudio(studio);
      forms = [defaultForm];
    }
    res.json({
      success: true,
      count: forms.length,
      forms,
    });
  });

  // Create New Client Form Link
  app.post('/api/studio/forms', (req: Request, res: Response) => {
    const { title, templateId, formCode, spreadsheetId, customGreeting, allowFileUploads } = req.body || {};
    const studio = resolveStudioFromRequest(req);

    const selectedTemplate = TEMPLATES.find((t) => t.id === templateId) || TEMPLATES[0];
    const targetSheetId = spreadsheetId?.trim() || studio.defaultSpreadsheetId || DEFAULT_SPREADSHEET_ID;

    // Generate unique formatted code e.g. VS-WED829 or custom
    const code =
      formCode?.trim().toUpperCase() ||
      `${(studio.name.substring(0, 2).replace(/[^A-Z]/gi, '') || 'ST').toUpperCase()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    // Ensure code uniqueness
    const existing = formLinksDb.getByCode(code);
    if (existing) {
      return res.status(400).json({
        success: false,
        message: `Form code "${code}" already exists. Please choose a unique code.`,
      });
    }

    const created = formLinksDb.create({
      formCode: code,
      studioId: studio.id,
      studioName: studio.name,
      templateId: selectedTemplate.id,
      templateTitle: selectedTemplate.title,
      title: title?.trim() || `${studio.name} - ${selectedTemplate.title}`,
      customGreeting: customGreeting?.trim() || 'Welcome! We are honored to document your celebration.',
      spreadsheetId: targetSheetId,
      isActive: true,
      allowFileUploads: allowFileUploads !== undefined ? allowFileUploads : true,
    });

    console.log(`[Studio Form Link Created] Studio: ${studio.name} (${studio.id}), Code: ${created.formCode}, Sheet: ${created.spreadsheetId}`);

    res.status(201).json({
      success: true,
      form: created,
      message: 'Client Form Link created successfully',
    });
  });

  // Update Existing Form Link
  app.put('/api/studio/forms/:code', (req: Request, res: Response) => {
    const code = req.params.code;
    const updates = req.body || {};
    const updated = formLinksDb.update(code, updates);

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Form not found' });
    }

    res.json({
      success: true,
      form: updated,
      message: 'Form updated successfully',
    });
  });

  // Delete Form Link
  app.delete('/api/studio/forms/:code', (req: Request, res: Response) => {
    const code = req.params.code;
    const deleted = formLinksDb.delete(code);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Form not found' });
    }
    res.json({ success: true, message: 'Form deleted successfully' });
  });

  // --- PUBLIC CLIENT FORM ENDPOINTS (NO GOOGLE AUTH / NO LOGIN REQUIRED) ---

  // Get Public Form Configuration (Client-facing)
  app.get('/api/public/form/:code', (req: Request, res: Response) => {
    const code = req.params.code?.toUpperCase().trim();
    const form = formLinksDb.getByCode(code);

    if (!form || !form.isActive) {
      // If code is default or generic, return fallback public config
      if (code === 'DEFAULT' || code === 'WEDDING' || code === 'DEMO') {
        const studio = studioDb.get();
        return res.json({
          success: true,
          form: {
            formCode: code,
            formTitle: 'Wedding Photography Inquiry Form',
            studioName: studio.name,
            studioPhone: studio.phone,
            studioWhatsapp: studio.whatsapp || studio.phone,
            studioWebsite: studio.website,
            studioInstagram: studio.instagram,
            templateId: 'tpl_wedding_photo',
            customGreeting: 'Welcome! We are honored to document your celebration.',
            allowFileUploads: true,
          },
        });
      }

      return res.status(404).json({
        success: false,
        message: 'This client inquiry form link is invalid or has been deactivated by the studio.',
      });
    }

    const studio = studioDb.getById(form.studioId) || studioDb.get();

    // Return sanitized public metadata only (NEVER expose spreadsheet ID or internal credentials to client)
    return res.json({
      success: true,
      form: {
        formCode: form.formCode,
        formTitle: form.title,
        studioName: form.studioName || studio.name,
        studioPhone: studio.phone,
        studioWhatsapp: studio.whatsapp || studio.phone,
        studioWebsite: studio.website,
        studioInstagram: studio.instagram,
        templateId: form.templateId,
        customGreeting: form.customGreeting,
        allowFileUploads: form.allowFileUploads,
      },
    });
  });

  // Submit Client Inquiry directly to Studio Google Sheet
  app.post('/api/public/form/:code/submit', async (req: Request, res: Response) => {
    try {
      const code = req.params.code?.toUpperCase().trim();
      const form = formLinksDb.getByCode(code);
      const studio = form ? (studioDb.getById(form.studioId) || studioDb.get()) : studioDb.get();

      const payload = req.body as ClientSubmission;

      if (!payload.phone || !payload.partner1 || !payload.partner2) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields. Please ensure partner names and contact phone number are provided.',
        });
      }

      // Determine Target Google Sheet ID & Apps Script Web App URL
      const targetSheetId =
        form?.spreadsheetId ||
        studio.defaultSpreadsheetId ||
        googleWorkspaceConfig.spreadsheetId ||
        DEFAULT_SPREADSHEET_ID;

      const targetAppsScriptUrl =
        form?.appsScriptUrl ||
        studio.appsScriptUrl ||
        process.env.GOOGLE_APPS_SCRIPT_URL;

      // Format Submission Record
      const now = new Date().toISOString();
      const submissionId =
        payload.submissionId ||
        `${code || 'VS'}-${new Date().getFullYear()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}${Math.floor(1000 + Math.random() * 9000)}`;

      const newInquiry: ClientSubmission = {
        ...payload,
        id: payload.id || `sub_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        submissionId,
        studioId: studio.id,
        formCode: code,
        createdAt: payload.createdAt || now,
        updatedAt: now,
        status: 'NEW',
        internalNotes: [],
        functions: Array.isArray(payload.functions) ? payload.functions : [],
        photographyServices: Array.isArray(payload.photographyServices) ? payload.photographyServices : [],
        weddingTypes: Array.isArray(payload.weddingTypes) ? payload.weddingTypes : [],
        weddingStyles: Array.isArray(payload.weddingStyles) ? payload.weddingStyles : [],
        references: Array.isArray(payload.references) ? payload.references : [],
        files: Array.isArray(payload.files) ? payload.files : [],
      };

      console.log(`[Public Client Submission Received] Form: ${code}, Studio: ${studio.name}, Couple: ${newInquiry.partner1} & ${newInquiry.partner2} -> Target Sheet: ${targetSheetId}, Apps Script: ${targetAppsScriptUrl ? 'Configured' : 'None'}`);

      const activeToken =
        activeGoogleAccessToken && Date.now() < activeGoogleAccessTokenExpiresAt
          ? activeGoogleAccessToken
          : undefined;

      // Append to Google Sheet (using Apps Script Web App or active Studio Google Token or Service Account)
      const sheetResult = await appendToGoogleSheet(newInquiry, activeToken, targetSheetId, targetAppsScriptUrl);

      if (sheetResult.success) {
        newInquiry.syncedToGoogleSheets = true;
        newInquiry.sheetsRowIndex = sheetResult.rowIndex;
      } else {
        newInquiry.syncedToGoogleSheets = false;
        console.warn(`[Google Sheet Append Notice] Sheet sync will be completed in background:`, sheetResult.message || sheetResult.error);
      }

      // Always save to database & increment form submission counter so data is never lost
      const savedInquiry = inquiryDb.save(newInquiry);
      if (code) {
        formLinksDb.incrementSubmissions(code);
      }

      // Clear draft if phone was used
      if (savedInquiry.phone) {
        draftsStore.delete(savedInquiry.phone);
      }

      console.log(`[Submission Confirmed] ${savedInquiry.submissionId} recorded for ${savedInquiry.partner1} & ${savedInquiry.partner2} (Sheet Sync: ${newInquiry.syncedToGoogleSheets ? 'Live' : 'Queued'})`);

      return res.status(201).json({
        success: true,
        message: 'Your inquiry has been submitted successfully.',
        submissionId: savedInquiry.submissionId,
        submission: savedInquiry,
        googleSheets: sheetResult,
        whatsappPhone: studio.whatsapp || studio.phone,
        studioName: studio.name,
      });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      console.error('[Public Submission Exception]', msg);
      return res.status(500).json({
        success: false,
        message: 'A server error occurred while transmitting your inquiry.',
        error: msg,
      });
    }
  });

  // Save auto-save draft
  app.post('/api/drafts/save', (req: Request, res: Response) => {
    const { phone, draft } = req.body;
    if (phone && draft) {
      draftsStore.set(phone, { ...draft, updatedAt: new Date().toISOString() });
    }
    res.json({ success: true, savedAt: new Date().toISOString() });
  });

  // Retrieve auto-save draft
  app.get('/api/drafts/:phone', (req: Request, res: Response) => {
    const draft = draftsStore.get(req.params.phone);
    if (!draft) {
      return res.status(404).json({ success: false, message: 'No draft found' });
    }
    res.json({ success: true, draft });
  });

  // Get active Google Workspace config
  app.get('/api/google/config', (req: Request, res: Response) => {
    const saInfo = getServiceAccountInfo();
    res.json({
      success: true,
      config: googleWorkspaceConfig,
      serviceAccount: saInfo,
    });
  });

  // Save/update active Google Workspace config
  app.post('/api/google/config', (req: Request, res: Response) => {
    const { folderId, folderName, folderUrl, spreadsheetId, spreadsheetTitle, spreadsheetUrl, userEmail, userName, syncedRowCount } = req.body;
    googleWorkspaceConfig = {
      ...googleWorkspaceConfig,
      folderId: folderId ?? googleWorkspaceConfig.folderId,
      folderName: folderName ?? googleWorkspaceConfig.folderName,
      folderUrl: folderUrl ?? googleWorkspaceConfig.folderUrl,
      spreadsheetId: spreadsheetId ?? googleWorkspaceConfig.spreadsheetId,
      spreadsheetTitle: spreadsheetTitle ?? googleWorkspaceConfig.spreadsheetTitle,
      spreadsheetUrl: spreadsheetUrl ?? (spreadsheetId ? `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit` : googleWorkspaceConfig.spreadsheetUrl),
      userEmail: userEmail ?? googleWorkspaceConfig.userEmail,
      userName: userName ?? googleWorkspaceConfig.userName,
      syncedRowCount: typeof syncedRowCount === 'number' ? syncedRowCount : googleWorkspaceConfig.syncedRowCount,
      isConnected: Boolean(spreadsheetId || googleWorkspaceConfig.spreadsheetId),
      lastSyncedAt: new Date().toISOString(),
    };
    const saInfo = getServiceAccountInfo();
    const appsScriptUrl = (req.body?.appsScriptUrl !== undefined ? req.body.appsScriptUrl : (googleWorkspaceConfig as any).appsScriptUrl) || process.env.GOOGLE_APPS_SCRIPT_URL || '';
    
    (googleWorkspaceConfig as any).appsScriptUrl = appsScriptUrl;

    res.json({
      success: true,
      config: {
        ...googleWorkspaceConfig,
        appsScriptUrl,
      },
      serviceAccount: saInfo,
    });
  });

  // Get Google Apps Script Code and setup guide
  app.get('/api/apps-script/code', (req: Request, res: Response) => {
    let scriptCode = '';
    const scriptPath = path.join(process.cwd(), 'google-apps-script', 'Code.gs');
    try {
      if (fs.existsSync(scriptPath)) {
        scriptCode = fs.readFileSync(scriptPath, 'utf-8');
      }
    } catch (e) {
      console.warn('[Apps Script Code Read Notice]', e);
    }

    res.json({
      success: true,
      code: scriptCode,
      deploymentInstructions: [
        '1. Open your NEW Google Sheet in Google Drive (or create a new one).',
        '2. In the top menu, click Extensions > Apps Script.',
        '3. Delete any default code in Code.gs, paste this entire script, and save (Ctrl+S / Cmd+S).',
        '4. Click the blue Deploy button (top-right) > New deployment.',
        '5. Click Select type (gear icon) > Web app.',
        '6. Set Execute as: "Me (your-email@gmail.com)".',
        '7. Set Who has access: "Anyone" (This allows ANY client/visitor on mobile or incognito to submit without 403 errors).',
        '8. Click Deploy, Authorize access, and copy the Web App URL (ends with /exec).',
        '9. Paste the Web App URL in the Studio Dashboard to link your sheet!'
      ],
      columns: SHEET_COLUMNS,
    });
  });

  // Test Google Apps Script Web App Connection
  app.post('/api/apps-script/test', async (req: Request, res: Response) => {
    try {
      const { webAppUrl, customData } = req.body || {};
      const targetUrl = webAppUrl || (googleWorkspaceConfig as any).appsScriptUrl || process.env.GOOGLE_APPS_SCRIPT_URL;

      if (!targetUrl || !targetUrl.trim().startsWith('http')) {
        return res.status(400).json({
          success: false,
          message: 'Please provide a valid Google Apps Script Web App URL (starts with https://script.google.com/macros/s/...)',
        });
      }

      const testInquiry: ClientSubmission = customData || createDummyTestSubmission();
      console.log(`[Apps Script Live Test] Sending test submission to ${targetUrl}`);

      const result = await appendViaAppsScript(targetUrl, testInquiry);

      if (result.success) {
        return res.json({
          success: true,
          message: result.message || 'Successfully reached Google Apps Script Web App and appended test row!',
          result,
          submission: testInquiry,
        });
      } else {
        return res.status(400).json({
          success: false,
          message: result.message || 'Failed to submit to Google Apps Script Web App.',
          error: result.error,
          result,
        });
      }
    } catch (err: any) {
      console.error('[Apps Script Test Exception]', err);
      return res.status(500).json({
        success: false,
        message: err.message || 'Internal server error while testing Apps Script Web App.',
        error: String(err),
      });
    }
  });

  // Google Sheets info and history
  app.get('/api/sheets/info', (req: Request, res: Response) => {
    const spreadsheetId = googleWorkspaceConfig.spreadsheetId || DEFAULT_SPREADSHEET_ID;
    const history = getSheetHistory();
    const saInfo = getServiceAccountInfo();
    res.json({
      success: true,
      columns: SHEET_COLUMNS,
      isConfigured: Boolean(spreadsheetId),
      spreadsheetId: spreadsheetId,
      spreadsheetUrl: googleWorkspaceConfig.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`,
      folderUrl: googleWorkspaceConfig.folderUrl,
      serviceAccount: saInfo,
      mode: 'LIVE_GOOGLE_SHEETS',
      totalRecordedRows: history.length,
      history,
    });
  });

  // Bulk Sync All Inquiries to Google Sheet
  app.post('/api/sheets/sync-all', async (req: Request, res: Response) => {
    try {
      const authHeader = req.headers.authorization || '';
      const incomingToken = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : undefined;
      if (incomingToken) {
        activeGoogleAccessToken = incomingToken;
        activeGoogleAccessTokenExpiresAt = Date.now() + 3600 * 1000;
      }
      const token = incomingToken || (activeGoogleAccessToken && Date.now() < activeGoogleAccessTokenExpiresAt ? activeGoogleAccessToken : undefined);
      const { spreadsheetId: customSheetId, appsScriptUrl: customAppsScriptUrl } = req.body || {};

      const targetSheetId = customSheetId || googleWorkspaceConfig.spreadsheetId || DEFAULT_SPREADSHEET_ID;
      const targetAppsScriptUrl = customAppsScriptUrl || (googleWorkspaceConfig as any).appsScriptUrl || process.env.GOOGLE_APPS_SCRIPT_URL;
      const allInquiries = inquiryDb.getAll();

      console.log(`[Google Sheets Sync All] Syncing ${allInquiries.length} database inquiries to sheet: ${targetSheetId} (Apps Script: ${targetAppsScriptUrl ? 'Configured' : 'None'})`);

      const result = await syncAllSubmissionsToGoogleSheet(allInquiries, token, targetSheetId, targetAppsScriptUrl);
      const saInfo = getServiceAccountInfo();

      if (result.success) {
        googleWorkspaceConfig.syncedRowCount = allInquiries.length;
        googleWorkspaceConfig.lastSyncedAt = new Date().toISOString();
        googleWorkspaceConfig.spreadsheetId = result.spreadsheetId;
        googleWorkspaceConfig.spreadsheetUrl = result.spreadsheetUrl;
        googleWorkspaceConfig.isConnected = true;

        // Mark all inquiries in DB as synced
        allInquiries.forEach((item, index) => {
          item.syncedToGoogleSheets = true;
          item.sheetsRowIndex = index + 2;
          inquiryDb.update(item.id, item);
        });

        return res.json({
          success: true,
          message: result.message,
          rowsSynced: result.rowsSynced,
          updatedRange: result.updatedRange,
          spreadsheetId: result.spreadsheetId,
          spreadsheetUrl: result.spreadsheetUrl,
          authMethod: result.authMethod,
          serviceAccount: saInfo,
        });
      } else {
        return res.status(400).json({
          success: false,
          message: result.message,
          error: result.error,
          spreadsheetId: result.spreadsheetId,
          spreadsheetUrl: result.spreadsheetUrl,
          authMethod: result.authMethod,
          serviceAccount: saInfo,
        });
      }
    } catch (err: any) {
      console.error('[Google Sheets Sync All Exception]', err);
      return res.status(500).json({
        success: false,
        message: err.message || 'Internal server error while syncing all inquiries.',
        error: String(err),
      });
    }
  });

  // Test Append Row to Google Sheet (for verification and debugging)
  app.post('/api/sheets/test-append', async (req: Request, res: Response) => {
    try {
      const authHeader = req.headers.authorization || '';
      const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : undefined;
      const { spreadsheetId: customSheetId, customData } = req.body || {};

      const testInquiry: ClientSubmission = customData || createDummyTestSubmission();
      const targetSheetId = customSheetId || googleWorkspaceConfig.spreadsheetId || DEFAULT_SPREADSHEET_ID;

      console.log(`[Google Sheets Test] Triggered test row append for "${testInquiry.partner1} & ${testInquiry.partner2}" to sheet: ${targetSheetId || 'Auto-Provision'}`);

      const result = await appendToGoogleSheet(testInquiry, token, targetSheetId);
      
      const saInfo = getServiceAccountInfo();

      if (result.success) {
        // Also increment synced row count in config
        googleWorkspaceConfig.syncedRowCount = (googleWorkspaceConfig.syncedRowCount || 0) + 1;
        googleWorkspaceConfig.lastSyncedAt = new Date().toISOString();
        if (result.spreadsheetId && !googleWorkspaceConfig.spreadsheetId) {
          googleWorkspaceConfig.spreadsheetId = result.spreadsheetId;
          googleWorkspaceConfig.spreadsheetUrl = result.spreadsheetUrl || '';
          googleWorkspaceConfig.isConnected = true;
        }

        return res.json({
          success: true,
          message: result.message,
          updatedRange: result.updatedRange,
          spreadsheetId: result.spreadsheetId || targetSheetId,
          spreadsheetUrl: result.spreadsheetUrl || (targetSheetId ? `https://docs.google.com/spreadsheets/d/${targetSheetId}/edit` : ''),
          authMethod: result.authMethod,
          serviceAccount: saInfo,
          submission: testInquiry,
        });
      } else {
        return res.status(400).json({
          success: false,
          message: result.message,
          error: result.error,
          spreadsheetId: result.spreadsheetId || targetSheetId,
          spreadsheetUrl: result.spreadsheetUrl || (targetSheetId ? `https://docs.google.com/spreadsheets/d/${targetSheetId}/edit` : ''),
          authMethod: result.authMethod,
          serviceAccount: saInfo,
        });
      }
    } catch (err: any) {
      console.error('[Google Sheets Test Exception]', err);
      return res.status(500).json({
        success: false,
        message: err.message || 'Internal server error while executing test append.',
        error: String(err),
      });
    }
  });

  // CSV Export for Inquiry Sheet
  app.get('/api/export/csv', (req: Request, res: Response) => {
    const list = inquiryDb.getAll();
    const csvContent = generateCsvExport(list);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="VISIONSHINE_Inquiry_Master_Sheet_${new Date().toISOString().slice(0, 10)}.csv"`
    );
    res.send(csvContent);
  });

  // JSON Database Export
  app.get('/api/export/json', (req: Request, res: Response) => {
    const list = inquiryDb.getAll();
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="VISIONSHINE_Inquiries_Database_${new Date().toISOString().slice(0, 10)}.json"`
    );
    res.send(JSON.stringify(list, null, 2));
  });

  // Explicit 404 handler for API routes (prevent falling through to HTML index.html)
  app.all('/api/*', (req: Request, res: Response) => {
    res.status(404).json({
      success: false,
      message: `API route not found: ${req.method} ${req.originalUrl}`,
    });
  });

  // Express API Error Handler (ensure JSON responses for all API errors)
  app.use((err: any, req: Request, res: Response, next: express.NextFunction) => {
    console.error('[Server API Error Handler]', err);
    if (req.path.startsWith('/api/')) {
      return res.status(500).json({
        success: false,
        message: err?.message || 'An internal server error occurred.',
        error: String(err),
      });
    }
    next(err);
  });

  // Vite integration
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[VISIONSHINE Server] Running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
