import React, { useState } from 'react';
import { Info, CheckCircle2, ChevronDown, ChevronUp, Monitor, HardDrive, FileType } from 'lucide-react';
import { IMAGE_GUIDELINES } from '../../utils/imageValidation';

interface Props {
  compact?: boolean;
}

export const ImageGuidelinesCard: React.FC<Props> = ({ compact = false }) => {
  const [isExpanded, setIsExpanded] = useState(!compact);

  return (
    <div className="rounded-2xl border border-indigo-500/20 bg-indigo-950/20 p-3.5 sm:p-4 text-xs select-none">
      <div
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2 text-indigo-300 font-semibold">
          <Info className="w-4 h-4 text-indigo-400 shrink-0" />
          <span>Image Upload Guidelines & Requirements</span>
        </div>

        <button
          type="button"
          className="p-1 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors"
        >
          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {isExpanded && (
        <div className="mt-3 pt-3 border-t border-white/8 grid grid-cols-1 sm:grid-cols-3 gap-3 animate-fade-in text-[11px]">
          {/* 1. Supported Formats */}
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-white/80 font-medium">
              <FileType className="w-3.5 h-3.5 text-sky-400" />
              <span>Supported Formats</span>
            </div>
            <div className="flex flex-wrap gap-1 pt-0.5">
              {IMAGE_GUIDELINES.allowedExtensions.map((ext) => (
                <span
                  key={ext}
                  className="px-1.5 py-0.5 rounded bg-white/10 text-[10px] font-mono uppercase text-sky-300"
                >
                  .{ext}
                </span>
              ))}
            </div>
            <p className="text-[10px] text-white/40 font-light">
              GIFs and vector files are not supported for canvas screensavers.
            </p>
          </div>

          {/* 2. Resolution & Aspect Ratio */}
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-white/80 font-medium">
              <Monitor className="w-3.5 h-3.5 text-emerald-400" />
              <span>Resolution & Display</span>
            </div>
            <p className="text-white/70 font-mono text-[10px]">
              Min: <span className="text-white font-semibold">{IMAGE_GUIDELINES.minResolutionLabel}</span>
            </p>
            <p className="text-[10px] text-white/50 font-light">
              Best: 1080p, 1440p, or 4K UHD. Landscape (16:9 / 16:10) recommended.
            </p>
          </div>

          {/* 3. File Size Limit */}
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-white/80 font-medium">
              <HardDrive className="w-3.5 h-3.5 text-amber-400" />
              <span>File Size Limit</span>
            </div>
            <p className="text-white/70 font-mono text-[10px]">
              Max: <span className="text-amber-300 font-semibold">{IMAGE_GUIDELINES.maxSizeLabel}</span> per photo
            </p>
            <p className="text-[10px] text-white/50 font-light">
              Recommended: {IMAGE_GUIDELINES.recommendedSizeLabel} for instant preloading.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
