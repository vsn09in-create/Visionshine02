import React from 'react';
import { GUEST_COUNT_PRESETS } from '../../data/constants';
import { Search, MapPin, Building, Users, Minus, Plus } from 'lucide-react';

interface Screen04LocationProps {
  partner1?: string;
  partner2?: string;
  city: string;
  mainVenue: string;
  guestCount: string;
  sameVenueForAll: boolean;
  sameCityForAll: boolean;
  sameGuestCountForAll: boolean;
  onChange: (updates: {
    city?: string;
    mainVenue?: string;
    guestCount?: string;
    sameVenueForAll?: boolean;
    sameCityForAll?: boolean;
    sameGuestCountForAll?: boolean;
  }) => void;
  onEnterPress: () => void;
}

export const Screen04Location: React.FC<Screen04LocationProps> = ({
  partner1 = '',
  partner2 = '',
  city,
  mainVenue,
  guestCount,
  sameVenueForAll,
  sameCityForAll,
  sameGuestCountForAll,
  onChange,
  onEnterPress,
}) => {
  // Parse numeric guest count for stepper/slider if possible, default to 350
  const numericCount = parseInt(guestCount.replace(/[^\d]/g, ''), 10) || 350;

  const handleStepCount = (delta: number) => {
    const next = Math.max(20, Math.min(3000, numericCount + delta));
    onChange({ guestCount: `${next} Guests` });
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    onChange({ guestCount: `${val} Guests` });
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-8 sm:py-14 relative z-10 animate-fadeIn">
      {/* Editorial Header */}
      <div className="mb-8 sm:mb-12 text-center">
        <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.35em] text-[var(--text-accent)] mb-2.5 block font-semibold">
          Step 3 of 6
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl font-light text-[var(--text-primary)] tracking-tight mb-3 italic">
          Where's it happening?
        </h1>
        <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-light tracking-wide max-w-md mx-auto">
          And roughly how many guests are coming
        </p>
      </div>

      {/* Main Location & Venue Inputs */}
      <div className="space-y-4 max-w-xl mx-auto mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* City / Destination Input */}
          <div className="relative">
            <input
              id="input-destination-city"
              type="text"
              autoFocus
              value={city}
              onChange={(e) => onChange({ city: e.target.value })}
              placeholder="Destination / City (e.g. Udaipur)"
              className="w-full h-13 px-5 pl-11 bg-[var(--bg-surface)] border border-[var(--border-app)] rounded-full text-xs sm:text-sm font-sans text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--text-primary)] shadow-2xs transition-all"
            />
            <Search className="w-4 h-4 text-[var(--text-muted)] absolute left-4 top-1/2 -translate-y-1/2" />
          </div>

          {/* Main Venue Input */}
          <div className="relative">
            <input
              id="input-main-venue"
              type="text"
              value={mainVenue}
              onChange={(e) => onChange({ mainVenue: e.target.value })}
              placeholder="Main Venue (e.g. Lake Palace)"
              className="w-full h-13 px-5 pl-11 bg-[var(--bg-surface)] border border-[var(--border-app)] rounded-full text-xs sm:text-sm font-sans text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--text-primary)] shadow-2xs transition-all"
            />
            <Building className="w-4 h-4 text-[var(--text-muted)] absolute left-4 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        {/* Minimal Toggles (Matching 3rd page in screenshot) */}
        <div className="bg-[var(--bg-surface)] border border-[var(--border-app)] rounded-2xl p-4 sm:p-5 shadow-2xs space-y-3.5">
          {/* Toggle 1: Same Venue */}
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm font-light text-[var(--text-primary)]">
              Same Venue for all functions?
            </span>
            <button
              type="button"
              onClick={() => onChange({ sameVenueForAll: !sameVenueForAll })}
              className={`w-11 h-6 rounded-full p-0.5 transition-colors duration-200 cursor-pointer ${
                sameVenueForAll ? 'bg-[var(--accent-pill-bg)]' : 'bg-[var(--border-app)]'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform duration-200 ${
                  sameVenueForAll ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="h-px bg-[var(--border-app-subtle)]" />

          {/* Toggle 2: Same City */}
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm font-light text-[var(--text-primary)]">
              Same City for all functions?
            </span>
            <button
              type="button"
              onClick={() => onChange({ sameCityForAll: !sameCityForAll })}
              className={`w-11 h-6 rounded-full p-0.5 transition-colors duration-200 cursor-pointer ${
                sameCityForAll ? 'bg-[var(--accent-pill-bg)]' : 'bg-[var(--border-app)]'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform duration-200 ${
                  sameCityForAll ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="h-px bg-[var(--border-app-subtle)]" />

          {/* Toggle 3: Same Guest count */}
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm font-light text-[var(--text-primary)]">
              Same Guest count for all functions?
            </span>
            <button
              type="button"
              onClick={() => onChange({ sameGuestCountForAll: !sameGuestCountForAll })}
              className={`w-11 h-6 rounded-full p-0.5 transition-colors duration-200 cursor-pointer ${
                sameGuestCountForAll ? 'bg-[var(--accent-pill-bg)]' : 'bg-[var(--border-app)]'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform duration-200 ${
                  sameGuestCountForAll ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Minimal Guest Count Counter & Slider */}
        <div className="bg-[var(--bg-surface)] border border-[var(--border-app)] rounded-2xl p-5 sm:p-6 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4 text-[var(--text-accent)]" />
              <span className="text-xs uppercase tracking-wider text-[var(--text-muted)] font-medium">
                Approximate Guest Count
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => handleStepCount(-25)}
                className="w-8 h-8 rounded-full border border-[var(--border-app)] hover:bg-[var(--bg-app)] flex items-center justify-center text-[var(--text-primary)] cursor-pointer"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="font-serif text-lg font-medium italic text-[var(--text-primary)] min-w-[70px] text-center">
                {guestCount || `${numericCount} Guests`}
              </span>
              <button
                type="button"
                onClick={() => handleStepCount(25)}
                className="w-8 h-8 rounded-full border border-[var(--border-app)] hover:bg-[var(--bg-app)] flex items-center justify-center text-[var(--text-primary)] cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Range Slider */}
          <input
            type="range"
            min="30"
            max="1500"
            step="20"
            value={numericCount}
            onChange={handleSliderChange}
            className="w-full accent-[var(--text-primary)] cursor-pointer"
          />

          {/* Quick presets */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 mt-4 pt-3 border-t border-[var(--border-app-subtle)]">
            {GUEST_COUNT_PRESETS.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => onChange({ guestCount: preset })}
                className={`px-3 py-1 rounded-full text-[11px] font-mono transition-all cursor-pointer border ${
                  guestCount === preset
                    ? 'bg-[var(--accent-pill-bg)] text-[var(--accent-pill-text)] border-[var(--accent-pill-bg)]'
                    : 'bg-[var(--bg-app)] text-[var(--text-secondary)] border-[var(--border-app)] hover:border-[var(--text-primary)]'
                }`}
              >
                {preset}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
