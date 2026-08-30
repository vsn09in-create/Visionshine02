import React, { useState, useRef } from 'react';
import { ReferenceLink, UploadedFileItem } from '../../types';
import {
  Link2,
  UploadCloud,
  FileText,
  Trash2,
  Plus,
  ExternalLink,
  Sparkles,
  CheckCircle2,
  FolderOpen,
} from 'lucide-react';
import { GoogleDrivePickerModal } from '../GoogleDrivePickerModal';

interface Screen07ReferencesProps {
  partner1?: string;
  partner2?: string;
  references: ReferenceLink[];
  files: UploadedFileItem[];
  onChange: (references: ReferenceLink[], files: UploadedFileItem[]) => void;
}

export const Screen07References: React.FC<Screen07ReferencesProps> = ({
  partner1 = '',
  partner2 = '',
  references,
  files,
  onChange,
}) => {
  const coupleName = partner1.trim() && partner2.trim()
    ? `${partner1.trim()} & ${partner2.trim()}`
    : partner1.trim() || partner2.trim() || '';

  const [newUrl, setNewUrl] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [showDriveModal, setShowDriveModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const detectPlatform = (url: string): ReferenceLink['platform'] => {
    const lower = url.toLowerCase();
    if (lower.includes('instagram.com')) return 'Instagram';
    if (lower.includes('pinterest.com') || lower.includes('pin.it')) return 'Pinterest';
    if (lower.includes('youtube.com') || lower.includes('youtu.be')) return 'YouTube';
    if (lower.includes('drive.google.com')) return 'Google Drive';
    if (lower.includes('dropbox.com')) return 'Dropbox';
    return 'Website';
  };

  const addReferenceLink = () => {
    if (!newUrl.trim()) return;

    let formatted = newUrl.trim();
    if (!formatted.startsWith('http://') && !formatted.startsWith('https://')) {
      formatted = `https://${formatted}`;
    }

    const platform = detectPlatform(formatted);
    const newRef: ReferenceLink = {
      id: `ref_${Date.now()}`,
      url: formatted,
      platform,
      description: newDescription.trim() || undefined,
    };

    onChange([...references, newRef], files);
    setNewUrl('');
    setNewDescription('');
  };

  const removeReferenceLink = (id: string) => {
    onChange(
      references.filter((r) => r.id !== id),
      files
    );
  };

  const handleFiles = (incomingFiles: FileList | null) => {
    if (!incomingFiles || incomingFiles.length === 0) return;

    const newItems: UploadedFileItem[] = [];

    Array.from(incomingFiles).forEach((file) => {
      const isImg = file.type.startsWith('image/');
      const fileItem: UploadedFileItem = {
        id: `file_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        name: file.name,
        size: file.size,
        type: file.type,
        progress: 100,
        uploadedAt: new Date().toISOString(),
      };

      if (isImg) {
        const reader = new FileReader();
        reader.onload = (e) => {
          fileItem.dataUrl = e.target?.result as string;
          onChange(references, [...files, fileItem]);
        };
        reader.readAsDataURL(file);
      } else {
        newItems.push(fileItem);
      }
    });

    if (newItems.length > 0) {
      onChange(references, [...files, ...newItems]);
    }
  };

  const removeFile = (id: string) => {
    onChange(
      references,
      files.filter((f) => f.id !== id)
    );
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
          Step 07 / 09 · Visual Moodboard
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-light text-[var(--text-primary)] tracking-tight mb-3 italic">
          Show us what you love.
        </h1>
        <p className="text-sm sm:text-base text-[var(--text-secondary)] font-light leading-relaxed max-w-lg mx-auto">
          Share Pinterest moodboards, Instagram saves, Google Drive folders, or presentation decks that inspire your vision. (Optional)
        </p>
      </div>

      {/* Part 1: Add Reference Links & Google Workspace Integration */}
      <div className="mb-6 sm:mb-8 bg-[var(--bg-surface)] border border-[var(--border-app)] rounded-2xl p-5 sm:p-6 shadow-2xs">
        <div className="flex items-center justify-between mb-3">
          <label className="block text-[10px] uppercase tracking-[0.2em] text-[var(--text-muted)] font-medium">
            Inspiration Links & Moodboards
          </label>
          <button
            type="button"
            id="btn-open-google-drive-picker"
            onClick={() => setShowDriveModal(true)}
            className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[var(--bg-app)] border border-[var(--border-app)] hover:border-[var(--text-accent)] text-[11px] font-sans text-[var(--text-primary)] transition-all cursor-pointer shadow-2xs group"
          >
            <FolderOpen className="w-3.5 h-3.5 text-[var(--text-accent)] group-hover:scale-110 transition-transform" />
            <span>Browse Google Drive / Sheets</span>
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-2.5 mb-4">
          <div className="relative flex-1">
            <input
              id="input-reference-url"
              type="url"
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              placeholder="Paste Instagram, Pinterest, YouTube or Drive link..."
              className="w-full h-11 px-3 pl-9 bg-[var(--bg-app)] border border-[var(--border-app)] rounded-xl text-xs font-sans text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--text-primary)] focus:bg-[var(--bg-surface)]"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addReferenceLink();
                }
              }}
            />
            <Link2 className="w-3.5 h-3.5 text-[var(--text-muted)] absolute left-3 top-1/2 -translate-y-1/2" />
          </div>

          <div className="w-full sm:w-48">
            <input
              type="text"
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              placeholder="Short note (optional)"
              className="w-full h-11 px-3 bg-[var(--bg-app)] border border-[var(--border-app)] rounded-xl text-xs font-sans text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--text-primary)] focus:bg-[var(--bg-surface)]"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addReferenceLink();
                }
              }}
            />
          </div>

          <button
            type="button"
            id="btn-add-reference"
            onClick={addReferenceLink}
            disabled={!newUrl.trim()}
            className="h-11 px-4 bg-[var(--accent-pill-bg)] text-[var(--accent-pill-text)] text-xs font-medium rounded-xl disabled:opacity-40 transition-colors flex items-center justify-center space-x-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>
        </div>

        {/* Existing Links List */}
        {references.length > 0 ? (
          <div className="space-y-2 pt-2 border-t border-[var(--border-app)]">
            {references.map((ref) => (
              <div
                key={ref.id}
                className="flex items-center justify-between p-2.5 bg-[var(--bg-app)] border border-[var(--border-app)] rounded-xl text-xs"
              >
                <div className="flex items-center space-x-2.5 overflow-hidden">
                  <span className="px-2 py-0.5 rounded-md bg-[var(--bg-surface-subtle)] text-[10px] uppercase tracking-wider font-semibold text-[var(--text-muted)] shrink-0">
                    {ref.platform}
                  </span>
                  <a
                    href={ref.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="truncate text-[var(--text-primary)] hover:text-[var(--text-accent)] font-sans hover:underline flex items-center space-x-1"
                  >
                    <span className="truncate">{ref.url}</span>
                    <ExternalLink className="w-3 h-3 shrink-0 text-[var(--text-accent)]" />
                  </a>
                  {ref.description && (
                    <span className="hidden sm:inline text-[var(--text-muted)] italic font-serif truncate">
                      — {ref.description}
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => removeReferenceLink(ref.id)}
                  className="p-1 text-[var(--text-muted)] hover:text-[#B85C43] rounded-md transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-[11px] text-[var(--text-muted)] italic font-serif">
            No links added yet. You can paste public links or moodboard boards above.
          </p>
        )}
      </div>

      {/* Part 2: Drag & Drop File Upload */}
      <div className="bg-[var(--bg-surface)] border border-[var(--border-app)] rounded-2xl p-5 sm:p-6 shadow-2xs">
        <label className="block text-[10px] uppercase tracking-[0.2em] text-[var(--text-muted)] font-medium mb-3">
          Upload Documents, Moodboards & References
        </label>

        {/* Drop Zone */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            handleFiles(e.dataTransfer.files);
          }}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-6 sm:p-8 text-center cursor-pointer transition-all ${
            isDragging
              ? 'border-[var(--text-primary)] bg-[var(--bg-surface-subtle)]'
              : 'border-[var(--border-app)] hover:border-[var(--text-accent)] bg-[var(--bg-app)]/60 hover:bg-[var(--bg-app)]'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,.pdf,.doc,.docx"
            onChange={(e) => handleFiles(e.target.files)}
            className="hidden"
          />
          <div className="w-10 h-10 mx-auto mb-3 rounded-full bg-[var(--bg-surface-subtle)] flex items-center justify-center text-[var(--text-accent)]">
            <UploadCloud className="w-5 h-5" />
          </div>
          <p className="text-xs sm:text-sm font-sans font-medium text-[var(--text-primary)]">
            Drag and drop images or PDF decks here, or <span className="text-[var(--text-accent)] underline">browse files</span>
          </p>
          <p className="text-[11px] text-[var(--text-muted)] font-light mt-1">
            Supports PNG, JPG, PDF, Keynote exports up to 25MB each
          </p>
        </div>

        {/* Uploaded Files Preview */}
        {files.length > 0 && (
          <div className="mt-4 space-y-2.5">
            {files.map((file) => {
              const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
              return (
                <div
                  key={file.id}
                  className="flex items-center justify-between p-3 bg-[var(--bg-app)] border border-[var(--border-app)] rounded-xl text-xs"
                >
                  <div className="flex items-center space-x-3 overflow-hidden">
                    {file.dataUrl ? (
                      <img
                        src={file.dataUrl}
                        alt={file.name}
                        className="w-10 h-10 object-cover rounded-lg border border-[var(--border-app)] shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-[var(--bg-surface-subtle)] flex items-center justify-center text-[var(--text-muted)] shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                    )}
                    <div className="overflow-hidden">
                      <p className="font-sans font-medium text-[var(--text-primary)] truncate">
                        {file.name}
                      </p>
                      <div className="flex items-center space-x-2 text-[10px] text-[var(--text-muted)]">
                        <span>{sizeMB} MB</span>
                        <span>•</span>
                        <span className="flex items-center space-x-1 text-[#5A7D58]">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Uploaded</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeFile(file.id)}
                    className="p-1.5 text-[var(--text-muted)] hover:text-[#B85C43] rounded-md transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Google Workspace (Drive & Sheets) Browser Modal */}
      <GoogleDrivePickerModal
        isOpen={showDriveModal}
        onClose={() => setShowDriveModal(false)}
        onSelectFiles={(selectedLinks) => {
          onChange([...references, ...selectedLinks], files);
        }}
      />
    </div>
  );
};
