import React, { useState, useEffect } from 'react';
import { StudioFormLink, StudioProfile, FormTemplate } from '../../types';
import { X, Link2, Sparkles, Check, FileSpreadsheet, Shield } from 'lucide-react';

interface CreateFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  studio: StudioProfile;
  template: FormTemplate;
  existingForm?: StudioFormLink | null;
  onSaved: (form: StudioFormLink) => void;
}

export const CreateFormModal: React.FC<CreateFormModalProps> = ({
  isOpen,
  onClose,
  studio,
  template,
  existingForm,
  onSaved,
}) => {
  const [title, setTitle] = useState('');
  const [formCode, setFormCode] = useState('');
  const [spreadsheetId, setSpreadsheetId] = useState('');
  const [appsScriptUrl, setAppsScriptUrl] = useState('');
  const [customGreeting, setCustomGreeting] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (existingForm) {
        setTitle(existingForm.title);
        setFormCode(existingForm.formCode);
        setSpreadsheetId(existingForm.spreadsheetId || studio.defaultSpreadsheetId);
        setAppsScriptUrl(existingForm.appsScriptUrl || studio.appsScriptUrl || '');
        setCustomGreeting(existingForm.customGreeting || '');
      } else {
        const randomDigits = Math.floor(100 + Math.random() * 900);
        setTitle(`${studio.name} - ${template.title}`);
        setFormCode(`VS-WED${randomDigits}`);
        setSpreadsheetId(studio.defaultSpreadsheetId || '1bZkKL-DDJ3k6cge5uOexYYOuQZt4VyZ-bQCgTEbCd-M');
        setAppsScriptUrl(studio.appsScriptUrl || '');
        setCustomGreeting('Welcome! We are honored to document your wedding celebration.');
      }
      setError(null);
    }
  }, [isOpen, existingForm, studio, template]);

  if (!isOpen) return null;

  const generateRandomCode = () => {
    const randomChars = Math.random().toString(36).substring(2, 6).toUpperCase();
    const randomNum = Math.floor(100 + Math.random() * 900);
    setFormCode(`VS-${randomChars}${randomNum}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCode.trim()) {
      setError('Please provide a unique Form Code.');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const url = existingForm ? `/api/studio/forms/${existingForm.formCode}` : '/api/studio/forms';
      const method = existingForm ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          formCode: formCode.trim().toUpperCase(),
          templateId: template.id,
          spreadsheetId: spreadsheetId.trim(),
          appsScriptUrl: appsScriptUrl.trim(),
          customGreeting: customGreeting.trim(),
          allowFileUploads: true,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to save form link.');
      }

      onSaved(data.form);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save form link.');
    } finally {
      setIsSaving(false);
    }
  };

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://yourapp.com';
  const previewUrl = `${origin}/form/${formCode.trim().toUpperCase() || 'VS-XXXXXX'}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-[var(--bg-surface)] border border-[var(--border-app)] rounded-2xl shadow-2xl p-6 sm:p-7 relative max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          type="button"
          className="absolute top-5 right-5 p-2 rounded-full text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-subtle)] transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-start space-x-3.5 mb-6">
          <div className="w-10 h-10 rounded-xl bg-[var(--bg-surface-subtle)] border border-[var(--border-app)] flex items-center justify-center text-[var(--text-accent)] shrink-0">
            <Link2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-[0.2em] text-[var(--text-muted)] font-medium block">
              {template.title}
            </span>
            <h3 className="font-serif text-xl sm:text-2xl text-[var(--text-primary)] font-normal">
              {existingForm ? 'Edit Client Form Link' : 'Create Custom Public Client Link'}
            </h3>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              Generates a unique, login-free URL that you can share directly with clients on WhatsApp, Instagram, or your website.
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-5 p-3 rounded-xl bg-[#FDEDED] dark:bg-[#2C1814] border border-[#F5C2C7] dark:border-[#5C2B29] text-xs text-[#842029] dark:text-[#F8D7DA]">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Form Title */}
          <div>
            <label className="block text-[11px] uppercase tracking-wider text-[var(--text-muted)] font-medium mb-1">
              Form Display Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Wedding Photography Inquiry Form 2026"
              className="w-full h-10 px-3.5 bg-[var(--bg-app)] border border-[var(--border-app)] rounded-xl text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--text-primary)]"
            />
          </div>

          {/* Form Code */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] uppercase tracking-wider text-[var(--text-muted)] font-medium">
                Unique Form Code (Public URL Identifier)
              </label>
              <button
                type="button"
                onClick={generateRandomCode}
                className="text-[11px] text-[var(--text-accent)] hover:underline flex items-center space-x-1 cursor-pointer"
              >
                <Sparkles className="w-3 h-3" />
                <span>Randomize</span>
              </button>
            </div>
            <div className="flex space-x-2">
              <input
                type="text"
                required
                value={formCode}
                onChange={(e) => setFormCode(e.target.value.toUpperCase().replace(/\s+/g, '-'))}
                placeholder="e.g. VS-WED829"
                className="w-full h-10 px-3.5 bg-[var(--bg-app)] border border-[var(--border-app)] rounded-xl text-xs font-mono uppercase text-[var(--text-primary)] tracking-wider focus:outline-none focus:border-[var(--text-primary)]"
              />
            </div>
          </div>

          {/* Live Link Preview Banner */}
          <div className="p-3 rounded-xl bg-[var(--bg-surface-subtle)] border border-[var(--border-app)] flex items-center space-x-2.5">
            <Link2 className="w-4 h-4 text-[var(--text-accent)] shrink-0" />
            <div className="min-w-0 flex-1">
              <span className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] block">
                Generated Public URL
              </span>
              <p className="text-xs font-mono text-[var(--text-primary)] truncate">
                {previewUrl}
              </p>
            </div>
          </div>

          {/* Target Google Sheet ID */}
          <div>
            <label className="block text-[11px] uppercase tracking-wider text-[var(--text-muted)] font-medium mb-1">
              Target Google Sheet ID (Permanent Source of Truth)
            </label>
            <div className="relative">
              <FileSpreadsheet className="w-4 h-4 text-[#107C41] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={spreadsheetId}
                onChange={(e) => setSpreadsheetId(e.target.value)}
                placeholder="Google Spreadsheet ID"
                className="w-full h-10 pl-10 pr-3.5 bg-[var(--bg-app)] border border-[var(--border-app)] rounded-xl text-xs font-mono text-[var(--text-primary)] focus:outline-none focus:border-[var(--text-primary)]"
              />
            </div>
            <p className="text-[10px] text-[var(--text-muted)] mt-1">
              Client submissions through this link will be appended directly into this Google Sheet via your server-side Service Account.
            </p>
          </div>

          {/* Welcome Greeting */}
          <div>
            <label className="block text-[11px] uppercase tracking-wider text-[var(--text-muted)] font-medium mb-1">
              Welcome Greeting Note (Shown to Client)
            </label>
            <textarea
              rows={2}
              value={customGreeting}
              onChange={(e) => setCustomGreeting(e.target.value)}
              placeholder="e.g. Welcome! We are honored to document your celebration."
              className="w-full p-3 bg-[var(--bg-app)] border border-[var(--border-app)] rounded-xl text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--text-primary)] resize-none"
            />
          </div>

          {/* Client Privacy Notice */}
          <div className="flex items-start space-x-2 p-3 rounded-xl bg-[var(--bg-app)] border border-[var(--border-app-subtle)] text-[11px] text-[var(--text-secondary)]">
            <Shield className="w-4 h-4 text-[#107C41] shrink-0 mt-0.5" />
            <span>
              This client link is 100% public. Clients will <strong>never</strong> be asked to log in or authenticate with Google.
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-[var(--border-app)]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              id="btn-save-client-link"
              className="px-5 py-2.5 rounded-xl bg-[var(--accent-pill-bg)] text-[var(--accent-pill-text)] text-xs font-medium uppercase tracking-wider shadow-2xs hover:opacity-90 active:scale-[0.99] transition-all flex items-center space-x-2 cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{isSaving ? 'Generating...' : existingForm ? 'Update Client Link' : 'Generate Client Link'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
