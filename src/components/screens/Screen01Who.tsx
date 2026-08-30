import React, { useState } from 'react';
import { COUNTRY_CODES } from '../../data/constants';
import { Phone, ChevronDown, Check } from 'lucide-react';

interface Screen01WhoProps {
  partner1: string;
  partner2: string;
  phone: string;
  countryCode: string;
  email?: string;
  onChange: (updates: {
    partner1?: string;
    partner2?: string;
    phone?: string;
    countryCode?: string;
    email?: string;
  }) => void;
  onEnterPress: () => void;
  isValid: boolean;
}

export const Screen01Who: React.FC<Screen01WhoProps> = ({
  partner1,
  partner2,
  phone,
  countryCode,
  email = '',
  onChange,
  onEnterPress,
  isValid,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const selectedCountry =
    COUNTRY_CODES.find((c) => c.code === countryCode) || COUNTRY_CODES[0];

  const handleCountryChange = (code: string) => {
    onChange({ countryCode: code });
    setIsDropdownOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && isValid) {
      e.preventDefault();
      onEnterPress();
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-8 sm:py-14 relative z-10 animate-fadeIn">
      {/* Editorial Header */}
      <div className="mb-8 sm:mb-12 text-center">
        <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.35em] text-[var(--text-accent)] mb-2.5 block font-semibold">
          Fill us in on the big details
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl font-light text-[var(--text-primary)] tracking-tight mb-3 italic">
          Who's getting married?
        </h1>
        <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-light tracking-wide max-w-sm mx-auto">
          Add both the names
        </p>
      </div>

      {/* Main Couple Names Input Boxes (Horizontal & Centered with &) */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 max-w-xl mx-auto">
          {/* Partner 1 Name */}
          <div className="w-full sm:flex-1">
            <input
              id="input-partner-1"
              type="text"
              autoFocus
              value={partner1}
              onChange={(e) => onChange({ partner1: e.target.value })}
              onKeyDown={handleKeyDown}
              placeholder="Priya"
              className="w-full h-14 px-6 text-center bg-[var(--bg-surface)] border border-[var(--border-app)] rounded-full text-lg sm:text-xl font-serif italic text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--text-primary)] focus:ring-1 focus:ring-[var(--text-primary)] shadow-2xs transition-all"
            />
          </div>

          {/* Centered Ampersand */}
          <span className="font-serif text-xl sm:text-2xl italic text-[var(--text-accent)] font-light shrink-0 select-none">
            &amp;
          </span>

          {/* Partner 2 Name */}
          <div className="w-full sm:flex-1">
            <input
              id="input-partner-2"
              type="text"
              value={partner2}
              onChange={(e) => onChange({ partner2: e.target.value })}
              onKeyDown={handleKeyDown}
              placeholder="Aniket"
              className="w-full h-14 px-6 text-center bg-[var(--bg-surface)] border border-[var(--border-app)] rounded-full text-lg sm:text-xl font-serif italic text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--text-primary)] focus:ring-1 focus:ring-[var(--text-primary)] shadow-2xs transition-all"
            />
          </div>
        </div>
      </div>

      {/* Contact Phone & Country Code Box */}
      <div className="max-w-md mx-auto bg-[var(--bg-surface)] border border-[var(--border-app)] rounded-3xl p-5 sm:p-6 shadow-2xs space-y-4">
        <div>
          <label
            htmlFor="input-phone-number"
            className="block text-[10px] uppercase tracking-[0.2em] text-[var(--text-muted)] font-medium mb-2 text-center"
          >
            WhatsApp / Primary Contact Number <span className="text-[var(--text-accent)]">*</span>
          </label>

          <div className="flex items-center gap-2">
            {/* Country code selector */}
            <div className="relative shrink-0">
              <button
                id="btn-country-selector"
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center space-x-1.5 h-12 px-3.5 bg-[var(--bg-app)] border border-[var(--border-app)] rounded-2xl text-xs font-mono text-[var(--text-primary)] hover:bg-[var(--bg-surface-subtle)] transition-colors cursor-pointer"
              >
                <span>{selectedCountry.flag}</span>
                <span className="font-semibold">{selectedCountry.code}</span>
                <ChevronDown className="w-3 h-3 text-[var(--text-muted)]" />
              </button>

              {isDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsDropdownOpen(false)}
                  />
                  <div className="absolute left-0 top-full mt-2 w-64 max-w-[calc(100vw-3rem)] max-h-60 overflow-y-auto bg-[var(--bg-surface)] border border-[var(--border-app)] rounded-2xl shadow-xl z-50 py-1.5">
                    {COUNTRY_CODES.map((c) => (
                      <button
                        key={c.code}
                        type="button"
                        onClick={() => handleCountryChange(c.code)}
                        className="w-full flex items-center justify-between px-3.5 py-2.5 text-xs text-left hover:bg-[var(--bg-surface-subtle)] transition-colors text-[var(--text-primary)] cursor-pointer"
                      >
                        <span className="flex items-center space-x-2">
                          <span>{c.flag}</span>
                          <span className="truncate">{c.country}</span>
                        </span>
                        <span className="font-mono text-[var(--text-muted)] shrink-0 ml-2">
                          {c.code}
                        </span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Phone input */}
            <div className="relative flex-1">
              <input
                id="input-phone-number"
                type="tel"
                value={phone}
                onChange={(e) => onChange({ phone: e.target.value.replace(/[^\d\s-]/g, '') })}
                onKeyDown={handleKeyDown}
                placeholder="98765 43210"
                className="w-full h-12 px-4 bg-[var(--bg-app)] border border-[var(--border-app)] rounded-2xl text-sm font-mono text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--text-primary)] focus:bg-[var(--bg-surface)] transition-all"
              />
            </div>
          </div>
        </div>

        {/* Optional Email input */}
        <div>
          <label
            htmlFor="input-email"
            className="block text-[9px] uppercase tracking-[0.2em] text-[var(--text-muted)] font-medium mb-1.5 text-center"
          >
            Email Address <span className="text-[10px] lowercase text-[var(--text-muted)]">(optional for quote copy)</span>
          </label>
          <input
            id="input-email"
            type="email"
            value={email}
            onChange={(e) => onChange({ email: e.target.value })}
            onKeyDown={handleKeyDown}
            placeholder="priya.aniket@gmail.com"
            className="w-full h-11 px-4 bg-[var(--bg-app)] border border-[var(--border-app)] rounded-2xl text-xs font-sans text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--text-primary)] focus:bg-[var(--bg-surface)] transition-all text-center"
          />
        </div>
      </div>
    </div>
  );
};
