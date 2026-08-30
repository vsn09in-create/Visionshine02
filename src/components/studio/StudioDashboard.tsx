import React, { useState, useEffect, useRef } from 'react';
import { StudioProfile, FormTemplate, StudioFormLink } from '../../types';
import { CreateFormModal } from './CreateFormModal';
import { ShareFormModal } from './ShareFormModal';
import { GoogleAppsScriptSetupModal } from './GoogleAppsScriptSetupModal';
import { VisionShineLogo } from '../VisionShineLogo';
import { getAccessToken, syncTokenWithBackend, googleSignIn } from '../../services/googleAuth';
import { safeFetchJson } from '../../utils/api';
import {
  Camera,
  MoreVertical,
  Link2,
  Copy,
  Eye,
  Plus,
  FileSpreadsheet,
  Check,
  ExternalLink,
  Share2,
  Trash2,
  Edit3,
  Sparkles,
  LogOut,
  Building2,
  Globe,
  Instagram,
  Phone,
  Mail,
  Sun,
  Moon,
  Briefcase,
  Heart,
  Calendar,
  Code2,
  ShieldCheck,
  Play,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  X,
  UserCheck,
} from 'lucide-react';
import { ThemeMode } from '../../utils/theme';

interface StudioDashboardProps {
  studio: StudioProfile;
  onUpdateStudio: (updated: StudioProfile) => void;
  onLogout: () => void;
  onPreviewForm: (formCode: string) => void;
  theme: ThemeMode;
  onToggleTheme: () => void;
}

export const StudioDashboard: React.FC<StudioDashboardProps> = ({
  studio,
  onUpdateStudio,
  onLogout,
  onPreviewForm,
  theme,
  onToggleTheme,
}) => {
  const [templates, setTemplates] = useState<FormTemplate[]>([]);
  const [forms, setForms] = useState<StudioFormLink[]>([]);
  const [activeMenuTemplateId, setActiveMenuTemplateId] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isAppsScriptModalOpen, setIsAppsScriptModalOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<FormTemplate | null>(null);
  const [selectedForm, setSelectedForm] = useState<StudioFormLink | null>(null);
  const [formToEdit, setFormToEdit] = useState<StudioFormLink | null>(null);

  // Form Delete Modal State
  const [formToDelete, setFormToDelete] = useState<StudioFormLink | null>(null);
  const [isDeletingForm, setIsDeletingForm] = useState(false);
  const [deleteSuccessMsg, setDeleteSuccessMsg] = useState<string | null>(null);

  // Profile Edit State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: studio.name,
    ownerName: studio.ownerName,
    email: studio.email,
    phone: studio.phone,
    website: studio.website || '',
    instagram: studio.instagram || '',
    tagline: studio.tagline || '',
    defaultSpreadsheetId: studio.defaultSpreadsheetId,
  });
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Sync All Submissions State
  const [isSyncingAll, setIsSyncingAll] = useState(false);
  const [syncStatus, setSyncStatus] = useState<{
    success: boolean;
    message: string;
    rowsCount?: number;
    sheetUrl?: string;
  } | null>(null);

  // Dropdown ref for click outside
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchTemplates();
    fetchForms();

    // Sync any existing Google access token with backend
    getAccessToken().then((token) => {
      if (token) {
        syncTokenWithBackend(token);
      }
    });

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenuTemplateId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchTemplates = async () => {
    try {
      const { ok, data } = await safeFetchJson<{ success: boolean; templates?: FormTemplate[] }>('/api/studio/templates');
      if (ok && data && data.success && Array.isArray(data.templates)) {
        setTemplates(data.templates);
      }
    } catch (e) {
      console.warn('Could not load templates', e);
    }
  };

  const fetchForms = async () => {
    try {
      const { ok, data } = await safeFetchJson<{ success: boolean; forms?: StudioFormLink[] }>('/api/studio/forms');
      if (ok && data && data.success && Array.isArray(data.forms)) {
        setForms(data.forms);
      }
    } catch (e) {
      console.warn('Could not load forms', e);
    }
  };

  const handleCopyLink = (code: string) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://yourapp.com';
    const url = `${origin}/form/${code}`;
    navigator.clipboard.writeText(url);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleCreateLinkForTemplate = (template: FormTemplate) => {
    setSelectedTemplate(template);
    setFormToEdit(null);
    setIsCreateModalOpen(true);
    setActiveMenuTemplateId(null);
  };

  const handleEditForm = (form: StudioFormLink) => {
    const tpl = templates.find((t) => t.id === form.templateId) || templates[0];
    setSelectedTemplate(tpl);
    setFormToEdit(form);
    setIsCreateModalOpen(true);
  };

  const handleConfirmDeleteForm = async () => {
    if (!formToDelete) return;
    setIsDeletingForm(true);
    const code = formToDelete.formCode;
    try {
      const { ok, data } = await safeFetchJson<{ success: boolean; message?: string }>(
        `/api/studio/forms/${code}`,
        { method: 'DELETE' }
      );
      if (ok) {
        setForms((prev) => prev.filter((f) => f.formCode !== code));
        setFormToDelete(null);
        setDeleteSuccessMsg(`Form link ${code} deleted successfully.`);
        setTimeout(() => setDeleteSuccessMsg(null), 3000);
      } else {
        alert(data?.message || 'Failed to delete form link.');
      }
    } catch (e) {
      console.error('Delete form failed', e);
    } finally {
      setIsDeletingForm(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    try {
      const { ok, data } = await safeFetchJson<{ success: boolean; studio?: StudioProfile; message?: string }>(
        '/api/studio/profile',
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(profileForm),
        }
      );
      if (ok && data && data.success && data.studio) {
        onUpdateStudio(data.studio);
        setIsEditingProfile(false);
        setProfileSuccess(true);
        setTimeout(() => setProfileSuccess(false), 3000);
      }
    } catch (e) {
      console.error('Save profile failed', e);
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleSyncAllSubmissions = async () => {
    setIsSyncingAll(true);
    setSyncStatus(null);
    try {
      let token = await getAccessToken();
      if (token) {
        await syncTokenWithBackend(token);
      }
      const { ok, data } = await safeFetchJson<any>('/api/sheets/sync-all', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          spreadsheetId: studio.defaultSpreadsheetId,
          appsScriptUrl: studio.appsScriptUrl,
        }),
      });
      setSyncStatus({
        success: Boolean(ok && data && data.success),
        message: data?.message || (ok ? 'Sync completed successfully!' : 'Sync encountered an error.'),
        rowsCount: data?.rowsSynced,
        sheetUrl: data?.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${studio.defaultSpreadsheetId}/edit?gid=399205612#gid=399205612`,
      });
    } catch (err: any) {
      setSyncStatus({
        success: false,
        message: `Sync failed: ${err.message || String(err)}`,
      });
    } finally {
      setIsSyncingAll(false);
    }
  };

  const weddingTemplate = templates.find((t) => t.id === 'tpl_wedding_photo') || {
    id: 'tpl_wedding_photo',
    title: 'Wedding Photography Inquiry Form',
    category: 'Wedding & Bridal',
    description:
      'The multi-step luxury questionnaire collecting traditions, guest counts, multi-day function schedules, style references, and logistics.',
    badge: 'Core Template',
    iconName: 'Camera',
    status: 'active',
    availableFieldsCount: 28,
  };

  const primaryForm = forms.find((f) => f.templateId === 'tpl_wedding_photo') || forms[0];

  return (
    <div className="min-h-screen bg-[var(--bg-app)] text-[var(--text-primary)] transition-colors duration-200">
      {/* Top Studio Navbar */}
      <header className="sticky top-0 z-30 bg-[var(--bg-surface)]/90 backdrop-blur-md border-b border-[var(--border-app)] px-4 sm:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <VisionShineLogo size="sm" />
            <span className="px-2 py-0.5 rounded-full bg-[var(--bg-surface-subtle)] border border-[var(--border-app)] text-[10px] uppercase tracking-wider text-[var(--text-muted)] font-mono">
              Admin
            </span>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-3">
            {primaryForm && (
              <button
                type="button"
                onClick={() => onPreviewForm(primaryForm.formCode)}
                className="hidden md:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-[var(--border-app)] bg-[var(--bg-app)] hover:bg-[var(--bg-surface-subtle)] text-xs text-[var(--text-primary)] transition-colors cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5 text-[var(--text-accent)]" />
                <span>Preview Client Form</span>
              </button>
            )}

            <button
              type="button"
              onClick={onToggleTheme}
              className="p-2 rounded-xl border border-[var(--border-app)] bg-[var(--bg-app)] hover:bg-[var(--bg-surface-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
              title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
            >
              {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>

            <button
              type="button"
              onClick={onLogout}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-[var(--border-app)] bg-[var(--bg-app)] hover:bg-[var(--bg-surface-subtle)] text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
              title="Log out of Studio Dashboard"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-10">
        {/* Profile Notification */}
        {profileSuccess && (
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs flex items-center space-x-2 animate-in fade-in duration-200">
            <Check className="w-4 h-4" />
            <span>Studio profile and default Google Sheet integration updated successfully.</span>
          </div>
        )}

        {/* 1. STUDIO PROFILE SECTION */}
        <section className="bg-[var(--bg-surface)] border border-[var(--border-app)] rounded-2xl p-6 sm:p-7 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-[var(--border-app)] mb-6 gap-4">
            <div className="flex items-center space-x-3.5">
              <div className="w-12 h-12 rounded-2xl bg-[var(--bg-surface-subtle)] border border-[var(--border-app)] flex items-center justify-center text-[var(--text-accent)] shadow-2xs shrink-0">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-[0.2em] text-[var(--text-muted)] font-medium block">
                  Studio Profile & Integration
                </span>
                <h2 className="font-serif text-xl sm:text-2xl text-[var(--text-primary)] font-normal">
                  {studio.name}
                </h2>
                <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                  {studio.tagline || 'Fine-Art Wedding Photography'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsEditingProfile(!isEditingProfile)}
              className="self-start sm:self-center px-4 py-2 rounded-xl border border-[var(--border-app)] bg-[var(--bg-app)] hover:bg-[var(--bg-surface-subtle)] text-xs text-[var(--text-primary)] font-medium flex items-center space-x-2 transition-colors cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{isEditingProfile ? 'Close Editor' : 'Edit Studio Profile'}</span>
            </button>
          </div>

          {isEditingProfile ? (
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-[var(--text-muted)] font-medium mb-1">
                    Studio Name
                  </label>
                  <input
                    type="text"
                    required
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                    className="w-full h-10 px-3.5 bg-[var(--bg-app)] border border-[var(--border-app)] rounded-xl text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--text-primary)]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-[var(--text-muted)] font-medium mb-1">
                    Owner / Director Name
                  </label>
                  <input
                    type="text"
                    required
                    value={profileForm.ownerName}
                    onChange={(e) => setProfileForm({ ...profileForm, ownerName: e.target.value })}
                    className="w-full h-10 px-3.5 bg-[var(--bg-app)] border border-[var(--border-app)] rounded-xl text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--text-primary)]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-[var(--text-muted)] font-medium mb-1">
                    Contact Email
                  </label>
                  <input
                    type="email"
                    required
                    value={profileForm.email}
                    onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                    className="w-full h-10 px-3.5 bg-[var(--bg-app)] border border-[var(--border-app)] rounded-xl text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--text-primary)]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-[var(--text-muted)] font-medium mb-1">
                    Phone / WhatsApp
                  </label>
                  <input
                    type="text"
                    required
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                    className="w-full h-10 px-3.5 bg-[var(--bg-app)] border border-[var(--border-app)] rounded-xl text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--text-primary)]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-[var(--text-muted)] font-medium mb-1">
                    Website URL
                  </label>
                  <input
                    type="text"
                    value={profileForm.website}
                    onChange={(e) => setProfileForm({ ...profileForm, website: e.target.value })}
                    placeholder="https://yourstudio.com"
                    className="w-full h-10 px-3.5 bg-[var(--bg-app)] border border-[var(--border-app)] rounded-xl text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--text-primary)]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-[var(--text-muted)] font-medium mb-1">
                    Instagram Handle
                  </label>
                  <input
                    type="text"
                    value={profileForm.instagram}
                    onChange={(e) => setProfileForm({ ...profileForm, instagram: e.target.value })}
                    placeholder="@yourstudio"
                    className="w-full h-10 px-3.5 bg-[var(--bg-app)] border border-[var(--border-app)] rounded-xl text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--text-primary)]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-[var(--text-muted)] font-medium mb-1">
                  Default Google Sheet ID (Direct Permanent Ledger)
                </label>
                <div className="relative">
                  <FileSpreadsheet className="w-4 h-4 text-[#107C41] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={profileForm.defaultSpreadsheetId}
                    onChange={(e) =>
                      setProfileForm({ ...profileForm, defaultSpreadsheetId: e.target.value })
                    }
                    placeholder="1bZkKL-DDJ3k6cge5uOexYYOuQZt4VyZ-bQCgTEbCd-M"
                    className="w-full h-10 pl-10 pr-3.5 bg-[var(--bg-app)] border border-[var(--border-app)] rounded-xl text-xs font-mono text-[var(--text-primary)] focus:outline-none focus:border-[var(--text-primary)]"
                  />
                </div>
                <p className="text-[10px] text-[var(--text-muted)] mt-1">
                  Submissions from all client forms will write directly to this sheet via the server-side Service Account.
                </p>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsEditingProfile(false)}
                  className="px-4 py-2 rounded-xl text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="px-5 py-2 rounded-xl bg-[var(--accent-pill-bg)] text-[var(--accent-pill-text)] text-xs font-medium uppercase tracking-wider shadow-2xs hover:opacity-90 transition-all cursor-pointer"
                >
                  {isSavingProfile ? 'Saving...' : 'Save Profile & Settings'}
                </button>
              </div>
            </form>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-[var(--bg-app)] border border-[var(--border-app-subtle)] space-y-1">
                <span className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] flex items-center space-x-1.5">
                  <Mail className="w-3.5 h-3.5 text-[var(--text-accent)]" />
                  <span>Email & Owner</span>
                </span>
                <p className="font-medium text-[var(--text-primary)] truncate">{studio.email}</p>
                <p className="text-[11px] text-[var(--text-secondary)]">{studio.ownerName}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-[var(--bg-app)] border border-[var(--border-app-subtle)] space-y-1">
                <span className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] flex items-center space-x-1.5">
                  <Phone className="w-3.5 h-3.5 text-[var(--text-accent)]" />
                  <span>Phone & WhatsApp</span>
                </span>
                <p className="font-medium text-[var(--text-primary)]">{studio.phone}</p>
                <p className="text-[11px] text-[var(--text-secondary)]">WA: {studio.whatsapp || studio.phone}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-[var(--bg-app)] border border-[var(--border-app-subtle)] space-y-1">
                <span className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] flex items-center space-x-1.5">
                  <Globe className="w-3.5 h-3.5 text-[var(--text-accent)]" />
                  <span>Social & Web</span>
                </span>
                <p className="font-medium text-[var(--text-primary)] truncate">
                  {studio.instagram || '@visionshine_studios'}
                </p>
                <p className="text-[11px] text-[var(--text-secondary)] truncate">
                  {studio.website || 'visionshine.com'}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[var(--bg-app)] border border-[var(--border-app-subtle)] space-y-1">
                <span className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] flex items-center space-x-1.5">
                  <FileSpreadsheet className="w-3.5 h-3.5 text-[#107C41]" />
                  <span>Connected Google Sheet</span>
                </span>
                <p className="font-mono text-[11px] text-[var(--text-primary)] truncate">
                  {studio.defaultSpreadsheetId}
                </p>
                <div className="flex items-center justify-between pt-0.5">
                  <a
                    href={studio.googleSpreadsheetUrl || `https://docs.google.com/spreadsheets/d/${studio.defaultSpreadsheetId}/edit`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-[#107C41] hover:underline flex items-center space-x-1 font-medium"
                  >
                    <span>Open Sheet</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  {studio.googleFolderName && (
                    <span className="text-[10px] text-[var(--text-muted)] font-mono truncate max-w-[100px]" title={studio.googleFolderName}>
                      📁 {studio.googleFolderName}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}
        </section>

        {/* GOOGLE SHEETS & APPS SCRIPT INTEGRATION BANNER */}
        <section className="bg-gradient-to-r from-[#107C41]/10 via-[var(--bg-surface)] to-[var(--bg-surface)] border border-[#107C41]/30 rounded-2xl p-5 sm:p-6 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start space-x-3.5">
              <div className="w-11 h-11 rounded-xl bg-[#107C41]/20 border border-[#107C41]/40 flex items-center justify-center text-[#107C41] shrink-0 mt-0.5">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] uppercase tracking-wider font-bold text-[#107C41] dark:text-[#25D366]">
                    Google Sheets &amp; Apps Script Web App
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-mono font-medium">
                    {studio.appsScriptUrl ? 'Public Web App Linked' : 'Active Ledger'}
                  </span>
                </div>
                <h3 className="font-serif text-lg text-[var(--text-primary)] font-normal">
                  Zero-Permission Client Submission Flow
                </h3>
                <p className="text-xs text-[var(--text-secondary)] max-w-2xl leading-relaxed">
                  Configure your NEW Google Sheet with Google Apps Script Web App (<code className="font-mono text-[11px]">Execute as: Me</code> &amp; <code className="font-mono text-[11px]">Access: Anyone</code>). This guarantees ANY client on mobile or desktop submits without 403 access barriers.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:gap-3 shrink-0">
              <button
                type="button"
                onClick={handleSyncAllSubmissions}
                disabled={isSyncingAll}
                className="px-4 py-2 rounded-xl bg-[var(--text-accent)] text-white text-xs font-medium uppercase tracking-wider flex items-center space-x-1.5 shadow-2xs hover:opacity-90 active:scale-[0.99] transition-all cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncingAll ? 'animate-spin' : ''}`} />
                <span>{isSyncingAll ? 'Syncing...' : 'Sync Inquiries to Sheet'}</span>
              </button>

              <button
                type="button"
                onClick={() => setIsAppsScriptModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-[#107C41] text-white text-xs font-medium uppercase tracking-wider flex items-center space-x-1.5 shadow-2xs hover:opacity-90 active:scale-[0.99] transition-all cursor-pointer"
              >
                <Code2 className="w-4 h-4" />
                <span>Apps Script &amp; Setup</span>
              </button>

              <a
                href={studio.googleSpreadsheetUrl || (studio.defaultSpreadsheetId ? `https://docs.google.com/spreadsheets/d/${studio.defaultSpreadsheetId}/edit?gid=399205612#gid=399205612` : 'https://sheets.new')}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2 rounded-xl border border-[var(--border-app)] bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-subtle)] text-xs text-[var(--text-primary)] font-medium flex items-center space-x-1.5 transition-colors cursor-pointer"
              >
                <span>Open Sheet</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {syncStatus && (
            <div
              className={`mt-4 p-3 rounded-xl border text-xs flex items-start justify-between gap-2 ${
                syncStatus.success
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-300'
                  : 'bg-amber-500/10 border-amber-500/30 text-amber-800 dark:text-amber-300'
              }`}
            >
              <div className="flex items-start space-x-2">
                {syncStatus.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                )}
                <div>
                  <p className="font-medium">{syncStatus.message}</p>
                  {syncStatus.success && (
                    <a
                      href={syncStatus.sheetUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline font-mono text-[11px] mt-1 inline-flex items-center space-x-1"
                    >
                      <span>View updated sheet rows</span>
                      <ExternalLink className="w-3 h-3 ml-1 inline" />
                    </a>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSyncStatus(null)}
                className="text-[var(--text-muted)] hover:text-[var(--text-primary)] p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </section>

        {/* 2. TEMPLATES SECTION */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-serif text-2xl text-[var(--text-primary)] font-normal tracking-wide">
                Form Templates
              </h2>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                Pre-configured luxury inquiry forms ready to generate client links.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Core Active Template: Wedding Photography Inquiry Form */}
            <div className="bg-[var(--bg-surface)] border-2 border-[var(--border-app)] hover:border-[var(--text-accent)]/50 rounded-2xl p-6 shadow-xs relative transition-all group flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-11 h-11 rounded-xl bg-[var(--accent-pill-bg)] text-[var(--accent-pill-text)] flex items-center justify-center shadow-2xs">
                      <Camera className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="px-2 py-0.5 rounded-full bg-[#107C41]/10 border border-[#107C41]/20 text-[#107C41] dark:text-[#25D366] text-[10px] uppercase tracking-wider font-medium">
                        Active Template
                      </span>
                      <h3 className="font-serif text-lg sm:text-xl text-[var(--text-primary)] font-normal mt-1 leading-snug">
                        {weddingTemplate.title}
                      </h3>
                    </div>
                  </div>

                  {/* Three-Dot Menu */}
                  <div className="relative" ref={menuRef}>
                    <button
                      id="btn-template-menu-wedding"
                      type="button"
                      onClick={() =>
                        setActiveMenuTemplateId(
                          activeMenuTemplateId === weddingTemplate.id ? null : weddingTemplate.id
                        )
                      }
                      className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-subtle)] transition-colors cursor-pointer"
                      title="Template Options"
                    >
                      <MoreVertical className="w-5 h-5" />
                    </button>

                    {activeMenuTemplateId === weddingTemplate.id && (
                      <div className="absolute right-0 top-8 w-48 bg-[var(--bg-surface)] border border-[var(--border-app)] rounded-xl shadow-xl py-1.5 z-40 animate-in fade-in zoom-in-95 duration-150">
                        <button
                          type="button"
                          onClick={() => handleCreateLinkForTemplate(weddingTemplate)}
                          className="w-full px-3.5 py-2 text-left text-xs text-[var(--text-primary)] hover:bg-[var(--bg-surface-subtle)] flex items-center space-x-2 cursor-pointer"
                        >
                          <Plus className="w-4 h-4 text-[var(--text-accent)]" />
                          <span className="font-medium">Create Client Link</span>
                        </button>

                        {primaryForm && (
                          <button
                            type="button"
                            onClick={() => {
                              handleCopyLink(primaryForm.formCode);
                              setActiveMenuTemplateId(null);
                            }}
                            className="w-full px-3.5 py-2 text-left text-xs text-[var(--text-primary)] hover:bg-[var(--bg-surface-subtle)] flex items-center space-x-2 cursor-pointer"
                          >
                            <Copy className="w-4 h-4 text-[var(--text-secondary)]" />
                            <span>Copy Client Link</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => handleCreateLinkForTemplate(weddingTemplate)}
                          className="w-full px-3.5 py-2 text-left text-xs text-[var(--text-primary)] hover:bg-[var(--bg-surface-subtle)] flex items-center space-x-2 cursor-pointer"
                        >
                          <Edit3 className="w-4 h-4 text-[var(--text-secondary)]" />
                          <span>Edit Template Config</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setActiveMenuTemplateId(null);
                            onPreviewForm(primaryForm?.formCode || 'VS-WED901');
                          }}
                          className="w-full px-3.5 py-2 text-left text-xs text-[var(--text-primary)] hover:bg-[var(--bg-surface-subtle)] flex items-center space-x-2 cursor-pointer border-t border-[var(--border-app)] mt-1 pt-1.5"
                        >
                          <Eye className="w-4 h-4 text-[var(--text-secondary)]" />
                          <span>Preview Form</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <p className="text-xs text-[var(--text-secondary)] leading-relaxed mb-4">
                  {weddingTemplate.description}
                </p>

                <div className="flex items-center space-x-2 text-[11px] text-[var(--text-muted)] font-mono">
                  <span>28 Structured Columns</span>
                  <span>•</span>
                  <span>Multi-Day Functions</span>
                  <span>•</span>
                  <span>Style Moodboard</span>
                </div>
              </div>

              {/* Primary Action Button */}
              <div className="pt-5 mt-5 border-t border-[var(--border-app)] flex items-center justify-between">
                <button
                  type="button"
                  id="btn-create-client-link-main"
                  onClick={() => handleCreateLinkForTemplate(weddingTemplate)}
                  className="px-4 py-2 rounded-xl bg-[var(--accent-pill-bg)] text-[var(--accent-pill-text)] text-xs font-medium uppercase tracking-wider flex items-center space-x-1.5 shadow-2xs hover:opacity-90 active:scale-95 transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Client Link</span>
                </button>

                {primaryForm && (
                  <button
                    type="button"
                    onClick={() => handleCopyLink(primaryForm.formCode)}
                    className="p-2 rounded-xl border border-[var(--border-app)] hover:bg-[var(--bg-surface-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
                    title="Quick Copy Form URL"
                  >
                    {copiedCode === primaryForm.formCode ? (
                      <Check className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Coming Soon Placeholders (Flexible Architecture for future templates) */}
            <div className="bg-[var(--bg-surface)]/60 border border-[var(--border-app)]/60 rounded-2xl p-6 opacity-75 relative flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-11 h-11 rounded-xl bg-[var(--bg-surface-subtle)] border border-[var(--border-app)] text-[var(--text-muted)] flex items-center justify-center">
                      <Briefcase className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="px-2 py-0.5 rounded-full bg-[var(--bg-surface-subtle)] border border-[var(--border-app)] text-[10px] uppercase tracking-wider text-[var(--text-muted)] font-medium">
                        Coming Soon
                      </span>
                      <h3 className="font-serif text-lg text-[var(--text-primary)] font-normal mt-1">
                        Commercial Shoot
                      </h3>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed mb-4">
                  Deliverables, model releases, usage licensing, and commercial brand guidelines.
                </p>
              </div>
              <div className="pt-4 border-t border-[var(--border-app-subtle)] text-[11px] text-[var(--text-muted)]">
                Template architecture ready for expansion
              </div>
            </div>

            <div className="bg-[var(--bg-surface)]/60 border border-[var(--border-app)]/60 rounded-2xl p-6 opacity-75 relative flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-11 h-11 rounded-xl bg-[var(--bg-surface-subtle)] border border-[var(--border-app)] text-[var(--text-muted)] flex items-center justify-center">
                      <Heart className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="px-2 py-0.5 rounded-full bg-[var(--bg-surface-subtle)] border border-[var(--border-app)] text-[10px] uppercase tracking-wider text-[var(--text-muted)] font-medium">
                        Coming Soon
                      </span>
                      <h3 className="font-serif text-lg text-[var(--text-primary)] font-normal mt-1">
                        Pre-Wedding Shoot
                      </h3>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed mb-4">
                  Destination preferences, outfit changes, sunset timing, themes, and hair/makeup.
                </p>
              </div>
              <div className="pt-4 border-t border-[var(--border-app-subtle)] text-[11px] text-[var(--text-muted)]">
                Template architecture ready for expansion
              </div>
            </div>
          </div>
        </section>

        {/* 3. FORMS SECTION */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="font-serif text-2xl text-[var(--text-primary)] font-normal tracking-wide">
                Active Client Links
              </h2>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                Unique public links generated for your studio. Share these on WhatsApp, Instagram bio, or website.
              </p>
            </div>

            <button
              type="button"
              onClick={() => handleCreateLinkForTemplate(weddingTemplate)}
              className="self-start sm:self-center px-4 py-2 rounded-xl bg-[var(--accent-pill-bg)] text-[var(--accent-pill-text)] text-xs font-medium uppercase tracking-wider flex items-center space-x-1.5 shadow-2xs hover:opacity-90 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Link</span>
            </button>
          </div>

          {forms.length === 0 ? (
            <div className="bg-[var(--bg-surface)] border border-[var(--border-app)] rounded-2xl p-8 text-center">
              <Link2 className="w-8 h-8 text-[var(--text-muted)] mx-auto mb-2" />
              <p className="text-sm font-medium text-[var(--text-primary)]">No custom links created yet</p>
              <p className="text-xs text-[var(--text-secondary)] mt-1 mb-4">
                Click "Create Client Link" on the Wedding Photography template above to generate your first link.
              </p>
              <button
                type="button"
                onClick={() => handleCreateLinkForTemplate(weddingTemplate)}
                className="px-4 py-2 rounded-xl bg-[var(--accent-pill-bg)] text-[var(--accent-pill-text)] text-xs font-medium uppercase tracking-wider cursor-pointer"
              >
                Create Client Link
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {forms.map((form) => {
                const origin =
                  typeof window !== 'undefined' ? window.location.origin : 'https://yourapp.com';
                const publicUrl = `${origin}/form/${form.formCode}`;
                const isCopied = copiedCode === form.formCode;

                return (
                  <div
                    key={form.id}
                    className="bg-[var(--bg-surface)] border border-[var(--border-app)] rounded-2xl p-5 shadow-xs hover:border-[var(--text-accent)]/40 transition-all space-y-4"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="px-2 py-0.5 rounded-md bg-[var(--bg-surface-subtle)] border border-[var(--border-app)] font-mono text-xs font-bold text-[var(--text-accent)]">
                            {form.formCode}
                          </span>
                          <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-medium">
                            Public & Live
                          </span>
                        </div>
                        <h4 className="font-serif text-base text-[var(--text-primary)] font-normal mt-1.5">
                          {form.title}
                        </h4>
                      </div>

                      <div className="flex items-center space-x-1">
                        <button
                          type="button"
                          onClick={() => handleEditForm(form)}
                          className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-subtle)] transition-colors cursor-pointer"
                          title="Edit link details"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormToDelete(form)}
                          className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-red-500 hover:bg-[var(--bg-surface-subtle)] transition-colors cursor-pointer"
                          title="Delete form link"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Public URL Box */}
                    <div className="p-2.5 rounded-xl bg-[var(--bg-app)] border border-[var(--border-app)] flex items-center justify-between text-xs">
                      <span className="font-mono text-[var(--text-primary)] truncate mr-2 select-all text-[11px]">
                        {publicUrl}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopyLink(form.formCode)}
                        className="px-2.5 py-1 rounded-md bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-subtle)] border border-[var(--border-app)] text-[var(--text-primary)] text-[11px] font-medium flex items-center space-x-1 shrink-0 transition-colors cursor-pointer"
                      >
                        {isCopied ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-500" />
                            <span>Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Metadata & Actions */}
                    <div className="flex items-center justify-between pt-2 border-t border-[var(--border-app-subtle)] text-[11px] text-[var(--text-secondary)]">
                      <div className="flex items-center space-x-2">
                        <FileSpreadsheet className="w-3.5 h-3.5 text-[#107C41]" />
                        <span className="font-mono truncate max-w-[120px] sm:max-w-[160px]">
                          {form.spreadsheetId}
                        </span>
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedForm(form);
                            setIsShareModalOpen(true);
                          }}
                          className="px-2.5 py-1 rounded-lg border border-[var(--border-app)] bg-[var(--bg-surface-subtle)] hover:bg-[var(--bg-app)] text-[var(--text-primary)] font-medium flex items-center space-x-1 transition-colors cursor-pointer"
                        >
                          <Share2 className="w-3 h-3" />
                          <span>Share / QR</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => onPreviewForm(form.formCode)}
                          className="px-2.5 py-1 rounded-lg bg-[var(--accent-pill-bg)] text-[var(--accent-pill-text)] font-medium flex items-center space-x-1 hover:opacity-90 transition-all cursor-pointer"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>Open</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>

      {/* Delete Form Confirmation Modal */}
      {formToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-[var(--bg-surface)] border border-[var(--border-app)] rounded-2xl shadow-2xl p-6 relative space-y-4">
            <div className="flex items-start space-x-3.5">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-600 dark:text-red-400 shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="font-serif text-lg text-[var(--text-primary)] font-normal">
                  Delete Form Link?
                </h3>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  Are you sure you want to delete form link <strong className="font-mono text-[var(--text-primary)]">{formToDelete.formCode}</strong> ({formToDelete.title})? Clients with this URL will no longer be able to submit inquiries.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setFormToDelete(null)}
                disabled={isDeletingForm}
                className="px-4 py-2 rounded-xl text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-subtle)] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteForm}
                disabled={isDeletingForm}
                className="px-4.5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-medium uppercase tracking-wider flex items-center space-x-1.5 shadow-2xs active:scale-[0.99] transition-all cursor-pointer disabled:opacity-50"
              >
                {isDeletingForm ? (
                  <span>Deleting...</span>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Link</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Success Toast */}
      {deleteSuccessMsg && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 bg-[var(--bg-surface)] border border-emerald-500/40 text-emerald-700 dark:text-emerald-300 rounded-xl shadow-xl flex items-center space-x-2 text-xs animate-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>{deleteSuccessMsg}</span>
        </div>
      )}

      {/* Modals */}
      <CreateFormModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        studio={studio}
        template={selectedTemplate || weddingTemplate}
        existingForm={formToEdit}
        onSaved={(newForm) => {
          fetchForms();
          setSelectedForm(newForm);
          setIsShareModalOpen(true);
        }}
      />

      <ShareFormModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        form={selectedForm}
        onPreview={(code) => onPreviewForm(code)}
      />

      <GoogleAppsScriptSetupModal
        isOpen={isAppsScriptModalOpen}
        onClose={() => setIsAppsScriptModalOpen(false)}
        studio={studio}
        onUpdateStudio={(updated) => {
          onUpdateStudio(updated);
          fetchForms();
        }}
      />
    </div>
  );
};
