import React, { useState } from 'react';
import { WeddingFunction, TimeOfDay } from '../../types';
import {
  DEFAULT_FUNCTION_TEMPLATES,
  sortFunctionsByFixedSequence,
} from '../../data/constants';
import {
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Check,
  Plus,
  Trash2,
  Calendar as CalendarIcon,
  Sun,
  Sunset,
  Moon,
  Sparkles,
  Clock,
  MapPin,
  Users,
} from 'lucide-react';

interface Screen05BigDaysProps {
  partner1?: string;
  partner2?: string;
  functions: WeddingFunction[];
  mainVenue: string;
  defaultGuestCount: string;
  sameVenueForAll?: boolean;
  sameGuestCountForAll?: boolean;
  onChange: (functions: WeddingFunction[]) => void;
}

const TIME_SLOTS: { id: TimeOfDay; label: string; icon: typeof Sun }[] = [
  { id: 'Morning', label: 'Morning', icon: Sun },
  { id: 'Afternoon', label: 'Afternoon', icon: Sun },
  { id: 'Evening', label: 'Evening', icon: Sunset },
  { id: 'Night', label: 'Night', icon: Moon },
];

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

interface DraftState {
  date: string;
  timeSlot: TimeOfDay;
  customTime?: string;
  venue?: string;
  guestCount?: string;
}

export const Screen05BigDays: React.FC<Screen05BigDaysProps> = ({
  functions,
  mainVenue,
  defaultGuestCount,
  sameVenueForAll = true,
  sameGuestCountForAll = true,
  onChange,
}) => {
  // Which function name is currently expanded for editing/picking
  const [expandedFnName, setExpandedFnName] = useState<string | null>(null);

  // Active month for the calendar
  const [activeMonthDate, setActiveMonthDate] = useState(() => {
    const firstSaved = functions[0]?.date;
    if (firstSaved) {
      const d = new Date(firstSaved);
      if (!isNaN(d.getTime())) return d;
    }
    return new Date(2026, 7, 1); // August 2026
  });

  // Local unconfirmed drafts per function name
  const [drafts, setDrafts] = useState<Record<string, DraftState>>({});

  // Just-added notification highlight
  const [justSavedName, setJustSavedName] = useState<string | null>(null);

  // Custom celebration name input
  const [customName, setCustomName] = useState('');
  const [showAddCustom, setShowAddCustom] = useState(false);

  // Helper to format date
  const formatReadableDate = (dateStr?: string) => {
    if (!dateStr) return 'Date not set';
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    const monthName = MONTH_NAMES[month]?.slice(0, 3);
    return `${day} ${monthName} ${year}`;
  };

  // Calendar calculations
  const currentYear = activeMonthDate.getFullYear();
  const currentMonth = activeMonthDate.getMonth();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay();

  const handlePrevMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveMonthDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const handleNextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveMonthDate(new Date(currentYear, currentMonth + 1, 1));
  };

  // Get or initialize draft for a template
  const getDraft = (fnName: string, defaultTime: TimeOfDay): DraftState => {
    if (drafts[fnName]) {
      return drafts[fnName];
    }
    const existing = functions.find(
      (f) => f.name.toLowerCase() === fnName.toLowerCase()
    );
    if (existing) {
      return {
        date: existing.date || `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-15`,
        timeSlot: existing.timeSlot || defaultTime,
        customTime: existing.customTime,
        venue: existing.venue || (sameVenueForAll ? mainVenue : ''),
        guestCount: existing.guestCount || (sameGuestCountForAll ? defaultGuestCount : ''),
      };
    }
    // Default fallback
    const lastDate = functions[functions.length - 1]?.date;
    return {
      date: lastDate || `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-15`,
      timeSlot: defaultTime,
      venue: sameVenueForAll ? mainVenue : '',
      guestCount: sameGuestCountForAll ? defaultGuestCount : '',
    };
  };

  // Update draft without saving to parent
  const updateDraft = (fnName: string, updates: Partial<DraftState>, defaultTime: TimeOfDay) => {
    const current = getDraft(fnName, defaultTime);
    setDrafts((prev) => ({
      ...prev,
      [fnName]: {
        ...current,
        ...updates,
      },
    }));
  };

  // Toggle expand for a function
  const handleToggleExpand = (fnName: string, defaultTime: TimeOfDay) => {
    if (expandedFnName === fnName) {
      setExpandedFnName(null);
    } else {
      setExpandedFnName(fnName);
      const draft = getDraft(fnName, defaultTime);
      if (draft.date) {
        const parts = draft.date.split('-');
        if (parts.length === 3) {
          const y = parseInt(parts[0], 10);
          const m = parseInt(parts[1], 10) - 1;
          if (!isNaN(y) && !isNaN(m)) {
            setActiveMonthDate(new Date(y, m, 1));
          }
        }
      }
    }
  };

  // User officially clicks "Add Function" (or "Update Function")
  const handleConfirmAddFunction = (fnName: string, defaultTime: TimeOfDay, isCustom = false) => {
    const draft = getDraft(fnName, defaultTime);
    const dateToSave = draft.date || `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-15`;

    const existingIndex = functions.findIndex(
      (f) => f.name.toLowerCase() === fnName.toLowerCase()
    );

    let updatedList: WeddingFunction[];
    if (existingIndex >= 0) {
      // Update existing saved function
      updatedList = functions.map((f, idx) =>
        idx === existingIndex
          ? {
              ...f,
              date: dateToSave,
              timeSlot: draft.timeSlot,
              customTime: draft.customTime,
              venue: draft.venue || (sameVenueForAll ? mainVenue : ''),
              guestCount: draft.guestCount || (sameGuestCountForAll ? defaultGuestCount : ''),
            }
          : f
      );
    } else {
      // Add new function
      const newFn: WeddingFunction = {
        id: isCustom ? `fn_custom_${Date.now()}` : `fn_${fnName.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}`,
        name: fnName,
        isCustom,
        date: dateToSave,
        timeSlot: draft.timeSlot,
        customTime: draft.customTime,
        venue: draft.venue || (sameVenueForAll ? mainVenue : ''),
        guestCount: draft.guestCount || (sameGuestCountForAll ? defaultGuestCount : ''),
      };
      updatedList = [...functions, newFn];
    }

    // Strictly maintain the fixed sequence order
    const sorted = sortFunctionsByFixedSequence(updatedList);
    onChange(sorted);

    // Provide visual feedback
    setJustSavedName(fnName);
    setTimeout(() => setJustSavedName(null), 3000);

    // Keep open or collapse
    setExpandedFnName(null);
  };

  // Remove confirmed function
  const handleRemoveFunction = (fnName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = functions.filter(
      (f) => f.name.toLowerCase() !== fnName.toLowerCase()
    );
    onChange(updated);
    if (expandedFnName === fnName) {
      setExpandedFnName(null);
    }
  };

  // Handle adding custom celebration
  const handleCreateCustom = () => {
    if (!customName.trim()) return;
    const name = customName.trim();
    const newDraft: DraftState = {
      date: `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-15`,
      timeSlot: 'Evening',
      venue: sameVenueForAll ? mainVenue : '',
      guestCount: sameGuestCountForAll ? defaultGuestCount : '',
    };
    setDrafts((prev) => ({ ...prev, [name]: newDraft }));
    setExpandedFnName(name);
    setCustomName('');
    setShowAddCustom(false);
  };

  // Fixed Templates List (1 through 9)
  const templates = DEFAULT_FUNCTION_TEMPLATES;

  // Custom added functions
  const customFunctions = functions.filter(
    (f) => !templates.some((t) => t.name.toLowerCase() === f.name.toLowerCase())
  );

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-8 sm:py-14 relative z-10 animate-fadeIn">
      {/* Editorial Header */}
      <div className="mb-8 sm:mb-10 text-center">
        <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.35em] text-[var(--text-accent)] mb-2.5 block font-semibold">
          Step 4 of 5
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl font-light text-[var(--text-primary)] tracking-tight mb-3 italic">
          The big days
        </h1>
        <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-light tracking-wide max-w-md mx-auto">
          Select a celebration, choose its date and time, and click{' '}
          <span className="font-medium text-[var(--text-primary)]">“Add Function”</span> to save it to your schedule.
        </p>

        {/* Counter of saved celebrations */}
        <div className="mt-3 inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[var(--bg-surface)] border border-[var(--border-app)] text-[11px] text-[var(--text-muted)] font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--text-accent)]" />
          <span>{functions.length} {functions.length === 1 ? 'Celebration' : 'Celebrations'} Added</span>
        </div>
      </div>

      {/* FIXED SEQUENCE LIST OF 9 FUNCTIONS */}
      <div className="space-y-3 max-w-xl mx-auto">
        {templates.map((tmpl, index) => {
          const sequenceNumber = index + 1;
          const isConfirmed = functions.some(
            (f) => f.name.toLowerCase() === tmpl.name.toLowerCase()
          );
          const savedFunction = functions.find(
            (f) => f.name.toLowerCase() === tmpl.name.toLowerCase()
          );
          const isExpanded = expandedFnName === tmpl.name;
          const draft = getDraft(tmpl.name, tmpl.defaultTime as TimeOfDay);
          const isJustSaved = justSavedName === tmpl.name;

          // Day selected in calendar draft
          let selectedDayNumber: number | null = null;
          if (draft.date) {
            const parts = draft.date.split('-');
            if (parts.length === 3) {
              const y = parseInt(parts[0], 10);
              const m = parseInt(parts[1], 10) - 1;
              const d = parseInt(parts[2], 10);
              if (y === currentYear && m === currentMonth) {
                selectedDayNumber = d;
              }
            }
          }

          return (
            <div
              key={tmpl.name}
              id={`function-row-${sequenceNumber}`}
              className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
                isConfirmed
                  ? isExpanded
                    ? 'bg-[var(--bg-surface)] border-[var(--text-primary)] shadow-sm'
                    : 'bg-[var(--bg-surface)] border-[var(--border-app)] hover:border-[var(--text-primary)]/50'
                  : isExpanded
                  ? 'bg-[var(--bg-surface)] border-[var(--border-app)] shadow-sm'
                  : 'bg-[var(--bg-surface-subtle)] border-[var(--border-app-subtle)] opacity-85 hover:opacity-100 hover:border-[var(--border-app)]'
              } ${isJustSaved ? 'ring-2 ring-[var(--text-accent)]/50' : ''}`}
            >
              {/* Option Row Header */}
              <button
                type="button"
                onClick={() => handleToggleExpand(tmpl.name, tmpl.defaultTime as TimeOfDay)}
                className="w-full px-4 sm:px-5 py-4 flex items-center justify-between text-left cursor-pointer transition-colors"
              >
                <div className="flex items-center space-x-3.5 min-w-0">
                  {/* Sequence Position Number */}
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center font-mono text-[11px] font-medium shrink-0 transition-all ${
                      isConfirmed
                        ? 'bg-[var(--accent-pill-bg)] text-[var(--accent-pill-text)] font-bold'
                        : 'bg-[var(--bg-app)] border border-[var(--border-app)] text-[var(--text-muted)]'
                    }`}
                  >
                    {isConfirmed ? <Check className="w-3.5 h-3.5 stroke-[2.5]" /> : sequenceNumber}
                  </div>

                  {/* Function Title */}
                  <div className="min-w-0">
                    <span
                      className={`font-serif text-base sm:text-lg italic tracking-wide truncate block ${
                        isConfirmed
                          ? 'text-[var(--text-primary)] font-medium'
                          : 'text-[var(--text-primary)]/80'
                      }`}
                    >
                      {tmpl.name}
                    </span>
                  </div>
                </div>

                {/* Right side: Status / Date & Time or '+ Select Date & Time' */}
                <div className="flex items-center space-x-2.5 shrink-0 ml-3">
                  {isConfirmed && savedFunction ? (
                    <div className="flex items-center space-x-1.5">
                      <span className="text-[11px] sm:text-xs font-mono font-medium text-[var(--text-accent)] bg-[var(--bg-app)] px-2.5 py-1 rounded-full border border-[var(--border-app-subtle)] flex items-center space-x-1">
                        <span>{formatReadableDate(savedFunction.date)}</span>
                        <span className="opacity-40">·</span>
                        <span>{savedFunction.timeSlot}</span>
                      </span>
                    </div>
                  ) : (
                    <span className="text-[11px] text-[var(--text-muted)] font-mono hover:text-[var(--text-primary)] transition-colors">
                      {isExpanded ? 'Editing...' : '+ Select Date & Time'}
                    </span>
                  )}

                  <div className="text-[var(--text-muted)] p-0.5">
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-[var(--text-primary)]" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </div>
                </div>
              </button>

              {/* EXPANDABLE DATE, TIME & ADD FUNCTION PANEL */}
              {isExpanded && (
                <div className="px-4 sm:px-5 pb-5 pt-2 border-t border-[var(--border-app-subtle)] animate-fadeIn space-y-4">
                  {/* Calendar Widget for Selecting Date */}
                  <div className="bg-[var(--bg-app)] border border-[var(--border-app)] rounded-2xl p-4">
                    <div className="flex items-center justify-between mb-3 px-1">
                      <div className="flex items-center space-x-1.5">
                        <CalendarIcon className="w-3.5 h-3.5 text-[var(--text-accent)]" />
                        <span className="font-serif text-sm sm:text-base italic text-[var(--text-primary)] font-medium">
                          {MONTH_NAMES[currentMonth]} {currentYear}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <button
                          type="button"
                          onClick={handlePrevMonth}
                          className="p-1.5 hover:bg-[var(--bg-surface)] rounded-full text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
                          title="Previous Month"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={handleNextMonth}
                          className="p-1.5 hover:bg-[var(--bg-surface)] rounded-full text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
                          title="Next Month"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Days of Week */}
                    <div className="grid grid-cols-7 gap-1 text-center mb-1.5 text-[10px] uppercase font-mono text-[var(--text-muted)]">
                      <span>Su</span>
                      <span>Mo</span>
                      <span>Tu</span>
                      <span>We</span>
                      <span>Th</span>
                      <span>Fr</span>
                      <span>Sa</span>
                    </div>

                    {/* Day Grid */}
                    <div className="grid grid-cols-7 gap-1 text-center">
                      {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                        <div key={`empty-${i}`} className="h-8" />
                      ))}
                      {Array.from({ length: daysInMonth }).map((_, i) => {
                        const day = i + 1;
                        const isDaySelected = selectedDayNumber === day;
                        return (
                          <button
                            key={day}
                            type="button"
                            onClick={() => {
                              const formatted = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                              updateDraft(tmpl.name, { date: formatted }, tmpl.defaultTime as TimeOfDay);
                            }}
                            className={`h-8 rounded-full text-xs font-mono flex items-center justify-center transition-all cursor-pointer ${
                              isDaySelected
                                ? 'bg-[var(--accent-pill-bg)] text-[var(--accent-pill-text)] font-bold scale-105 shadow-xs'
                                : 'hover:bg-[var(--bg-surface)] text-[var(--text-primary)]'
                            }`}
                          >
                            {day}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Time of Day Slots */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-[10px] uppercase tracking-[0.2em] text-[var(--text-muted)] font-medium flex items-center space-x-1">
                        <Clock className="w-3 h-3 text-[var(--text-accent)]" />
                        <span>Select Time of Day</span>
                      </label>
                      <span className="text-[11px] font-mono text-[var(--text-accent)]">
                        {draft.timeSlot}
                      </span>
                    </div>
                    <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
                      {TIME_SLOTS.map((slot) => {
                        const Icon = slot.icon;
                        const isSlotSelected = draft.timeSlot === slot.id;
                        return (
                          <button
                            key={slot.id}
                            type="button"
                            onClick={() =>
                              updateDraft(tmpl.name, { timeSlot: slot.id }, tmpl.defaultTime as TimeOfDay)
                            }
                            className={`py-2.5 px-1 rounded-xl text-center border text-xs font-serif transition-all cursor-pointer flex flex-col items-center justify-center space-y-1 ${
                              isSlotSelected
                                ? 'bg-[var(--accent-pill-bg)] text-[var(--accent-pill-text)] border-[var(--accent-pill-bg)] shadow-2xs'
                                : 'bg-[var(--bg-app)] text-[var(--text-secondary)] border-[var(--border-app)] hover:border-[var(--text-primary)]'
                            }`}
                          >
                            <Icon className="w-3.5 h-3.5" />
                            <span className="text-[11px]">{slot.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Venue / Guest Count Overrides */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                    <div>
                      <label className="block text-[9px] uppercase tracking-[0.2em] text-[var(--text-muted)] font-medium mb-1">
                        Venue / Location (Optional)
                      </label>
                      <input
                        type="text"
                        value={draft.venue || ''}
                        onChange={(e) =>
                          updateDraft(tmpl.name, { venue: e.target.value }, tmpl.defaultTime as TimeOfDay)
                        }
                        placeholder={mainVenue || 'Venue name'}
                        className="w-full h-9 px-3 bg-[var(--bg-app)] border border-[var(--border-app)] rounded-xl text-xs font-sans text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--text-primary)]"
                      />
                    </div>

                    <div>
                      <label className="block text-[9px] uppercase tracking-[0.2em] text-[var(--text-muted)] font-medium mb-1">
                        Guest Count (Optional)
                      </label>
                      <input
                        type="text"
                        value={draft.guestCount || ''}
                        onChange={(e) =>
                          updateDraft(tmpl.name, { guestCount: e.target.value }, tmpl.defaultTime as TimeOfDay)
                        }
                        placeholder={defaultGuestCount || 'e.g. 300'}
                        className="w-full h-9 px-3 bg-[var(--bg-app)] border border-[var(--border-app)] rounded-xl text-xs font-sans text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--text-primary)]"
                      />
                    </div>
                  </div>

                  {/* CLEAR & PROMINENT "ADD FUNCTION" ACTION BUTTON */}
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => handleConfirmAddFunction(tmpl.name, tmpl.defaultTime as TimeOfDay)}
                      className="w-full py-3.5 px-5 rounded-xl bg-[var(--accent-pill-bg)] text-[var(--accent-pill-text)] hover:opacity-90 active:scale-[0.99] font-sans font-medium text-xs sm:text-sm tracking-wide flex items-center justify-between shadow-sm cursor-pointer transition-all border border-[var(--accent-pill-bg)]"
                    >
                      <div className="flex items-center space-x-2.5">
                        <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                        <span className="font-serif italic text-sm sm:text-base font-medium">
                          {isConfirmed ? `Update ${tmpl.name}` : `Add Function (${tmpl.name})`}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1.5 text-[11px] font-mono opacity-90">
                        <span>{formatReadableDate(draft.date)}</span>
                        <span>·</span>
                        <span>{draft.timeSlot}</span>
                      </div>
                    </button>

                    <p className="text-[10px] text-center text-[var(--text-muted)] mt-2 font-mono">
                      * Clicking Add Function saves this celebration in position #{sequenceNumber}
                    </p>
                  </div>

                  {/* Remove action if function is already saved */}
                  {isConfirmed && (
                    <div className="pt-1 flex justify-end">
                      <button
                        type="button"
                        onClick={(e) => handleRemoveFunction(tmpl.name, e)}
                        className="text-[11px] text-[var(--text-muted)] hover:text-[#B85C43] inline-flex items-center space-x-1 cursor-pointer transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Remove from schedule</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {/* CUSTOM FUNCTIONS (If any added by user) */}
        {customFunctions.map((fn, customIdx) => {
          const isExpanded = expandedFnName === fn.name;
          const draft = getDraft(fn.name, fn.timeSlot || 'Evening');
          const isConfirmed = true;

          let selectedDayNumber: number | null = null;
          if (draft.date) {
            const parts = draft.date.split('-');
            if (parts.length === 3) {
              const y = parseInt(parts[0], 10);
              const m = parseInt(parts[1], 10) - 1;
              const d = parseInt(parts[2], 10);
              if (y === currentYear && m === currentMonth) {
                selectedDayNumber = d;
              }
            }
          }

          return (
            <div
              key={fn.name}
              className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
                isExpanded
                  ? 'bg-[var(--bg-surface)] border-[var(--text-primary)] shadow-sm'
                  : 'bg-[var(--bg-surface)] border-[var(--border-app)] hover:border-[var(--text-primary)]/50'
              }`}
            >
              {/* Header */}
              <button
                type="button"
                onClick={() => handleToggleExpand(fn.name, fn.timeSlot || 'Evening')}
                className="w-full px-4 sm:px-5 py-4 flex items-center justify-between text-left cursor-pointer transition-colors"
              >
                <div className="flex items-center space-x-3.5 min-w-0">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center font-mono text-[11px] font-bold bg-[var(--accent-pill-bg)] text-[var(--accent-pill-text)] shrink-0">
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  </div>
                  <span className="font-serif text-base sm:text-lg italic tracking-wide truncate block text-[var(--text-primary)] font-medium">
                    {fn.name}
                  </span>
                </div>

                <div className="flex items-center space-x-2.5 shrink-0 ml-3">
                  <span className="text-[11px] sm:text-xs font-mono font-medium text-[var(--text-accent)] bg-[var(--bg-app)] px-2.5 py-1 rounded-full border border-[var(--border-app-subtle)]">
                    {formatReadableDate(fn.date)} · {fn.timeSlot}
                  </span>
                  <div className="text-[var(--text-muted)] p-0.5">
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-[var(--text-primary)]" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </div>
                </div>
              </button>

              {/* Editor */}
              {isExpanded && (
                <div className="px-4 sm:px-5 pb-5 pt-2 border-t border-[var(--border-app-subtle)] animate-fadeIn space-y-4">
                  {/* Calendar */}
                  <div className="bg-[var(--bg-app)] border border-[var(--border-app)] rounded-2xl p-4">
                    <div className="flex items-center justify-between mb-3 px-1">
                      <span className="font-serif text-sm sm:text-base italic text-[var(--text-primary)] font-medium">
                        {MONTH_NAMES[currentMonth]} {currentYear}
                      </span>
                      <div className="flex items-center space-x-1">
                        <button
                          type="button"
                          onClick={handlePrevMonth}
                          className="p-1.5 hover:bg-[var(--bg-surface)] rounded-full text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={handleNextMonth}
                          className="p-1.5 hover:bg-[var(--bg-surface)] rounded-full text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-7 gap-1 text-center mb-1.5 text-[10px] uppercase font-mono text-[var(--text-muted)]">
                      <span>Su</span>
                      <span>Mo</span>
                      <span>Tu</span>
                      <span>We</span>
                      <span>Th</span>
                      <span>Fr</span>
                      <span>Sa</span>
                    </div>

                    <div className="grid grid-cols-7 gap-1 text-center">
                      {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                        <div key={`empty-${i}`} className="h-8" />
                      ))}
                      {Array.from({ length: daysInMonth }).map((_, i) => {
                        const day = i + 1;
                        const isDaySelected = selectedDayNumber === day;
                        return (
                          <button
                            key={day}
                            type="button"
                            onClick={() => {
                              const formatted = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                              updateDraft(fn.name, { date: formatted }, 'Evening');
                            }}
                            className={`h-8 rounded-full text-xs font-mono flex items-center justify-center transition-all cursor-pointer ${
                              isDaySelected
                                ? 'bg-[var(--accent-pill-bg)] text-[var(--accent-pill-text)] font-bold scale-105 shadow-xs'
                                : 'hover:bg-[var(--bg-surface)] text-[var(--text-primary)]'
                            }`}
                          >
                            {day}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Time */}
                  <div>
                    <label className="block text-[10px] uppercase tracking-[0.2em] text-[var(--text-muted)] font-medium mb-1.5">
                      Select Time of Day
                    </label>
                    <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
                      {TIME_SLOTS.map((slot) => {
                        const Icon = slot.icon;
                        const isSlotSelected = draft.timeSlot === slot.id;
                        return (
                          <button
                            key={slot.id}
                            type="button"
                            onClick={() =>
                              updateDraft(fn.name, { timeSlot: slot.id }, 'Evening')
                            }
                            className={`py-2.5 px-1 rounded-xl text-center border text-xs font-serif transition-all cursor-pointer flex flex-col items-center justify-center space-y-1 ${
                              isSlotSelected
                                ? 'bg-[var(--accent-pill-bg)] text-[var(--accent-pill-text)] border-[var(--accent-pill-bg)]'
                                : 'bg-[var(--bg-app)] text-[var(--text-secondary)] border-[var(--border-app)] hover:border-[var(--text-primary)]'
                            }`}
                          >
                            <Icon className="w-3.5 h-3.5" />
                            <span className="text-[11px]">{slot.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Add Function Button */}
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => handleConfirmAddFunction(fn.name, 'Evening', true)}
                      className="w-full py-3.5 px-5 rounded-xl bg-[var(--accent-pill-bg)] text-[var(--accent-pill-text)] hover:opacity-90 active:scale-[0.99] font-sans font-medium text-xs sm:text-sm tracking-wide flex items-center justify-between shadow-sm cursor-pointer transition-all border border-[var(--accent-pill-bg)]"
                    >
                      <div className="flex items-center space-x-2.5">
                        <Check className="w-4 h-4" />
                        <span className="font-serif italic text-sm sm:text-base font-medium">
                          Update {fn.name}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1.5 text-[11px] font-mono opacity-90">
                        <span>{formatReadableDate(draft.date)}</span>
                        <span>·</span>
                        <span>{draft.timeSlot}</span>
                      </div>
                    </button>
                  </div>

                  <div className="pt-1 flex justify-end">
                    <button
                      type="button"
                      onClick={(e) => handleRemoveFunction(fn.name, e)}
                      className="text-[11px] text-[var(--text-muted)] hover:text-[#B85C43] inline-flex items-center space-x-1 cursor-pointer transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Remove from schedule</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* Add Custom Celebration Prompt */}
        {showAddCustom ? (
          <div className="bg-[var(--bg-surface)] border border-[var(--border-app)] rounded-2xl p-4 shadow-2xs animate-fadeIn">
            <label className="block text-[10px] uppercase tracking-[0.2em] text-[var(--text-muted)] font-medium mb-2 text-center">
              Custom Function or Ritual Name
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                autoFocus
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="e.g. Ring Ceremony, Welcome Brunch..."
                onKeyDown={(e) => e.key === 'Enter' && handleCreateCustom()}
                className="flex-1 h-11 px-4 bg-[var(--bg-app)] border border-[var(--border-app)] rounded-xl text-xs sm:text-sm font-serif italic text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--text-primary)]"
              />
              <button
                type="button"
                onClick={handleCreateCustom}
                disabled={!customName.trim()}
                className="h-11 px-5 bg-[var(--accent-pill-bg)] text-[var(--accent-pill-text)] rounded-xl text-xs uppercase tracking-wider font-medium cursor-pointer disabled:opacity-40"
              >
                Proceed
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddCustom(false);
                  setCustomName('');
                }}
                className="h-11 px-3 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowAddCustom(true)}
            className="w-full py-3.5 rounded-2xl border border-dashed border-[var(--border-app)] bg-[var(--bg-surface-subtle)] text-xs font-serif italic text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--text-primary)] flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-2xs mt-4"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Add Custom Function or Celebration</span>
          </button>
        )}
      </div>
    </div>
  );
};
