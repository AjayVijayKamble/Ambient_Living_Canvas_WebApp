import React, { useRef, useState, useEffect } from 'react';
import {
  Upload,
  Play,
  Trash2,
  Image as ImageIcon,
  ShieldCheck,
  Plus,
  ArrowLeft,
  Layers,
  X,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { useAlbumStore } from '../../store/albumStore';
import { useAuthStore } from '../../store/authStore';
import { storageService } from '../../services/supabase/storageService';
import { validateImageFile } from '../../utils/imageValidation';
import { ImageGuidelinesCard } from '../common/ImageGuidelinesCard';
import type { UserAlbum, TransitionType, SoundscapeType, ParticleType } from '../../types';

export const UserPhotosManager: React.FC = () => {
  const { user, openAuthModal } = useAuthStore();
  const {
    albums,
    loadAlbums,
    createAlbum,
    addPhotosToAlbum,
    deleteAlbum,
    deletePhoto,
    playAlbumScreensaver,
    activeAlbum,
    setActiveAlbum
  } = useAlbumStore();

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const folderInputRef = useRef<HTMLInputElement | null>(null);
  const albumPhotoInputRef = useRef<HTMLInputElement | null>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [isCreateAlbumOpen, setIsCreateAlbumOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{
    current: number;
    total: number;
    percentage: number;
    currentFileName?: string;
  } | null>(null);
  const [uploadSuccessMessage, setUploadSuccessMessage] = useState<string | null>(null);
  const [uploadErrors, setUploadErrors] = useState<string[]>([]);
  const [uploadWarnings, setUploadWarnings] = useState<string[]>([]);

  // New Album Form
  const [albumName, setAlbumName] = useState('');
  const [albumDescription, setAlbumDescription] = useState('');
  const [albumTransition, setAlbumTransition] = useState<TransitionType>('crossfade');
  const [albumSoundscape, setAlbumSoundscape] = useState<SoundscapeType>('none');
  const [albumParticle, setAlbumParticle] = useState<ParticleType>('none');
  const [albumDuration, setAlbumDuration] = useState(10);

  const userId = user?.id || '';
  const currentAlbum = albums.find((a) => a.id === activeAlbum?.id) || activeAlbum;

  useEffect(() => {
    if (userId) {
      loadAlbums(userId);
    }
  }, [userId, loadAlbums]);

  const handleCreateAlbumSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!albumName.trim()) return;

    const newAlbum = await createAlbum({
      userId,
      name: albumName.trim(),
      description: albumDescription.trim() || undefined,
      transition: albumTransition,
      defaultDuration: albumDuration,
      soundscape: albumSoundscape,
      particleEffect: albumParticle
    });

    setIsCreateAlbumOpen(false);
    setAlbumName('');
    setAlbumDescription('');
    setActiveAlbum(newAlbum);
  };

  const handleUploadPhotosToActiveAlbum = async (files: FileList | null) => {
    if (!files || files.length === 0 || !currentAlbum || !userId) return;

    setIsUploading(true);
    setUploadSuccessMessage(null);
    setUploadErrors([]);
    setUploadWarnings([]);

    const fileList = Array.from(files);
    const validFilesToUpload: File[] = [];
    const errors: string[] = [];
    const warnings: string[] = [];

    for (const file of fileList) {
      const result = await validateImageFile(file);
      if (!result.isValid) {
        errors.push(`${file.name}: ${result.error}`);
      } else {
        validFilesToUpload.push(file);
        if (result.warning) {
          warnings.push(`${file.name}: ${result.warning}`);
        }
      }
    }

    if (errors.length > 0) {
      setUploadErrors(errors);
    }
    if (warnings.length > 0) {
      setUploadWarnings(warnings);
    }

    if (validFilesToUpload.length > 0) {
      setUploadProgress({
        current: 0,
        total: validFilesToUpload.length,
        percentage: 5,
        currentFileName: validFilesToUpload[0].name
      });

      const successList: Array<{ title: string; url: string }> = [];

      for (let i = 0; i < validFilesToUpload.length; i++) {
        const file = validFilesToUpload[i];
        const percentBefore = Math.round((i / validFilesToUpload.length) * 90) + 5;
        setUploadProgress({
          current: i + 1,
          total: validFilesToUpload.length,
          percentage: percentBefore,
          currentFileName: file.name
        });

        const res = await storageService.uploadUserPhoto(userId, file);
        if (res.url) {
          successList.push({
            title: file.name.replace(/\.[^/.]+$/, ''),
            url: res.url
          });
        }

        const percentAfter = Math.round(((i + 1) / validFilesToUpload.length) * 90) + 5;
        setUploadProgress({
          current: i + 1,
          total: validFilesToUpload.length,
          percentage: percentAfter,
          currentFileName: file.name
        });
      }

      if (successList.length > 0) {
        setUploadProgress({
          current: validFilesToUpload.length,
          total: validFilesToUpload.length,
          percentage: 100,
          currentFileName: 'Finalizing album...'
        });
        await addPhotosToAlbum(currentAlbum.id, userId, successList);
        await loadAlbums(userId);
        setUploadSuccessMessage(
          `Successfully uploaded ${successList.length} photo${successList.length > 1 ? 's' : ''} to "${currentAlbum.name}"!`
        );
      }
    }

    setIsUploading(false);
    setTimeout(() => {
      setUploadProgress(null);
    }, 1500);
  };

  return (
    <div className="w-full max-w-[1680px] mx-auto py-6 select-none animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-mono tracking-widest uppercase mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Private Custom Collections · Multi-Screen Ready</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-wide">
            Your Personal Screensaver Albums
          </h2>
          <p className="text-xs sm:text-sm text-white/50 font-light mt-0.5 max-w-2xl">
            Create custom photo albums from your local memories, configure ambient soundscapes, and launch a gorgeous full-screen screensaver with 1 click.
          </p>
        </div>

        {user && (
          <div className="flex items-center gap-3">
            {currentAlbum ? (
              <button
                onClick={() => setActiveAlbum(null)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full glass-dock text-xs font-medium text-white/70 hover:text-white cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Albums</span>
              </button>
            ) : (
              <button
                onClick={() => setIsCreateAlbumOpen(true)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-sky-400 via-indigo-500 to-purple-500 text-white font-semibold text-xs shadow-lg shadow-indigo-500/20 hover:scale-105 active:scale-95 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Create New Album</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* GUEST ACCESS PROMPT (When not logged in) */}
      {!user && (
        <div className="py-16 px-6 rounded-3xl glass-panel border border-white/10 text-center max-w-xl mx-auto my-6 animate-fade-in shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-sky-400/20 via-indigo-500/20 to-purple-500/20 border border-white/15 flex items-center justify-center mx-auto mb-4 text-sky-400 shadow-xl shadow-indigo-500/10">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h3 className="text-2xl font-display font-bold text-white mb-2">
            Sign In for Personal Albums
          </h3>
          <p className="text-xs sm:text-sm text-white/50 font-light leading-relaxed max-w-md mx-auto mb-6">
            Create custom screensaver collections from your private memories, configure ambient soundscapes, and keep your personal albums isolated to your account.
          </p>
          <button
            onClick={() => openAuthModal('Please sign in or create an account to manage your personal photo albums.')}
            className="px-6 py-3 rounded-full bg-gradient-to-r from-sky-400 via-indigo-500 to-purple-500 text-white font-semibold text-xs tracking-wide shadow-lg shadow-indigo-500/25 hover:brightness-110 active:scale-95 transition-all cursor-pointer"
          >
            Sign In / Create Account
          </button>
        </div>
      )}

      {user && (
        <>

      {/* VIEW 1: ALBUM DETAILS / PHOTO MANAGER */}
      {currentAlbum ? (
        <div className="space-y-8 animate-fade-in">
          {/* Active Album Bar */}
          <div className="p-6 rounded-3xl glass-card border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              {currentAlbum.coverUrl ? (
                <img
                  src={currentAlbum.coverUrl}
                  alt={currentAlbum.name}
                  className="w-16 h-16 rounded-2xl object-cover shadow-lg border border-white/15"
                />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center text-white/40">
                  <ImageIcon className="w-8 h-8" />
                </div>
              )}
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-display font-bold text-xl text-white">{currentAlbum.name}</h3>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase bg-white/10 text-white/70">
                    {currentAlbum.photos.length} Photos
                  </span>
                </div>
                {currentAlbum.description && (
                  <p className="text-xs text-white/50 font-light mt-0.5 max-w-xl">
                    {currentAlbum.description}
                  </p>
                )}
                <div className="flex items-center gap-3 mt-2 text-[11px] font-mono text-white/40">
                  <span>Transition: {currentAlbum.transition}</span>
                  <span>·</span>
                  <span>Duration: {currentAlbum.defaultDuration}s</span>
                  {currentAlbum.particleEffect !== 'none' && (
                    <>
                      <span>·</span>
                      <span>Particle: {currentAlbum.particleEffect}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 self-start sm:self-auto">
              <input
                ref={albumPhotoInputRef}
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={(e) => handleUploadPhotosToActiveAlbum(e.target.files)}
              />

              <button
                onClick={() => albumPhotoInputRef.current?.click()}
                disabled={isUploading}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full glass-dock text-xs font-medium text-white hover:bg-white/15 transition-all cursor-pointer disabled:opacity-50"
              >
                <Upload className="w-3.5 h-3.5 text-sky-400" />
                <span>{isUploading ? 'Uploading...' : 'Add Photos'}</span>
              </button>

              {currentAlbum.photos.length > 0 && (
                <button
                  onClick={() => playAlbumScreensaver(currentAlbum)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 text-black font-semibold text-xs tracking-wide shadow-lg shadow-emerald-500/25 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-black" />
                  <span>Start Screensaver</span>
                </button>
              )}
            </div>
          </div>

          {/* Active Upload Progress Bar */}
          {isUploading && uploadProgress && (
            <div className="p-5 rounded-2xl bg-gradient-to-r from-sky-500/10 via-indigo-500/10 to-emerald-500/10 border border-sky-400/30 text-white text-xs animate-fade-in shadow-xl backdrop-blur-md">
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-sky-500/20 text-sky-300 animate-pulse">
                    <Upload className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white">Uploading Photos</span>
                      <span className="text-[11px] font-mono text-sky-300">
                        ({uploadProgress.current} of {uploadProgress.total})
                      </span>
                    </div>
                    {uploadProgress.currentFileName && (
                      <p className="text-[11px] text-white/50 truncate max-w-md mt-0.5">
                        {uploadProgress.currentFileName}
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-lg font-mono font-bold text-sky-400">
                    {uploadProgress.percentage}%
                  </span>
                </div>
              </div>

              {/* Progress Track & Bar */}
              <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden relative">
                <div
                  className="h-full bg-gradient-to-r from-sky-400 via-teal-400 to-emerald-400 rounded-full transition-all duration-300 shadow-[0_0_12px_rgba(56,189,248,0.6)]"
                  style={{ width: `${uploadProgress.percentage}%` }}
                />
              </div>
            </div>
          )}

          {/* Upload Success Alert */}
          {uploadSuccessMessage && (
            <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-200 text-xs animate-fade-in flex items-center justify-between gap-3 shadow-lg shadow-emerald-500/10">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="font-medium">{uploadSuccessMessage}</span>
              </div>
              <button
                onClick={() => setUploadSuccessMessage(null)}
                className="text-white/40 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Guidelines Card */}
          <ImageGuidelinesCard compact />

          {/* Upload Errors Box */}
          {uploadErrors.length > 0 && (
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs animate-fade-in">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 font-semibold">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{uploadErrors.length} file(s) could not be uploaded:</span>
                </div>
                <button
                  onClick={() => setUploadErrors([])}
                  className="text-white/40 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <ul className="space-y-1 list-disc list-inside text-[11px] text-rose-200/80">
                {uploadErrors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Upload Warnings Box */}
          {uploadWarnings.length > 0 && (
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs animate-fade-in flex items-start justify-between gap-3">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-0.5 text-[11px]">
                  {uploadWarnings.map((warn, i) => (
                    <p key={i}>{warn}</p>
                  ))}
                </div>
              </div>
              <button
                onClick={() => setUploadWarnings([])}
                className="text-white/40 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Photos Grid in Active Album */}
          {currentAlbum.photos.length === 0 ? (
            <div
              onClick={() => albumPhotoInputRef.current?.click()}
              className="py-20 rounded-3xl border-2 border-dashed border-white/15 bg-white/[0.02] flex flex-col items-center justify-center text-center cursor-pointer hover:border-white/30 transition-colors"
            >
              <div className="p-4 rounded-2xl bg-white/5 text-sky-400 mb-3">
                <Upload className="w-8 h-8" />
              </div>
              <h4 className="font-display font-bold text-lg text-white mb-1">
                No Photos in this Album Yet
              </h4>
              <p className="text-xs text-white/40 max-w-sm mb-4">
                Click here or choose Add Photos to upload images for your screensaver.
              </p>
              <button className="px-5 py-2 rounded-full glass-dock text-xs font-medium text-white">
                Upload Photos
              </button>
            </div>
          ) : (
            <div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
                {currentAlbum.photos.map((photo) => (
                  <div
                    key={photo.id}
                    className="group relative rounded-2xl overflow-hidden glass-card aspect-[4/3] bg-black/40"
                  >
                    <img
                      src={photo.url}
                      alt={photo.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-2.5">
                      <span className="text-xs text-white font-medium truncate max-w-[120px]">
                        {photo.title}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deletePhoto(currentAlbum.id, photo.id);
                        }}
                        className="p-1.5 rounded-lg bg-rose-500/80 text-white hover:bg-rose-600 transition-colors cursor-pointer shrink-0"
                        title="Delete Photo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* VIEW 2: ALBUMS LIST & QUICK CARDS */
        <div>
          {albums.length === 0 ? (
            <div className="text-center py-20 glass-panel rounded-3xl border border-white/8">
              <Layers className="w-12 h-12 text-white/20 mx-auto mb-3" />
              <h3 className="text-lg font-display font-bold text-white mb-1">
                No Albums Created Yet
              </h3>
              <p className="text-xs text-white/40 max-w-sm mx-auto mb-6">
                Create a personal album, upload your favorite photos, and start your screensaver anytime with one click.
              </p>
              <button
                onClick={() => setIsCreateAlbumOpen(true)}
                className="px-6 py-2.5 rounded-full bg-white text-black font-semibold text-xs shadow-md hover:bg-white/90 cursor-pointer"
              >
                Create Your First Album
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
              {albums.map((alb) => (
                <div
                  key={alb.id}
                  onClick={() => setActiveAlbum(alb)}
                  className="group relative rounded-3xl overflow-hidden glass-card cursor-pointer p-5 flex flex-col justify-between aspect-[16/10] hover:scale-[1.02] transition-all duration-300 border border-white/10"
                >
                  {/* Background Cover Image */}
                  {alb.coverUrl ? (
                    <div className="absolute inset-0 overflow-hidden bg-black/60">
                      <img
                        src={alb.coverUrl}
                        alt={alb.name}
                        className="w-full h-full object-cover filter brightness-50 group-hover:scale-108 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#08090B] via-[#08090B]/40 to-transparent" />
                    </div>
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/40 to-slate-950/60" />
                  )}

                  {/* Top Row: Photos count & Delete */}
                  <div className="relative z-10 flex items-center justify-between">
                    <span className="px-3 py-1 rounded-full text-[10px] font-mono uppercase tracking-wider bg-white/15 backdrop-blur-md text-white border border-white/10">
                      {alb.photos.length} Photos
                    </span>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteAlbum(alb.id);
                      }}
                      className="p-2 rounded-xl bg-black/50 text-white/40 hover:text-rose-400 hover:bg-rose-500/20 transition-colors cursor-pointer"
                      title="Delete Album"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Bottom Row: Title + 1-Click Screensaver Button */}
                  <div className="relative z-10 flex items-end justify-between gap-4">
                    <div>
                      <h3 className="font-display font-bold text-lg text-white group-hover:text-sky-300 transition-colors">
                        {alb.name}
                      </h3>
                      {alb.description && (
                        <p className="text-xs text-white/60 font-light mt-0.5 line-clamp-1">
                          {alb.description}
                        </p>
                      )}
                    </div>

                    {alb.photos.length > 0 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          playAlbumScreensaver(alb);
                        }}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-emerald-400 text-black font-semibold text-xs tracking-wide shadow-xl hover:scale-105 active:scale-95 transition-transform cursor-pointer shrink-0"
                        title="Start Screensaver Immediately"
                      >
                        <Play className="w-3.5 h-3.5 fill-black" />
                        <span>Start</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      </>
      )}

      {/* CREATE ALBUM MODAL */}
      {isCreateAlbumOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-md bg-[#0F1117] border border-white/15 rounded-3xl p-6 shadow-2xl">
            <button
              onClick={() => setIsCreateAlbumOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-full glass-dock text-white/50 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="font-display font-bold text-lg text-white mb-1">Create Custom Album</h3>
            <p className="text-xs text-white/40 mb-3">
              Set up your album title, ambient soundscape, and screensaver transitions.
            </p>

            <div className="mb-4">
              <ImageGuidelinesCard compact />
            </div>

            <form onSubmit={handleCreateAlbumSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-mono uppercase text-white/60 mb-1">
                  Album Name *
                </label>
                <input
                  type="text"
                  value={albumName}
                  onChange={(e) => setAlbumName(e.target.value)}
                  placeholder="e.g. Kyoto Trip 2025 or Zen Minimal"
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-indigo-400"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase text-white/60 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={albumDescription}
                  onChange={(e) => setAlbumDescription(e.target.value)}
                  placeholder="Brief note about this visual collection..."
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-indigo-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono uppercase text-white/60 mb-1">
                    Transition
                  </label>
                  <select
                    value={albumTransition}
                    onChange={(e) => setAlbumTransition(e.target.value as TransitionType)}
                    className="w-full px-3 py-2 rounded-xl bg-[#161922] border border-white/10 text-white text-xs"
                  >
                    <option value="crossfade">Smooth Crossfade</option>
                    <option value="zoom-fade">Ken Burns Zoom-Fade</option>
                    <option value="cinematic">Cinematic Pan</option>
                    <option value="blur-fade">Soft Blur Dissolve</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase text-white/60 mb-1">
                    Soundscape
                  </label>
                  <select
                    value={albumSoundscape}
                    onChange={(e) => setAlbumSoundscape(e.target.value as SoundscapeType)}
                    className="w-full px-3 py-2 rounded-xl bg-[#161922] border border-white/10 text-white text-xs"
                  >
                    <option value="none">Muted / Silence</option>
                    <option value="rain">Gentle Rain</option>
                    <option value="forest">Forest Birds</option>
                    <option value="ocean">Ocean Waves</option>
                    <option value="meditation">Zen Meditation</option>
                    <option value="cafe">Cozy Cafe</option>
                    <option value="fireplace">Fireplace</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono uppercase text-white/60 mb-1">
                    Atmosphere Particles
                  </label>
                  <select
                    value={albumParticle}
                    onChange={(e) => setAlbumParticle(e.target.value as ParticleType)}
                    className="w-full px-3 py-2 rounded-xl bg-[#161922] border border-white/10 text-white text-xs"
                  >
                    <option value="none">None</option>
                    <option value="sakura">Sakura Cherry Blossoms</option>
                    <option value="bokeh">Warm Bokeh Glow</option>
                    <option value="fireflies">Fireflies</option>
                    <option value="stars">Starfield</option>
                    <option value="snow">Snow</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase text-white/60 mb-1">
                    Slide Duration
                  </label>
                  <select
                    value={albumDuration}
                    onChange={(e) => setAlbumDuration(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-[#161922] border border-white/10 text-white text-xs"
                  >
                    <option value={5}>5 seconds</option>
                    <option value={10}>10 seconds</option>
                    <option value={15}>15 seconds</option>
                    <option value={30}>30 seconds</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 mt-3 rounded-xl bg-gradient-to-r from-sky-400 via-indigo-500 to-purple-500 text-white font-semibold text-xs tracking-wide shadow-md hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer"
              >
                Create Album & Add Photos
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
