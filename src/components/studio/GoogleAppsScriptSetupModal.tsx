import React, { useState, useEffect } from 'react';
import { StudioProfile } from '../../types';
import {
  X,
  FileSpreadsheet,
  Copy,
  Check,
  ExternalLink,
  Code2,
  Play,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Sparkles,
  Smartphone,
  Globe2,
  Lock,
} from 'lucide-react';

interface GoogleAppsScriptSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  studio: StudioProfile;
  onUpdateStudio: (updated: StudioProfile) => void;
}

export const GoogleAppsScriptSetupModal: React.FC<GoogleAppsScriptSetupModalProps> = ({
  isOpen,
  onClose,
  studio,
  onUpdateStudio,
}) => {
  const [spreadsheetId, setSpreadsheetId] = useState(studio.defaultSpreadsheetId || '');
  const [appsScriptUrl, setAppsScriptUrl] = useState(studio.appsScriptUrl || '');
  const [scriptCode, setScriptCode] = useState('');
  const [isCopiedCode, setIsCopiedCode] = useState(false);
  const [isCopiedSheetId, setIsCopiedSheetId] = useState(false);
  const [activeTab, setActiveTab] = useState<'guide' | 'code' | 'test'>('guide');

  // Test state
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    rowIndex?: number;
    authMethod?: string;
    spreadsheetUrl?: string;
  } | null>(null);

  // Save state
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSpreadsheetId(studio.defaultSpreadsheetId || '');
      setAppsScriptUrl(studio.appsScriptUrl || '');
      fetchAppsScriptCode();
      setTestResult(null);
    }
  }, [isOpen, studio]);

  const fetchAppsScriptCode = async () => {
    try {
      const res = await fetch('/api/apps-script/code');
      const data = await res.json();
      if (data.success && data.code) {
        setScriptCode(data.code);
      }
    } catch (e) {
      console.warn('Could not fetch script code', e);
    }
  };

  if (!isOpen) return null;

  const handleCopyCode = () => {
    if (!scriptCode) return;
    navigator.clipboard.writeText(scriptCode);
    setIsCopiedCode(true);
    setTimeout(() => setIsCopiedCode(false), 2500);
  };

  const handleCopySheetId = () => {
    if (!spreadsheetId) return;
    navigator.clipboard.writeText(spreadsheetId);
    setIsCopiedSheetId(true);
    setTimeout(() => setIsCopiedSheetId(false), 2000);
  };

  const handleSaveConfig = async () => {
    setIsSaving(true);
    try {
      // 1. Update Studio profile
      const studioRes = await fetch('/api/studio/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          defaultSpreadsheetId: spreadsheetId.trim(),
          appsScriptUrl: appsScriptUrl.trim(),
        }),
      });
      const studioData = await studioRes.json();

      // 2. Update Google config on backend
      await fetch('/api/google/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          spreadsheetId: spreadsheetId.trim(),
          appsScriptUrl: appsScriptUrl.trim(),
        }),
      });

      if (studioData.success && studioData.studio) {
        onUpdateStudio(studioData.studio);
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Save configuration failed', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleRunTest = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      let res;
      if (appsScriptUrl && appsScriptUrl.trim().startsWith('http')) {
        // Test Google Apps Script Web App
        res = await fetch('/api/apps-script/test', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            webAppUrl: appsScriptUrl.trim(),
          }),
        });
      } else {
        // Test Direct Sheets API
        res = await fetch('/api/sheets/test-append', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            spreadsheetId: spreadsheetId.trim(),
          }),
        });
      }

      const data = await res.json();
      setTestResult({
        success: data.success,
        message: data.message || (data.success ? 'Test submission completed!' : 'Test submission failed.'),
        rowIndex: data.result?.rowIndex || data.rowIndex || data.submission?.sheetsRowIndex,
        authMethod: data.result?.authMethod || data.authMethod,
        spreadsheetUrl:
          data.result?.spreadsheetUrl ||
          data.spreadsheetUrl ||
          (spreadsheetId ? `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit` : undefined),
      });
    } catch (err: any) {
      setTestResult({
        success: false,
        message: `Connection error: ${err.message || String(err)}`,
      });
    } finally {
      setIsTesting(false);
    }
  };

  const liveSpreadsheetUrl = spreadsheetId
    ? `https://docs.google.com/spreadsheets/d/${spreadsheetId.trim()}/edit`
    : 'https://sheets.new';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-3xl bg-[var(--bg-surface)] border border-[var(--border-app)] rounded-2xl shadow-2xl p-6 sm:p-8 relative max-h-[90vh] flex flex-col">
        {/* Close Button */}
        <button
          onClick={onClose}
          type="button"
          className="absolute top-5 right-5 p-2 rounded-full text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-subtle)] transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-start space-x-4 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-[#107C41]/10 border border-[#107C41]/30 flex items-center justify-center text-[#107C41] shrink-0">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] uppercase tracking-[0.2em] text-[var(--text-accent)] font-medium">
                Google Sheets Integration
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] uppercase font-mono font-bold tracking-wider">
                Public Access Ready
              </span>
            </div>
            <h3 className="font-serif text-2xl text-[var(--text-primary)] font-normal mt-0.5">
              Google Sheet & Apps Script Setup
            </h3>
            <p className="text-xs text-[var(--text-secondary)] mt-1 max-w-xl">
              Connect a NEW Google Sheet via Google Apps Script Web App. This ensures ANY client on ANY device, mobile phone, or Gmail account can submit with 0 permission barriers and 0 error 403s.
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center space-x-2 border-b border-[var(--border-app)] pb-3 mb-5">
          <button
            type="button"
            onClick={() => setActiveTab('guide')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
              activeTab === 'guide'
                ? 'bg-[var(--accent-pill-bg)] text-[var(--accent-pill-text)] shadow-2xs'
                : 'text-[var(--text-secondary)] hover:bg-[var(--bg-surface-subtle)] hover:text-[var(--text-primary)]'
            }`}
          >
            Step-by-Step Setup Guide
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('code')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center space-x-1.5 cursor-pointer ${
              activeTab === 'code'
                ? 'bg-[var(--accent-pill-bg)] text-[var(--accent-pill-text)] shadow-2xs'
                : 'text-[var(--text-secondary)] hover:bg-[var(--bg-surface-subtle)] hover:text-[var(--text-primary)]'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Apps Script Code (Code.gs)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('test')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center space-x-1.5 cursor-pointer ${
              activeTab === 'test'
                ? 'bg-[var(--accent-pill-bg)] text-[var(--accent-pill-text)] shadow-2xs'
                : 'text-[var(--text-secondary)] hover:bg-[var(--bg-surface-subtle)] hover:text-[var(--text-primary)]'
            }`}
          >
            <Play className="w-3.5 h-3.5" />
            <span>Live Flow Test</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-5">
          {/* TAB 1: GUIDE */}
          {activeTab === 'guide' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              {/* Step 1: Create New Sheet */}
              <div className="bg-[var(--bg-app)] border border-[var(--border-app)] rounded-2xl p-4.5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <span className="w-6 h-6 rounded-full bg-[var(--text-accent)] text-white text-xs font-bold flex items-center justify-center">
                      1
                    </span>
                    <h4 className="font-serif text-base text-[var(--text-primary)]">
                      Create or Open your NEW Google Sheet
                    </h4>
                  </div>
                  <a
                    href="https://sheets.new"
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded-xl bg-[#107C41] text-white text-xs font-medium flex items-center space-x-1 hover:opacity-90 transition-opacity cursor-pointer"
                  >
                    <span>Create New Sheet (sheets.new)</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  Open your Google Drive and create a brand new spreadsheet named <strong className="text-[var(--text-primary)]">"VISIONSHINE - Wedding Onboarding Master Sheet"</strong>.
                </p>
              </div>

              {/* Step 2: Open Apps Script & Paste Code */}
              <div className="bg-[var(--bg-app)] border border-[var(--border-app)] rounded-2xl p-4.5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <span className="w-6 h-6 rounded-full bg-[var(--text-accent)] text-white text-xs font-bold flex items-center justify-center">
                      2
                    </span>
                    <h4 className="font-serif text-base text-[var(--text-primary)]">
                      Paste the Google Apps Script Code
                    </h4>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyCode}
                    className="px-3 py-1.5 rounded-xl bg-[var(--accent-pill-bg)] text-[var(--accent-pill-text)] text-xs font-medium flex items-center space-x-1.5 shadow-2xs hover:opacity-90 transition-all cursor-pointer"
                  >
                    {isCopiedCode ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Code Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Code.gs</span>
                      </>
                    )}
                  </button>
                </div>
                <ol className="text-xs text-[var(--text-secondary)] space-y-1.5 list-decimal pl-5">
                  <li>In your Google Sheet, click on <strong className="text-[var(--text-primary)]">Extensions &gt; Apps Script</strong> in the top menu bar.</li>
                  <li>Select and delete any default template code inside the editor.</li>
                  <li>Click <strong>Copy Code.gs</strong> above and paste it into the editor.</li>
                  <li>Press <strong>Save</strong> (<kbd className="px-1 py-0.5 rounded bg-[var(--bg-surface)] border border-[var(--border-app)] font-mono text-[10px]">Ctrl+S</kbd> / <kbd className="px-1 py-0.5 rounded bg-[var(--bg-surface)] border border-[var(--border-app)] font-mono text-[10px]">Cmd+S</kbd>).</li>
                </ol>
              </div>

              {/* Step 3: Deploy as Web App */}
              <div className="bg-[var(--bg-app)] border border-[var(--border-app)] rounded-2xl p-4.5 space-y-3">
                <div className="flex items-center space-x-2.5">
                  <span className="w-6 h-6 rounded-full bg-[var(--text-accent)] text-white text-xs font-bold flex items-center justify-center">
                    3
                  </span>
                  <h4 className="font-serif text-base text-[var(--text-primary)]">
                    Deploy as Public Web App (CRITICAL SETTINGS)
                  </h4>
                </div>
                <p className="text-xs text-[var(--text-secondary)]">
                  Click the blue <strong className="text-[var(--text-primary)]">Deploy</strong> button (top right) &gt; <strong className="text-[var(--text-primary)]">New deployment</strong> &gt; Select type: <strong className="text-[var(--text-primary)]">Web app</strong>:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="p-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-app)] space-y-1">
                    <div className="flex items-center space-x-1.5 text-xs font-semibold text-[var(--text-primary)]">
                      <Lock className="w-3.5 h-3.5 text-[var(--text-accent)]" />
                      <span>Execute as</span>
                    </div>
                    <p className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                      Me (your-gmail@gmail.com)
                    </p>
                    <p className="text-[11px] text-[var(--text-muted)]">
                      Submissions write to your sheet using your owner authority.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-app)] space-y-1">
                    <div className="flex items-center space-x-1.5 text-xs font-semibold text-[var(--text-primary)]">
                      <Globe2 className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Who has access</span>
                    </div>
                    <p className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                      Anyone
                    </p>
                    <p className="text-[11px] text-[var(--text-muted)]">
                      Allows ANY client on mobile or incognito to submit without permission errors.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-2 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-300">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>
                    When Google prompts you to "Authorize access", click your account, then click <strong>"Advanced"</strong> &gt; <strong>"Go to Untitled project (unsafe)"</strong> &gt; <strong>"Allow"</strong>.
                  </span>
                </div>
              </div>

              {/* Step 4: Link URLs */}
              <div className="bg-[var(--bg-app)] border border-[var(--border-app)] rounded-2xl p-4.5 space-y-4">
                <div className="flex items-center space-x-2.5">
                  <span className="w-6 h-6 rounded-full bg-[var(--text-accent)] text-white text-xs font-bold flex items-center justify-center">
                    4
                  </span>
                  <h4 className="font-serif text-base text-[var(--text-primary)]">
                    Save Your Google Sheet & Web App URLs
                  </h4>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-[var(--text-muted)] font-medium mb-1">
                      Google Apps Script Web App URL (ends with /exec)
                    </label>
                    <input
                      type="url"
                      value={appsScriptUrl}
                      onChange={(e) => setAppsScriptUrl(e.target.value)}
                      placeholder="https://script.google.com/macros/s/.../exec"
                      className="w-full h-10 px-3.5 bg-[var(--bg-surface)] border border-[var(--border-app)] rounded-xl text-xs font-mono text-[var(--text-primary)] focus:outline-none focus:border-[var(--text-primary)]"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] uppercase tracking-wider text-[var(--text-muted)] font-medium">
                        Target Google Spreadsheet ID (or full URL)
                      </label>
                      {spreadsheetId && (
                        <a
                          href={liveSpreadsheetUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] text-[var(--text-accent)] hover:underline flex items-center space-x-1"
                        >
                          <span>Open Sheet</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                    <div className="relative">
                      <FileSpreadsheet className="w-4 h-4 text-[#107C41] absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={spreadsheetId}
                        onChange={(e) => {
                          const val = e.target.value.trim();
                          // Extract ID if full URL was pasted
                          const match = val.match(/\/d\/([a-zA-Z0-9-_]+)/);
                          if (match && match[1]) {
                            setSpreadsheetId(match[1]);
                          } else {
                            setSpreadsheetId(val);
                          }
                        }}
                        placeholder="e.g. 1bZkKL-DDJ3k6cge5uOexYYOuQZt4VyZ-bQCgTEbCd-M"
                        className="w-full h-10 pl-10 pr-3.5 bg-[var(--bg-surface)] border border-[var(--border-app)] rounded-xl text-xs font-mono text-[var(--text-primary)] focus:outline-none focus:border-[var(--text-primary)]"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={handleSaveConfig}
                    disabled={isSaving}
                    className="px-5 py-2.5 rounded-xl bg-[var(--accent-pill-bg)] text-[var(--accent-pill-text)] text-xs font-medium uppercase tracking-wider flex items-center space-x-2 shadow-2xs hover:opacity-90 active:scale-[0.99] transition-all cursor-pointer"
                  >
                    {isSaving ? (
                      <span>Saving...</span>
                    ) : saveSuccess ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-500" />
                        <span>Saved Successfully!</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Save Google Sheet Config</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('test')}
                    className="px-4 py-2 rounded-xl border border-[var(--border-app)] bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-subtle)] text-xs font-medium text-[var(--text-primary)] flex items-center space-x-1.5 transition-colors cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 text-[var(--text-accent)]" />
                    <span>Run Verification Test</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CODE */}
          {activeTab === 'code' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-serif text-lg text-[var(--text-primary)] font-normal">
                    Complete Google Apps Script Source
                  </h4>
                  <p className="text-xs text-[var(--text-secondary)]">
                    Paste this directly into your Google Sheet's Apps Script editor (<code className="font-mono text-[11px]">Code.gs</code>).
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="px-4 py-2 rounded-xl bg-[var(--accent-pill-bg)] text-[var(--accent-pill-text)] text-xs font-medium uppercase tracking-wider flex items-center space-x-2 shadow-2xs hover:opacity-90 transition-all cursor-pointer"
                >
                  {isCopiedCode ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-500" />
                      <span>Copied to Clipboard</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copy Full Script</span>
                    </>
                  )}
                </button>
              </div>

              <div className="relative rounded-2xl bg-[#1C1917] text-[#FAF7F2] p-4 font-mono text-xs overflow-x-auto max-h-[380px] border border-stone-800">
                <pre className="whitespace-pre">{scriptCode || '// Loading script code...'}</pre>
              </div>
            </div>
          )}

          {/* TAB 3: LIVE TEST */}
          {activeTab === 'test' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="bg-[var(--bg-app)] border border-[var(--border-app)] rounded-2xl p-5 space-y-4">
                <div>
                  <h4 className="font-serif text-lg text-[var(--text-primary)] font-normal">
                    Test Google Sheet Live Submission Flow
                  </h4>
                  <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                    Sends a simulated luxury client inquiry row directly through your integration to verify end-to-end data delivery.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-app)] space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[var(--text-muted)] uppercase tracking-wider text-[10px]">Current Target</span>
                    <span className="font-mono font-semibold text-[var(--text-primary)]">
                      {appsScriptUrl ? 'Google Apps Script Web App (Public Mode)' : 'Google Sheets API (Service Account)'}
                    </span>
                  </div>
                  {appsScriptUrl && (
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-[var(--text-muted)]">Web App URL</span>
                      <span className="font-mono text-[var(--text-primary)] truncate max-w-md">
                        {appsScriptUrl}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-[var(--text-muted)]">Spreadsheet ID</span>
                    <span className="font-mono text-[var(--text-primary)] truncate max-w-md">
                      {spreadsheetId || 'Auto-Provision'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <button
                    type="button"
                    onClick={handleRunTest}
                    disabled={isTesting}
                    className="px-5 py-2.5 rounded-xl bg-[#107C41] text-white text-xs font-medium uppercase tracking-wider flex items-center space-x-2 shadow-2xs hover:opacity-90 active:scale-[0.99] transition-all cursor-pointer"
                  >
                    {isTesting ? (
                      <span>Transmitting Test Row...</span>
                    ) : (
                      <>
                        <Play className="w-4 h-4" />
                        <span>Send Test Submission</span>
                      </>
                    )}
                  </button>

                  {spreadsheetId && (
                    <a
                      href={liveSpreadsheetUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-4 py-2.5 rounded-xl border border-[var(--border-app)] bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-subtle)] text-xs text-[var(--text-primary)] font-medium flex items-center space-x-1.5 transition-colors cursor-pointer"
                    >
                      <span>Open Live Google Sheet</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>

                {/* Test Result Display */}
                {testResult && (
                  <div
                    className={`p-4 rounded-2xl border text-xs space-y-2 animate-in fade-in duration-200 ${
                      testResult.success
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-200'
                        : 'bg-red-500/10 border-red-500/30 text-red-800 dark:text-red-200'
                    }`}
                  >
                    <div className="flex items-center space-x-2 font-semibold">
                      {testResult.success ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                      )}
                      <span>{testResult.success ? 'Verification Succeeded!' : 'Verification Notice'}</span>
                    </div>
                    <p className="leading-relaxed">{testResult.message}</p>
                    {testResult.rowIndex && (
                      <p className="font-mono text-[11px] font-medium">
                        Row Recorded: #{testResult.rowIndex}
                      </p>
                    )}
                    {testResult.spreadsheetUrl && (
                      <div className="pt-1">
                        <a
                          href={testResult.spreadsheetUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center space-x-1 font-semibold underline text-xs hover:opacity-80"
                        >
                          <span>Click here to view your new row in Google Sheets</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="pt-4 mt-4 border-t border-[var(--border-app)] flex items-center justify-between text-xs text-[var(--text-muted)]">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-[#107C41]" />
            <span>28 Form Columns Automatically Mapped & Formatted</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
