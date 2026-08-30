import React from 'react';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { TOTAL_STEPS } from '../data/constants';

interface NavigationControlsProps {
  currentStep: number;
  canContinue: boolean;
  onBack: () => void;
  onNext: () => void;
  nextLabel?: string;
  isSubmitting?: boolean;
  disabledReason?: string;
}

export const NavigationControls: React.FC<NavigationControlsProps> = ({
  currentStep,
  canContinue,
  onBack,
  onNext,
  nextLabel,
  isSubmitting = false,
  disabledReason,
}) => {
  const isFirstStep = currentStep === 1;
  const isReviewStep = currentStep === TOTAL_STEPS;

  const defaultLabel = isReviewStep ? 'Confirm & Send' : 'Continue';
  const label = nextLabel || defaultLabel;

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-4 sm:py-8 mt-2">
      <div className="flex items-center justify-between gap-3">
        {/* Back Button */}
        <div className="flex items-center">
          {!isFirstStep && (
            <button
              id="btn-nav-back"
              type="button"
              onClick={onBack}
              disabled={isSubmitting}
              className="group inline-flex items-center space-x-2 min-h-[44px] min-w-[44px] px-3 py-2 rounded-full text-xs uppercase tracking-[0.2em] font-medium text-[var(--text-primary)] opacity-70 hover:opacity-100 hover:bg-[var(--bg-surface)] active:scale-95 transition-all cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1 text-[var(--text-primary)]" />
              <span className="font-sans">Back</span>
            </button>
          )}
        </div>

        {/* Continue Button & Status */}
        <div className="flex flex-col sm:flex-row items-end sm:items-center space-y-1 sm:space-y-0 sm:space-x-3">
          {disabledReason && !canContinue && (
            <span className="text-[11px] sm:text-xs text-[var(--text-muted)] italic font-serif max-w-[220px] text-right">
              {disabledReason}
            </span>
          )}

          <button
            id="btn-nav-continue"
            type="button"
            onClick={onNext}
            disabled={!canContinue || isSubmitting}
            className={`group inline-flex items-center justify-center space-x-2.5 sm:space-x-3 px-6 sm:px-8 py-3 sm:py-3.5 min-h-[46px] rounded-full text-xs font-medium uppercase tracking-[0.2em] transition-all duration-300 shadow-sm active:scale-[0.98] ${
              canContinue && !isSubmitting
                ? 'bg-[var(--accent-pill-bg)] text-[var(--accent-pill-text)] hover:opacity-90 cursor-pointer shadow-md'
                : 'bg-[var(--border-app)] text-[var(--text-muted)] cursor-not-allowed opacity-60'
            }`}
          >
            {isSubmitting ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-current/40 border-t-current rounded-full animate-spin" />
                <span className="font-sans">Submitting...</span>
              </>
            ) : (
              <>
                <span className="font-sans">{label}</span>
                {isReviewStep ? (
                  <Check className="w-3.5 h-3.5 text-[var(--text-accent)]" />
                ) : (
                  <ArrowRight className="w-3.5 h-3.5 text-[var(--text-accent)] transition-transform group-hover:translate-x-1" />
                )}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

