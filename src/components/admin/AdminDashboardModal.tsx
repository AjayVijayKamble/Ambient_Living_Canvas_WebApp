import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Shield,
  Layers,
  Users,
  MessageSquare,
  Plus,
  Trash2,
  Upload,
  Globe,
  Clock,
  Image as ImageIcon,
  CheckCircle2,
  ExternalLink,
  Eye,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useCatalogStore } from '../../store/catalogStore';
import { adminService } from '../../services/supabase/adminService';
import { feedbackService } from '../../services/supabase/feedbackService';
import { storageService } from '../../services/supabase/storageService';
import { CATEGORIES } from '../../data/categories';
import { validateImageFile, validateImageUrl } from '../../utils/imageValidation';
import { ImageGuidelinesCard } from '../common/ImageGuidelinesCard';
import type { MediaItem, UserAdminView, UserFeedback, ParticleType, SoundscapeType } from '../../types';

export const AdminDashboardModal: React.FC = () => {
  const { isAdminModalOpen, closeAdminModal, isAdmin, user } = useAuthStore();
  const { catalog, syncAdminMedia } = useCatalogStore();

  const [activeTab, setActiveTab] = useState<'media' | 'users' | 'feedback'>('media');
  const [selectedCategory, setSelectedCategory] = useState<string>('anime');
  const [categoryItems, setCategoryItems] = useState<MediaItem[]>([]);

  // Add Image Dialog state
  const [isAddImageOpen, setIsAddImageOpen] = useState(false);
  const [newImageTitle, setNewImageTitle] = useState('');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newImageAuthor, setNewImageAuthor] = useState('');
  const [newImageParticle, setNewImageParticle] = useState<ParticleType>('none');
  const [newImageSoundscape, setNewImageSoundscape] = useState<SoundscapeType>('none');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadWarning, setUploadWarning] = useState<string | null>(null);
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Users Directory state
  const [usersList, setUsersList] = useState<UserAdminView[]>([]);
  const [selectedUserForAlbums, setSelectedUserForAlbums] = useState<UserAdminView | null>(null);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);

  // Feedback state
  const [feedbackList, setFeedbackList] = useState<UserFeedback[]>([]);
  const [isLoadingFeedback, setIsLoadingFeedback] = useState(false);

  // Load category items when selectedCategory changes or tab changes
  useEffect(() => {
    if (!isAdminModalOpen) return;

    const loadMedia = async () => {
      const overrides = await adminService.getCategoryMedia(selectedCategory);
      const catalogMatches = catalog.filter((m) => m.categories.includes(selectedCategory));
      
      // Combine without duplicates
      const overrideIds = new Set(overrides.map((o) => o.id));
      const combined = [...overrides, ...catalogMatches.filter((m) => !overrideIds.has(m.id))];
      setCategoryItems(combined);
    };

    loadMedia();
  }, [selectedCategory, isAdminModalOpen, catalog]);

  // Load Users Directory
  const refreshUsers = async () => {
    setIsLoadingUsers(true);
    const users = await adminService.getAllUsers();
    setUsersList(users);
    setIsLoadingUsers(false);
  };

  // Load Feedback Inbox
  const refreshFeedback = async () => {
    setIsLoadingFeedback(true);
    const list = await feedbackService.getAllFeedback();
    setFeedbackList(list);
    setIsLoadingFeedback(false);
  };

  useEffect(() => {
    if (!isAdminModalOpen) return;
    if (activeTab === 'users') refreshUsers();
    if (activeTab === 'feedback') refreshFeedback();
  }, [activeTab, isAdminModalOpen]);

  if (!isAdminModalOpen || !isAdmin) return null;

  // Handle uploading or creating new category image
  const handleAddMediaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploadError(null);

    if (!newImageUrl.trim()) {
      setUploadError('Please choose a file to upload or enter an image URL.');
      return;
    }

    // If image was entered via URL directly, validate it
    if (!imageDimensions) {
      setIsUploading(true);
      const validation = await validateImageUrl(newImageUrl);
      setIsUploading(false);

      if (!validation.isValid) {
        setUploadError(validation.error || 'The image URL is invalid or inaccessible.');
        return;
      }
      if (validation.width && validation.height) {
        setImageDimensions({ width: validation.width, height: validation.height });
      }
    }

    const newItem = await adminService.addMediaToCategory(selectedCategory, {
      title: newImageTitle || 'Ambient Scene',
      url: newImageUrl,
      thumbnailUrl: newImageUrl,
      categories: [selectedCategory],
      moods: ['peaceful'],
      source: 'curated',
      author: newImageAuthor || 'Curated Artist',
      width: imageDimensions?.width || 3840,
      height: imageDimensions?.height || 2160,
      type: 'image',
      particleEffect: newImageParticle,
      suggestedSoundscape: newImageSoundscape
    });

    setCategoryItems((prev) => [newItem, ...prev]);
    syncAdminMedia([newItem]);
    setIsAddImageOpen(false);
    setNewImageTitle('');
    setNewImageUrl('');
    setNewImageAuthor('');
    setUploadError(null);
    setUploadWarning(null);
    setImageDimensions(null);
  };

  // Handle local file upload with format, size, and resolution validation
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);
    setUploadWarning(null);

    // Validate format, size, and resolution
    const validation = await validateImageFile(file);
    if (!validation.isValid) {
      setUploadError(validation.error || 'Unsupported image file.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    if (validation.warning) {
      setUploadWarning(validation.warning);
    }

    if (validation.width && validation.height) {
      setImageDimensions({ width: validation.width, height: validation.height });
    }

    setIsUploading(true);
    const res = await storageService.uploadCategoryMedia(file);
    setIsUploading(false);

    if (res.url) {
      setNewImageUrl(res.url);
      if (!newImageTitle) {
        setNewImageTitle(file.name.replace(/\.[^/.]+$/, ''));
      }
    }
  };

  // Handle deleting category image
  const handleDeleteItem = async (id: string) => {
    await adminService.deleteCategoryMedia(selectedCategory, id);
    setCategoryItems((prev) => prev.filter((i) => i.id !== id));
  };

  const formatRelativeTime = (isoString: string) => {
    try {
      const diffSecs = Math.floor((Date.now() - new Date(isoString).getTime()) / 1000);
      if (diffSecs < 60) return 'Just now';
      if (diffSecs < 3600) return `${Math.floor(diffSecs / 60)}m ago`;
      if (diffSecs < 86400) return `${Math.floor(diffSecs / 3600)}h ago`;
      return `${Math.floor(diffSecs / 86400)}d ago`;
    } catch {
      return isoString;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-xl animate-fade-in select-none">
      <div className="relative w-full max-w-6xl max-h-[90vh] bg-[#0C0E14] border border-white/10 rounded-3xl flex flex-col shadow-2xl overflow-hidden">
        {/* Top Header Bar */}
        <div className="px-6 py-4 border-b border-white/8 flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display font-bold text-lg text-white">Admin Studio</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  iamavk265
                </span>
              </div>
              <p className="text-xs text-white/40 font-light">
                Manage category images, monitor user directory, and review incoming queries
              </p>
            </div>
          </div>

          <button
            onClick={closeAdminModal}
            className="p-2 rounded-full glass-dock text-white/50 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 border-b border-white/8 flex items-center gap-2 pt-3 bg-white/[0.01]">
          {[
            { id: 'media', label: 'Category Media Manager', icon: Layers },
            { id: 'users', label: 'User Directory & Activity', icon: Users },
            { id: 'feedback', label: `Inquiries & Feedback (${feedbackList.length})`, icon: MessageSquare }
          ].map((t) => {
            const Icon = t.icon;
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id as typeof activeTab)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-medium transition-all border-b-2 cursor-pointer ${
                  isActive
                    ? 'border-indigo-400 text-white bg-white/5'
                    : 'border-transparent text-white/50 hover:text-white hover:bg-white/[0.02]'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-indigo-400' : 'text-white/40'}`} />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-white/10">
          {/* TAB 1: CATEGORY MEDIA MANAGER */}
          {activeTab === 'media' && (
            <div>
              {/* Category Selector + Add Image Button */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <span className="text-xs text-white/60 font-mono uppercase">Category:</span>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-3 py-2 rounded-xl bg-[#161922] border border-white/15 text-white text-xs font-semibold focus:outline-none focus:border-indigo-400 cursor-pointer"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c.id} value={c.id} className="bg-[#161922] text-white">
                        {c.name} ({c.group})
                      </option>
                    ))}
                  </select>
                  <span className="text-xs text-white/40">
                    {categoryItems.length} photos in this category
                  </span>
                </div>

                <button
                  onClick={() => setIsAddImageOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-sky-400 via-indigo-500 to-purple-500 text-white font-semibold text-xs shadow-md hover:brightness-110 active:scale-95 transition-all cursor-pointer self-start sm:self-auto"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Upload / Add Image</span>
                </button>
              </div>

              {/* Photos Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {categoryItems.map((item) => (
                  <div
                    key={item.id}
                    className="group relative rounded-2xl overflow-hidden glass-card aspect-[16/10] bg-black/40 flex flex-col justify-between p-3"
                  >
                    <img
                      src={item.thumbnailUrl || item.url}
                      alt={item.title}
                      className="absolute inset-0 w-full h-full object-cover filter brightness-75 group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

                    <div className="relative z-10 flex items-center justify-between">
                      {item.particleEffect && item.particleEffect !== 'none' && (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-mono uppercase bg-white/20 text-white backdrop-blur-md">
                          {item.particleEffect}
                        </span>
                      )}
                      <button
                        onClick={() => handleDeleteItem(item.id)}
                        className="p-1.5 rounded-lg bg-black/60 text-white/60 hover:text-rose-400 hover:bg-rose-500/20 transition-colors ml-auto cursor-pointer"
                        title="Remove Image"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="relative z-10">
                      <p className="text-xs font-semibold text-white line-clamp-1">{item.title}</p>
                      {item.author && (
                        <p className="text-[10px] text-white/50 font-light truncate">{item.author}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: USER DIRECTORY & ACTIVITY */}
          {activeTab === 'users' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-semibold text-white">Registered Users</h3>
                  <p className="text-xs text-white/40">
                    Accounts, countries, last login, and personal album photo statistics
                  </p>
                </div>

                <button
                  onClick={refreshUsers}
                  disabled={isLoadingUsers}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full glass-dock text-xs text-white/70 hover:text-white cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingUsers ? 'animate-spin' : ''}`} />
                  <span>Refresh</span>
                </button>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.02]">
                <table className="w-full text-left text-xs text-white/80">
                  <thead className="bg-white/5 text-[10px] font-mono uppercase tracking-wider text-white/50 border-b border-white/10">
                    <tr>
                      <th className="py-3 px-4">User</th>
                      <th className="py-3 px-4">Country</th>
                      <th className="py-3 px-4">Role</th>
                      <th className="py-3 px-4 text-center">Albums</th>
                      <th className="py-3 px-4 text-center">Album Photos</th>
                      <th className="py-3 px-4">Last Login</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {usersList.map((u) => (
                      <tr key={u.id} className="hover:bg-white/[0.03] transition-colors">
                        <td className="py-3.5 px-4 font-medium text-white flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 text-white flex items-center justify-center text-xs font-bold">
                            {u.username.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div>{u.username}</div>
                            <div className="text-[10px] text-white/40">{u.email}</div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1.5 text-white/70">
                            <Globe className="w-3.5 h-3.5 text-indigo-400" />
                            <span>{u.country}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[9px] font-mono uppercase ${
                              u.role === 'admin'
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                : 'bg-white/10 text-white/60'
                            }`}
                          >
                            {u.role}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center font-mono">{u.albumCount}</td>
                        <td className="py-3.5 px-4 text-center font-mono text-emerald-400">
                          {u.photoCount}
                        </td>
                        <td className="py-3.5 px-4 text-white/50 font-mono text-[11px]">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-white/30" />
                            <span>{formatRelativeTime(u.lastSignInAt)}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => setSelectedUserForAlbums(u)}
                            className="px-2.5 py-1 rounded-lg glass-dock text-[11px] text-indigo-300 hover:text-white cursor-pointer"
                          >
                            View Albums
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: FEEDBACK INBOX */}
          {activeTab === 'feedback' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-semibold text-white">Inquiries & Feedback</h3>
                  <p className="text-xs text-white/40">
                    Questions, bug reports, and suggestions submitted by visitors
                  </p>
                </div>

                <button
                  onClick={refreshFeedback}
                  disabled={isLoadingFeedback}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full glass-dock text-xs text-white/70 hover:text-white cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingFeedback ? 'animate-spin' : ''}`} />
                  <span>Refresh</span>
                </button>
              </div>

              {feedbackList.length === 0 ? (
                <div className="text-center py-16 glass-card rounded-2xl">
                  <MessageSquare className="w-10 h-10 text-white/20 mx-auto mb-2" />
                  <p className="text-xs text-white/40">No messages received yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {feedbackList.map((f) => (
                    <div
                      key={f.id}
                      className="p-4 rounded-2xl glass-card border border-white/8 flex flex-col sm:flex-row sm:items-start justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-mono uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                            {f.type}
                          </span>
                          <span className="text-xs font-semibold text-white">{f.name || 'Anonymous'}</span>
                          <span className="text-xs text-white/40">({f.email})</span>
                          <span className="text-[10px] text-white/30 font-mono">
                            {formatRelativeTime(f.createdAt)}
                          </span>
                        </div>
                        <p className="text-xs text-white/80 font-light mt-1 whitespace-pre-wrap">
                          {f.message}
                        </p>
                      </div>

                      {f.status === 'new' ? (
                        <button
                          onClick={async () => {
                            await feedbackService.markAsReviewed(f.id);
                            setFeedbackList((prev) =>
                              prev.map((item) => (item.id === f.id ? { ...item, status: 'reviewed' } : item))
                            );
                          }}
                          className="px-3 py-1 rounded-lg bg-white/10 hover:bg-emerald-500/20 text-white/60 hover:text-emerald-300 text-xs transition-colors shrink-0 cursor-pointer"
                        >
                          Mark Reviewed
                        </button>
                      ) : (
                        <span className="text-[10px] font-mono uppercase text-emerald-400 shrink-0">
                          Reviewed
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* MODAL: ADD / UPLOAD IMAGE TO CATEGORY */}
      {isAddImageOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-md bg-[#0F1117] border border-white/15 rounded-3xl p-6 shadow-2xl">
            <button
              onClick={() => setIsAddImageOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-full glass-dock text-white/50 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="font-display font-bold text-lg text-white mb-1">
              Add Photo to Category: {selectedCategory.toUpperCase()}
            </h3>
            <p className="text-xs text-white/50 mb-4">
              Upload high-definition photos from your device or paste a public image URL.
            </p>

            {/* Image Guidelines Box */}
            <div className="mb-4">
              <ImageGuidelinesCard compact />
            </div>

            {/* Validation Error Alert */}
            {uploadError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5 animate-fade-in">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{uploadError}</span>
              </div>
            )}

            {/* Validation Warning Alert */}
            {uploadWarning && (
              <div className="mb-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-2.5 animate-fade-in">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{uploadWarning}</span>
              </div>
            )}

            <form onSubmit={handleAddMediaSubmit} className="space-y-4">
              {/* File Upload Option */}
              <div>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="w-full py-3 rounded-xl border border-dashed border-white/20 bg-white/5 hover:bg-white/10 text-xs text-white/80 flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  <Upload className="w-4 h-4 text-sky-400" />
                  <span>{isUploading ? 'Uploading Image...' : 'Upload Image File'}</span>
                </button>
              </div>

              <div className="flex items-center gap-2 text-white/30 text-[10px] font-mono uppercase">
                <div className="flex-1 h-[1px] bg-white/10" />
                <span>OR PASTE URL</span>
                <div className="flex-1 h-[1px] bg-white/10" />
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase text-white/60 mb-1">
                  Image URL *
                </label>
                <input
                  type="url"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-indigo-400"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase text-white/60 mb-1">
                  Scene Title
                </label>
                <input
                  type="text"
                  value={newImageTitle}
                  onChange={(e) => setNewImageTitle(e.target.value)}
                  placeholder="e.g. Neon Tokyo Cyber Alley"
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-indigo-400"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase text-white/60 mb-1">
                  Photographer / Creator
                </label>
                <input
                  type="text"
                  value={newImageAuthor}
                  onChange={(e) => setNewImageAuthor(e.target.value)}
                  placeholder="e.g. Makoto Shinkai Studio"
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-indigo-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono uppercase text-white/60 mb-1">
                    Particle Overlay
                  </label>
                  <select
                    value={newImageParticle}
                    onChange={(e) => setNewImageParticle(e.target.value as ParticleType)}
                    className="w-full px-3 py-2 rounded-xl bg-[#161922] border border-white/10 text-white text-xs"
                  >
                    <option value="none">None</option>
                    <option value="sakura">Sakura Petals</option>
                    <option value="stars">Stars</option>
                    <option value="rain">Rain</option>
                    <option value="snow">Snow</option>
                    <option value="fireflies">Fireflies</option>
                    <option value="bokeh">Bokeh Glow</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase text-white/60 mb-1">
                    Soundscape
                  </label>
                  <select
                    value={newImageSoundscape}
                    onChange={(e) => setNewImageSoundscape(e.target.value as SoundscapeType)}
                    className="w-full px-3 py-2 rounded-xl bg-[#161922] border border-white/10 text-white text-xs"
                  >
                    <option value="none">None</option>
                    <option value="rain">Rain</option>
                    <option value="forest">Forest Birds</option>
                    <option value="ocean">Ocean Waves</option>
                    <option value="meditation">Zen Meditation</option>
                    <option value="fireplace">Fireplace</option>
                    <option value="space">Deep Space</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 mt-2 rounded-xl bg-gradient-to-r from-sky-400 via-indigo-500 to-purple-500 text-white font-semibold text-xs tracking-wide shadow-md hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer"
              >
                Add Image to Category
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: INSPECT USER'S ALBUMS */}
      {selectedUserForAlbums && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-lg bg-[#0F1117] border border-white/15 rounded-3xl p-6 shadow-2xl">
            <button
              onClick={() => setSelectedUserForAlbums(null)}
              className="absolute top-5 right-5 p-2 rounded-full glass-dock text-white/50 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="font-display font-bold text-lg text-white mb-1">
              Albums for {selectedUserForAlbums.username}
            </h3>
            <p className="text-xs text-white/40 mb-4">
              Total {selectedUserForAlbums.albumCount} albums, {selectedUserForAlbums.photoCount} photos
            </p>

            {(!selectedUserForAlbums.albums || selectedUserForAlbums.albums.length === 0) ? (
              <div className="py-12 text-center text-xs text-white/40">
                This user has not created any personal albums yet.
              </div>
            ) : (
              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {selectedUserForAlbums.albums.map((alb) => (
                  <div
                    key={alb.id}
                    className="flex items-center gap-3 p-3 rounded-xl glass-card border border-white/8"
                  >
                    {alb.coverUrl ? (
                      <img src={alb.coverUrl} alt={alb.name} className="w-12 h-12 rounded-lg object-cover" />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center text-white/40">
                        <ImageIcon className="w-5 h-5" />
                      </div>
                    )}
                    <div className="flex-1">
                      <h4 className="text-xs font-semibold text-white">{alb.name}</h4>
                      {alb.description && (
                        <p className="text-[11px] text-white/50 line-clamp-1">{alb.description}</p>
                      )}
                      <span className="text-[10px] text-white/30 font-mono">
                        {(alb.photos?.length || 0)} photos
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
