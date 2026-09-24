import React, { useState, useEffect } from 'react';
import { Monitor, X, ArrowUpRight } from 'lucide-react';

export const MultiMonitorTip: React.FC = () => {
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    const isDismissed = localStorage.getItem('ambient_monitor_tip_dismissed');
    if (!isDismissed) {
      setDismissed(false);
    }
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem('ambient_monitor_tip_dismissed', 'true');
  };

  if (dismissed) return null;

  return (
    <div className="relative w-full rounded-2xl glass-panel p-4 sm:p-5 mb-8 border border-sky-500/20 bg-gradient-to-r from-sky-950/30 via-indigo-950/20 to-transparent flex items-start sm:items-center justify-between gap-4 select-none">
      <div className="flex items-center gap-3.5">
        <div className="p-2.5 rounded-xl bg-sky-500/15 text-sky-400 border border-sky-500/30 shrink-0">
          <Monitor className="w-5 h-5" />
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-semibold text-sky-300 tracking-wide">
            Designed for Multi-Monitor Setups
          </span>
          <p className="text-xs text-white/70 font-light mt-0.5 leading-relaxed">
            Drag this browser window to your idle 2nd or 3rd display, click <strong className="text-white font-medium">Start Ambient</strong>, and press <strong className="text-white font-medium">F</strong> for fullscreen. Ambient runs indefinitely with zero memory leaks.
          </p>
        </div>
      </div>

      <button
        onClick={handleDismiss}
        className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors shrink-0 cursor-pointer"
        title="Dismiss tip"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
