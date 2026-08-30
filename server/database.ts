import fs from 'fs';
import path from 'path';
import { ClientSubmission, StudioProfile, StudioFormLink, FormTemplate } from '../src/types';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'inquiries.json');
const STUDIOS_FILE = path.join(DATA_DIR, 'studios.json');
const FORMS_FILE = path.join(DATA_DIR, 'forms.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

export const TEMPLATES: FormTemplate[] = [
  {
    id: 'tpl_wedding_photo',
    title: 'Wedding Photography Inquiry Form',
    category: 'Wedding & Bridal',
    description:
      'The multi-step luxury questionnaire collecting traditions, guest counts, multi-day function schedules, style references, and logistics.',
    badge: 'Core Template',
    iconName: 'Camera',
    status: 'active',
    availableFieldsCount: 28,
  },
  {
    id: 'tpl_commercial',
    title: 'Commercial Shoot',
    category: 'Commercial & Fashion',
    description:
      'Deliverables, model releases, studio vs location requirements, usage rights, and creative direction.',
    badge: 'Coming Soon',
    iconName: 'Briefcase',
    status: 'coming_soon',
    availableFieldsCount: 16,
  },
  {
    id: 'tpl_prewedding',
    title: 'Pre-Wedding Shoot',
    category: 'Couples & Editorial',
    description:
      'Destination preferences, outfit changes, sunset timing, themes, and hair/makeup coordination.',
    badge: 'Coming Soon',
    iconName: 'Heart',
    status: 'coming_soon',
    availableFieldsCount: 18,
  },
  {
    id: 'tpl_event',
    title: 'Birthday / Event',
    category: 'Events & Celebrations',
    description:
      'Party timeline, venue specs, VIP guest lists, candid priorities, and quick turnaround requirements.',
    badge: 'Coming Soon',
    iconName: 'Sparkles',
    status: 'coming_soon',
    availableFieldsCount: 14,
  },
  {
    id: 'tpl_corporate',
    title: 'Corporate & Brand',
    category: 'Enterprise',
    description:
      'Headshots, summit keynotes, brand guidelines, invoice billing entities, and expedited delivery.',
    badge: 'Coming Soon',
    iconName: 'Building',
    status: 'coming_soon',
    availableFieldsCount: 15,
  },
];

const DEFAULT_STUDIO: StudioProfile = {
  id: 'studio_visionshine',
  name: 'VISIONSHINE Studios',
  slug: 'visionshine',
  ownerName: 'Studio Director',
  email: 'studio@visionshine.com',
  phone: '+91 98201 23456',
  website: 'https://visionshine.com',
  instagram: '@visionshine_studios',
  tagline: 'Fine-Art Luxury Wedding Photography & Cinematic Films',
  defaultSpreadsheetId: '1Ehg3A_TnzZYg048U6f1sRvd_lrmyj5_8Nn7DVci1D-I',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const DEFAULT_FORMS: StudioFormLink[] = [
  {
    id: 'form_link_01',
    formCode: 'VS-WED901',
    studioId: 'studio_visionshine',
    studioName: 'VISIONSHINE Studios',
    templateId: 'tpl_wedding_photo',
    templateTitle: 'Wedding Photography Inquiry Form',
    title: 'Wedding Photography Inquiry Form 2026',
    customGreeting: 'Welcome! We are honored to document your celebration.',
    spreadsheetId: '1Ehg3A_TnzZYg048U6f1sRvd_lrmyj5_8Nn7DVci1D-I',
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    updatedAt: new Date().toISOString(),
    submissionsCount: 12,
    isActive: true,
    allowFileUploads: true,
  },
];


// Initial luxury demo inquiries to seed if database is empty
const INITIAL_DEMO_INQUIRIES: ClientSubmission[] = [
  {
    id: 'sub_demo_01',
    submissionId: 'VS-2026-KM8291',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    phone: '9820145678',
    countryCode: '+91',
    partner1: 'Ananya Singhania',
    partner2: 'Rohan Mehra',
    weddingTypes: ['Hindu', 'Fusion'],
    weddingStyles: ['Royal Heritage', 'Destination'],
    city: 'Udaipur, Rajasthan',
    mainVenue: 'The Leela Palace & Jagmandir Island',
    guestCount: '300 – 500',
    sameVenueForAll: false,
    sameCityForAll: true,
    sameGuestCountForAll: false,
    functions: [
      {
        id: 'f1',
        name: 'Welcome Dinner & Mehendi',
        date: '2026-11-14',
        venue: 'The Oberoi Udaivilas Lawns',
        timeSlot: 'Afternoon',
        guestCount: '250',
      },
      {
        id: 'f2',
        name: 'Sangeet Gala',
        date: '2026-11-14',
        venue: 'Jagmandir Courtyard',
        timeSlot: 'Evening',
        guestCount: '400',
      },
      {
        id: 'f3',
        name: 'Haldi & Chooda',
        date: '2026-11-15',
        venue: 'Poolside Terrace',
        timeSlot: 'Morning',
        guestCount: '150',
      },
      {
        id: 'f4',
        name: 'Wedding Ceremony (Pheras)',
        date: '2026-11-15',
        venue: 'The Leela Palace Amphitheatre',
        timeSlot: 'Evening',
        guestCount: '450',
      },
      {
        id: 'f5',
        name: 'Grand Reception',
        date: '2026-11-16',
        venue: 'City Palace Zenana Mahal',
        timeSlot: 'Night',
        guestCount: '500',
      },
    ],
    photographyServices: [
      'Candid Photography',
      'Cinematic Wedding Film',
      'Pre-Wedding Shoot',
      'Drone Coverage',
      'Wedding Albums',
    ],
    specialMoments:
      'Bride entry on floral shikara boat across Lake Pichola. Grandmother’s traditional Rajasthani Ghoomar performance during Sangeet.',
    photographyPreferences:
      'High contrast editorial look, warm natural tones, film grain aesthetic, candid emotional moments over staged groups.',
    references: [
      {
        id: 'ref1',
        url: 'https://pinterest.com/board/ananya-rohan-royal-wedding',
        platform: 'Pinterest',
        description: 'Moodboard for golden hour lake portraits and floral decor',
      },
      {
        id: 'ref2',
        url: 'https://instagram.com/p/luxuryweddings_editorial',
        platform: 'Instagram',
        description: 'Lighting reference for the Sangeet night',
      },
    ],
    files: [
      {
        id: 'f_art1',
        name: 'Moodboard_ColorPalette_Udaipur.pdf',
        size: 3450000,
        type: 'application/pdf',
        progress: 100,
        uploadedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      },
    ],
    discoverySource: 'Instagram',
    instagramHandle: '@ananyasinghania',
    plannerName: 'Vandana Mohan / The Wedding Design Company',
    plannerPhone: '+91 98110 23456',
    weddingWebsite: 'https://withjoy.com/ananya-and-rohan-2026',
    additionalInformation:
      'We would love a private 45-minute golden hour couple portrait session before the Sangeet begins.',
    status: 'CONFIRMED',
    syncedToGoogleSheets: true,
    sheetsRowIndex: 2,
    internalNotes: [
      {
        id: 'note_1',
        text: 'Client requested lead director + 3 candid photographers and 2 drone pilots. Advance token received.',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        author: 'Studio Director',
      },
    ],
  },
  {
    id: 'sub_demo_02',
    submissionId: 'VS-2026-TR4912',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
    phone: '9873210987',
    countryCode: '+91',
    partner1: 'Tara Krishnan',
    partner2: 'Kabir Sen',
    weddingTypes: ['Interfaith', 'Fusion'],
    weddingStyles: ['Intimate', 'Modern'],
    city: 'Alibaug / Mumbai',
    mainVenue: 'Awas Heritage Villa Estate',
    guestCount: '150 – 250',
    sameVenueForAll: true,
    sameCityForAll: true,
    sameGuestCountForAll: true,
    functions: [
      {
        id: 'fn_t1',
        name: 'Sunset Sundowner & Cocktails',
        date: '2026-12-08',
        venue: 'Awas Heritage Villa',
        timeSlot: 'Evening',
        guestCount: '120',
      },
      {
        id: 'fn_t2',
        name: 'South Indian & Bengali Vows',
        date: '2026-12-09',
        venue: 'Awas Heritage Coconut Grove',
        timeSlot: 'Morning',
        guestCount: '150',
      },
      {
        id: 'fn_t3',
        name: 'After Hours Party',
        date: '2026-12-09',
        venue: 'Awas Heritage Glasshouse',
        timeSlot: 'Night',
        guestCount: '150',
      },
    ],
    photographyServices: [
      'Candid Photography',
      'Cinematic Wedding Film',
      'Couple Portraits',
      'Wedding Albums',
    ],
    specialMoments:
      'Both families singing acoustic songs together under fairy lights. Minimal staged photos.',
    photographyPreferences:
      '35mm analog film aesthetic, black and white fine art portraits, organic movement.',
    references: [
      {
        id: 'ref_t1',
        url: 'https://drive.google.com/drive/folders/tara-kabir-references',
        platform: 'Google Drive',
        description: 'Ceremony moodboard and outfit color palettes',
      },
    ],
    files: [],
    discoverySource: 'Previous Client',
    instagramHandle: '@tarakrishnan',
    plannerName: 'Self-planned with sister',
    weddingWebsite: 'https://tarakabir.wedding',
    additionalInformation:
      'We prefer minimal equipment and non-intrusive cameras during the vows.',
    status: 'NEW',
    syncedToGoogleSheets: true,
    sheetsRowIndex: 3,
    internalNotes: [],
  },
];

class InquiryDatabase {
  private cache: Map<string, ClientSubmission> = new Map();

  constructor() {
    this.loadFromDisk();
  }

  private loadFromDisk(): void {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const list: ClientSubmission[] = JSON.parse(raw);
        if (Array.isArray(list) && list.length > 0) {
          list.forEach((sub) => {
            if (sub && sub.id) {
              this.cache.set(sub.id, sub);
            }
          });
          console.log(`[Inquiry Database] Loaded ${this.cache.size} inquiries from disk.`);
          return;
        }
      }
    } catch (e) {
      console.warn('[Inquiry Database] Error reading database file, initializing defaults:', e);
    }

    // Seed defaults
    INITIAL_DEMO_INQUIRIES.forEach((sub) => this.cache.set(sub.id, sub));
    this.saveToDisk();
    console.log(`[Inquiry Database] Initialized with ${this.cache.size} default inquiries.`);
  }

  private saveToDisk(): void {
    try {
      const list = Array.from(this.cache.values());
      fs.writeFileSync(DB_FILE, JSON.stringify(list, null, 2), 'utf-8');
    } catch (e) {
      console.error('[Inquiry Database] Error saving to disk:', e);
    }
  }

  public getAll(): ClientSubmission[] {
    return Array.from(this.cache.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  public getByStudioId(studioId: string): ClientSubmission[] {
    return this.getAll().filter(
      (sub) => !sub.studioId || sub.studioId === studioId || studioId === 'studio_visionshine'
    );
  }

  public getById(id: string): ClientSubmission | undefined {
    return (
      this.cache.get(id) ||
      Array.from(this.cache.values()).find(
        (s) => s.submissionId.toLowerCase() === id.toLowerCase()
      )
    );
  }

  public save(submission: ClientSubmission): ClientSubmission {
    this.cache.set(submission.id, submission);
    this.saveToDisk();
    return submission;
  }

  public update(id: string, updates: Partial<ClientSubmission>): ClientSubmission | null {
    const existing = this.getById(id);
    if (!existing) return null;

    const updated: ClientSubmission = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    this.cache.set(existing.id, updated);
    this.saveToDisk();
    return updated;
  }

  public delete(id: string): boolean {
    const existing = this.getById(id);
    if (!existing) return false;
    const deleted = this.cache.delete(existing.id);
    if (deleted) {
      this.saveToDisk();
    }
    return deleted;
  }
}

export const inquiryDb = new InquiryDatabase();

class StudioDatabase {
  private cache: Map<string, StudioProfile> = new Map();

  constructor() {
    this.loadFromDisk();
  }

  private loadFromDisk(): void {
    try {
      if (fs.existsSync(STUDIOS_FILE)) {
        const raw = fs.readFileSync(STUDIOS_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          parsed.forEach((s: StudioProfile) => {
            if (s && s.id) {
              this.cache.set(s.id, s);
            }
          });
          return;
        } else if (parsed && parsed.id) {
          this.cache.set(parsed.id, parsed);
          return;
        }
      }
    } catch (e) {
      console.warn('[Studio Database] Error reading studio file, using default:', e);
    }

    this.cache.set(DEFAULT_STUDIO.id, DEFAULT_STUDIO);
    this.saveToDisk();
  }

  private saveToDisk(): void {
    try {
      const list = Array.from(this.cache.values());
      fs.writeFileSync(STUDIOS_FILE, JSON.stringify(list, null, 2), 'utf-8');
    } catch (e) {
      console.error('[Studio Database] Error saving to disk:', e);
    }
  }

  public getAll(): StudioProfile[] {
    return Array.from(this.cache.values());
  }

  public get(idOrEmail?: string): StudioProfile {
    if (idOrEmail) {
      const found = this.getById(idOrEmail) || this.getByEmail(idOrEmail);
      if (found) return found;
    }
    return this.cache.get(DEFAULT_STUDIO.id) || Array.from(this.cache.values())[0] || DEFAULT_STUDIO;
  }

  public getById(id: string): StudioProfile | undefined {
    if (!id) return undefined;
    return this.cache.get(id);
  }

  public getByEmail(email: string): StudioProfile | undefined {
    if (!email) return undefined;
    const normalized = email.trim().toLowerCase();
    return Array.from(this.cache.values()).find(
      (s) => s.email?.trim().toLowerCase() === normalized
    );
  }

  public getOrCreate(email: string, initialData?: Partial<StudioProfile>): StudioProfile {
    const existing = this.getByEmail(email);
    if (existing) {
      if (initialData && Object.keys(initialData).length > 0) {
        return this.update(existing.id, initialData);
      }
      return existing;
    }

    const cleanEmail = email.trim().toLowerCase();
    const studioId = `studio_${Buffer.from(cleanEmail).toString('hex').substring(0, 10)}`;
    const now = new Date().toISOString();

    const newStudio: StudioProfile = {
      id: studioId,
      name: initialData?.name || `${initialData?.ownerName || 'Studio'} Photography`,
      slug: initialData?.name?.toLowerCase().replace(/[^a-z0-9]/g, '-') || 'studio',
      ownerName: initialData?.ownerName || 'Studio Owner',
      email: cleanEmail,
      phone: initialData?.phone || '+91 98201 23456',
      whatsapp: initialData?.whatsapp || initialData?.phone || '+91 98201 23456',
      website: initialData?.website || '',
      instagram: initialData?.instagram || '',
      tagline: initialData?.tagline || 'Fine-Art Wedding Photography & Cinematic Films',
      defaultSpreadsheetId: initialData?.defaultSpreadsheetId || '',
      googleFolderId: initialData?.googleFolderId || '',
      googleFolderName: initialData?.googleFolderName || 'Studio Forms',
      createdAt: now,
      updatedAt: now,
    };

    this.cache.set(newStudio.id, newStudio);
    this.saveToDisk();
    console.log(`[Studio Database] Created new studio profile for: ${newStudio.email} (ID: ${newStudio.id})`);
    return newStudio;
  }

  public update(idOrEmail: string, updates: Partial<StudioProfile>): StudioProfile {
    const existing = this.getById(idOrEmail) || this.getByEmail(idOrEmail) || this.get();
    const updated: StudioProfile = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    this.cache.set(updated.id, updated);
    this.saveToDisk();
    return updated;
  }
}

export const studioDb = new StudioDatabase();

class FormLinksDatabase {
  private cache: Map<string, StudioFormLink> = new Map();

  constructor() {
    this.loadFromDisk();
  }

  private loadFromDisk(): void {
    try {
      if (fs.existsSync(FORMS_FILE)) {
        const raw = fs.readFileSync(FORMS_FILE, 'utf-8');
        const list: StudioFormLink[] = JSON.parse(raw);
        if (Array.isArray(list) && list.length > 0) {
          list.forEach((form) => {
            if (form && form.formCode) {
              this.cache.set(form.formCode.toUpperCase(), form);
            }
          });
          return;
        }
      }
    } catch (e) {
      console.warn('[FormLinks Database] Error reading forms file, initializing defaults:', e);
    }

    DEFAULT_FORMS.forEach((form) => this.cache.set(form.formCode.toUpperCase(), form));
    this.saveToDisk();
  }

  private saveToDisk(): void {
    try {
      const list = Array.from(this.cache.values());
      fs.writeFileSync(FORMS_FILE, JSON.stringify(list, null, 2), 'utf-8');
    } catch (e) {
      console.error('[FormLinks Database] Error saving to disk:', e);
    }
  }

  public getAll(): StudioFormLink[] {
    return Array.from(this.cache.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  public getByStudioId(studioId: string): StudioFormLink[] {
    return this.getAll().filter((f) => f.studioId === studioId);
  }

  public getByCode(code: string): StudioFormLink | undefined {
    if (!code) return undefined;
    return this.cache.get(code.toUpperCase().trim());
  }

  public getById(id: string): StudioFormLink | undefined {
    return Array.from(this.cache.values()).find((f) => f.id === id);
  }

  public create(
    form: Omit<StudioFormLink, 'id' | 'createdAt' | 'updatedAt' | 'submissionsCount'> & {
      formCode?: string;
    }
  ): StudioFormLink {
    const code =
      form.formCode?.trim().toUpperCase() ||
      `VS-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const now = new Date().toISOString();
    const newForm: StudioFormLink = {
      ...form,
      id: `form_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      formCode: code,
      createdAt: now,
      updatedAt: now,
      submissionsCount: 0,
      isActive: form.isActive !== undefined ? form.isActive : true,
    };

    this.cache.set(newForm.formCode, newForm);
    this.saveToDisk();
    return newForm;
  }

  public ensureDefaultFormForStudio(studio: StudioProfile): StudioFormLink {
    const existingForms = this.getByStudioId(studio.id);
    if (existingForms.length > 0) {
      return existingForms[0];
    }

    const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    const prefix = (studio.name.substring(0, 2).replace(/[^A-Z]/gi, '') || 'ST').toUpperCase();
    const defaultCode = `${prefix}-WED${randomSuffix}`;

    const newForm = this.create({
      formCode: defaultCode,
      studioId: studio.id,
      studioName: studio.name,
      templateId: 'tpl_wedding_photo',
      templateTitle: 'Wedding Photography Inquiry Form',
      title: `${studio.name} - Wedding Inquiry Form`,
      customGreeting: 'Welcome! We are honored to document your wedding celebration.',
      spreadsheetId: studio.defaultSpreadsheetId || '1bZkKL-DDJ3k6cge5uOexYYOuQZt4VyZ-bQCgTEbCd-M',
      isActive: true,
      allowFileUploads: true,
    });

    console.log(`[FormLinks Database] Auto-provisioned unique form link ${newForm.formCode} for studio ${studio.name}`);
    return newForm;
  }

  public update(code: string, updates: Partial<StudioFormLink>): StudioFormLink | null {
    const existing = this.getByCode(code);
    if (!existing) return null;

    const updated: StudioFormLink = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    this.cache.set(existing.formCode, updated);
    this.saveToDisk();
    return updated;
  }

  public incrementSubmissions(code: string): void {
    const existing = this.getByCode(code);
    if (existing) {
      existing.submissionsCount = (existing.submissionsCount || 0) + 1;
      existing.updatedAt = new Date().toISOString();
      this.cache.set(existing.formCode, existing);
      this.saveToDisk();
    }
  }

  public delete(code: string): boolean {
    const existing = this.getByCode(code);
    if (!existing) return false;
    const deleted = this.cache.delete(existing.formCode);
    if (deleted) {
      this.saveToDisk();
    }
    return deleted;
  }
}

export const formLinksDb = new FormLinksDatabase();

