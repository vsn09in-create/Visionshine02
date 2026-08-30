import React from 'react';
import { STEP_NAMES, TOTAL_STEPS } from '../data/constants';

interface ProgressIndicatorProps {
  currentStep: number;
  onStepClick?: (step: number) => void;
  maxAccessibleStep?: number;
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  currentStep,
  onStepClick,
  maxAccessibleStep = 1,
}) => {
  if (currentStep > TOTAL_STEPS) {
    return null; // On success screen
  }

  const formattedCurrent = currentStep < 10 ? `0${currentStep}` : `${currentStep}`;
  const formattedTotal = TOTAL_STEPS < 10 ? `0${TOTAL_STEPS}` : `${TOTAL_STEPS}`;
  const currentStepName = STEP_NAMES[currentStep - 1] || '';

  return (
    <div className="w-full max-w-2xl mx-auto px-4 pt-3 sm:pt-5 pb-1 sm:pb-2 relative z-10">
      {/* Top step info */}
      <div className="flex items-center justify-between text-xs font-sans mb-2 sm:mb-3">
        <span className="text-[9px] sm:text-[10px] uppercase tracking-[0.25em] text-[var(--text-muted)] font-medium">
          Step <span className="text-[var(--text-primary)] font-semibold">{formattedCurrent}</span> of{' '}
          <span>{formattedTotal}</span>
        </span>
        <span className="text-[var(--text-accent)] font-serif italic text-xs sm:text-sm tracking-wide truncate ml-2">
          {currentStepName}
        </span>
      </div>

      {/* Segmented Minimal Bar */}
      <div className="flex items-center gap-1.5 sm:gap-2 w-full">
        {Array.from({ length: TOTAL_STEPS }).map((_, index) => {
          const stepNum = index + 1;
          const isCompleted = stepNum < currentStep;
          const isCurrent = stepNum === currentStep;
          const isClickable = onStepClick && stepNum <= maxAccessibleStep;

          return (
            <button
              key={stepNum}
              type="button"
              id={`progress-step-pill-${stepNum}`}
              disabled={!isClickable}
              onClick={() => isClickable && onStepClick(stepNum)}
              title={`Step ${stepNum}: ${STEP_NAMES[index]}`}
              className={`flex-1 h-[2.5px] sm:h-[3px] py-1 -my-1 transition-all duration-300 relative block rounded-full ${
                isCurrent
                  ? 'bg-[var(--accent-pill-bg)] ring-1 ring-[var(--accent-pill-bg)]/30'
                  : isCompleted
                  ? 'bg-[var(--text-accent)] hover:bg-[var(--text-primary)] cursor-pointer'
                  : 'bg-[var(--border-app)]'
              }`}
            />
          );
        })}
      </div>
    </div>
  );
};
