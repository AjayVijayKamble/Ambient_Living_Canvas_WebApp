import React, { useState } from 'react';
import { useCatalogStore } from './store/catalogStore';
import { usePlayerStore } from './store/playerStore';
import type { Experience, MediaItem } from './types';

// Common Components
import { Navbar } from './components/common/Navbar';
import { PlaylistModal } from './components/common/PlaylistModal';

// Home & Gallery Components
import { HeroBanner } from './components/home/HeroBanner';
import { MultiMonitorTip } from './components/home/MultiMonitorTip';
import { MoodSelector } from './components/home/MoodSelector';
import { FeaturedExperiences } from './components/home/FeaturedExperiences';
import { CategoryBrowser } from './components/home/CategoryBrowser';

// Gallery Modals & Local Photos
import { ExperienceCard } from './components/gallery/ExperienceCard';
import { ExperienceDetailModal } from './components/gallery/ExperienceDetailModal';
import { CustomMixBuilderModal } from './components/gallery/CustomMixBuilderModal';
import { SearchModal } from './components/search/SearchModal';
import { SettingsModal } from './components/settings/SettingsModal';
import { UserPhotosManager } from './components/local/UserPhotosManager';

// Auth, Feedback & Admin Modals
import { AuthModal } from './components/auth/AuthModal';
import { ChangePasswordModal } from './components/auth/ChangePasswordModal';
import { ContactModal } from './components/common/ContactModal';
import { AdminDashboardModal } from './components/admin/AdminDashboardModal';
import { useAuthStore } from './store/authStore';

// Fullscreen Player
import { FullscreenPlayer } from './components/player/FullscreenPlayer';

// Icons
import { Heart, Layers, Sparkles, FolderOpen, Play, Trash2, ArrowLeft, Lock } from 'lucide-react';

const VALID_TABS = ['explore', 'moods', 'worlds', 'playlists', 'favorites', 'local'] as const;
type TabType = typeof VALID_TABS[number];

const getInitialTab = (): TabType => {
  if (typeof window !== 'undefined') {
    const hash = window.location.hash.replace('#', '').toLowerCase();
    if (VALID_TABS.includes(hash as TabType)) {
      return hash as TabType;
    }
    const saved = localStorage.getItem('ambient_active_tab_v1');
    if (saved && VALID_TABS.includes(saved as TabType)) {
      return saved as TabType;
    }
  }
  return 'explore';
};

export function App() {
  const [activeTab, setActiveTabState] = useState<TabType>(getInitialTab);
  const [selectedExperience, setSelectedExperience] = useState<Experience | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isMixBuilderOpen, setIsMixBuilderOpen] = useState(false);
  const [playlistTargetMediaId, setPlaylistTargetMediaId] = useState<string | undefined>(undefined);
  const [isPlaylistModalOpen, setIsPlaylistModalOpen] = useState(false);

  const setActiveTab = (tab: TabType) => {
    setActiveTabState(tab);
    try {
      window.location.hash = tab;
      localStorage.setItem('ambient_active_tab_v1', tab);
    } catch {
      // ignore
    }
  };

  React.useEffect(() => {
    if (window.location.hash !== `#${activeTab}`) {
      window.location.hash = activeTab;
    }

    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '').toLowerCase();
      if (VALID_TABS.includes(hash as TabType)) {
        setActiveTabState(hash as TabType);
        localStorage.setItem('ambient_active_tab_v1', hash);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [activeTab]);

  const { catalog, experiences, favorites, playlists, toggleFavorite, deletePlaylist } = useCatalogStore();
  const { startExperience, startCustomQueue } = usePlayerStore();

  // Favorite Items resolution
  const favoriteExperiences = experiences.filter((e) => favorites.includes(e.id));
  const favoriteMedia = catalog.filter((m) => favorites.includes(m.id));

  const { user, openAuthModal, checkSession } = useAuthStore();

  React.useEffect(() => {
    checkSession();
  }, [checkSession]);

  const handleOpenPlaylists = (mediaId?: string) => {
    if (!user) {
      openAuthModal('Please sign in or create an account to access and manage your playlists.');
      return;
    }
    setPlaylistTargetMediaId(mediaId);
    setIsPlaylistModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#08090B] text-[#F5F5F5] selection:bg-indigo-500/30 selection:text-white flex flex-col font-sans">
      {/* 1. Global Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenMixBuilder={() => setIsMixBuilderOpen(true)}
      />

      {/* 2. Main Discovery View Area - Expanded for cinematic widescreen */}
      <main className="flex-1 max-w-[1680px] w-full mx-auto px-4 sm:px-8 lg:px-12 py-8">
        {/* TAB: EXPLORE */}
        {activeTab === 'explore' && (
          <div>
            <HeroBanner
              onExploreClick={() => {
                const el = document.getElementById('categories-section');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              onOpenMixBuilder={() => setIsMixBuilderOpen(true)}
            />

            <MultiMonitorTip />

            <MoodSelector />

            <FeaturedExperiences
              experiences={experiences}
              onOpenDetails={(exp) => setSelectedExperience(exp)}
              onOpenMixBuilder={() => setIsMixBuilderOpen(true)}
            />

            <div id="categories-section">
              <CategoryBrowser />
            </div>
          </div>
        )}

        {/* TAB: MOODS */}
        {activeTab === 'moods' && (
          <div className="animate-fade-in">
            <div className="mb-8">
              <h1 className="text-3xl sm:text-4xl font-display font-bold text-white tracking-wide">
                Mood Calibrations
              </h1>
              <p className="text-sm text-white/50 font-light mt-1">
                Visual atmospheres specifically tailored for peaceful contemplation, intense focus, or cozy evenings.
              </p>
            </div>

            <MoodSelector />

            <div className="mt-12">
              <h2 className="text-xl font-display font-semibold text-white mb-6">
                All Mood Experiences
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                {experiences.map((exp) => (
                  <ExperienceCard
                    key={exp.id}
                    experience={exp}
                    onOpenDetails={(e) => setSelectedExperience(e)}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB: WORLDS */}
        {activeTab === 'worlds' && (
          <div className="animate-fade-in">
            <div className="mb-8">
              <h1 className="text-3xl sm:text-4xl font-display font-bold text-white tracking-wide">
                Worlds & Environments
              </h1>
              <p className="text-sm text-white/50 font-light mt-1">
                From deep interstellar space to neon cyberpunk streets and timeless alpine sanctuaries.
              </p>
            </div>

            <CategoryBrowser />
          </div>
        )}

        {/* TAB: PLAYLISTS */}
        {activeTab === 'playlists' && (
          <div className="animate-fade-in">
            {!user ? (
              <div className="text-center py-20 px-6 glass-panel rounded-3xl max-w-2xl mx-auto my-8 border border-white/10">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-500/20 to-indigo-500/20 border border-purple-500/30 flex items-center justify-center mx-auto mb-4 text-purple-400 shadow-lg shadow-purple-500/10">
                  <Lock className="w-8 h-8" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-display font-bold text-white mb-2">
                  Sign In to Access Your Playlists
                </h2>
                <p className="text-sm text-white/50 max-w-md mx-auto mb-8 leading-relaxed font-light">
                  Create custom visual playlists, organize multi-screen ambient scenes, and sync them seamlessly across all your devices with your personal account.
                </p>
                <button
                  onClick={() => openAuthModal('Please sign in or create an account to access and manage your playlists.')}
                  className="px-8 py-3 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white font-semibold text-xs tracking-wide shadow-lg shadow-purple-500/25 transition-all cursor-pointer hover:scale-[1.02]"
                >
                  Sign In or Create Account
                </button>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h1 className="text-3xl sm:text-4xl font-display font-bold text-white tracking-wide">
                      Your Playlists
                    </h1>
                    <p className="text-sm text-white/50 font-light mt-1">
                      Custom collections organized for your unique multi-screen environment.
                    </p>
                  </div>

                  <button
                    onClick={() => handleOpenPlaylists()}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-black font-semibold text-xs hover:bg-white/90 transition-all cursor-pointer shadow-lg"
                  >
                    <span>Create Playlist</span>
                  </button>
                </div>

                {playlists.length === 0 ? (
                  <div className="text-center py-20 glass-panel rounded-3xl">
                    <Layers className="w-12 h-12 text-white/20 mx-auto mb-3" />
                    <h3 className="text-lg font-display font-bold text-white mb-1">
                      No Playlists Created Yet
                    </h3>
                    <p className="text-xs text-white/40 max-w-sm mx-auto mb-6">
                      Create personal playlists to group your favorite visual scenes for your workday or relaxation.
                    </p>
                    <button
                      onClick={() => handleOpenPlaylists()}
                      className="px-5 py-2 rounded-full glass-dock text-xs font-medium text-white hover:bg-white/15 cursor-pointer"
                    >
                      Create Your First Playlist
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                    {playlists.map((pl) => {
                      const items = pl.mediaIds
                        .map((id) => catalog.find((m) => m.id === id))
                        .filter((m): m is MediaItem => Boolean(m));

                      return (
                        <div
                          key={pl.id}
                          onClick={() => {
                            if (items.length > 0) startCustomQueue(items, pl.name);
                          }}
                          className="group relative rounded-2xl overflow-hidden glass-card cursor-pointer p-5 flex flex-col justify-between aspect-[16/10] hover:scale-[1.02] transition-all"
                        >
                          {pl.coverUrl && (
                            <div className="absolute inset-0 overflow-hidden bg-black/60">
                              <img
                                src={pl.coverUrl}
                                alt={pl.name}
                                className="w-full h-full object-cover filter brightness-45 group-hover:scale-108 transition-transform duration-700"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-[#08090B] via-[#08090B]/50 to-transparent" />
                            </div>
                          )}

                          <div className="relative z-10 flex items-center justify-between">
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider bg-white/15 backdrop-blur-md text-white">
                              {pl.mediaIds.length} Scenes
                            </span>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deletePlaylist(pl.id);
                              }}
                              className="p-1.5 rounded-lg bg-black/40 text-white/40 hover:text-rose-400 hover:bg-rose-500/20 transition-colors"
                              title="Delete Playlist"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="relative z-10 flex items-end justify-between">
                            <div>
                              <h3 className="font-display font-bold text-lg text-white group-hover:text-sky-300 transition-colors">
                                {pl.name}
                              </h3>
                              {pl.description && (
                                <p className="text-xs text-white/60 font-light mt-0.5 line-clamp-1">
                                  {pl.description}
                                </p>
                              )}
                            </div>

                            <div className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center shadow-xl scale-90 group-hover:scale-100 transition-transform">
                              <Play className="w-4 h-4 fill-black translate-x-0.5" />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* TAB: FAVORITES */}
        {activeTab === 'favorites' && (
          <div className="animate-fade-in">
            <div className="mb-8">
              <h1 className="text-3xl sm:text-4xl font-display font-bold text-white tracking-wide">
                Your Favorites
              </h1>
              <p className="text-sm text-white/50 font-light mt-1">
                Saved experiences and visual moments for instant access.
              </p>
            </div>

            {!user ? (
              <div className="text-center py-16 px-6 glass-panel rounded-3xl border border-white/10 max-w-lg mx-auto">
                <Heart className="w-12 h-12 text-rose-400/60 mx-auto mb-3" />
                <h3 className="text-xl font-display font-bold text-white mb-2">
                  Sign In to Access Your Favorites
                </h3>
                <p className="text-xs text-white/50 max-w-sm mx-auto mb-6 leading-relaxed">
                  Sign in or create an account to save favorite ambient experiences, visual moments, and access them anytime across your screens.
                </p>
                <button
                  onClick={() => openAuthModal('Please sign in or create an account to access your saved favorites.')}
                  className="px-6 py-2.5 rounded-full bg-gradient-to-r from-rose-500 to-indigo-600 text-white font-semibold text-xs tracking-wide shadow-lg shadow-rose-500/20 hover:brightness-110 active:scale-95 transition-all cursor-pointer"
                >
                  Sign In / Create Account
                </button>
              </div>
            ) : favoriteExperiences.length === 0 && favoriteMedia.length === 0 ? (
              <div className="text-center py-20 glass-panel rounded-3xl">
                <Heart className="w-12 h-12 text-white/20 mx-auto mb-3" />
                <h3 className="text-lg font-display font-bold text-white mb-1">
                  No Favorites Saved Yet
                </h3>
                <p className="text-xs text-white/40 max-w-sm mx-auto mb-6">
                  Click the heart icon on any experience or visual scene to save it here for quick playback.
                </p>
                <button
                  onClick={() => setActiveTab('explore')}
                  className="px-5 py-2 rounded-full glass-dock text-xs font-medium text-white hover:bg-white/15 cursor-pointer"
                >
                  Explore Experiences
                </button>
              </div>
            ) : (
              <div className="space-y-12">
                {favoriteExperiences.length > 0 && (
                  <div>
                    <h2 className="text-xl font-display font-semibold text-white mb-4">
                      Favorite Experiences ({favoriteExperiences.length})
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                      {favoriteExperiences.map((exp) => (
                        <ExperienceCard
                          key={exp.id}
                          experience={exp}
                          onOpenDetails={(e) => setSelectedExperience(e)}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {favoriteMedia.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-display font-semibold text-white">
                        Favorite Visual Moments ({favoriteMedia.length})
                      </h2>
                      <button
                        onClick={() => startCustomQueue(favoriteMedia, 'My Favorite Visuals Flow')}
                        className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-medium hover:bg-rose-500/30 transition-all cursor-pointer"
                      >
                        <Play className="w-3.5 h-3.5 fill-rose-300" />
                        <span>Play All Favorites</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {favoriteMedia.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => startCustomQueue([item, ...favoriteMedia.filter((i) => i.id !== item.id)], item.title)}
                          className="group relative rounded-xl overflow-hidden glass-card aspect-[16/10] bg-black/40 cursor-pointer transition-all hover:scale-[1.03]"
                        >
                          <img
                            src={item.thumbnailUrl || item.url}
                            alt={item.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80 group-hover:opacity-100 transition-opacity" />

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleFavorite(item.id);
                            }}
                            className="absolute top-2 right-2 p-1.5 rounded-full glass-dock text-rose-500 hover:scale-110 transition-transform"
                            title="Remove Favorite"
                          >
                            <Heart className="w-3.5 h-3.5 fill-rose-500" />
                          </button>

                          <div className="absolute bottom-2 inset-x-2">
                            <span className="text-xs font-medium text-white line-clamp-1 block">
                              {item.title}
                            </span>
                            {item.location && (
                              <span className="text-[10px] text-white/50 font-light truncate block">
                                {item.location}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* TAB: LOCAL USER PHOTOS */}
        {activeTab === 'local' && <UserPhotosManager />}
      </main>

      {/* 3. Master Fullscreen Ambient Player Layer */}
      <FullscreenPlayer
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenPlaylists={() => handleOpenPlaylists()}
      />

      {/* 4. Experience Details Modal */}
      <ExperienceDetailModal
        experience={selectedExperience}
        onClose={() => setSelectedExperience(null)}
        onOpenPlaylists={(mediaId) => handleOpenPlaylists(mediaId)}
      />

      {/* 5. Custom Mix Builder Modal */}
      <CustomMixBuilderModal
        isOpen={isMixBuilderOpen}
        onClose={() => setIsMixBuilderOpen(false)}
      />

      {/* 6. Quick Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectExperience={(exp) => setSelectedExperience(exp)}
      />

      {/* 7. Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      {/* 8. Playlist Management Modal */}
      <PlaylistModal
        isOpen={isPlaylistModalOpen}
        onClose={() => {
          setIsPlaylistModalOpen(false);
          setPlaylistTargetMediaId(undefined);
        }}
        targetMediaId={playlistTargetMediaId}
      />

      {/* 9. Authentication & User Profile Modals */}
      <AuthModal />
      <ChangePasswordModal />

      {/* 10. Contact Us & Feedback Modal */}
      <ContactModal />

      {/* 11. Admin Studio Dashboard Modal */}
      <AdminDashboardModal />

      {/* 12. Minimal Footer */}
      <footer className="w-full border-t border-white/6 py-8 px-4 text-center text-xs text-white/40 select-none">
        <div className="max-w-[1680px] w-full mx-auto px-4 sm:px-8 lg:px-12 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-display font-semibold text-white/70">Ambient</span>
            <span>—</span>
            <span>Living Canvas & Screensaver for Idle Monitors</span>
          </div>

          <div className="flex items-center gap-4 text-white/40">
            <span>Pure Browser Web App</span>
            <span>·</span>
            <span>Zero Installation</span>
            <span>·</span>
            <span>4K Ultra-HD</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
