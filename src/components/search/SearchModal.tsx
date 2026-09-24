import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Play, MapPin, Sparkles } from 'lucide-react';
import { useCatalogStore } from '../../store/catalogStore';
import { usePlayerStore } from '../../store/playerStore';
import type { MediaItem, Experience } from '../../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSelectExperience: (experience: Experience) => void;
}

export const SearchModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSelectExperience
}) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement | null>(null);

  const { catalog, experiences } = useCatalogStore();
  const { startCustomQueue, startExperience } = usePlayerStore();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  // Global key listener for Ctrl+K or /
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const normalized = query.toLowerCase().trim();

  const matchingExperiences = normalized
    ? experiences.filter(
        (e) =>
          e.name.toLowerCase().includes(normalized) ||
          e.description.toLowerCase().includes(normalized) ||
          e.categories.some((c) => c.toLowerCase().includes(normalized)) ||
          e.moods.some((m) => m.toLowerCase().includes(normalized))
      )
    : [];

  const matchingMedia = normalized
    ? catalog.filter(
        (m) =>
          m.title.toLowerCase().includes(normalized) ||
          (m.location && m.location.toLowerCase().includes(normalized)) ||
          m.categories.some((c) => c.toLowerCase().includes(normalized)) ||
          m.moods.some((mood) => mood.toLowerCase().includes(normalized))
      )
    : [];

  const handlePlayMedia = (item: MediaItem) => {
    startCustomQueue([item, ...catalog.filter((i) => i.id !== item.id)], item.title);
    onClose();
  };

  const SUGGESTED = [
    'Tokyo night',
    'Alpine sunrise',
    'Deep space',
    'Calm ocean',
    'Kyoto rain',
    'Minimal architecture',
    'Aurora borealis',
    'Cozy fireside'
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/80 backdrop-blur-xl animate-fade-in select-none">
      <div className="relative w-full max-w-3xl bg-[#111318] border border-white/12 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[80vh]">
        {/* Search Input Bar */}
        <div className="flex items-center px-6 py-4 border-b border-white/8 gap-3">
          <Search className="w-5 h-5 text-white/40 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search moods, places, cosmos, themes (e.g. 'Tokyo night', 'rain', 'space')..."
            className="w-full bg-transparent text-base font-medium text-white placeholder-white/40 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-full text-white/40 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="px-2.5 py-1 rounded-lg text-xs font-mono text-white/50 hover:text-white bg-white/6 hover:bg-white/10"
          >
            ESC
          </button>
        </div>

        {/* Search Results / Suggestions */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {!query && (
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-white/40 block mb-3">
                Suggested Searches
              </span>
              <div className="flex flex-wrap gap-2">
                {SUGGESTED.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setQuery(tag)}
                    className="px-3 py-1.5 rounded-full glass-pill text-xs text-white/70 hover:text-white hover:border-white/20 transition-all cursor-pointer"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Matching Experiences */}
          {matchingExperiences.length > 0 && (
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-sky-400 block mb-3">
                Experiences ({matchingExperiences.length})
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {matchingExperiences.map((exp) => (
                  <div
                    key={exp.id}
                    onClick={() => {
                      startExperience(exp);
                      onClose();
                    }}
                    className="flex items-center gap-3 p-3 rounded-2xl glass-card cursor-pointer hover:bg-white/12 transition-all group"
                  >
                    <img
                      src={exp.coverUrl}
                      alt={exp.name}
                      className="w-14 h-14 rounded-xl object-cover shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-semibold text-white group-hover:text-sky-300 truncate">
                        {exp.name}
                      </h4>
                      <p className="text-[11px] text-white/50 truncate mt-0.5">
                        {exp.tagline}
                      </p>
                    </div>
                    <div className="p-2 rounded-full bg-white/10 text-white opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      <Play className="w-3.5 h-3.5 fill-white" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Matching Media Items */}
          {matchingMedia.length > 0 && (
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-white/40 block mb-3">
                Visual Moments ({matchingMedia.length})
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {matchingMedia.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handlePlayMedia(item)}
                    className="group relative rounded-xl overflow-hidden glass-card aspect-[16/10] cursor-pointer"
                  >
                    <img
                      src={item.thumbnailUrl || item.url}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute bottom-2 inset-x-2">
                      <span className="text-[11px] font-medium text-white line-clamp-1 block">
                        {item.title}
                      </span>
                      {item.location && (
                        <span className="text-[9px] text-white/50 font-light truncate block">
                          {item.location}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {query && matchingExperiences.length === 0 && matchingMedia.length === 0 && (
            <div className="text-center py-12 text-white/40 text-xs">
              No results found for &ldquo;{query}&rdquo;. Try another term.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
