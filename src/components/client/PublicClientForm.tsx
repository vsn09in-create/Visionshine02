import React, { useState, useEffect } from 'react';
import { ClientSubmission, PublicFormMetadata } from '../../types';
import { createInitialSubmission, TOTAL_STEPS } from '../../data/constants';
import { Screen01Who } from '../screens/Screen01Who';
import { Screen03WeddingType } from '../screens/Screen03WeddingType';
import { Screen04Location } from '../screens/Screen04Location';
import { Screen05BigDays } from '../screens/Screen05BigDays';
import { Screen09Review } from '../screens/Screen09Review';
import { Screen10Success } from '../screens/Screen10Success';
import { ProgressIndicator } from '../ProgressIndicator';
import { NavigationControls } from '../NavigationControls';
import { ThemeMode } from '../../utils/theme';
import { Sun, Moon, Check, AlertCircle, Loader2 } from 'lucide-react';
import { VisionShineLogo } from '../VisionShineLogo';

interface PublicClientFormProps {
  formCode: string;
  theme: ThemeMode;
  onToggleTheme: () => void;
  onExitToAdmin?: () => void;
}

export const PublicClientForm: React.FC<PublicClientFormProps> = ({
  formCode,
  theme,
  onToggleTheme,
  onExitToAdmin,
}) => {
  const [formMeta, setFormMeta] = useState<PublicFormMetadata | null>(null);
  const [isLoadingMeta, setIsLoadingMeta] = useState(true);
  const [metaError, setMetaError] = useState<string | null>(null);

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [maxAccessibleStep, setMaxAccessibleStep] = useState<number>(1);
  const [submission, setSubmission] = useState<ClientSubmission>(() => {
    try {
      const storageKey = `client_form_${formCode}_draft`;
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.submissionId) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Could not load draft', e);
    }
    return createInitialSubmission();
  });

  const [isSaved, setIsSaved] = useState(true);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Fetch Public Form Meta
  useEffect(() => {
    let isMounted = true;
    const fetchMeta = async () => {
      setIsLoadingMeta(true);
      setMetaError(null);
      try {
        const res = await fetch(`/api/public/form/${encodeURIComponent(formCode)}`);
        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.message || 'This inquiry form link is invalid or unavailable.');
        }
        if (isMounted) {
          setFormMeta(data.form);
        }
      } catch (err: any) {
        if (isMounted) {
          setMetaError(err.message || 'Form link unavailable.');
        }
      } finally {
        if (isMounted) {
          setIsLoadingMeta(false);
        }
      }
    };

    fetchMeta();
    return () => {
      isMounted = false;
    };
  }, [formCode]);

  // Update max accessible step
  useEffect(() => {
    if (currentStep > maxAccessibleStep) {
      setMaxAccessibleStep(currentStep);
    }
  }, [currentStep, maxAccessibleStep]);

  // Auto-save draft locally
  useEffect(() => {
    setIsSaved(false);
    const timer = setTimeout(() => {
      try {
        const storageKey = `client_form_${formCode}_draft`;
        localStorage.setItem(storageKey, JSON.stringify(submission));
        setIsSaved(true);
        setLastSavedAt(new Date().toLocaleTimeString());
      } catch (e) {
        console.warn('Draft save error', e);
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [submission, formCode]);

  // Validation Rules
  const phoneDigits = submission.phone.replace(/\D/g, '');
  const minPhoneDigits = submission.countryCode === '+91' ? 10 : 6;
  const isStep1Valid = Boolean(
    submission.partner1.trim().length >= 1 &&
      submission.partner2.trim().length >= 1 &&
      phoneDigits.length >= minPhoneDigits
  );

  const isStep2Valid = Boolean(
    submission.weddingTypes.length > 0 ||
      (submission.weddingTypeOther && submission.weddingTypeOther.trim().length > 0)
  );

  const isStep3Valid = Boolean(submission.city.trim().length >= 1);
  const isStep4Valid = Boolean(submission.functions.length >= 1);
  const isStep5Valid = isStep1Valid && isStep2Valid && isStep3Valid && isStep4Valid;

  const canContinue = (() => {
    switch (currentStep) {
      case 1:
        return isStep1Valid;
      case 2:
        return isStep2Valid;
      case 3:
        return isStep3Valid;
      case 4:
        return isStep4Valid;
      case 5:
        return isStep5Valid;
      default:
        return true;
    }
  })();

  const disabledReason = (() => {
    if (canContinue) return undefined;
    switch (currentStep) {
      case 1:
        if (!submission.partner1.trim()) {
          return 'Enter 1st partner name';
        }
        if (!submission.partner2.trim()) {
          return 'Enter 2nd partner name';
        }
        if (phoneDigits.length < minPhoneDigits) {
          return submission.countryCode === '+91'
            ? 'Enter 10-digit mobile number'
            : 'Enter valid mobile number';
        }
        return 'Please enter couple details';
      case 2:
        return 'Pick at least 1 wedding tradition';
      case 3:
        return 'Enter destination or city';
      case 4:
        return 'Add at least 1 function';
      default:
        return 'Please complete required fields';
    }
  })();

  const handleNext = () => {
    if (!canContinue) return;
    if (currentStep === TOTAL_STEPS) {
      handleSubmit();
    } else {
      setCurrentStep((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleJumpToStep = (step: number) => {
    setCurrentStep(step);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Submit directly to Google Sheet via server Service Account
  const handleSubmit = async () => {
    if (!isStep5Valid) {
      setSubmitError('Please complete all required sections before submitting.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const response = await fetch(`/api/public/form/${encodeURIComponent(formCode)}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submission),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.error ||
            result.message ||
            'Failed to record your submission to the studio ledger. Please try again.'
        );
      }

      // Update state with confirmed submission ID from Google Sheet
      if (result.submission) {
        setSubmission(result.submission);
      }

      // Remove local draft
      try {
        localStorage.removeItem(`client_form_${formCode}_draft`);
      } catch (e) {
        // ignore
      }

      // Transition to verified thank you screen
      setCurrentStep(6);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      console.error('[Client Submission Error]', err);
      setSubmitError(
        err.message || 'We could not save your submission. Please check your connection and retry.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartNew = () => {
    try {
      localStorage.removeItem(`client_form_${formCode}_draft`);
    } catch (e) {
      // ignore
    }
    setSubmission(createInitialSubmission());
    setCurrentStep(1);
    setMaxAccessibleStep(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (isLoadingMeta) {
    return (
      <div className="min-h-screen bg-[var(--bg-app)] flex flex-col items-center justify-center p-6 text-center">
        <Loader2 className="w-8 h-8 text-[var(--text-accent)] animate-spin mb-4" />
        <h2 className="font-serif text-xl text-[var(--text-primary)] font-normal">
          Loading Inquiry Questionnaire...
        </h2>
        <p className="text-xs text-[var(--text-secondary)] mt-1">Connecting to studio portal</p>
      </div>
    );
  }

  if (metaError || !formMeta) {
    return (
      <div className="min-h-screen bg-[var(--bg-app)] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="font-serif text-2xl text-[var(--text-primary)] font-normal mb-2">
          Inquiry Link Unavailable
        </h2>
        <p className="text-xs sm:text-sm text-[var(--text-secondary)] max-w-md mx-auto mb-6">
          {metaError || 'This client form link is invalid or has been deactivated by the studio.'}
        </p>
        {onExitToAdmin && (
          <button
            type="button"
            onClick={onExitToAdmin}
            className="px-4 py-2 rounded-xl bg-[var(--accent-pill-bg)] text-[var(--accent-pill-text)] text-xs font-medium uppercase tracking-wider cursor-pointer"
          >
            Return to Studio Dashboard
          </button>
        )}
      </div>
    );
  }

  const coupleHeaderName =
    submission.partner1.trim() && submission.partner2.trim()
      ? `${submission.partner1.trim()} & ${submission.partner2.trim()}`
      : submission.partner1.trim() || submission.partner2.trim() || 'Wedding Inquiry';

  return (
    <div className="min-h-screen bg-[var(--bg-app)] text-[var(--text-primary)] flex flex-col selection:bg-[var(--accent-pill-bg)] selection:text-[var(--accent-pill-text)] relative overflow-x-hidden font-sans transition-colors duration-200">
      {/* Editorial Circular Ambient Halo Watermark */}
      <div className="fixed top-24 left-1/2 -translate-x-1/2 w-[340px] sm:w-[520px] h-[340px] sm:h-[520px] rounded-full border border-[var(--border-app)]/40 pointer-events-none select-none z-0 opacity-70" />
      <div className="fixed top-36 left-1/2 -translate-x-1/2 w-[240px] sm:w-[380px] h-[240px] sm:h-[380px] rounded-full border border-[var(--border-app-subtle)]/30 pointer-events-none select-none z-0 opacity-50" />

      {/* Clean Client Header (NO ADMIN CONTROLS / NO GOOGLE SIGN IN) */}
      <header className="sticky top-0 z-30 bg-[var(--bg-app)]/85 backdrop-blur-md border-b border-[var(--border-app)] px-4 sm:px-8 py-3.5 transition-colors duration-200">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center">
            <VisionShineLogo size="md" />
          </div>

          <div className="flex items-center space-x-2">
            {/* Auto-save status badge */}
            <div className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1 rounded-full border border-[var(--border-app)] bg-[var(--bg-surface)] text-[10px] text-[var(--text-secondary)]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#107C41] animate-pulse" />
              <span>{isSaved ? 'Auto-Saved' : 'Saving...'}</span>
            </div>

            {/* Theme Toggle */}
            <button
              type="button"
              onClick={onToggleTheme}
              className="p-2 rounded-full border border-[var(--border-app)] bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
              title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
            >
              {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>

            {/* Admin Switcher if authorized preview */}
            {onExitToAdmin && (
              <button
                type="button"
                onClick={onExitToAdmin}
                className="text-[11px] uppercase tracking-wider px-2.5 py-1 rounded-lg border border-[var(--border-app)] hover:bg-[var(--bg-surface-subtle)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
              >
                Exit to Studio
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Progress Bar for Step 1-5 */}
      {currentStep <= TOTAL_STEPS && (
        <ProgressIndicator
          currentStep={currentStep}
          onStepClick={handleJumpToStep}
          maxAccessibleStep={maxAccessibleStep}
        />
      )}

      {/* Main Questionnaire Screen */}
      <main className="flex-1 flex flex-col justify-center relative z-10 pb-6">
        {currentStep === 1 && (
          <Screen01Who
            partner1={submission.partner1}
            partner2={submission.partner2}
            phone={submission.phone}
            countryCode={submission.countryCode}
            email={submission.email}
            onChange={(updates) =>
              setSubmission((prev) => ({
                ...prev,
                ...updates,
              }))
            }
            onEnterPress={handleNext}
            isValid={isStep1Valid}
          />
        )}

        {currentStep === 2 && (
          <Screen03WeddingType
            partner1={submission.partner1}
            partner2={submission.partner2}
            weddingTypes={submission.weddingTypes}
            weddingTypeOther={submission.weddingTypeOther || ''}
            weddingStyles={submission.weddingStyles}
            weddingStyleOther={submission.weddingStyleOther || ''}
            onChange={(weddingTypes, weddingTypeOther, weddingStyles, weddingStyleOther) =>
              setSubmission((prev) => ({
                ...prev,
                weddingTypes,
                weddingTypeOther,
                weddingStyles,
                weddingStyleOther,
              }))
            }
          />
        )}

        {currentStep === 3 && (
          <Screen04Location
            partner1={submission.partner1}
            partner2={submission.partner2}
            city={submission.city}
            mainVenue={submission.mainVenue}
            guestCount={submission.guestCount}
            sameVenueForAll={submission.sameVenueForAll}
            sameCityForAll={submission.sameCityForAll}
            sameGuestCountForAll={submission.sameGuestCountForAll}
            onChange={(updates) =>
              setSubmission((prev) => ({
                ...prev,
                ...updates,
              }))
            }
            onEnterPress={handleNext}
          />
        )}

        {currentStep === 4 && (
          <Screen05BigDays
            partner1={submission.partner1}
            partner2={submission.partner2}
            functions={submission.functions}
            mainVenue={submission.mainVenue}
            defaultGuestCount={submission.guestCount}
            sameVenueForAll={submission.sameVenueForAll}
            sameGuestCountForAll={submission.sameGuestCountForAll}
            onChange={(funcs) =>
              setSubmission((prev) => ({
                ...prev,
                functions: funcs,
              }))
            }
          />
        )}

        {currentStep === 5 && (
          <Screen09Review
            submission={submission}
            onEditStep={handleJumpToStep}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            submitError={submitError}
            onUpdateServices={(services) =>
              setSubmission((prev) => ({
                ...prev,
                photographyServices: services,
              }))
            }
          />
        )}

        {currentStep === 6 && (
          <Screen10Success
            data={submission}
            studioName={formMeta?.studioName}
            studioPhone={formMeta?.studioPhone}
            studioWhatsapp={formMeta?.studioWhatsapp}
            onStartNew={handleStartNew}
          />
        )}
      </main>

      {/* Bottom Sticky Navigation (Steps 1 to 4) */}
      {currentStep < TOTAL_STEPS && (
        <NavigationControls
          currentStep={currentStep}
          canContinue={canContinue}
          disabledReason={disabledReason}
          onNext={handleNext}
          onBack={handleBack}
          isSubmitting={isSubmitting}
        />
      )}

      {/* Footer Branding */}
      {currentStep <= TOTAL_STEPS && (
        <footer className="w-full py-6 text-center text-xs text-[var(--text-muted)] border-t border-[var(--border-app)]/40 relative z-10">
          <div className="max-w-2xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <span className="font-serif italic text-sm text-[var(--text-secondary)]">
              {formMeta.studioName}
            </span>
            <span className="text-[11px] font-mono uppercase tracking-widest text-[var(--text-muted)]">
              Secure Direct Transmission
            </span>
          </div>
        </footer>
      )}
    </div>
  );
};
