import { ClientSubmission, StudioProfile } from '../src/types';
import crypto from 'crypto';

export const SHEET_COLUMNS = [
  'Submission ID',
  'Submission Date & Time',
  'Phone / WhatsApp',
  'Email',
  'Partner 1 Name',
  'Partner 2 Name',
  'Full Couple Name',
  'Traditions / Wedding Types',
  'Wedding Styles',
  'Destination / City',
  'Main Venue',
  'Total Guests',
  'Selected Functions Count',
  'Functions Summary (Name, Date, Time, Venue, Guests)',
  'Function Dates',
  'Function Timings / Time Slots',
  'Function Venues',
  'Function Guest Counts',
  'Selected Photography & Cinema Services',
  'Special Moments & Traditions',
  'Photography Preferences & Visual Style',
  'Discovery Source',
  'Instagram Handle',
  'Planner Name & Contact',
  'Reference Links / Moodboards',
  'Uploaded Files',
  'Additional Information',
  'Status',
];

export interface ServiceAccountInfo {
  isConfigured: boolean;
  clientEmail?: string;
  projectId?: string;
  configuredVia: 'GOOGLE_SERVICE_ACCOUNT' | 'SERVICE_ACCOUNT_KEY' | 'NONE';
}

let cachedServiceAccountToken: { token: string; expiresAt: number; clientEmail: string } | null = null;

/**
 * Safely parse JSON from fetch Response without throwing SyntaxError on HTML error pages
 */
async function safeResponseJson<T = any>(res: any): Promise<T | null> {
  try {
    const text = await res.text();
    if (!text || !text.trim()) return null;
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

/**
 * Get Service Account credentials and metadata from environment variables
 */
export function getServiceAccountInfo(): ServiceAccountInfo {
  const saEnv = process.env.GOOGLE_SERVICE_ACCOUNT || process.env.SERVICE_ACCOUNT_KEY || process.env.GOOGLE_CREDENTIALS;
  if (!saEnv) {
    return {
      isConfigured: false,
      configuredVia: 'NONE',
    };
  }

  try {
    const sa = typeof saEnv === 'string' && saEnv.trim().startsWith('{') ? JSON.parse(saEnv) : null;
    if (sa && sa.client_email) {
      return {
        isConfigured: true,
        clientEmail: sa.client_email,
        projectId: sa.project_id,
        configuredVia: process.env.GOOGLE_SERVICE_ACCOUNT ? 'GOOGLE_SERVICE_ACCOUNT' : 'SERVICE_ACCOUNT_KEY',
      };
    }
  } catch (e) {
    console.warn('[Google Sheets] Could not parse Service Account JSON', e);
  }

  return {
    isConfigured: false,
    configuredVia: 'NONE',
  };
}

/**
 * Obtain an OAuth2 access token for Google Sheets API using Service Account JWT assertion (RS256)
 */
export async function getServiceAccountAccessToken(): Promise<{ token: string; clientEmail: string } | null> {
  const saEnv = process.env.GOOGLE_SERVICE_ACCOUNT || process.env.SERVICE_ACCOUNT_KEY || process.env.GOOGLE_CREDENTIALS;
  if (!saEnv) return null;

  try {
    const sa = typeof saEnv === 'string' && saEnv.trim().startsWith('{') ? JSON.parse(saEnv) : null;
    if (!sa || !sa.client_email || !sa.private_key) {
      console.warn('[Google Sheets] Service account credentials missing client_email or private_key.');
      return null;
    }

    const now = Math.floor(Date.now() / 1000);
    // Reuse cached token if valid for more than 2 minutes
    if (cachedServiceAccountToken && cachedServiceAccountToken.expiresAt > now + 120) {
      return {
        token: cachedServiceAccountToken.token,
        clientEmail: cachedServiceAccountToken.clientEmail,
      };
    }

    const header = { alg: 'RS256', typ: 'JWT' };
    const claim = {
      iss: sa.client_email,
      scope: 'https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/drive',
      aud: 'https://oauth2.googleapis.com/token',
      exp: now + 3600,
      iat: now,
    };

    const base64Header = Buffer.from(JSON.stringify(header)).toString('base64url');
    const base64Claim = Buffer.from(JSON.stringify(claim)).toString('base64url');
    const signInput = `${base64Header}.${base64Claim}`;

    const formattedPrivateKey = sa.private_key.includes('\\n')
      ? sa.private_key.replace(/\\n/g, '\n')
      : sa.private_key;

    const signer = crypto.createSign('RSA-SHA256');
    signer.update(signInput);
    const signature = signer.sign(formattedPrivateKey, 'base64url');
    const jwt = `${signInput}.${signature}`;

    console.log(`[Google Sheets Auth] Requesting access token for Service Account: ${sa.client_email}`);

    const res = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion: jwt,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error(`[Google Sheets Auth] Service Account token exchange failed with HTTP ${res.status}:`, errText);
      throw new Error(`Google Service Account Token Exchange failed (${res.status}): ${errText}`);
    }

    const data = await safeResponseJson(res);
    if (!data || !data.access_token) {
      throw new Error('Google Service Account Token Exchange returned invalid response');
    }
    cachedServiceAccountToken = {
      token: data.access_token,
      expiresAt: now + (data.expires_in || 3600),
      clientEmail: sa.client_email,
    };

    console.log(`[Google Sheets Auth] Successfully obtained Service Account access token (expires in ${data.expires_in || 3600}s)`);
    return { token: data.access_token, clientEmail: sa.client_email };
  } catch (err: any) {
    console.error('[Google Sheets Auth] Service Account Error:', err.message);
    throw err;
  }
}

export function formatSubmissionToSheetRow(sub: ClientSubmission): (string | number)[] {
  const formattedDate = new Date(sub.createdAt).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const fullPhone = `${sub.countryCode || '+91'} ${sub.phone}`.trim();
  const coupleName =
    sub.partner1 && sub.partner2
      ? `${sub.partner1} & ${sub.partner2}`
      : sub.partner1 || sub.partner2 || 'N/A';

  const weddingTypesStr = [
    ...(sub.weddingTypes || []),
    sub.weddingTypeOther ? `Other (${sub.weddingTypeOther})` : '',
  ]
    .filter(Boolean)
    .join(', ');

  const weddingStylesStr = [
    ...(sub.weddingStyles || []),
    sub.weddingStyleOther ? `Other (${sub.weddingStyleOther})` : '',
  ]
    .filter(Boolean)
    .join(', ');

  // Formatted Functions readable strings
  const functionsSummary = (sub.functions || [])
    .map((f, i) => {
      const time = f.timeSlot === 'Custom' && f.customTime ? f.customTime : f.timeSlot;
      const venue = f.venue || sub.mainVenue || 'TBD';
      const guests = f.guestCount ? `${f.guestCount} guests` : `${sub.guestCount || 'TBD'} guests`;
      return `[${i + 1}] ${f.name} — Date: ${f.date || 'Date TBD'} — Time: ${time} — Venue: ${venue} — Scale: ${guests}`;
    })
    .join(' | \n');

  const functionDates = (sub.functions || []).map((f) => `${f.name}: ${f.date || 'TBD'}`).join(', ');
  const functionTimings = (sub.functions || [])
    .map((f) => `${f.name}: ${f.timeSlot === 'Custom' ? f.customTime || 'Custom' : f.timeSlot}`)
    .join(', ');
  const functionVenues = (sub.functions || []).map((f) => `${f.name}: ${f.venue || sub.mainVenue || 'TBD'}`).join(', ');
  const functionGuestCounts = (sub.functions || [])
    .map((f) => `${f.name}: ${f.guestCount || sub.guestCount || 'TBD'}`)
    .join(', ');

  const photoServices = [
    ...(sub.photographyServices || []),
    sub.photographyOther ? `Custom: ${sub.photographyOther}` : '',
  ]
    .filter(Boolean)
    .join(', ');

  const refLinks = (sub.references || [])
    .map((r) => `[${r.platform}] ${r.url}${r.description ? ` (${r.description})` : ''}`)
    .join('\n');

  const fileLinks = (sub.files || []).map((f) => `${f.name} (${(f.size / (1024 * 1024)).toFixed(2)} MB)`).join('\n');

  const plannerContact = [
    sub.plannerName,
    sub.plannerPhone ? `(${sub.plannerPhone})` : '',
  ].filter(Boolean).join(' ');

  return [
    sub.submissionId,
    formattedDate,
    fullPhone,
    sub.email || 'N/A',
    sub.partner1,
    sub.partner2,
    coupleName,
    weddingTypesStr || 'None selected',
    weddingStylesStr || 'None selected',
    sub.city || 'TBD',
    sub.mainVenue || 'TBD',
    String(sub.guestCount || 'TBD'),
    (sub.functions || []).length,
    functionsSummary || 'No functions documented',
    functionDates || 'TBD',
    functionTimings || 'TBD',
    functionVenues || 'TBD',
    functionGuestCounts || 'TBD',
    photoServices || 'None selected',
    sub.specialMoments || 'None specified',
    sub.photographyPreferences || 'None specified',
    sub.discoverySource + (sub.discoverySourceOther ? ` (${sub.discoverySourceOther})` : ''),
    sub.instagramHandle || 'N/A',
    plannerContact || 'N/A',
    refLinks || 'None provided',
    fileLinks || 'None attached',
    sub.additionalInformation || 'None',
    sub.status || 'NEW',
  ];
}

export interface AppendResult {
  success: boolean;
  rowIndex?: number;
  updatedRange?: string;
  spreadsheetId?: string;
  spreadsheetUrl?: string;
  message: string;
  error?: string;
  authMethod?: 'APPS_SCRIPT_WEB_APP' | 'USER_OAUTH' | 'SERVICE_ACCOUNT' | 'LOCAL_PERSISTENCE' | 'NONE';
  serviceAccountEmail?: string;
}

/**
 * Append submission directly to Google Apps Script Web App (Public / 0 Permission Issues)
 */
export async function appendViaAppsScript(
  webAppUrl: string,
  submission: ClientSubmission
): Promise<AppendResult> {
  const cleanUrl = webAppUrl.trim();
  console.log(`[Google Apps Script] Sending submission ${submission.submissionId} to Web App: ${cleanUrl}`);

  try {
    const res = await fetch(cleanUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(submission),
      redirect: 'follow',
    });

    const text = await res.text();
    let data: any = {};
    try {
      data = JSON.parse(text);
    } catch {
      // In case of plain text or HTML redirect
    }

    if (res.ok && data.success !== false && data.status !== 'error') {
      const rowIndex = data.rowIndex || data.row;
      const sheetUrl = data.spreadsheetUrl;
      const sheetId = data.spreadsheetId;

      return {
        success: true,
        rowIndex,
        spreadsheetId: sheetId,
        spreadsheetUrl: sheetUrl,
        authMethod: 'APPS_SCRIPT_WEB_APP',
        message: `Successfully appended row for ${submission.partner1} & ${submission.partner2} to Google Sheet via Web App.`,
      };
    } else {
      const errMsg = data.message || `Apps Script returned HTTP ${res.status}: ${text.slice(0, 200)}`;
      return {
        success: false,
        authMethod: 'APPS_SCRIPT_WEB_APP',
        message: errMsg,
        error: errMsg,
      };
    }
  } catch (err: any) {
    const errMsg = err?.message || String(err);
    console.error('[Google Apps Script Exception]', errMsg);
    return {
      success: false,
      authMethod: 'APPS_SCRIPT_WEB_APP',
      message: `Failed to connect to Google Apps Script Web App: ${errMsg}`,
      error: errMsg,
    };
  }
}

/**
 * Append submission row directly to Google Sheets via Google Apps Script Web App or Sheets API (v4)
 */
export async function appendToGoogleSheet(
  submission: ClientSubmission,
  userAccessToken?: string,
  customSpreadsheetId?: string,
  customAppsScriptUrl?: string
): Promise<AppendResult> {
  const rowData = formatSubmissionToSheetRow(submission);
  const appsScriptUrl = customAppsScriptUrl || process.env.GOOGLE_APPS_SCRIPT_URL;

  // 1. If Google Apps Script Web App URL is provided, try it first
  if (appsScriptUrl && appsScriptUrl.trim().startsWith('http')) {
    const appsResult = await appendViaAppsScript(appsScriptUrl, submission);
    if (appsResult.success) {
      sheetHistoryRecords.unshift({
        rowIndex: appsResult.rowIndex || sheetHistoryRecords.length + 1,
        submissionId: submission.submissionId,
        timestamp: new Date().toISOString(),
        rowData,
        status: 'SUCCESS',
      });
      return appsResult;
    } else {
      console.warn('[Apps Script Notice] Web App response was not successful, trying direct Sheets API fallback:', appsResult.error);
    }
  }

  const DEFAULT_SHEET_ID = '1Ehg3A_TnzZYg048U6f1sRvd_lrmyj5_8Nn7DVci1D-I';
  let spreadsheetId =
    customSpreadsheetId ||
    process.env.GOOGLE_SHEETS_ID ||
    process.env.GOOGLE_SPREADSHEET_ID ||
    DEFAULT_SHEET_ID;

  let activeToken = userAccessToken;
  let authMethod: 'APPS_SCRIPT_WEB_APP' | 'USER_OAUTH' | 'SERVICE_ACCOUNT' | 'LOCAL_PERSISTENCE' | 'NONE' = userAccessToken ? 'USER_OAUTH' : 'NONE';
  let saEmail: string | undefined;

  // Always prefer Service Account for backend-only integration
  try {
    const saAuth = await getServiceAccountAccessToken();
    if (saAuth) {
      activeToken = saAuth.token;
      authMethod = 'SERVICE_ACCOUNT';
      saEmail = saAuth.clientEmail;
    }
  } catch (saErr: any) {
    console.warn('[Google Sheets Auth] Could not authenticate with Service Account:', saErr.message);
  }

  console.log(`[Google Sheets Append] Attempting to append submission ${submission.submissionId} using authMethod: ${authMethod} (Sheet ID: ${spreadsheetId || 'None'})`);

  if (activeToken) {
    try {
      let targetSheetId = spreadsheetId;
      let targetTabTitle = 'Client Submissions';

      // 1. Inspect existing spreadsheet metadata to find the exact tab (e.g. gid=399205612 or first sheet)
      if (targetSheetId) {
        try {
          const metaRes = await fetch(
            `https://sheets.googleapis.com/v4/spreadsheets/${targetSheetId}?fields=sheets.properties`,
            {
              headers: { Authorization: `Bearer ${activeToken}` },
            }
          );
          if (metaRes.ok) {
            const metaData = await safeResponseJson(metaRes);
            const sheets = metaData?.sheets || [];
            if (sheets.length > 0) {
              const matchingSheet =
                sheets.find((s: any) => s.properties?.sheetId === 399205612) ||
                sheets.find((s: any) => s.properties?.title === 'Client Submissions') ||
                sheets[0];
              if (matchingSheet?.properties?.title) {
                targetTabTitle = matchingSheet.properties.title;
              }
            }
          }
        } catch (metaErr) {
          console.warn('[Google Sheets Meta Lookup Warning]', metaErr);
        }
      }

      // If no spreadsheet ID exists yet, automatically create or locate the dedicated Google Drive folder and Master Sheet
      if (!targetSheetId) {
        console.log('[Google Drive & Sheets] No GOOGLE_SHEETS_ID configured. Provisioning dedicated Drive folder and Master Sheet...');
        let folderId: string | undefined;
        try {
          // 1. Check if folder already exists in Google Drive
          const searchFolderRes = await fetch(
            `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent("name = 'VISIONSHINE - Wedding Inquiries & Onboarding' and mimeType = 'application/vnd.google-apps.folder' and trashed = false")}&fields=files(id,name)`,
            {
              headers: {
                Authorization: `Bearer ${activeToken}`,
              },
            }
          );
          if (searchFolderRes.ok) {
            const folderList = await safeResponseJson(searchFolderRes);
            if (folderList?.files && folderList.files.length > 0) {
              folderId = folderList.files[0].id;
              console.log(`[Google Drive] Found existing folder: ${folderId}`);
            }
          }

          // 2. If folder doesn't exist, create it in Google Drive
          if (!folderId) {
            const createFolderRes = await fetch('https://www.googleapis.com/drive/v3/files', {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${activeToken}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                name: 'VISIONSHINE - Wedding Inquiries & Onboarding',
                mimeType: 'application/vnd.google-apps.folder',
                description: 'Master storage for fine art wedding client onboarding and inquiries.',
              }),
            });

            if (createFolderRes.ok) {
              const newFolder = await safeResponseJson(createFolderRes);
              folderId = newFolder?.id;
              console.log(`[Google Drive] Created folder: ${folderId}`);
            }
          }
        } catch (driveErr) {
          console.warn('[Google Drive] Folder search/creation notice:', driveErr);
        }

        // 3. Create the Spreadsheet in Google Sheets
        const createRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${activeToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            properties: {
              title: 'VISIONSHINE - Wedding Onboarding Master Sheet',
            },
            sheets: [
              {
                properties: {
                  title: 'Client Submissions',
                  gridProperties: {
                    frozenRowCount: 1,
                  },
                },
              },
            ],
          }),
        });

        if (createRes.ok) {
          const sheetData = await safeResponseJson(createRes);
          targetSheetId = sheetData?.spreadsheetId;
          targetTabTitle = 'Client Submissions';
          console.log(`[Google Sheets] Created new Spreadsheet ID: ${targetSheetId}`);

          // 4. Move spreadsheet into the dedicated Google Drive folder
          if (folderId && targetSheetId) {
            try {
              await fetch(`https://www.googleapis.com/drive/v3/files/${targetSheetId}?addParents=${folderId}&fields=id,parents`, {
                method: 'PATCH',
                headers: {
                  Authorization: `Bearer ${activeToken}`,
                },
              });
              console.log(`[Google Drive] Moved sheet ${targetSheetId} into folder ${folderId}`);
            } catch (moveErr) {
              console.warn('[Google Drive] Move to folder notice:', moveErr);
            }
          }

          // 5. Set Header Row with all column names and luxury styling
          await fetch(
            `https://sheets.googleapis.com/v4/spreadsheets/${targetSheetId}/values/'${targetTabTitle}'!A1:AB1?valueInputOption=USER_ENTERED`,
            {
              method: 'PUT',
              headers: {
                Authorization: `Bearer ${activeToken}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                values: [SHEET_COLUMNS],
              }),
            }
          );
        } else {
          const createErr = (await safeResponseJson(createRes)) || {};
          console.error('[Google Sheets] Failed to create new spreadsheet:', createErr);
        }
      }

      if (targetSheetId) {
        console.log(`[Google Sheets Append] Sending row to sheet: https://docs.google.com/spreadsheets/d/${targetSheetId}/edit?gid=399205612#gid=399205612 (Tab: '${targetTabTitle}')`);
        
        // Ensure headers exist if sheet is empty
        try {
          const headerCheckRes = await fetch(
            `https://sheets.googleapis.com/v4/spreadsheets/${targetSheetId}/values/'${targetTabTitle}'!A1:B1`,
            {
              headers: { Authorization: `Bearer ${activeToken}` },
            }
          );
          if (headerCheckRes.ok) {
            const hData = await safeResponseJson(headerCheckRes);
            if (!hData?.values || hData.values.length === 0) {
              await fetch(
                `https://sheets.googleapis.com/v4/spreadsheets/${targetSheetId}/values/'${targetTabTitle}'!A1:AB1?valueInputOption=USER_ENTERED`,
                {
                  method: 'PUT',
                  headers: {
                    Authorization: `Bearer ${activeToken}`,
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({ values: [SHEET_COLUMNS] }),
                }
              );
            }
          }
        } catch (hErr) {
          // ignore header check error
        }

        // Attempt append to resolved sheet tab
        let appendRes = await fetch(
          `https://sheets.googleapis.com/v4/spreadsheets/${targetSheetId}/values/'${targetTabTitle}'!A:AB:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${activeToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              values: [rowData],
            }),
          }
        );

        if (!appendRes.ok && appendRes.status === 400) {
          // If tab name append failed, try generic range A:AB
          console.log("[Google Sheets] Sheet tab append failed with 400, trying generic range A:AB...");
          appendRes = await fetch(
            `https://sheets.googleapis.com/v4/spreadsheets/${targetSheetId}/values/A:AB:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`,
            {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${activeToken}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                values: [rowData],
              }),
            }
          );
        }

        if (appendRes.ok) {
          const appendData = await safeResponseJson(appendRes);
          const updatedRange = appendData?.updates?.updatedRange || 'A1:AB1';
          console.log(`[Google Sheets Success] Successfully appended row to Google Sheet: ${updatedRange} (${submission.partner1} & ${submission.partner2})`);

          // Record in internal history
          sheetHistoryRecords.unshift({
            rowIndex: sheetHistoryRecords.length + 1,
            submissionId: submission.submissionId,
            timestamp: new Date().toISOString(),
            rowData,
            status: 'SUCCESS',
          });

          return {
            success: true,
            spreadsheetId: targetSheetId,
            spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${targetSheetId}/edit`,
            updatedRange,
            authMethod,
            serviceAccountEmail: saEmail,
            message: `Successfully appended row for ${submission.partner1} & ${submission.partner2} to Google Sheet (${updatedRange}).`,
          };
        } else {
          const errData = (await safeResponseJson(appendRes)) || {};
          const status = appendRes.status;
          const apiMessage = errData?.error?.message || appendRes.statusText;
          
          let userFriendlyExplanation = `Google Sheets API Error (${status}): ${apiMessage}`;
          if (status === 403) {
            userFriendlyExplanation = `PERMISSION_DENIED (HTTP 403): The spreadsheet (ID: ${targetSheetId}) is not shared with editor permissions. Please open your Google Sheet, click "Share", and add ${saEmail || 'your Google account'} as "Editor".`;
          } else if (status === 404) {
            userFriendlyExplanation = `NOT_FOUND (HTTP 404): The spreadsheet with ID "${targetSheetId}" could not be found. Please check your GOOGLE_SHEETS_ID or create a new sheet in Drive.`;
          } else if (status === 401) {
            userFriendlyExplanation = `UNAUTHENTICATED (HTTP 401): The authentication token expired or is invalid. Please sign in again.`;
          }

          console.error(`[Google Sheets Error ${status}]`, userFriendlyExplanation, errData);

          // Record failure in history
          sheetHistoryRecords.unshift({
            rowIndex: sheetHistoryRecords.length + 1,
            submissionId: submission.submissionId,
            timestamp: new Date().toISOString(),
            rowData,
            status: 'FAILED',
            error: userFriendlyExplanation,
          });

          return {
            success: false,
            spreadsheetId: targetSheetId,
            spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${targetSheetId}/edit`,
            authMethod,
            serviceAccountEmail: saEmail,
            message: userFriendlyExplanation,
            error: userFriendlyExplanation,
          };
        }
      }
    } catch (apiErr: any) {
      const errMsg = apiErr?.message || String(apiErr);
      console.error('[Google Sheets API Exception]', errMsg);
      return {
        success: false,
        spreadsheetId,
        spreadsheetUrl: spreadsheetId ? `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit` : undefined,
        authMethod,
        serviceAccountEmail: saEmail,
        message: `Network/API error connecting to Google Sheets: ${errMsg}`,
        error: errMsg,
      };
    }
  }

  // If no auth token could be found at all
  const saInfo = getServiceAccountInfo();
  const fallbackMsg = saInfo.isConfigured
    ? `No active Google token. Found Service Account (${saInfo.clientEmail}) - please make sure the sheet is shared with this email as Editor.`
    : 'Google Workspace is not connected. Sign in with Google in the Studio Hub or configure GOOGLE_SERVICE_ACCOUNT to sync live.';

  console.log(`[Google Sheets Notice] ${fallbackMsg}`);

  sheetHistoryRecords.unshift({
    rowIndex: sheetHistoryRecords.length + 1,
    submissionId: submission.submissionId,
    timestamp: new Date().toISOString(),
    rowData,
    status: 'MOCK_STORED',
    error: fallbackMsg,
  });

  return {
    success: false,
    spreadsheetId: spreadsheetId || undefined,
    spreadsheetUrl: spreadsheetId ? `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit` : undefined,
    authMethod: 'NONE',
    message: fallbackMsg,
    error: fallbackMsg,
  };
}

/**
 * Generate rich dummy submission for live test appends
 */
export function createDummyTestSubmission(): ClientSubmission {
  const testId = `TEST-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
  const now = new Date().toISOString();

  return {
    id: `test_${Date.now()}`,
    submissionId: testId,
    createdAt: now,
    updatedAt: now,
    status: 'NEW',
    partner1: 'Aria Sharma',
    partner2: 'Rohan Mehta',
    countryCode: '+91',
    phone: '9876543210',
    email: 'aria.rohan.wedding@example.com',
    weddingTypes: ['Hindu', 'Fusion'],
    weddingTypeOther: '',
    weddingStyles: ['Royal Heritage', 'Destination'],
    weddingStyleOther: '',
    city: 'Udaipur, Rajasthan',
    mainVenue: 'The Leela Palace Lake Pichola',
    guestCount: '250',
    sameVenueForAll: false,
    sameCityForAll: true,
    sameGuestCountForAll: false,
    functions: [
      {
        id: 'fn_1',
        name: 'Welcome Dinner & Mehendi',
        date: '2026-11-20',
        venue: 'Poolside Lawns',
        timeSlot: 'Evening',
        guestCount: '150',
        notes: 'Sunset lighting, bohemian floral theme',
      },
      {
        id: 'fn_2',
        name: 'Sangeet Night',
        date: '2026-11-21',
        venue: 'Grand Courtyard',
        timeSlot: 'Night',
        guestCount: '250',
        notes: 'Performances, family dances, stage lighting',
      },
      {
        id: 'fn_3',
        name: 'Varmala & Royal Pheras',
        date: '2026-11-22',
        venue: 'Lake Terrace Mandap',
        timeSlot: 'Afternoon',
        guestCount: '250',
        notes: 'Sunset pheras overlooking the lake',
      },
    ],
    photographyServices: [
      'Candid Photography',
      'Cinematic Wedding Film',
      'Drone Coverage',
      'Pre-Wedding Shoot',
      'Wedding Albums',
    ],
    photographyOther: '',
    specialMoments: 'Bride entrance via boat on Lake Pichola, emotional vidai, acoustic vow exchange',
    photographyPreferences: 'Editorial, cinematic warm tones, candid emotions, timeless symmetry',
    discoverySource: 'Instagram',
    discoverySourceOther: '',
    instagramHandle: '@aria_rohan_celebration',
    plannerName: 'Regal Weddings India (Devika)',
    plannerPhone: '+91 9988776655',
    weddingWebsite: 'https://withjoy.com/aria-rohan-2026',
    references: [
      {
        id: 'ref_1',
        platform: 'Pinterest',
        url: 'https://pinterest.com/sample-wedding-moodboard',
        description: 'Warm earth tones & sunset ceremony aesthetics',
      },
    ],
    files: [],
    additionalInformation: 'TEST ROW GENERATED FROM VISIONSHINE STUDIO HUB TO VERIFY GOOGLE SHEETS LIVE SYNC.',
    syncedToGoogleSheets: false,
    internalNotes: [
      {
        id: 'note_test',
        text: 'Automated test row to verify Google Sheets integration and column formatting.',
        createdAt: now,
        author: 'Studio System Test',
      },
    ],
  };
}

export interface SheetRowRecord {
  rowIndex: number;
  submissionId: string;
  timestamp: string;
  rowData: (string | number)[];
  status: 'SUCCESS' | 'MOCK_STORED' | 'FAILED';
  error?: string;
}

const sheetHistoryRecords: SheetRowRecord[] = [];

export function getSheetHistory(): SheetRowRecord[] {
  return sheetHistoryRecords;
}

export function generateCsvExport(submissions: ClientSubmission[]): string {
  const header = SHEET_COLUMNS.map((col) => `"${col.replace(/"/g, '""')}"`).join(',');
  const rows = submissions.map((sub) => {
    const row = formatSubmissionToSheetRow(sub);
    return row
      .map((val) => {
        const str = String(val ?? '');
        return `"${str.replace(/"/g, '""')}"`;
      })
      .join(',');
  });

  return [header, ...rows].join('\n');
}

export interface BulkSyncResult {
  success: boolean;
  rowsSynced: number;
  spreadsheetId: string;
  spreadsheetUrl: string;
  updatedRange?: string;
  message: string;
  error?: string;
  authMethod?: 'USER_OAUTH' | 'SERVICE_ACCOUNT' | 'NONE';
  serviceAccountEmail?: string;
}

/**
 * Sync all submissions in bulk to the specified Google Sheet
 */
export async function syncAllSubmissionsToGoogleSheet(
  submissions: ClientSubmission[],
  userAccessToken?: string,
  customSpreadsheetId?: string,
  appsScriptUrl?: string
): Promise<BulkSyncResult> {
  const targetSheetId =
    customSpreadsheetId ||
    process.env.GOOGLE_SHEETS_ID ||
    process.env.GOOGLE_SPREADSHEET_ID ||
    '1Ehg3A_TnzZYg048U6f1sRvd_lrmyj5_8Nn7DVci1D-I';

  // If Google Apps Script Web App URL is provided or configured, sync via Web App first
  const cleanAppsScript = appsScriptUrl?.trim();
  if (cleanAppsScript && cleanAppsScript.startsWith('http') && cleanAppsScript.includes('/exec')) {
    try {
      console.log(`[Google Sheets Bulk Sync] Syncing ${submissions.length} rows via Apps Script Web App: ${cleanAppsScript}`);
      const appsRes = await fetch(cleanAppsScript, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bulkSubmissions: submissions,
          submissions: submissions,
          spreadsheetId: targetSheetId,
        }),
      });

      if (appsRes.ok) {
        return {
          success: true,
          rowsSynced: submissions.length,
          spreadsheetId: targetSheetId,
          spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${targetSheetId}/edit?gid=399205612#gid=399205612`,
          updatedRange: `A2:AB${submissions.length + 1}`,
          authMethod: 'APPS_SCRIPT_WEB_APP' as any,
          message: `Successfully synced ${submissions.length} inquiries to Google Sheet via Apps Script Web App!`,
        };
      }
    } catch (appErr: any) {
      console.warn('[Apps Script Bulk Sync Warning]', appErr);
    }
  }

  let activeToken = userAccessToken;
  let authMethod: 'USER_OAUTH' | 'SERVICE_ACCOUNT' | 'NONE' = userAccessToken ? 'USER_OAUTH' : 'NONE';
  let saEmail: string | undefined;

  if (!activeToken) {
    try {
      const saAuth = await getServiceAccountAccessToken();
      if (saAuth) {
        activeToken = saAuth.token;
        authMethod = 'SERVICE_ACCOUNT';
        saEmail = saAuth.clientEmail;
      }
    } catch (saErr: any) {
      console.warn('[Google Sheets Bulk] Could not authenticate with Service Account:', saErr.message);
    }
  }

  const rows = submissions.map(formatSubmissionToSheetRow);

  if (activeToken) {
    try {
      let targetTabTitle = 'Client Submissions';

      // 1. Check sheet tabs metadata to find exact tab title (gid=399205612)
      try {
        const metaRes = await fetch(
          `https://sheets.googleapis.com/v4/spreadsheets/${targetSheetId}?fields=sheets.properties`,
          {
            headers: { Authorization: `Bearer ${activeToken}` },
          }
        );
        if (metaRes.ok) {
          const metaData = await safeResponseJson(metaRes);
          const sheets = metaData?.sheets || [];
          if (sheets.length > 0) {
            const matchingSheet =
              sheets.find((s: any) => s.properties?.sheetId === 399205612) ||
              sheets.find((s: any) => s.properties?.title === 'Client Submissions') ||
              sheets[0];
            if (matchingSheet?.properties?.title) {
              targetTabTitle = matchingSheet.properties.title;
            }
          }
        }
      } catch (mErr) {
        console.warn('[Google Sheets Bulk Meta Warning]', mErr);
      }

      console.log(`[Google Sheets Bulk Sync] Syncing ${submissions.length} rows to ${targetSheetId} (Tab: '${targetTabTitle}')...`);

      // 2. Ensure the Header Row exists on Row 1
      try {
        await fetch(
          `https://sheets.googleapis.com/v4/spreadsheets/${targetSheetId}/values/'${targetTabTitle}'!A1:AB1?valueInputOption=USER_ENTERED`,
          {
            method: 'PUT',
            headers: {
              Authorization: `Bearer ${activeToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              values: [SHEET_COLUMNS],
            }),
          }
        );
        console.log(`[Google Sheets Bulk Sync] Ensured headers at '${targetTabTitle}'!A1:AB1 on sheet ${targetSheetId}`);
      } catch (hErr) {
        console.warn('[Google Sheets Header Notice]', hErr);
      }

      // 3. Append all rows to sheet
      let appendRes = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${targetSheetId}/values/'${targetTabTitle}'!A:AB:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${activeToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            values: rows,
          }),
        }
      );

      if (!appendRes.ok && appendRes.status === 400) {
        appendRes = await fetch(
          `https://sheets.googleapis.com/v4/spreadsheets/${targetSheetId}/values/A:AB:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${activeToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              values: rows,
            }),
          }
        );
      }

      if (appendRes.ok) {
        const appendData = await safeResponseJson(appendRes);
        const updatedRange = appendData?.updates?.updatedRange || `A2:AB${rows.length + 1}`;
        console.log(`[Google Sheets Bulk Sync] Successfully synced ${rows.length} rows (${updatedRange})`);

        return {
          success: true,
          rowsSynced: rows.length,
          spreadsheetId: targetSheetId,
          spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${targetSheetId}/edit?gid=399205612#gid=399205612`,
          updatedRange,
          authMethod,
          serviceAccountEmail: saEmail,
          message: `Successfully synced all ${rows.length} inquiries to Google Sheet (${updatedRange}).`,
        };
      } else {
        const errData = (await safeResponseJson(appendRes)) || {};
        const status = appendRes.status;
        const apiMessage = errData?.error?.message || appendRes.statusText;

        let userFriendly = `Google Sheets API Error (${status}): ${apiMessage}`;
        if (status === 403) {
          userFriendly = `PERMISSION_DENIED (HTTP 403): The spreadsheet (ID: ${targetSheetId}) is not shared with editor permissions. Please open https://docs.google.com/spreadsheets/d/${targetSheetId}/edit?gid=399205612#gid=399205612, click "Share", and grant "Editor" access to ${saEmail || 'your authorized Google account'}.`;
        }

        return {
          success: false,
          rowsSynced: 0,
          spreadsheetId: targetSheetId,
          spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${targetSheetId}/edit?gid=399205612#gid=399205612`,
          authMethod,
          serviceAccountEmail: saEmail,
          message: userFriendly,
          error: userFriendly,
        };
      }
    } catch (bulkErr: any) {
      const msg = bulkErr?.message || String(bulkErr);
      return {
        success: false,
        rowsSynced: 0,
        spreadsheetId: targetSheetId,
        spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${targetSheetId}/edit?gid=399205612#gid=399205612`,
        authMethod,
        serviceAccountEmail: saEmail,
        message: `Network error during Google Sheets bulk sync: ${msg}`,
        error: msg,
      };
    }
  }

  // If no auth token
  const saInfo = getServiceAccountInfo();
  const noticeMsg = saInfo.isConfigured
    ? `Service Account (${saInfo.clientEmail}) needs Editor permission on sheet https://docs.google.com/spreadsheets/d/${targetSheetId}/edit?gid=399205612#gid=399205612`
    : `Please connect Google Workspace or deploy the Google Apps Script Web App to sync all ${rows.length} inquiries directly to your sheet.`;

  return {
    success: false,
    rowsSynced: 0,
    spreadsheetId: targetSheetId,
    spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${targetSheetId}/edit?gid=399205612#gid=399205612`,
    authMethod: 'NONE',
    message: noticeMsg,
    error: noticeMsg,
  };
}

export interface StudioDriveProvisionResult {
  success: boolean;
  folderId?: string;
  folderName: string;
  spreadsheetId: string;
  spreadsheetUrl: string;
  isNew: boolean;
  message: string;
}

/**
 * Idempotently check, locate or create a dedicated Google Drive folder and Google Sheet for a studio
 */
export async function ensureStudioDriveAndSheet(
  studio: StudioProfile,
  userAccessToken?: string
): Promise<StudioDriveProvisionResult> {
  const folderName = studio.googleFolderName || `${studio.name} - Studio Forms`;
  const sheetTitle = `${studio.name} - Client Inquiries`;

  let activeToken = userAccessToken;
  if (!activeToken) {
    try {
      const saAuth = await getServiceAccountAccessToken();
      if (saAuth) {
        activeToken = saAuth.token;
      }
    } catch (e) {
      // ignore
    }
  }

  // If studio already has valid folderId and defaultSpreadsheetId, reuse it
  if (studio.defaultSpreadsheetId && studio.googleFolderId) {
    return {
      success: true,
      folderId: studio.googleFolderId,
      folderName,
      spreadsheetId: studio.defaultSpreadsheetId,
      spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${studio.defaultSpreadsheetId}/edit`,
      isNew: false,
      message: 'Reused existing Google Drive folder and Google Sheet',
    };
  }

  if (activeToken) {
    try {
      let folderId = studio.googleFolderId;
      // 1. Search for existing folder
      if (!folderId) {
        const searchFolderRes = await fetch(
          `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(`name = '${folderName.replace(/'/g, "\\'")}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`)}&fields=files(id,name)`,
          {
            headers: { Authorization: `Bearer ${activeToken}` },
          }
        );
        if (searchFolderRes.ok) {
          const searchData = await safeResponseJson(searchFolderRes);
          if (searchData?.files && searchData.files.length > 0) {
            folderId = searchData.files[0].id;
          }
        }
      }

      // If folder doesn't exist, create it
      if (!folderId) {
        const createFolderRes = await fetch('https://www.googleapis.com/drive/v3/files', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${activeToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: folderName,
            mimeType: 'application/vnd.google-apps.folder',
            description: `Dedicated storage folder for ${studio.name} client inquiry forms and spreadsheets.`,
          }),
        });
        if (createFolderRes.ok) {
          const newFolder = await safeResponseJson(createFolderRes);
          folderId = newFolder?.id;
        }
      }

      // 2. Check for existing sheet
      let spreadsheetId = studio.defaultSpreadsheetId;
      let isNew = false;
      if (!spreadsheetId && folderId) {
        const searchSheetRes = await fetch(
          `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(`'${folderId}' in parents and mimeType = 'application/vnd.google-apps.spreadsheet' and trashed = false`)}&fields=files(id,name)`,
          {
            headers: { Authorization: `Bearer ${activeToken}` },
          }
        );
        if (searchSheetRes.ok) {
          const sheetList = await safeResponseJson(searchSheetRes);
          if (sheetList?.files && sheetList.files.length > 0) {
            spreadsheetId = sheetList.files[0].id;
          }
        }
      }

      // 3. Create sheet if not found
      if (!spreadsheetId) {
        const createSheetRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${activeToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            properties: {
              title: sheetTitle,
            },
            sheets: [
              {
                properties: {
                  title: 'Client Submissions',
                  gridProperties: { frozenRowCount: 1 },
                },
              },
            ],
          }),
        });

        if (createSheetRes.ok) {
          const sheetData = await safeResponseJson(createSheetRes);
          spreadsheetId = sheetData?.spreadsheetId;
          isNew = true;

          // Move into folder
          if (folderId && spreadsheetId) {
            try {
              await fetch(
                `https://www.googleapis.com/drive/v3/files/${spreadsheetId}?addParents=${folderId}&fields=id,parents`,
                {
                  method: 'PATCH',
                  headers: { Authorization: `Bearer ${activeToken}` },
                }
              );
            } catch (moveErr) {
              console.warn('[Google Drive] Notice moving sheet into folder:', moveErr);
            }
          }

          // Set 28-column header row
          await fetch(
            `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/'Client Submissions'!A1:AB1?valueInputOption=USER_ENTERED`,
            {
              method: 'PUT',
              headers: {
                Authorization: `Bearer ${activeToken}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                values: [SHEET_COLUMNS],
              }),
            }
          );
        }
      }

      const finalSheetId =
        spreadsheetId || studio.defaultSpreadsheetId || '1Ehg3A_TnzZYg048U6f1sRvd_lrmyj5_8Nn7DVci1D-I';

      return {
        success: true,
        folderId,
        folderName,
        spreadsheetId: finalSheetId,
        spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${finalSheetId}/edit?gid=399205612#gid=399205612`,
        isNew,
        message: isNew
          ? 'Created dedicated Google Drive folder and Google Sheet'
          : 'Connected to studio Google Drive and Sheet',
      };
    } catch (err: any) {
      console.warn('[ensureStudioDriveAndSheet] Warning during Google Drive provisioning:', err.message);
    }
  }

  const fallbackSheetId =
    studio.defaultSpreadsheetId || '1Ehg3A_TnzZYg048U6f1sRvd_lrmyj5_8Nn7DVci1D-I';

  return {
    success: true,
    folderId: studio.googleFolderId || `folder_${studio.id}`,
    folderName,
    spreadsheetId: fallbackSheetId,
    spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${fallbackSheetId}/edit?gid=399205612#gid=399205612`,
    isNew: false,
    message: 'Using configured studio spreadsheet',
  };
}

