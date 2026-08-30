export type WeddingType =
  | 'Hindu'
  | 'Muslim'
  | 'Sikh'
  | 'Christian'
  | 'Jain'
  | 'Buddhist'
  | 'Interfaith'
  | 'Parsi'
  | 'Fusion'
  | 'Other';

export type WeddingStyle =
  | 'Traditional'
  | 'Modern'
  | 'Intimate'
  | 'Destination'
  | 'Big Wedding'
  | 'Royal Heritage'
  | 'Coastal / Beach'
  | 'Minimalist'
  | 'Fusion'
  | 'Other';

export type TimeOfDay = 'Morning' | 'Afternoon' | 'Evening' | 'Night' | 'Full Day' | 'Custom';

export interface WeddingFunction {
  id: string;
  name: string;
  isCustom?: boolean;
  date: string;
  venue: string;
  timeSlot: TimeOfDay;
  customTime?: string;
  guestCount?: number | string;
  notes?: string;
}

export type PhotographyService =
  | 'Candid Photography'
  | 'Traditional Photography'
  | 'Cinematic Wedding Film'
  | 'Traditional Video'
  | 'Pre-Wedding Shoot'
  | 'Couple Portraits'
  | 'Family Portraits'
  | 'Drone Coverage'
  | 'Wedding Albums'
  | 'Full Wedding Coverage'
  | 'Live Streaming'
  | 'Other';

export interface ReferenceLink {
  id: string;
  url: string;
  platform: 'Instagram' | 'Pinterest' | 'YouTube' | 'Google Drive' | 'Dropbox' | 'Website' | 'Other';
  description?: string;
}

export interface UploadedFileItem {
  id: string;
  name: string;
  size: number;
  type: string;
  dataUrl?: string;
  progress: number;
  uploadedAt: string;
}

export type DiscoverySource =
  | 'Instagram'
  | 'Google Search'
  | 'Friend / Family'
  | 'Previous Client'
  | 'Wedding Planner'
  | 'Venue Recommendation'
  | 'Vogue / WedMeGood / Editorial'
  | 'Other';

export type SubmissionStatus =
  | 'NEW'
  | 'CONTACTED'
  | 'CONFIRMED'
  | 'SHOOT UPCOMING'
  | 'COMPLETED'
  | 'ARCHIVED';

export interface InternalNote {
  id: string;
  text: string;
  createdAt: string;
  author: string;
}

export interface ClientSubmission {
  id: string;
  submissionId: string;
  createdAt: string;
  updatedAt: string;
  
  // Step 1: Contact
  phone: string;
  countryCode: string;
  email?: string;

  // Step 2: Couple
  partner1: string;
  partner2: string;

  // Step 3: Wedding Type & Style
  weddingTypes: string[];
  weddingTypeOther?: string;
  weddingStyles: string[];
  weddingStyleOther?: string;

  // Step 4: Location
  city: string;
  mainVenue: string;
  guestCount: string;
  sameVenueForAll: boolean;
  sameCityForAll: boolean;
  sameGuestCountForAll: boolean;

  // Step 5: Functions Timeline
  functions: WeddingFunction[];

  // Step 6: Photography
  photographyServices: string[];
  photographyOther?: string;
  specialMoments: string;
  photographyPreferences: string;

  // Step 7: References & Files
  references: ReferenceLink[];
  files: UploadedFileItem[];

  // Step 8: Final Look
  discoverySource: string;
  discoverySourceOther?: string;
  instagramHandle?: string;
  plannerName?: string;
  plannerPhone?: string;
  weddingWebsite?: string;
  additionalInformation?: string;

  // Management & Sync
  studioId?: string;
  formCode?: string;
  status: SubmissionStatus;
  syncedToGoogleSheets: boolean;
  sheetsRowIndex?: number;
  internalNotes: InternalNote[];
}

export interface StudioProfile {
  id: string;
  name: string;
  slug: string;
  ownerName: string;
  email: string;
  phone: string;
  whatsapp?: string;
  website?: string;
  instagram?: string;
  tagline?: string;
  googleFolderId?: string;
  googleFolderName?: string;
  defaultSpreadsheetId: string;
  googleSpreadsheetUrl?: string;
  appsScriptUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FormTemplate {
  id: string;
  title: string;
  category: string;
  description: string;
  badge?: string;
  iconName: string;
  status: 'active' | 'coming_soon';
  availableFieldsCount: number;
}

export interface StudioFormLink {
  id: string;
  formCode: string; // e.g. "VS-WED829", "VS-LUXE01"
  studioId: string;
  studioName: string;
  templateId: string;
  templateTitle: string;
  title: string;
  customGreeting?: string;
  spreadsheetId: string; // Google Sheet target for submissions
  appsScriptUrl?: string; // Optional direct Google Apps Script Web App URL
  createdAt: string;
  updatedAt: string;
  submissionsCount: number;
  isActive: boolean;
  allowFileUploads?: boolean;
}

export interface PublicFormMetadata {
  formCode: string;
  formTitle: string;
  studioName: string;
  studioPhone?: string;
  studioWhatsapp?: string;
  studioWebsite?: string;
  studioInstagram?: string;
  templateId: string;
  customGreeting?: string;
  allowFileUploads?: boolean;
}

