import React, { useState, useEffect } from 'react';
import { StudioProfile } from './types';
import { StudioLogin } from './components/studio/StudioLogin';
import { StudioDashboard } from './components/studio/StudioDashboard';
import { PublicClientForm } from './components/client/PublicClientForm';
import { VisionShineLogo } from './components/VisionShineLogo';
import { ThemeMode, getInitialTheme, applyTheme } from './utils/theme';
import { initGlobalClickSound } from './utils/sound';
import { safeFetchJson } from './utils/api';

function parseFormCodeFromLocation(): string | null {
  if (typeof window === 'undefined') return null;

  // Check path e.g. /form/VS-WED901 or /forms/VS-WED901
  const path = window.location.pathname;
  const pathMatch = path.match(/^\/forms?\/([A-Za-z0-9-_]+)/i);
  if (pathMatch && pathMatch[1]) {
    return pathMatch[1].toUpperCase();
  }

  // Check search query e.g. ?form=VS-WED901
  const params = new URLSearchParams(window.location.search);
  const formQuery = params.get('form') || params.get('code');
  if (formQuery) {
    return formQuery.toUpperCase();
  }

  // Check hash e.g. #/form/VS-WED901 or #form=VS-WED901
  const hash = window.location.hash;
  const hashMatch = hash.match(/forms?\/([A-Za-z0-9-_]+)/i) || hash.match(/form=([A-Za-z0-9-_]+)/i);
  if (hashMatch && hashMatch[1]) {
    return hashMatch[1].toUpperCase();
  }

  return null;
}

export default function App() {
  const [theme, setTheme] = useState<ThemeMode>(getInitialTheme);
  const [activeFormCode, setActiveFormCode] = useState<string | null>(parseFormCodeFromLocation);
  const [studio, setStudio] = useState<StudioProfile | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Apply theme to HTML root
  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  // Sound effects
  useEffect(() => {
    const cleanup = initGlobalClickSound();
    return cleanup;
  }, []);

  // Listen for browser navigation (back/forward)
  useEffect(() => {
    const handlePopState = () => {
      setActiveFormCode(parseFormCodeFromLocation());
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Fetch Studio Profile / Session on load
  useEffect(() => {
    const checkStudioSession = async () => {
      try {
        const savedToken = localStorage.getItem('studio_auth_token');
        const { ok, data } = await safeFetchJson<{ success: boolean; studio?: StudioProfile }>('/api/studio/profile');
        if (ok && data && data.success && data.studio) {
          // If token exists or was previously logged in
          if (savedToken) {
            setStudio(data.studio);
          }
        }
      } catch (e) {
        console.warn('Could not verify studio profile', e);
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkStudioSession();
  }, []);

  const handleLoginSuccess = (loggedStudio: StudioProfile, token: string) => {
    localStorage.setItem('studio_auth_token', token);
    setStudio(loggedStudio);
  };

  const handleLogout = () => {
    localStorage.removeItem('studio_auth_token');
    setStudio(null);
  };

  const handlePreviewForm = (formCode: string) => {
    window.history.pushState({}, '', `/form/${formCode}`);
    setActiveFormCode(formCode);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleExitToAdmin = () => {
    window.history.pushState({}, '', '/');
    setActiveFormCode(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ROUTE 1: PUBLIC CLIENT INQUIRY FORM (Completely Public, NO Google Login)
  if (activeFormCode) {
    return (
      <PublicClientForm
        formCode={activeFormCode}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        onExitToAdmin={studio ? handleExitToAdmin : undefined}
      />
    );
  }

  // ROUTE 2: STUDIO OWNER / ADMIN DASHBOARD
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-[var(--bg-app)] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-[var(--text-accent)] border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!studio) {
    return (
      <div className="min-h-screen bg-[var(--bg-app)] text-[var(--text-primary)] transition-colors duration-200">
        <header className="px-6 py-4 border-b border-[var(--border-app)] flex items-center justify-between">
          <VisionShineLogo size="sm" />
          <button
            type="button"
            onClick={handleToggleTheme}
            className="p-2 rounded-xl border border-[var(--border-app)] bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
        </header>
        <StudioLogin onLoginSuccess={handleLoginSuccess} />
      </div>
    );
  }

  return (
    <StudioDashboard
      studio={studio}
      onUpdateStudio={(updated) => setStudio(updated)}
      onLogout={handleLogout}
      onPreviewForm={handlePreviewForm}
      theme={theme}
      onToggleTheme={handleToggleTheme}
    />
  );
}
