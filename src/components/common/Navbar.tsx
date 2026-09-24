import React from 'react';
import {
  Sparkles,
  Search,
  Sliders,
  Heart,
  Layers,
  FolderOpen,
  Play,
  Monitor,
  MessageSquare,
  Shield
} from 'lucide-react';
import { usePlayerStore } from '../../store/playerStore';
import { useCatalogStore } from '../../store/catalogStore';
import { useAuthStore } from '../../store/authStore';
import { UserProfileMenu } from '../auth/UserProfileMenu';

interface Props {
  activeTab: 'explore' | 'moods' | 'worlds' | 'playlists' | 'favorites' | 'local';
  setActiveTab: (tab: 'explore' | 'moods' | 'worlds' | 'playlists' | 'favorites' | 'local') => void;
  onOpenSearch: () => void;
  onOpenSettings: () => void;
  onOpenMixBuilder: () => void;
}

export const Navbar: React.FC<Props> = ({
  activeTab,
  setActiveTab,
  onOpenSearch,
  onOpenSettings,
  onOpenMixBuilder
}) => {
  const { startOneClickAmbient, startSurpriseMe } = usePlayerStore();
  const { favorites } = useCatalogStore();

  return (
    <header className="sticky top-0 z-40 w-full bg-[#08090B]/80 backdrop-blur-2xl border-b border-white/8 select-none">
      <div className="max-w-[1680px] w-full mx-auto px-4 sm:px-8 lg:px-12 h-18 flex items-center justify-between">
        {/* Left: Brand Logo & Navigation */}
        <div className="flex items-center gap-8">
          <button
            onClick={() => setActiveTab('explore')}
            className="flex items-center gap-2.5 group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-400 via-indigo-500 to-pink-500 p-[1.5px] shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-[#08090B] rounded-[10px] flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-gradient-to-r from-sky-400 to-indigo-400 animate-pulse" />
              </div>
            </div>
            <div className="flex flex-col text-left">
              <span className="font-display font-bold text-lg tracking-wider text-white group-hover:text-sky-300 transition-colors">
                Ambient
              </span>
              <span className="text-[9px] font-mono tracking-widest text-white/40 uppercase -mt-1 hidden sm:block">
                Living Canvas
              </span>
            </div>
          </button>

          {/* Nav Tabs */}
          <nav className="hidden md:flex items-center gap-1">
            {[
              { id: 'explore', label: 'Explore' },
              { id: 'moods', label: 'Moods' },
              { id: 'worlds', label: 'Worlds' },
              { id: 'playlists', label: 'Playlists' },
              { id: 'favorites', label: `Favorites (${favorites.length})` },
              { id: 'local', label: 'My Photos' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-white/12 text-white shadow-sm'
                    : 'text-white/60 hover:text-white hover:bg-white/6'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Admin Studio shortcut (if Admin) */}
          {useAuthStore.getState().isAdmin && (
            <button
              onClick={() => useAuthStore.getState().openAdminModal()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-medium hover:bg-amber-500/30 transition-all cursor-pointer"
              title="Open Admin Studio"
            >
              <Shield className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Admin Studio</span>
            </button>
          )}

          {/* Contact Us button */}
          <button
            onClick={() => useAuthStore.getState().openContactModal()}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full glass-pill text-xs font-medium text-white/70 hover:text-white transition-all cursor-pointer"
            title="Contact Us / Feedback"
          >
            <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
            <span>Contact Us</span>
          </button>

          {/* Search Trigger */}
          <button
            onClick={onOpenSearch}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full glass-pill text-xs text-white/60 hover:text-white transition-all cursor-pointer"
            title="Search experiences (Cmd/Ctrl + K)"
          >
            <Search className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Search</span>
            <kbd className="hidden md:inline text-[10px] font-mono px-1 py-0.5 rounded bg-white/10 text-white/40">
              /
            </kbd>
          </button>

          {/* Settings */}
          <button
            onClick={onOpenSettings}
            className="p-2 rounded-full glass-pill text-white/70 hover:text-white transition-all cursor-pointer"
            title="Settings"
          >
            <Sliders className="w-4 h-4" />
          </button>

          {/* User Profile & Auth Menu */}
          <UserProfileMenu />

          {/* Start Ambient CTA */}
          <button
            onClick={startOneClickAmbient}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-sky-400 via-indigo-500 to-purple-500 text-white text-xs font-semibold tracking-wide hover:brightness-110 hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-indigo-500/25 cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span className="hidden xs:inline">Start Ambient</span>
          </button>
        </div>
      </div>
    </header>
  );
};
