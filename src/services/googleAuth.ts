import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  User,
  signOut,
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);

const provider = new GoogleAuthProvider();
// Request Google Drive & Google Sheets scopes
provider.addScope('https://www.googleapis.com/auth/drive.file');
provider.addScope('https://www.googleapis.com/auth/drive.readonly');
provider.addScope('https://www.googleapis.com/auth/spreadsheets');
provider.addScope('https://www.googleapis.com/auth/spreadsheets.readonly');
provider.setCustomParameters({
  prompt: 'select_account',
});

// Flag to indicate if we are in the middle of a sign-in flow.
let isSigningIn = false;
// Cache the access token in memory.
let cachedAccessToken: string | null = null;

// Initialize auth state listener. Call this on app load.
export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        // User is logged into Firebase Auth, token might need refreshed or retrieved on explicit interaction
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken || '');
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

// Must be called from a button click or user interaction
export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Failed to get access token from Firebase Auth');
    }

    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Sign in error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const logout = async () => {
  await signOut(auth);
  cachedAccessToken = null;
};

export interface GoogleDriveFile {
  id: string;
  name: string;
  mimeType: string;
  thumbnailLink?: string;
  webViewLink?: string;
  iconLink?: string;
  size?: string;
}

// Fetch user's Google Drive files (images, docs, PDFs)
export const listDriveFiles = async (
  token?: string,
  query = "mimeType contains 'image/' or mimeType = 'application/pdf' or mimeType contains 'presentation'"
): Promise<GoogleDriveFile[]> => {
  const activeToken = token || cachedAccessToken;
  if (!activeToken) {
    throw new Error('Google authentication required to access Google Drive.');
  }

  const encodedQuery = encodeURIComponent(`trashed = false and (${query})`);
  const response = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${encodedQuery}&fields=files(id,name,mimeType,thumbnailLink,webViewLink,iconLink,size)&pageSize=30&orderBy=modifiedTime desc`,
    {
      headers: {
        Authorization: `Bearer ${activeToken}`,
      },
    }
  );

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Failed to fetch Google Drive files: ${response.statusText}`);
  }

  const data = await response.json();
  return data.files || [];
};

// Fetch user's Google Spreadsheets
export const listSpreadsheets = async (token?: string): Promise<GoogleDriveFile[]> => {
  const activeToken = token || cachedAccessToken;
  if (!activeToken) {
    throw new Error('Google authentication required to access Google Sheets.');
  }

  const query = encodeURIComponent("mimeType = 'application/vnd.google-apps.spreadsheet' and trashed = false");
  const response = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name,mimeType,webViewLink,iconLink)&pageSize=20&orderBy=modifiedTime desc`,
    {
      headers: {
        Authorization: `Bearer ${activeToken}`,
      },
    }
  );

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Failed to fetch Google Spreadsheets: ${response.statusText}`);
  }

  const data = await response.json();
  return data.files || [];
};
