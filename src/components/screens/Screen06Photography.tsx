import React from 'react';
import { PHOTOGRAPHY_SERVICES } from '../../data/constants';
import { PhotographyService } from '../../types';
import { Sparkles, Check, HeartHandshake, Eye } from 'lucide-react';

interface Screen06PhotographyProps {
  partner1?: string;
  partner2?: string;
  services: string[];
  photographyOther?: string;
  specialMoments: string;
  photographyPreferences: string;
  onChange: (updates: {
    photographyServices?: string[];
    photographyOther?: string;
    specialMoments?: string;
    photographyPreferences?: string;
  }) => void;
}

export const Screen06Photography: React.FC<Screen06PhotographyProps> = ({
  partner1 = '',
  partner2 = '',
  services,
  photographyOther = '',
  specialMoments,
  photographyPreferences,
  onChange,
}) => {
  const coupleName = partner1.trim() && partner2.trim()
    ? `${partner1.trim()} & ${partner2.trim()}`
    : partner1.trim() || partner2.trim() || '';

  const toggleService = (serviceId: PhotographyService) => {
    if (services.includes(serviceId)) {
      if (services.length > 1) {
        onChange({
          photographyServices: services.filter((s) => s !== serviceId),
          photographyOther: serviceId === 'Other' ? '' : photographyOther,
        });
      }
    } else {
      onChange({
        photographyServices: [...services, serviceId],
      });
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-6 sm:py-10 animate-fadeIn">
      {/* Editorial Header */}
      <div className="mb-6 sm:mb-8 text-left sm:text-center">
        {coupleName && (
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-[var(--bg-surface)] border border-[var(--border-app)] mb-3 shadow-2xs max-w-full">
            <Sparkles className="w-3 h-3 text-[var(--text-accent)] shrink-0" />
            <span className="font-serif italic text-xs sm:text-sm text-[var(--text-primary)] break-words text-left">
              {coupleName}
            </span>
          </div>
        )}
        <span className="text-[10px] uppercase tracking-[0.4em] text-[var(--text-accent)] mb-2 block font-semibold">
          Step 06 / 09 · Photography & Cinematography
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-light text-[var(--text-primary)] tracking-tight mb-3 italic">
          Tell us how you want your story captured.
        </h1>
        <p className="text-sm sm:text-base text-[var(--text-secondary)] font-light leading-relaxed max-w-lg mx-auto">
          Every love story is unique. Select your desired deliverables and share your aesthetic preferences with our visual artists.
        </p>
      </div>

      {/* Services Grid */}
      <div className="mb-8 sm:mb-10">
        <div className="flex items-center justify-between mb-4">
          <label className="text-[10px] uppercase tracking-[0.2em] text-[var(--text-muted)] font-medium">
            Coverage & Deliverables <span className="text-[var(--text-accent)]">*</span>
          </label>
          <span className="text-[11px] font-serif italic text-[var(--text-accent)]">Select all that apply</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {PHOTOGRAPHY_SERVICES.map((srv) => {
            const isSelected = services.includes(srv.id);
            return (
              <button
                key={srv.id}
                type="button"
                id={`btn-photo-service-${srv.id.toLowerCase().replace(/[\s/]+/g, '-')}`}
                onClick={() => toggleService(srv.id)}
                className={`p-4 rounded-xl text-left border transition-all relative cursor-pointer ${
                  isSelected
                    ? 'bg-[var(--accent-pill-bg)] text-[var(--accent-pill-text)] border-[var(--accent-pill-bg)] shadow-xs'
                    : 'bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-subtle)] text-[var(--text-primary)] border-[var(--border-app)]'
                }`}
              >
                <div className="flex items-start justify-between">
                  <span className="font-sans font-medium text-xs sm:text-sm tracking-wide">
                    {srv.title}
                  </span>
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ml-2 transition-colors ${
                      isSelected ? 'bg-[var(--text-accent)] text-[var(--accent-pill-bg)]' : 'border border-[var(--border-app)]'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                </div>
                <p
                  className={`text-xs font-sans mt-1.5 leading-relaxed ${
                    isSelected ? 'opacity-80' : 'text-[var(--text-secondary)]'
                  }`}
                >
                  {srv.subtitle}
                </p>
              </button>
            );
          })}
        </div>

        {services.includes('Other') && (
          <div className="mt-3">
            <input
              type="text"
              value={photographyOther}
              onChange={(e) => onChange({ photographyOther: e.target.value })}
              placeholder="Specify custom deliverables (e.g. 35mm Film rolls, Polaroid guestbook, Drone light show)..."
              className="w-full h-11 px-3.5 bg-[var(--bg-surface)] border border-[var(--border-app)] rounded-lg text-xs font-sans text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--text-primary)]"
            />
          </div>
        )}
      </div>

      {/* Special Moments Textarea */}
      <div className="space-y-6">
        <div className="bg-[var(--bg-surface)] border border-[var(--border-app)] rounded-2xl p-5 sm:p-6 shadow-2xs">
          <div className="flex items-center space-x-2 mb-2">
            <HeartHandshake className="w-4 h-4 text-[var(--text-accent)]" />
            <label
              htmlFor="textarea-special-moments"
              className="text-[10px] uppercase tracking-[0.2em] text-[var(--text-muted)] font-medium"
            >
              Key People, Hidden Rituals & Cherished Moments
            </label>
          </div>
          <p className="text-xs text-[var(--text-secondary)] font-light mb-3 leading-relaxed">
            Are there special family members (e.g. grandparents, pet dog with rings, surprise flash mob), private first-looks, or rare family traditions we must not miss?
          </p>
          <textarea
            id="textarea-special-moments"
            rows={4}
            value={specialMoments}
            onChange={(e) => onChange({ specialMoments: e.target.value })}
            placeholder="e.g. Groom's sister designed the varmala; Grandfather turns 85 on the wedding day and we want dedicated portraits; Bride will arrive via boat..."
            className="w-full p-4 bg-[var(--bg-app)] border border-[var(--border-app)] rounded-xl text-sm font-sans text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--text-primary)] focus:bg-[var(--bg-surface)] resize-y"
          />
        </div>

        {/* Aesthetic Preferences Textarea */}
        <div className="bg-[var(--bg-surface)] border border-[var(--border-app)] rounded-2xl p-5 sm:p-6 shadow-2xs">
          <div className="flex items-center space-x-2 mb-2">
            <Eye className="w-4 h-4 text-[var(--text-accent)]" />
            <label
              htmlFor="textarea-photography-preferences"
              className="text-[10px] uppercase tracking-[0.2em] text-[var(--text-muted)] font-medium"
            >
              Visual Tone & Coverage Preferences
            </label>
          </div>
          <p className="text-xs text-[var(--text-secondary)] font-light mb-3 leading-relaxed">
            Is there anything specific you want from your photography experience? (e.g. warm cinematic tones, black & white editorial portraits, candid intimacy, unobtrusive cameras, fast-paced highlight reels).
          </p>
          <textarea
            id="textarea-photography-preferences"
            rows={4}
            value={photographyPreferences}
            onChange={(e) => onChange({ photographyPreferences: e.target.value })}
            placeholder="e.g. We love natural candid emotions, editorial fashion lighting, 35mm grain, minimal posed stage photos, and documentary style storytelling..."
            className="w-full p-4 bg-[var(--bg-app)] border border-[var(--border-app)] rounded-xl text-sm font-sans text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--text-primary)] focus:bg-[var(--bg-surface)] resize-y"
          />
        </div>
      </div>
    </div>
  );
};
