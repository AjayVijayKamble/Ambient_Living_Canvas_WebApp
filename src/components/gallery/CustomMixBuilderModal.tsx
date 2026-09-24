import React, { useState } from 'react';
import { X, Sparkles, Plus, Check, Play, Volume2, Layers } from 'lucide-react';
import { CATEGORIES } from '../../data/categories';
import { useCatalogStore } from '../../store/catalogStore';
import { usePlayerStore } from '../../store/playerStore';
import type { TransitionType, SoundscapeType } from '../../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const CustomMixBuilderModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [mixName, setMixName] = useState('My Atmospheric Blend');
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([
    'mountains',
    'rainy-day',
    'cafes'
  ]);
  const [selectedTransition, setSelectedTransition] = useState<TransitionType>('crossfade');
  const [selectedSoundscape, setSelectedSoundscape] = useState<SoundscapeType>('rain');

  const { catalog, createCustomMix } = useCatalogStore();
  const { startExperience } = usePlayerStore();

  if (!isOpen) return null;

  const toggleCategory = (id: string) => {
    if (selectedCategoryIds.includes(id)) {
      if (selectedCategoryIds.length > 1) {
        setSelectedCategoryIds(selectedCategoryIds.filter((catId) => catId !== id));
      }
    } else {
      setSelectedCategoryIds([...selectedCategoryIds, id]);
    }
  };

  const handleCreateAndPlay = () => {
    // Gather media items from selected categories
    const matchingItems = catalog.filter((item) =>
      item.categories.some((c) => selectedCategoryIds.includes(c)) ||
      item.moods.some((m) => selectedCategoryIds.includes(m))
    );

    const mediaIds = matchingItems.length > 0 
      ? matchingItems.map((i) => i.id) 
      : catalog.slice(0, 10).map((i) => i.id);

    const coverUrl = matchingItems[0]?.url || catalog[0]?.url || '';

    const newMix = createCustomMix({
      name: mixName || 'Custom Ambient Mix',
      tagline: `Curated blend of ${selectedCategoryIds.length} environments`,
      description: `User-crafted ambient flow combining ${selectedCategoryIds.join(', ')}.`,
      coverUrl,
      mediaIds,
      categories: selectedCategoryIds,
      moods: ['peaceful', 'calm'],
      transition: selectedTransition,
      defaultDuration: 15,
      soundscape: selectedSoundscape
    });

    startExperience(newMix);
    onClose();
  };

  const TRANSITIONS: { id: TransitionType; label: string }[] = [
    { id: 'crossfade', label: 'Crossfade' },
    { id: 'zoom-fade', label: 'Zoom Fade' },
    { id: 'cinematic', label: 'Cinematic' },
    { id: 'dissolve', label: 'Dissolve' },
    { id: 'blur-fade', label: 'Blur Fade' },
    { id: 'light-leak', label: 'Light Leak' }
  ];

  const SOUNDSCAPES: { id: SoundscapeType; label: string }[] = [
    { id: 'none', label: 'No Sound' },
    { id: 'rain', label: '🌧️ Rain' },
    { id: 'ocean', label: '🌊 Ocean' },
    { id: 'forest', label: '🌲 Forest' },
    { id: 'fireplace', label: '🔥 Fireplace' },
    { id: 'space', label: '🌌 Deep Space' },
    { id: 'cafe', label: '☕ Café' },
    { id: 'meditation', label: '🧘 Meditation' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-xl animate-fade-in select-none">
      <div className="relative w-full max-w-2xl bg-[#111318] border border-white/10 rounded-3xl overflow-hidden shadow-2xl p-6 sm:p-8 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/8 mb-6">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-display font-bold text-white tracking-wide">
                Build Your Custom Mix
              </h2>
              <p className="text-xs text-white/50 font-light mt-0.5">
                Combine categories into an intelligent ambient sequence.
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

        {/* Modal Scrollable Body */}
        <div className="space-y-6 overflow-y-auto pr-1 flex-1">
          {/* Mix Name Input */}
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-white/60 mb-2">
              Mix Name
            </label>
            <input
              type="text"
              value={mixName}
              onChange={(e) => setMixName(e.target.value)}
              placeholder="e.g. Rainy Mountain Coffee"
              className="w-full px-4 py-2.5 rounded-xl glass-input text-sm font-medium focus:outline-none"
            />
          </div>

          {/* Category Selector */}
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-white/60 mb-2">
              Select Categories to Blend ({selectedCategoryIds.length})
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {CATEGORIES.slice(0, 18).map((cat) => {
                const isSelected = selectedCategoryIds.includes(cat.id);
                return (
                  <button
                    key={cat.id}
                    onClick={() => toggleCategory(cat.id)}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer border ${
                      isSelected
                        ? 'bg-white/15 text-white border-white/30 shadow-sm'
                        : 'bg-white/4 text-white/50 border-white/6 hover:bg-white/8 hover:text-white'
                    }`}
                  >
                    <span>{cat.name}</span>
                    {isSelected ? (
                      <Check className="w-3.5 h-3.5 text-sky-400" />
                    ) : (
                      <Plus className="w-3.5 h-3.5 text-white/30" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Soundscape & Transition Settings */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Soundscape */}
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-white/60 mb-2">
                Ambient Soundscape
              </label>
              <select
                value={selectedSoundscape}
                onChange={(e) => setSelectedSoundscape(e.target.value as SoundscapeType)}
                className="w-full px-3 py-2 rounded-xl glass-input text-xs font-medium bg-[#17191F]"
              >
                {SOUNDSCAPES.map((s) => (
                  <option key={s.id} value={s.id} className="bg-[#17191F] text-white">
                    {s.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Transition */}
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-white/60 mb-2">
                Transition Style
              </label>
              <select
                value={selectedTransition}
                onChange={(e) => setSelectedTransition(e.target.value as TransitionType)}
                className="w-full px-3 py-2 rounded-xl glass-input text-xs font-medium bg-[#17191F]"
              >
                {TRANSITIONS.map((t) => (
                  <option key={t.id} value={t.id} className="bg-[#17191F] text-white">
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="pt-6 border-t border-white/8 mt-6 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-full glass-pill text-xs font-medium text-white/70 hover:text-white cursor-pointer"
          >
            Cancel
          </button>

          <button
            onClick={handleCreateAndPlay}
            className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-sky-400 via-indigo-500 to-purple-600 text-white font-semibold text-xs tracking-wide shadow-lg shadow-indigo-500/25 hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>Save & Start Mix</span>
          </button>
        </div>
      </div>
    </div>
  );
};
