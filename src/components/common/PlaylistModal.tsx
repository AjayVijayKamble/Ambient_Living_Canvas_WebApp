import React, { useState } from 'react';
import { X, Layers, Plus, Play, Trash2, Check, Lock } from 'lucide-react';
import { useCatalogStore } from '../../store/catalogStore';
import { usePlayerStore } from '../../store/playerStore';
import { useAuthStore } from '../../store/authStore';
import type { MediaItem } from '../../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  targetMediaId?: string;
}

export const PlaylistModal: React.FC<Props> = ({
  isOpen,
  onClose,
  targetMediaId
}) => {
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const { user, openAuthModal } = useAuthStore();
  const { playlists, catalog, createPlaylist, deletePlaylist, addToPlaylist, removeFromPlaylist } = useCatalogStore();
  const { startCustomQueue } = usePlayerStore();

  if (!isOpen) return null;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlaylistName.trim()) return;
    if (!user) {
      onClose();
      openAuthModal('Please sign in or create an account to create playlists.');
      return;
    }
    const initialIds = targetMediaId ? [targetMediaId] : [];
    createPlaylist(newPlaylistName.trim(), '', initialIds);
    setNewPlaylistName('');
    setIsCreating(false);
  };

  const handlePlayPlaylist = (playlistId: string) => {
    const pl = playlists.find((p) => p.id === playlistId);
    if (!pl) return;

    const items = pl.mediaIds
      .map((id) => catalog.find((m) => m.id === id))
      .filter((m): m is MediaItem => Boolean(m));

    if (items.length > 0) {
      startCustomQueue(items, pl.name);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-xl animate-fade-in select-none">
      <div className="relative w-full max-w-xl bg-[#111318] border border-white/10 rounded-3xl overflow-hidden shadow-2xl p-6 sm:p-8 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/8 mb-6">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-500/15 text-purple-400 border border-purple-500/30">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-display font-bold text-white tracking-wide">
                {targetMediaId ? 'Add to Playlist' : 'Your Playlists'}
              </h2>
              <p className="text-xs text-white/50 font-light mt-0.5">
                Organize custom visual collections for specific workflows or moods.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full glass-dock text-white/60 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Auth Gate for Unauthenticated Users */}
        {!user ? (
          <div className="flex flex-col items-center justify-center p-8 text-center glass-card rounded-2xl border border-white/10 my-auto py-10">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-500/20 to-indigo-500/20 border border-purple-500/30 flex items-center justify-center mb-4 text-purple-400">
              <Lock className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Sign In Required</h3>
            <p className="text-xs text-white/60 max-w-sm mb-6 leading-relaxed">
              Playlists are securely saved to your account and synced across your devices with Supabase cloud database.
            </p>
            <button
              onClick={() => {
                onClose();
                openAuthModal('Please sign in or create an account to access and manage your playlists.');
              }}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white font-medium text-xs shadow-lg shadow-purple-500/25 transition-all cursor-pointer"
            >
              Sign In to Continue
            </button>
          </div>
        ) : (
          <>
            {/* Playlists List */}
            <div className="space-y-3 overflow-y-auto pr-1 flex-1 mb-6 min-h-[140px]">
              {playlists.length === 0 ? (
                <div className="text-center py-10 glass-panel rounded-2xl border border-dashed border-white/10">
                  <Layers className="w-8 h-8 text-white/20 mx-auto mb-2" />
                  <p className="text-xs text-white/50 mb-1">No playlists created yet</p>
                  <p className="text-[11px] text-white/30">Create your first playlist using the button below.</p>
                </div>
              ) : (
                playlists.map((pl) => {
                  const hasTarget = targetMediaId ? pl.mediaIds.includes(targetMediaId) : false;

                  return (
                    <div
                      key={pl.id}
                      className="flex items-center justify-between p-3.5 rounded-2xl glass-card hover:bg-white/10 transition-all"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {pl.coverUrl ? (
                          <img
                            src={pl.coverUrl}
                            alt={pl.name}
                            className="w-12 h-12 rounded-xl object-cover shrink-0"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                            <Layers className="w-5 h-5 text-white/40" />
                          </div>
                        )}

                        <div className="min-w-0">
                          <h4 className="text-xs font-semibold text-white truncate">
                            {pl.name}
                          </h4>
                          <span className="text-[11px] text-white/40 font-mono">
                            {pl.mediaIds.length} scenes
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {targetMediaId ? (
                          <button
                            onClick={() => {
                              if (hasTarget) {
                                removeFromPlaylist(pl.id, targetMediaId);
                              } else {
                                addToPlaylist(pl.id, targetMediaId);
                              }
                            }}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                              hasTarget
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : 'glass-pill text-white/70 hover:text-white'
                            }`}
                          >
                            {hasTarget ? (
                              <>
                                <Check className="w-3.5 h-3.5" />
                                <span>Added</span>
                              </>
                            ) : (
                              <>
                                <Plus className="w-3.5 h-3.5" />
                                <span>Add</span>
                              </>
                            )}
                          </button>
                        ) : (
                          <button
                            onClick={() => handlePlayPlaylist(pl.id)}
                            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer"
                            title="Play Playlist"
                          >
                            <Play className="w-3.5 h-3.5 fill-white translate-x-0.5" />
                          </button>
                        )}

                        <button
                          onClick={() => deletePlaylist(pl.id)}
                          className="p-2 rounded-full hover:bg-rose-500/20 text-white/40 hover:text-rose-400 transition-colors cursor-pointer"
                          title="Delete Playlist"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Create New Playlist Bar */}
            {isCreating ? (
              <form onSubmit={handleCreate} className="flex items-center gap-2">
                <input
                  type="text"
                  value={newPlaylistName}
                  onChange={(e) => setNewPlaylistName(e.target.value)}
                  placeholder="Enter playlist name..."
                  className="flex-1 px-4 py-2 rounded-xl glass-input text-xs font-medium"
                  autoFocus
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-white text-black font-semibold text-xs cursor-pointer shadow-md"
                >
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-3 py-2 rounded-xl glass-pill text-xs text-white/60 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
              </form>
            ) : (
              <button
                onClick={() => setIsCreating(true)}
                className="w-full py-2.5 rounded-2xl border border-dashed border-white/20 hover:border-white/40 text-xs font-medium text-white/70 hover:text-white flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Create New Playlist</span>
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};
