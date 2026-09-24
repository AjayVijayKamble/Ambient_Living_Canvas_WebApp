import React from 'react';
import { Sparkles, Sun, Compass, Coffee, Zap, Moon, Film, HeartHandshake } from 'lucide-react';
import { usePlayerStore } from '../../store/playerStore';

export const MoodSelector: React.FC = () => {
  const { startMood } = usePlayerStore();

  const MOODS = [
    {
      id: 'Peaceful',
      label: 'Peaceful',
      sub: 'Tranquil sanctuaries',
      icon: Sun,
      color: 'from-emerald-950/70 to-teal-900/60',
      border: 'hover:border-emerald-500/40',
      glow: 'group-hover:text-emerald-400'
    },
    {
      id: 'Focus',
      label: 'Focused',
      sub: 'Clean geometry',
      icon: Compass,
      color: 'from-slate-900/70 to-zinc-900/60',
      border: 'hover:border-slate-400/40',
      glow: 'group-hover:text-slate-300'
    },
    {
      id: 'Cozy',
      label: 'Cozy',
      sub: 'Warm hearths & rain',
      icon: Coffee,
      color: 'from-amber-950/70 to-orange-950/60',
      border: 'hover:border-amber-500/40',
      glow: 'group-hover:text-amber-400'
    },
    {
      id: 'Energizing',
      label: 'Energized',
      sub: 'Radiant golden hour',
      icon: Zap,
      color: 'from-amber-900/70 to-rose-950/60',
      border: 'hover:border-amber-400/40',
      glow: 'group-hover:text-amber-300'
    },
    {
      id: 'Dreamy',
      label: 'Dreamy',
      sub: 'Pastel twilight clouds',
      icon: Sparkles,
      color: 'from-purple-950/70 to-pink-950/60',
      border: 'hover:border-pink-500/40',
      glow: 'group-hover:text-pink-400'
    },
    {
      id: 'Cinematic',
      label: 'Cinematic',
      sub: 'Anamorphic vistas',
      icon: Film,
      color: 'from-cyan-950/70 to-blue-950/60',
      border: 'hover:border-cyan-500/40',
      glow: 'group-hover:text-cyan-400'
    },
    {
      id: 'Mysterious',
      label: 'Mysterious',
      sub: 'Fog-shrouded peaks',
      icon: Moon,
      color: 'from-indigo-950/70 to-slate-950/60',
      border: 'hover:border-indigo-500/40',
      glow: 'group-hover:text-indigo-400'
    },
    {
      id: 'Meditative',
      label: 'Meditative',
      sub: 'Still water & zenith',
      icon: HeartHandshake,
      color: 'from-teal-950/70 to-cyan-950/60',
      border: 'hover:border-teal-500/40',
      glow: 'group-hover:text-teal-400'
    }
  ];

  return (
    <section className="mb-14 select-none">
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-display font-bold text-white tracking-wide">
            How should your screen feel?
          </h2>
          <p className="text-xs sm:text-sm text-white/50 font-light mt-0.5">
            Select a mood to instantly begin an ambient flow.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {MOODS.map((m) => {
          const Icon = m.icon;
          return (
            <button
              key={m.id}
              onClick={() => startMood(m.id)}
              className={`group relative p-3.5 sm:p-4 rounded-2xl bg-gradient-to-b ${m.color} border border-white/8 ${m.border} flex flex-col items-start justify-between min-h-[108px] transition-all duration-300 hover:scale-[1.03] hover:shadow-xl active:scale-95 cursor-pointer text-left overflow-hidden`}
            >
              <div className="p-2 rounded-xl bg-white/10 text-white/80 group-hover:bg-white/20 transition-colors">
                <Icon className={`w-4 h-4 transition-colors ${m.glow}`} />
              </div>

              <div className="mt-3">
                <span className="font-display font-semibold text-sm text-white block">
                  {m.label}
                </span>
                <span className="text-[10px] text-white/50 font-light block leading-tight mt-0.5">
                  {m.sub}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
};
