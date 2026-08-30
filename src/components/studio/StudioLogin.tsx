import React, { useState } from 'react';
import { StudioProfile } from '../../types';
import { Lock, Mail, ArrowRight, Sparkles, ShieldCheck, Loader2 } from 'lucide-react';
import { googleSignIn } from '../../services/googleAuth';
import { VisionShineLogo } from '../VisionShineLogo';
import { safeFetchJson } from '../../utils/api';

interface StudioLoginProps {
  onLoginSuccess: (studio: StudioProfile, token: string) => void;
}

export const StudioLogin: React.FC<StudioLoginProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('studio@visionshine.com');
  const [password, setPassword] = useState('••••••••••••');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    setError(null);

    try {
      // 1. Trigger Firebase Google Auth popup
      let googleUserEmail = '';
      let googleDisplayName = '';
      let googlePhotoUrl = '';
      let googleAccessToken = '';

      try {
        const authResult = await googleSignIn();
        if (authResult?.user) {
          googleUserEmail = authResult.user.email || '';
          googleDisplayName = authResult.user.displayName || '';
          googlePhotoUrl = authResult.user.photoURL || '';
          googleAccessToken = authResult.accessToken || '';
        }
      } catch (popupErr: any) {
        console.warn('Google popup error, attempting fallback:', popupErr);
        // If popup was blocked or iframe restriction, provide fallback for the logged-in Google user
        if (popupErr.code === 'auth/popup-blocked' || popupErr.code === 'auth/popup-closed-by-user') {
          // If explicitly closed, throw error; otherwise let user know
          throw new Error('Google Sign-In popup was closed. Please try again.');
        }
        throw popupErr;
      }

      if (!googleUserEmail) {
        throw new Error('Could not retrieve email from Google Account.');
      }

      // 2. Exchange with Studio Backend
      const { ok, data } = await safeFetchJson<{ success: boolean; studio: StudioProfile; token: string; message?: string }>(
        '/api/studio/google-login',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: googleUserEmail,
            displayName: googleDisplayName,
            photoURL: googlePhotoUrl,
            accessToken: googleAccessToken,
          }),
        }
      );

      if (!ok || !data || !data.success) {
        throw new Error(data?.message || 'Failed to authenticate Google account with Studio portal.');
      }

      onLoginSuccess(data.studio, data.token);
    } catch (err: any) {
      console.error('Gmail login error:', err);
      setError(err.message || 'Gmail Sign-In failed. Please try again or use email login.');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const { ok, data } = await safeFetchJson<{ success: boolean; studio: StudioProfile; token: string; message?: string }>(
        '/api/studio/login',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email.trim(), password: password.trim() }),
        }
      );

      if (!ok || !data || !data.success) {
        throw new Error(data?.message || 'Invalid credentials.');
      }

      onLoginSuccess(data.studio, data.token);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please verify your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemoLogin = async () => {
    setEmail('studio@visionshine.com');
    setPassword('studio123');
    setIsLoading(true);
    setError(null);

    try {
      const { ok, data } = await safeFetchJson<{ success: boolean; studio: StudioProfile; token: string; message?: string }>(
        '/api/studio/login',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: 'studio@visionshine.com', password: 'demo' }),
        }
      );

      if (!ok || !data || !data.success) {
        throw new Error(data?.message || 'Could not log in.');
      }

      onLoginSuccess(data.studio, data.token);
    } catch (err: any) {
      setError(err.message || 'Login failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-[var(--bg-surface)] border border-[var(--border-app)] rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--border-app)]/30 rounded-full blur-2xl pointer-events-none -mr-10 -mt-10" />

        {/* Brand Heading */}
        <div className="text-center mb-6">
          <div className="mb-2.5">
            <VisionShineLogo size="lg" />
          </div>
          <span className="text-[10px] uppercase tracking-[0.3em] text-[var(--text-muted)] font-medium block mb-1">
            Studio Admin Portal
          </span>
          <h2 className="font-serif text-xl sm:text-2xl text-[var(--text-primary)] font-normal tracking-wide">
            Studio Owner Login
          </h2>
          <p className="text-xs text-[var(--text-secondary)] mt-1.5 max-w-xs mx-auto">
            Manage your inquiry templates, custom public client links, and Google Sheets integrations.
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3 rounded-xl bg-[#FDEDED] dark:bg-[#2C1814] border border-[#F5C2C7] dark:border-[#5C2B29] text-xs text-[#842029] dark:text-[#F8D7DA] flex items-start space-x-2">
            <span>{error}</span>
          </div>
        )}

        {/* Gmail / Google Login Button */}
        <div className="mb-5">
          <button
            type="button"
            id="btn-gmail-login"
            onClick={handleGoogleSignIn}
            disabled={isGoogleLoading || isLoading}
            className="w-full h-11 px-4 rounded-xl border border-[var(--border-app)] bg-[var(--bg-app)] hover:bg-[var(--bg-surface-subtle)] text-[var(--text-primary)] text-xs font-medium flex items-center justify-center space-x-3 shadow-xs hover:border-[var(--text-accent)]/50 active:scale-[0.99] transition-all cursor-pointer group"
          >
            {isGoogleLoading ? (
              <>
                <Loader2 className="w-4 h-4 text-[var(--text-accent)] animate-spin" />
                <span>Connecting to Google Account...</span>
              </>
            ) : (
              <>
                {/* Official Google Color G Icon */}
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
                <span className="font-semibold tracking-wide">Continue with Gmail / Google</span>
              </>
            )}
          </button>
        </div>

        {/* Divider */}
        <div className="relative flex items-center justify-center mb-5">
          <div className="border-t border-[var(--border-app)] w-full" />
          <span className="bg-[var(--bg-surface)] px-3 text-[10px] uppercase tracking-widest text-[var(--text-muted)] font-medium shrink-0">
            or sign in with password
          </span>
          <div className="border-t border-[var(--border-app)] w-full" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] uppercase tracking-wider text-[var(--text-muted)] font-medium mb-1.5">
              Studio Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[var(--text-muted)] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="studio@yourbrand.com"
                className="w-full h-11 pl-10 pr-3.5 bg-[var(--bg-app)] border border-[var(--border-app)] rounded-xl text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--text-primary)] transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] uppercase tracking-wider text-[var(--text-muted)] font-medium mb-1.5">
              Admin Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[var(--text-muted)] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full h-11 pl-10 pr-3.5 bg-[var(--bg-app)] border border-[var(--border-app)] rounded-xl text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--text-primary)] transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            id="btn-studio-login"
            disabled={isLoading || isGoogleLoading}
            className="w-full h-11 mt-2 bg-[var(--accent-pill-bg)] text-[var(--accent-pill-text)] rounded-xl text-xs font-medium uppercase tracking-wider flex items-center justify-center space-x-2 shadow-2xs hover:opacity-90 active:scale-[0.99] transition-all cursor-pointer"
          >
            <span>{isLoading ? 'Signing In...' : 'Sign In with Password'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Quick Demo Access */}
        <div className="mt-6 pt-5 border-t border-[var(--border-app)] text-center">
          <button
            type="button"
            onClick={handleQuickDemoLogin}
            disabled={isLoading || isGoogleLoading}
            className="w-full py-2.5 px-3 rounded-xl border border-[var(--border-app)] hover:border-[var(--text-accent)] bg-[var(--bg-app)] text-xs text-[var(--text-primary)] flex items-center justify-center space-x-2 transition-all cursor-pointer group"
          >
            <Sparkles className="w-3.5 h-3.5 text-[var(--text-accent)] group-hover:scale-110 transition-transform" />
            <span>Instant Demo Access (VISIONSHINE Admin)</span>
          </button>
          <div className="flex items-center justify-center space-x-1.5 text-[10px] text-[var(--text-muted)] mt-3">
            <ShieldCheck className="w-3.5 h-3.5 text-[#107C41]" />
            <span>Clients access forms directly via unique public links without login.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
