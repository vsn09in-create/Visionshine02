import React, { useState } from 'react';
import { COUNTRY_CODES } from '../../data/constants';
import { Phone, ShieldCheck, ChevronDown, Sparkles } from 'lucide-react';

interface Screen01PhoneProps {
  phone: string;
  countryCode: string;
  onChange: (phone: string, countryCode: string) => void;
  onEnterPress: () => void;
  isValid: boolean;
}

export const Screen01Phone: React.FC<Screen01PhoneProps> = ({
  phone,
  countryCode,
  onChange,
  onEnterPress,
  isValid,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handlePhoneInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Keep only numbers
    const cleanNumber = e.target.value.replace(/\D/g, '');
    // Limit to max 12 digits
    const trimmed = cleanNumber.slice(0, 12);
    onChange(trimmed, countryCode);
  };

  const handleCountryChange = (code: string) => {
    onChange(phone, code);
    setIsDropdownOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && isValid) {
      e.preventDefault();
      onEnterPress();
    }
  };

  const selectedCountry = COUNTRY_CODES.find((c) => c.code === countryCode) || COUNTRY_CODES[0];

  return (
    <div className="w-full max-w-xl mx-auto px-4 py-8 sm:py-12 animate-fadeIn">
      {/* Editorial Header */}
      <div className="mb-6 sm:mb-8 text-left sm:text-center">
        <span className="text-[10px] uppercase tracking-[0.4em] text-[var(--text-accent)] mb-2 block font-semibold">
          Step 01 / 09 · Private Client Portal
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-light text-[var(--text-primary)] tracking-tight mb-3 italic">
          Let's get started.
        </h1>
        <p className="text-sm sm:text-base text-[var(--text-secondary)] font-light leading-relaxed max-w-md mx-auto">
          Tell us how we can reach you. Our creative directors will use this number for your bespoke consultation and day-of planning.
        </p>
      </div>

      {/* Main Input Box */}
      <div className="bg-[var(--bg-surface)] backdrop-blur-xs border border-[var(--border-app)] rounded-2xl p-6 sm:p-8 shadow-2xs transition-all">
        <label htmlFor="input-phone-number" className="block text-[10px] uppercase tracking-[0.2em] text-[var(--text-muted)] font-medium mb-3">
          Mobile Number <span className="text-[var(--text-accent)]">*</span>
        </label>

        <div className="relative flex items-center">
          {/* Country Selector Dropdown */}
          <div className="relative">
            <button
              id="btn-country-selector"
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center space-x-1.5 h-14 px-3.5 bg-[var(--bg-app)] border border-r-0 border-[var(--border-app)] rounded-l-xl text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--bg-surface-subtle)] transition-colors focus:ring-1 focus:ring-[var(--text-primary)] cursor-pointer"
            >
              <span className="text-base">{selectedCountry.flag}</span>
              <span className="font-sans font-medium">{selectedCountry.code}</span>
              <ChevronDown className="w-3.5 h-3.5 text-[var(--text-muted)]" />
            </button>

            {isDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsDropdownOpen(false)}
                />
                <div className="absolute left-0 top-full mt-2 w-64 max-w-[calc(100vw-3rem)] max-h-60 overflow-y-auto bg-[var(--bg-surface)] border border-[var(--border-app)] rounded-xl shadow-lg z-50 py-1">
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
                      <span className="font-mono text-[var(--text-muted)] shrink-0 ml-2">{c.code}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Number Input */}
          <div className="relative flex-1">
            <input
              id="input-phone-number"
              type="tel"
              autoFocus
              value={phone}
              onChange={handlePhoneInput}
              onKeyDown={handleKeyDown}
              placeholder={countryCode === '+91' ? 'Enter 10-digit mobile number' : 'Enter mobile number'}
              className="w-full h-14 px-4 bg-[var(--bg-app)] border border-[var(--border-app)] rounded-r-xl text-base sm:text-lg font-sans text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--text-primary)] focus:bg-[var(--bg-surface)] transition-all tracking-wide"
            />
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
              <Phone className="w-4 h-4 text-[var(--text-muted)]" />
            </div>
          </div>
        </div>

        {/* Validation hint */}
        <div className="mt-3 flex items-center justify-between">
          {phone.length > 0 && !isValid ? (
            <p className="text-xs text-[#B85C43] font-sans">
              {countryCode === '+91' ? 'Please enter a valid 10-digit Indian mobile number.' : 'Please enter a valid mobile number.'}
            </p>
          ) : (
            <p className="text-xs text-[var(--text-secondary)] font-sans">
              {countryCode === '+91' && phone.length === 10 ? '✓ Valid Indian mobile number' : 'WhatsApp and calls will be coordinated on this number.'}
            </p>
          )}
          {countryCode === '+91' && (
            <span className="text-[11px] font-mono text-[var(--text-muted)]">
              {phone.length}/10
            </span>
          )}
        </div>
      </div>

      {/* Trust & Privacy Notice */}
      <div className="mt-6 flex items-start space-x-2.5 px-3 py-2 text-xs text-[var(--text-muted)] font-sans">
        <ShieldCheck className="w-4 h-4 text-[var(--text-accent)] shrink-0 mt-0.5" />
        <p>
          We respect your privacy. No marketing automation bots. Your number remains strictly confidential with our studio directors.
        </p>
      </div>
    </div>
  );
};
