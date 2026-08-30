import React from 'react';
import { STUDIO_CONFIG } from '../data/constants';
import { Check, Sun, Moon, FolderOpen } from 'lucide-react';
import { ThemeMode } from '../utils/theme';
import { VisionShineLogo } from './VisionShineLogo';

interface HeaderProps {
  currentStep: number;
  partner1: string;
  partner2: string;
  isSaved: boolean;
  theme: ThemeMode;
  onToggleTheme: () => void;
  onOpenDrive?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentStep,
  partner1,
  partner2,
  isSaved,
  theme,
  onToggleTheme,
  onOpenDrive,
}) => {
  const coupleName = partner1.trim() && partner2.trim()
    ? `${partner1.trim()} & ${partner2.trim()}`
    : partner1.trim() || partner2.trim() || '';

  const isMoonMode = theme === 'dark';

  return (
    <header className="sticky top-0 z-40 w-full bg-[var(--bg-app)]/90 backdrop-blur-md border-b border-[var(--border-app)] transition-colors duration-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-3.5 flex items-center justify-between gap-2 sm:gap-3">
        {/* Left: Studio Firm Name */}
        <div className="flex flex-col min-w-0 pr-1 sm:pr-2">
          <div className="flex items-center">
            <VisionShineLogo size="md" />
          </div>

          {coupleName && currentStep > 1 && (
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-serif italic break-words mt-0.5 leading-snug truncate max-w-[200px] sm:max-w-none">
              Curating story for{' '}
              <span className="text-[var(--text-primary)] font-medium not-italic">
                {coupleName}
              </span>
            </p>
          )}
        </div>

        {/* Right: Actions (Theme Toggle & Auto-save status) */}
        <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
          {/* Subtle Auto-save indicator */}
          <div className="hidden sm:flex items-center space-x-1.5 px-2.5 sm:px-3 py-1 rounded-full bg-[var(--bg-surface)] border border-[var(--border-app)] text-[10px] uppercase tracking-widest text-[var(--text-muted)]">
            {isSaved ? (
              <>
                <Check className="w-3 h-3 text-[#5A7D58]" />
                <span className="font-sans">Saved</span>
              </>
            ) : (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--text-accent)] animate-pulse" />
                <span className="font-sans">Saving...</span>
              </>
            )}
          </div>

          {/* Google Drive / Workspace Connector Button */}
          {onOpenDrive && (
            <button
              id="btn-header-google-drive"
              type="button"
              onClick={onOpenDrive}
              title="Browse Google Drive & Sheets"
              aria-label="Browse Google Drive & Sheets"
              className="flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 min-h-[38px] rounded-full border border-[var(--border-app)] bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-subtle)] active:scale-95 text-[var(--text-primary)] transition-all cursor-pointer shadow-2xs group"
            >
              <FolderOpen className="w-3.5 h-3.5 text-[var(--text-accent)] group-hover:scale-110 transition-transform" />
              <span className="text-[11px] font-sans uppercase tracking-wider text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] hidden xs:inline">
                Drive & Sheets
              </span>
            </button>
          )}

          {/* Elegant Sun / Moon Mode Toggle Button */}
          <button
            id="btn-theme-toggle"
            type="button"
            onClick={onToggleTheme}
            title={isMoonMode ? 'Switch to Sun Mode' : 'Switch to Moon Mode'}
            aria-label={isMoonMode ? 'Switch to Sun Mode' : 'Switch to Moon Mode'}
            className="flex items-center space-x-1.5 px-3 py-1.5 min-h-[38px] rounded-full border border-[var(--border-app)] bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-subtle)] active:scale-95 text-[var(--text-primary)] transition-all cursor-pointer shadow-2xs group"
          >
            {isMoonMode ? (
              <>
                <Sun className="w-3.5 h-3.5 text-[#E5C158] transition-transform group-hover:rotate-45" />
                <span className="text-[11px] font-sans uppercase tracking-wider text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]">
                  Sun
                </span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-[var(--text-accent)] transition-transform group-hover:-rotate-12" />
                <span className="text-[11px] font-sans uppercase tracking-wider text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]">
                  Moon
                </span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

