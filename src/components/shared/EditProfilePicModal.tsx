import React, { useState, useRef } from 'react';
import { Camera, Upload, X, Check, RefreshCw, Image as ImageIcon, Loader2, Sparkles, User } from 'lucide-react';
import { Employee } from '../../types';

interface EditProfilePicModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentEmployee: Employee;
  onUpdateAvatar: (newAvatarUrl: string) => Promise<void> | void;
}

export const EditProfilePicModal: React.FC<EditProfilePicModalProps> = ({
  isOpen,
  onClose,
  currentEmployee,
  onUpdateAvatar,
}) => {
  const [avatarUrl, setAvatarUrl] = useState<string>(currentEmployee.avatar || '');
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Curated Preset Avatar Options
  const presetAvatars = [
    `https://ui-avatars.com/api/?name=${encodeURIComponent(currentEmployee.name)}&background=0D8ABC&color=fff&size=256`,
    `https://ui-avatars.com/api/?name=${encodeURIComponent(currentEmployee.name)}&background=4F46E5&color=fff&size=256`,
    `https://ui-avatars.com/api/?name=${encodeURIComponent(currentEmployee.name)}&background=059669&color=fff&size=256`,
    `https://ui-avatars.com/api/?name=${encodeURIComponent(currentEmployee.name)}&background=D97706&color=fff&size=256`,
    `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300`,
    `https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300`,
    `https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=300`,
    `https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=300`,
    `https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=300`,
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg('');
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrorMsg('Image size must be less than 5MB.');
        return;
      }
      setIsUploading(true);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarUrl(reader.result as string);
        setIsUploading(false);
      };
      reader.onerror = () => {
        setErrorMsg('Failed to read image file.');
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!avatarUrl || !avatarUrl.trim()) {
      setErrorMsg('Please select or upload a profile picture.');
      return;
    }

    setIsSaving(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      await onUpdateAvatar(avatarUrl.trim());
      setSuccessMsg('Profile picture updated successfully!');
      setTimeout(() => {
        setIsSaving(false);
        setSuccessMsg('');
        onClose();
      }, 1000);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to update profile picture.');
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 text-white shadow-2xl relative space-y-5 animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center">
              <Camera size={20} />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white">Edit Profile Picture</h3>
              <p className="text-xs text-slate-400">Update photo for {currentEmployee.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 p-1.5 rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Avatar Live Preview */}
        <div className="flex flex-col items-center justify-center py-2">
          <div className="relative group">
            <img
              src={avatarUrl || currentEmployee.avatar}
              alt="Avatar Preview"
              className="w-28 h-28 rounded-full object-cover ring-4 ring-blue-500/60 shadow-xl bg-slate-800"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-500 text-white p-2.5 rounded-full shadow-lg transition-transform hover:scale-105"
              title="Upload new photo"
            >
              <Upload size={16} />
            </button>
            {isUploading && (
              <div className="absolute inset-0 bg-slate-950/70 rounded-full flex items-center justify-center">
                <Loader2 size={24} className="animate-spin text-blue-400" />
              </div>
            )}
          </div>
          <span className="text-xs text-slate-400 mt-2 font-medium">Live Preview</span>
        </div>

        {/* Upload Button & Image URL Input */}
        <div className="space-y-3 bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800">
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
            Upload from Computer / Phone
          </label>
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full bg-slate-800 hover:bg-slate-700 text-blue-300 hover:text-blue-200 border border-slate-700 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all"
          >
            <ImageIcon size={16} />
            Select Photo File (JPG, PNG, WEBP)
          </button>

          <div className="pt-2">
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">
              Or paste Image Web URL:
            </label>
            <input
              type="text"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="w-full bg-slate-900 border border-slate-800 text-xs text-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-blue-500 font-mono"
            />
          </div>
        </div>

        {/* Preset Avatar Selection */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block flex items-center gap-1">
            <Sparkles size={13} className="text-amber-400" />
            Or Select Quick Preset:
          </span>
          <div className="grid grid-cols-5 gap-2">
            {presetAvatars.map((url, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setAvatarUrl(url)}
                className={`relative rounded-xl overflow-hidden aspect-square border-2 transition-all ${
                  avatarUrl === url
                    ? 'border-blue-500 ring-2 ring-blue-500/50 scale-105'
                    : 'border-slate-800 hover:border-slate-600 opacity-80 hover:opacity-100'
                }`}
              >
                <img src={url} alt={`Preset ${idx + 1}`} className="w-full h-full object-cover" />
                {avatarUrl === url && (
                  <div className="absolute inset-0 bg-blue-600/30 flex items-center justify-center">
                    <Check size={14} className="text-white font-bold" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {errorMsg && (
          <p className="text-xs text-rose-400 bg-rose-950/50 p-2.5 rounded-xl border border-rose-800/60 font-medium">
            {errorMsg}
          </p>
        )}

        {successMsg && (
          <p className="text-xs text-emerald-400 bg-emerald-950/50 p-2.5 rounded-xl border border-emerald-800/60 font-medium flex items-center gap-1.5">
            <Check size={16} />
            {successMsg}
          </p>
        )}

        {/* Save & Cancel Actions */}
        <div className="flex items-center gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-3 rounded-xl text-xs font-bold transition-all"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving || isUploading}
            className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-lg"
          >
            {isSaving ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Saving Photo...</span>
              </>
            ) : (
              <>
                <Check size={16} />
                <span>Save Profile Picture</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
