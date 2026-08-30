import React, { useState } from 'react';
import { WEDDING_TRADITIONS } from '../../data/constants';
import { Plus, Check, Sparkles } from 'lucide-react';

interface Screen03WeddingTypeProps {
  partner1?: string;
  partner2?: string;
  weddingTypes: string[];
  weddingTypeOther?: string;
  weddingStyles: string[];
  weddingStyleOther?: string;
  onChange: (
    weddingTypes: string[],
    weddingTypeOther: string | undefined,
    weddingStyles: string[],
    weddingStyleOther: string | undefined
  ) => void;
}

export const Screen03WeddingType: React.FC<Screen03WeddingTypeProps> = ({
  partner1 = '',
  partner2 = '',
  weddingTypes,
  weddingTypeOther = '',
  weddingStyles,
  weddingStyleOther = '',
  onChange,
}) => {
  const [showCustomInput, setShowCustomInput] = useState(Boolean(weddingTypeOther));
  const [customText, setCustomText] = useState(weddingTypeOther || '');

  const toggleTradition = (tradition: string) => {
    if (weddingTypes.includes(tradition)) {
      if (weddingTypes.length > 1) {
        onChange(
          weddingTypes.filter((t) => t !== tradition),
          weddingTypeOther,
          weddingStyles,
          weddingStyleOther
        );
      }
    } else {
      onChange([...weddingTypes, tradition], weddingTypeOther, weddingStyles, weddingStyleOther);
    }
  };

  const handleCustomTextChange = (val: string) => {
    setCustomText(val);
    onChange(weddingTypes, val, weddingStyles, weddingStyleOther);
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-8 sm:py-14 relative z-10 animate-fadeIn">
      {/* Editorial Header */}
      <div className="mb-8 sm:mb-12 text-center">
        <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.35em] text-[var(--text-accent)] mb-2.5 block font-semibold">
          Step 2 of 6
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl font-light text-[var(--text-primary)] tracking-tight mb-3 italic">
          What kind of wedding is it?
        </h1>
        <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-light tracking-wide max-w-md mx-auto">
          Pick the traditions (or two!). Type it if it's not here.
        </p>
      </div>

      {/* Grid of Minimal Pill Buttons (Matching Screenshot) */}
      <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 max-w-xl mx-auto mb-8">
        {WEDDING_TRADITIONS.map((tradition) => {
          const isSelected = weddingTypes.includes(tradition);
          return (
            <button
              key={tradition}
              type="button"
              onClick={() => toggleTradition(tradition)}
              className={`px-5 sm:px-6 py-2.5 sm:py-3 rounded-full text-xs sm:text-sm font-serif tracking-wide transition-all duration-200 border cursor-pointer ${
                isSelected
                  ? 'bg-[var(--accent-pill-bg)] text-[var(--accent-pill-text)] border-[var(--accent-pill-bg)] shadow-xs scale-105'
                  : 'bg-[var(--bg-surface)] text-[var(--text-primary)] border-[var(--border-app)] hover:border-[var(--text-primary)]'
              }`}
            >
              {tradition}
            </button>
          );
        })}

        {/* Custom Tradition Pill / Toggle */}
        <button
          type="button"
          onClick={() => setShowCustomInput(!showCustomInput)}
          className={`px-5 py-2.5 sm:py-3 rounded-full text-xs sm:text-sm font-serif italic tracking-wide transition-all border cursor-pointer inline-flex items-center space-x-1.5 ${
            showCustomInput || weddingTypeOther
              ? 'bg-[var(--bg-surface-subtle)] text-[var(--text-primary)] border-[var(--text-primary)]'
              : 'bg-[var(--bg-surface)] text-[var(--text-muted)] border-[var(--border-app)] hover:text-[var(--text-primary)]'
          }`}
        >
          <Plus className="w-3 h-3" />
          <span>Type custom</span>
        </button>
      </div>

      {/* Custom Input Box if toggled */}
      {(showCustomInput || weddingTypeOther) && (
        <div className="max-w-md mx-auto bg-[var(--bg-surface)] border border-[var(--border-app)] rounded-2xl p-4 sm:p-5 shadow-2xs animate-fadeIn">
          <label className="block text-[10px] uppercase tracking-[0.2em] text-[var(--text-muted)] font-medium mb-2 text-center">
            Custom Cultural Tradition / Style
          </label>
          <input
            type="text"
            value={customText}
            onChange={(e) => handleCustomTextChange(e.target.value)}
            placeholder="e.g. Royal Rajputana, Destination Fusion..."
            className="w-full h-11 px-4 text-center bg-[var(--bg-app)] border border-[var(--border-app)] rounded-xl text-xs sm:text-sm font-serif italic text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--text-primary)] focus:bg-[var(--bg-surface)] transition-all"
          />
        </div>
      )}
    </div>
  );
};
