import React, { useState, useEffect } from 'react';
import {
  googleSignIn,
  listDriveFiles,
  listSpreadsheets,
  logout,
  GoogleDriveFile,
  getAccessToken,
} from '../services/googleAuth';
import { User } from 'firebase/auth';
import {
  X,
  FolderOpen,
  FileSpreadsheet,
  Image as ImageIcon,
  FileText,
  ExternalLink,
  Check,
  LogOut,
  RefreshCw,
  Search,
} from 'lucide-react';
import { ReferenceLink } from '../types';

interface GoogleDrivePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectFiles: (selectedLinks: ReferenceLink[]) => void;
}

export const GoogleDrivePickerModal: React.FC<GoogleDrivePickerModalProps> = ({
  isOpen,
  onClose,
  onSelectFiles,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [driveFiles, setDriveFiles] = useState<GoogleDriveFile[]>([]);
  const [spreadsheets, setSpreadsheets] = useState<GoogleDriveFile[]>([]);
  const [activeTab, setActiveTab] = useState<'drive' | 'sheets'>('drive');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      getAccessToken().then((t) => {
        if (t) {
          setToken(t);
          loadWorkspaceData(t);
        }
      });
    }
  }, [isOpen]);

  const handleLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await googleSignIn();
      if (res) {
        setUser(res.user);
        setToken(res.accessToken);
        await loadWorkspaceData(res.accessToken);
      }
    } catch (err: any) {
      console.error('Google Sign In failed:', err);
      setError(err.message || 'Failed to sign in with Google');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    setUser(null);
    setToken(null);
    setDriveFiles([]);
    setSpreadsheets([]);
    setSelectedIds(new Set());
  };

  const loadWorkspaceData = async (accessToken: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const [files, sheets] = await Promise.all([
        listDriveFiles(accessToken).catch((e) => {
          console.warn('Could not list drive files:', e);
          return [];
        }),
        listSpreadsheets(accessToken).catch((e) => {
          console.warn('Could not list sheets:', e);
          return [];
        }),
      ]);
      setDriveFiles(files);
      setSpreadsheets(sheets);
    } catch (err: any) {
      setError(err.message || 'Error loading Google Workspace files');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSelection = (file: GoogleDriveFile) => {
    const next = new Set(selectedIds);
    if (next.has(file.id)) {
      next.delete(file.id);
    } else {
      next.add(file.id);
    }
    setSelectedIds(next);
  };

  const handleConfirmSelection = () => {
    const allFiles = [...driveFiles, ...spreadsheets];
    const chosen = allFiles.filter((f) => selectedIds.has(f.id));

    const newRefs: ReferenceLink[] = chosen.map((file) => ({
      id: `drive_${file.id}_${Date.now()}`,
      url: file.webViewLink || `https://drive.google.com/file/d/${file.id}/view`,
      platform: file.mimeType.includes('spreadsheet') ? 'Google Drive' : 'Google Drive',
      description: file.name,
    }));

    onSelectFiles(newRefs);
    setSelectedIds(new Set());
    onClose();
  };

  if (!isOpen) return null;

  const currentList = activeTab === 'drive' ? driveFiles : spreadsheets;
  const filteredList = currentList.filter((f) =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div
      id="modal-google-workspace-picker"
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn"
    >
      <div className="bg-[var(--bg-surface)] border border-[var(--border-app)] rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-app)] bg-[var(--bg-app)]/50">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-app)] flex items-center justify-center text-[var(--text-accent)] shadow-2xs">
              <FolderOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-medium text-[var(--text-primary)]">
                Google Drive & Sheets
              </h3>
              <p className="text-[11px] text-[var(--text-secondary)]">
                Select visual moodboards, PDFs, and wedding assets directly from your Google Drive
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 flex-1 overflow-y-auto space-y-4">
          {!token ? (
            /* Google Sign-in Prompt */
            <div className="text-center py-10 px-4 space-y-5">
              <div className="w-16 h-16 rounded-full bg-[var(--bg-surface-subtle)] flex items-center justify-center mx-auto border border-[var(--border-app)]">
                <svg className="w-8 h-8" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.16 0 9.97 0 12s.45 3.84 1.25 5.42l4.03-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
              </div>

              <div>
                <h4 className="font-serif text-xl text-[var(--text-primary)] font-normal mb-1">
                  Connect Google Workspace
                </h4>
                <p className="text-xs text-[var(--text-secondary)] max-w-sm mx-auto leading-relaxed">
                  Sign in with your Google Account to browse your Google Drive folders, wedding moodboard files, and Google Sheets.
                </p>
              </div>

              {error && (
                <div className="p-3 bg-[#FDEDED] dark:bg-[#2C1814] border border-[#F5C2C7] dark:border-[#5C2B29] rounded-xl text-xs text-[#842029] dark:text-[#F8D7DA]">
                  {error}
                </div>
              )}

              {/* Official Google Sign In Button */}
              <div className="pt-2">
                <button
                  id="btn-google-sign-in"
                  type="button"
                  onClick={handleLogin}
                  disabled={isLoading}
                  className="inline-flex items-center space-x-3 px-5 py-2.5 rounded-full bg-white dark:bg-[#2C2C2C] text-[#3c4043] dark:text-white border border-[#dadce0] dark:border-[#444444] shadow-sm hover:shadow-md active:scale-98 transition-all cursor-pointer text-xs font-medium"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.16 0 9.97 0 12s.45 3.84 1.25 5.42l4.03-3.15z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                    />
                  </svg>
                  <span>{isLoading ? 'Signing In...' : 'Sign in with Google'}</span>
                </button>
              </div>
            </div>
          ) : (
            /* Authenticated File Picker */
            <div className="space-y-4">
              {/* Active User Bar & Tabs */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-[var(--border-app)]">
                {/* Tabs */}
                <div className="flex items-center space-x-2 bg-[var(--bg-app)] p-1 rounded-xl border border-[var(--border-app)]">
                  <button
                    type="button"
                    onClick={() => setActiveTab('drive')}
                    className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                      activeTab === 'drive'
                        ? 'bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-2xs'
                        : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    <FolderOpen className="w-3.5 h-3.5" />
                    <span>Drive Files ({driveFiles.length})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('sheets')}
                    className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                      activeTab === 'sheets'
                        ? 'bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-2xs'
                        : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                    <span>Sheets ({spreadsheets.length})</span>
                  </button>
                </div>

                {/* Refresh & Sign out */}
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => token && loadWorkspaceData(token)}
                    disabled={isLoading}
                    title="Refresh files"
                    className="p-2 rounded-lg border border-[var(--border-app)] hover:bg-[var(--bg-surface-subtle)] text-[var(--text-secondary)] transition-colors cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                  </button>
                  <button
                    type="button"
                    onClick={handleLogout}
                    title="Sign out"
                    className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg border border-[var(--border-app)] hover:bg-[#FDEDED] hover:text-[#842029] text-xs text-[var(--text-muted)] transition-colors cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Sign out</span>
                  </button>
                </div>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 text-[var(--text-muted)] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={`Search ${activeTab === 'drive' ? 'Drive files' : 'Google Sheets'}...`}
                  className="w-full h-10 pl-9 pr-3 bg-[var(--bg-app)] border border-[var(--border-app)] rounded-xl text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--text-primary)]"
                />
              </div>

              {/* File Grid / List */}
              {isLoading ? (
                <div className="py-12 text-center text-xs text-[var(--text-muted)] flex flex-col items-center justify-center space-y-2">
                  <RefreshCw className="w-5 h-5 animate-spin text-[var(--text-accent)]" />
                  <span>Loading your Google Drive items...</span>
                </div>
              ) : filteredList.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[360px] overflow-y-auto pr-1">
                  {filteredList.map((file) => {
                    const isSelected = selectedIds.has(file.id);
                    const isSheet = file.mimeType.includes('spreadsheet');
                    const isImage = file.mimeType.startsWith('image/');

                    return (
                      <div
                        key={file.id}
                        onClick={() => toggleSelection(file)}
                        className={`p-3 rounded-xl border transition-all flex items-start space-x-3 cursor-pointer select-none ${
                          isSelected
                            ? 'border-[var(--text-primary)] bg-[var(--bg-surface-subtle)] shadow-2xs'
                            : 'border-[var(--border-app)] bg-[var(--bg-app)] hover:border-[var(--text-accent)]'
                        }`}
                      >
                        {/* Checkbox indicator */}
                        <div
                          className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                            isSelected
                              ? 'bg-[var(--accent-pill-bg)] border-[var(--accent-pill-bg)] text-[var(--accent-pill-text)]'
                              : 'border-[var(--border-app)] bg-[var(--bg-surface)]'
                          }`}
                        >
                          {isSelected && <Check className="w-3.5 h-3.5" />}
                        </div>

                        {/* File Thumbnail or Icon */}
                        <div className="w-8 h-8 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-app)] flex items-center justify-center shrink-0 overflow-hidden text-[var(--text-accent)]">
                          {isImage && file.thumbnailLink ? (
                            <img
                              src={file.thumbnailLink}
                              alt={file.name}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover"
                            />
                          ) : isSheet ? (
                            <FileSpreadsheet className="w-4 h-4 text-[#107C41]" />
                          ) : (
                            <FileText className="w-4 h-4" />
                          )}
                        </div>

                        {/* File Name & Link */}
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-[var(--text-primary)] truncate font-sans">
                            {file.name}
                          </p>
                          <div className="flex items-center space-x-2 mt-0.5">
                            <span className="text-[10px] text-[var(--text-muted)] truncate">
                              {isSheet ? 'Spreadsheet' : isImage ? 'Image' : 'Document'}
                            </span>
                            {file.webViewLink && (
                              <a
                                href={file.webViewLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="text-[10px] text-[var(--text-accent)] hover:underline inline-flex items-center space-x-0.5"
                              >
                                <span>Open</span>
                                <ExternalLink className="w-2.5 h-2.5" />
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-10 text-center text-xs text-[var(--text-muted)]">
                  {searchQuery ? 'No items matched your search.' : 'No files found in your Google Drive.'}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-[var(--border-app)] bg-[var(--bg-app)]/50 flex items-center justify-between">
          <div className="text-xs text-[var(--text-muted)]">
            {selectedIds.size > 0 ? (
              <span className="text-[var(--text-primary)] font-medium">
                {selectedIds.size} item{selectedIds.size > 1 ? 's' : ''} selected
              </span>
            ) : (
              <span>Select items to attach to your inquiry</span>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-[var(--border-app)] text-xs text-[var(--text-secondary)] hover:bg-[var(--bg-surface)] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            {token && (
              <button
                type="button"
                id="btn-confirm-drive-selection"
                onClick={handleConfirmSelection}
                disabled={selectedIds.size === 0}
                className="px-4 py-2 rounded-xl bg-[var(--accent-pill-bg)] text-[var(--accent-pill-text)] text-xs font-medium disabled:opacity-40 transition-all cursor-pointer shadow-2xs"
              >
                Add Selected to Inquiry
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
