import { WeddingType, WeddingStyle, PhotographyService, DiscoverySource, ClientSubmission, WeddingFunction } from '../types';

export const STUDIO_CONFIG = {
  name: 'VISIONSHINE',
  tagline: 'Fine Art Wedding Cinematography & Archives',
  phone: '+91 70586 28904',
  whatsapp: '7058628904',
  whatsappDisplay: '+91 70586 28904',
  email: 'concierge@visionshine.com',
  website: 'https://visionshine.photography',
  instagram: '@visionshine.weddings',
  location: 'Mumbai · New Delhi · Udaipur · Global Destinations',
  workingHours: 'Mon – Sat: 10:00 AM – 7:30 PM IST',
};

export const TOTAL_STEPS = 5;

export const STEP_NAMES = [
  "Who’s Getting Married",
  "Wedding Traditions",
  "Where & Guests",
  "The Big Days",
  "One Last Look",
];

export const COUNTRY_CODES = [
  { code: '+91', country: 'India', flag: '🇮🇳', format: '10 digits' },
  { code: '+1', country: 'USA / Canada', flag: '🇺🇸', format: '10 digits' },
  { code: '+44', country: 'UK', flag: '🇬🇧', format: '10 digits' },
  { code: '+971', country: 'UAE', flag: '🇦🇪', format: '9 digits' },
  { code: '+65', country: 'Singapore', flag: '🇸🇬', format: '8 digits' },
  { code: '+61', country: 'Australia', flag: '🇦🇺', format: '9 digits' },
  { code: '+64', country: 'New Zealand', flag: '🇳🇿', format: '8-9 digits' },
  { code: '+966', country: 'Saudi Arabia', flag: '🇸🇦', format: '9 digits' },
  { code: '+974', country: 'Qatar', flag: '🇶🇦', format: '8 digits' },
  { code: '+49', country: 'Germany', flag: '🇩🇪', format: '10-11 digits' },
  { code: '+33', country: 'France', flag: '🇫🇷', format: '9 digits' },
  { code: '+39', country: 'Italy', flag: '🇮🇹', format: '10 digits' },
  { code: '+852', country: 'Hong Kong', flag: '🇭🇰', format: '8 digits' },
];

export const WEDDING_TRADITIONS = [
  'Western',
  'Gujarati',
  'Marwadi',
  'Punjabi',
  'South Indian',
  'Bengali',
  'Maharashtrian',
  'Sindhi',
  'Christian',
  'Muslim',
  'Inter-faith',
];

export const WEDDING_TYPES: { id: WeddingType; label: string; description: string }[] = [
  { id: 'Hindu', label: 'Hindu', description: 'Vedic rituals, Pheras & auspicious timings' },
  { id: 'Muslim', label: 'Muslim', description: 'Nikah, Walima & traditional festivities' },
  { id: 'Sikh', label: 'Sikh', description: 'Anand Karaj & vibrant celebrations' },
  { id: 'Christian', label: 'Christian', description: 'White wedding, Church mass & vows' },
  { id: 'Jain', label: 'Jain', description: 'Sacred Lagna rituals & dinner traditions' },
  { id: 'Buddhist', label: 'Buddhist', description: 'Monk blessings & sacred ceremonies' },
  { id: 'Interfaith', label: 'Interfaith', description: 'Blending multiple cultures & rituals' },
  { id: 'Fusion', label: 'Fusion / Multi-cultural', description: 'Cross-cultural bespoke rituals' },
  { id: 'Parsi', label: 'Parsi', description: 'Lagan, Achu Michu & banquet feasts' },
  { id: 'Other', label: 'Other', description: 'Unique cultural ceremony' },
];

export const WEDDING_STYLES: { id: WeddingStyle; label: string; description: string }[] = [
  { id: 'Traditional', label: 'Traditional', description: 'Rich cultural roots and time-honored rituals' },
  { id: 'Modern', label: 'Modern Chic', description: 'Contemporary elegance and sleek aesthetics' },
  { id: 'Intimate', label: 'Intimate Gathering', description: 'Close circle of cherished friends and family' },
  { id: 'Destination', label: 'Destination', description: 'Away from home at a picturesque retreat' },
  { id: 'Big Wedding', label: 'Grand Celebration', description: 'Lavish multi-day affair with high energy' },
  { id: 'Royal Heritage', label: 'Royal Heritage', description: 'Historic palaces, forts, and stately venues' },
  { id: 'Coastal / Beach', label: 'Coastal / Beach', description: 'Sun-drenched sea breezes & relaxed elegance' },
  { id: 'Minimalist', label: 'Minimalist Editorial', description: 'Understated luxury, curated details' },
  { id: 'Other', label: 'Other', description: 'Bespoke celebration concept' },
];

export const GUEST_COUNT_PRESETS = [
  '50 – 100',
  '150 – 250',
  '300 – 500',
  '600 – 800',
  '1000+',
];

export const FIXED_FUNCTION_ORDER = [
  'Mehndi',
  'Haldi',
  'Sangeet',
  'Baraat',
  'Pheras',
  'Reception',
  'Afterparty',
  'Midnight Pheras',
  'Wedding Ceremony',
] as const;

export const DEFAULT_FUNCTION_TEMPLATES = [
  { id: 'fn_mehndi', name: 'Mehndi', defaultTime: 'Afternoon', icon: 'Sparkles' },
  { id: 'fn_haldi', name: 'Haldi', defaultTime: 'Morning', icon: 'Sun' },
  { id: 'fn_sangeet', name: 'Sangeet', defaultTime: 'Evening', icon: 'Music' },
  { id: 'fn_baraat', name: 'Baraat', defaultTime: 'Evening', icon: 'Heart' },
  { id: 'fn_pheras', name: 'Pheras', defaultTime: 'Evening', icon: 'Flame' },
  { id: 'fn_reception', name: 'Reception', defaultTime: 'Night', icon: 'GlassWater' },
  { id: 'fn_afterparty', name: 'Afterparty', defaultTime: 'Night', icon: 'Moon' },
  { id: 'fn_midnight_pheras', name: 'Midnight Pheras', defaultTime: 'Night', icon: 'Sparkles' },
  { id: 'fn_wedding_ceremony', name: 'Wedding Ceremony', defaultTime: 'Evening', icon: 'Heart' },
];

export function sortFunctionsByFixedSequence(fns: WeddingFunction[]): WeddingFunction[] {
  return [...fns].sort((a, b) => {
    const idxA = FIXED_FUNCTION_ORDER.indexOf(a.name as typeof FIXED_FUNCTION_ORDER[number]);
    const idxB = FIXED_FUNCTION_ORDER.indexOf(b.name as typeof FIXED_FUNCTION_ORDER[number]);

    // If both are in fixed list, preserve strict index order
    if (idxA !== -1 && idxB !== -1) {
      return idxA - idxB;
    }
    // If only A is in fixed list, A comes first
    if (idxA !== -1) return -1;
    // If only B is in fixed list, B comes first
    if (idxB !== -1) return 1;
    // Otherwise keep relative custom order
    return 0;
  });
}

export const PHOTOGRAPHY_SERVICES: { id: PhotographyService; title: string; subtitle: string }[] = [
  { id: 'Candid Photography', title: 'Candid Photography', subtitle: 'Unposed, raw emotional moments captured invisibly' },
  { id: 'Cinematic Wedding Film', title: 'Cinematic Wedding Film', subtitle: 'Story-driven 4K documentary style highlight feature' },
  { id: 'Traditional Photography', title: 'Traditional Stage & Portraits', subtitle: 'Formal family group coverage and altar rituals' },
  { id: 'Traditional Video', title: 'Full Length Traditional Video', subtitle: 'Continuous documentary recording of complete rituals' },
  { id: 'Pre-Wedding Shoot', title: 'Pre-Wedding Editorial Session', subtitle: 'Romantic bespoke shoot in casual or formal couture' },
  { id: 'Couple Portraits', title: 'Fine Art Couple Portraits', subtitle: 'Dedicated golden-hour portraiture sessions' },
  { id: 'Drone Coverage', title: 'Drone & Aerial Cinematography', subtitle: 'Sweeping venue vistas and grand guest entrances' },
  { id: 'Wedding Albums', title: 'Handcrafted Coffee Table Albums', subtitle: 'Flush-mount fine art archival leather/linen books' },
  { id: 'Full Wedding Coverage', title: 'Full Studio Team Coverage', subtitle: 'End-to-end lead directors, candid & cinematography crew' },
  { id: 'Live Streaming', title: '4K Private Live Streaming', subtitle: 'Ultra-low latency private broadcast for remote family' },
  { id: 'Other', title: 'Custom Photography Request', subtitle: 'Tailored requirements unique to your celebrations' },
];

export const DISCOVERY_SOURCES: DiscoverySource[] = [
  'Instagram',
  'Friend / Family',
  'Previous Client',
  'Wedding Planner',
  'Venue Recommendation',
  'Google Search',
  'Vogue / WedMeGood / Editorial',
  'Other',
];

export function generateSubmissionId(): string {
  const year = new Date().getFullYear();
  const randomLetters = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const char1 = randomLetters.charAt(Math.floor(Math.random() * randomLetters.length));
  const char2 = randomLetters.charAt(Math.floor(Math.random() * randomLetters.length));
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `VS-${year}-${char1}${char2}${randomNum}`;
}

export function createInitialSubmission(): ClientSubmission {
  return {
    id: `sub_${Date.now()}`,
    submissionId: generateSubmissionId(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    phone: '',
    countryCode: '+91',
    partner1: '',
    partner2: '',
    weddingTypes: ['Hindu'],
    weddingStyles: ['Traditional'],
    city: '',
    mainVenue: '',
    guestCount: '300 – 500',
    sameVenueForAll: true,
    sameCityForAll: true,
    sameGuestCountForAll: true,
    functions: [],
    photographyServices: ['Candid Photography', 'Cinematic Wedding Film', 'Handcrafted Wedding Albums' as PhotographyService],
    specialMoments: '',
    photographyPreferences: '',
    references: [],
    files: [],
    discoverySource: 'Instagram',
    instagramHandle: '',
    plannerName: '',
    plannerPhone: '',
    weddingWebsite: '',
    additionalInformation: '',
    status: 'NEW',
    syncedToGoogleSheets: false,
    internalNotes: [],
  };
}
