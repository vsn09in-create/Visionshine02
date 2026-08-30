import React from 'react';
import { Heart, Sparkles, User } from 'lucide-react';

interface Screen02CoupleProps {
  partner1: string;
  partner2: string;
  onChange: (partner1: string, partner2: string) => void;
  onEnterPress: () => void;
  isValid: boolean;
}

export const Screen02Couple: React.FC<Screen02CoupleProps> = ({
  partner1,
  partner2,
  onChange,
  onEnterPress,
  isValid,
}) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && isValid) {
      e.preventDefault();
      onEnterPress();
    }
  };

  const coupleTitle = partner1.trim() && partner2.trim()
    ? `${partner1.trim()} & ${partner2.trim()}`
    : partner1.trim() || partner2.trim() || 'The Couple';

  return (
    <div className="w-full max-w-xl mx-auto px-4 py-8 sm:py-12 animate-fadeIn">
      {/* Editorial Header */}
      <div className="mb-8 text-left sm:text-center">
        <span className="text-[10px] uppercase tracking-[0.4em] text-[var(--text-accent)] mb-3 block font-semibold">
          Step 02 / 09 · The Protagonists
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-light text-[var(--text-primary)] tracking-tight mb-3 italic">
          Who's getting married?
        </h1>
        <p className="text-sm sm:text-base text-[var(--text-secondary)] font-light leading-relaxed max-w-md mx-auto">
          Let's start with the two people at the heart of the story. How should we address you both in our wedding album and film titles?
        </p>
      </div>

      {/* Live Preview Card */}
      <div className="mb-8 p-6 bg-[var(--bg-surface)] border border-[var(--border-app)] rounded-2xl text-center relative overflow-hidden shadow-2xs">
        <span className="text-[9px] uppercase tracking-[0.25em] text-[var(--text-accent)] font-medium font-sans">
          Bespoke Archive & Wedding Film
        </span>
        <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-light italic text-[var(--text-primary)] mt-2 tracking-tight transition-all break-words leading-tight px-2">
          {coupleTitle}
        </h2>
        <p className="text-xs text-[var(--text-muted)] font-serif italic mt-1.5">
          Forever begins here
        </p>
      </div>

      {/* Inputs */}
      <div className="space-y-5 bg-[var(--bg-surface)] backdrop-blur-xs border border-[var(--border-app)] rounded-2xl p-6 sm:p-8 shadow-2xs">
        {/* Partner 1 */}
        <div>
          <label htmlFor="input-partner-1" className="block text-[10px] uppercase tracking-[0.2em] text-[var(--text-muted)] font-medium mb-2.5">
            Partner 1 Name <span className="text-[var(--text-accent)]">*</span>
          </label>
          <div className="relative">
            <input
              id="input-partner-1"
              type="text"
              autoFocus
              value={partner1}
              onChange={(e) => onChange(e.target.value, partner2)}
              onKeyDown={handleKeyDown}
              placeholder="e.g. Ananya Singhania"
              className="w-full h-13 px-4 pl-11 bg-[var(--bg-app)] border border-[var(--border-app)] rounded-xl text-base font-sans text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--text-primary)] focus:bg-[var(--bg-surface)] transition-all"
            />
            <User className="w-4 h-4 text-[var(--text-muted)] absolute left-4 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        {/* Partner 2 */}
        <div>
          <label htmlFor="input-partner-2" className="block text-[10px] uppercase tracking-[0.2em] text-[var(--text-muted)] font-medium mb-2.5">
            Partner 2 Name <span className="text-[var(--text-accent)]">*</span>
          </label>
          <div className="relative">
            <input
              id="input-partner-2"
              type="text"
              value={partner2}
              onChange={(e) => onChange(partner1, e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="e.g. Rohan Mehra"
              className="w-full h-13 px-4 pl-11 bg-[var(--bg-app)] border border-[var(--border-app)] rounded-xl text-base font-sans text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--text-primary)] focus:bg-[var(--bg-surface)] transition-all"
            />
            <User className="w-4 h-4 text-[var(--text-muted)] absolute left-4 top-1/2 -translate-y-1/2" />
          </div>
        </div>
      </div>
    </div>
  );
};
