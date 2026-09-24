import React, { useState, useEffect } from 'react';

interface Props {
  format?: '12h' | '24h';
}

export const MinimalistClock: React.FC<Props> = ({ format = '12h' }) => {
  const [timeStr, setTimeStr] = useState('');
  const [period, setPeriod] = useState('');
  const [dateStr, setDateStr] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      let hours = now.getHours();
      const minutes = String(now.getMinutes()).padStart(2, '0');

      if (format === '12h') {
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12 || 12;
        setTimeStr(`${hours}:${minutes}`);
        setPeriod(ampm);
      } else {
        setTimeStr(`${String(hours).padStart(2, '0')}:${minutes}`);
        setPeriod('');
      }

      const options: Intl.DateTimeFormatOptions = { weekday: 'short', month: 'short', day: 'numeric' };
      setDateStr(now.toLocaleDateString('en-US', options).toUpperCase());
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [format]);

  return (
    <div className="absolute bottom-8 right-10 z-20 pointer-events-none select-none text-right transition-opacity duration-700 opacity-40 hover:opacity-80">
      <div className="flex items-baseline justify-end gap-1.5 font-display text-3xl md:text-4xl font-light tracking-wider text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)]">
        <span>{timeStr}</span>
        {period && <span className="text-xs font-normal tracking-widest text-white/70">{period}</span>}
      </div>
      <div className="text-[11px] font-mono tracking-widest text-white/60 mt-0.5 drop-shadow-[0_1px_8px_rgba(0,0,0,0.8)]">
        {dateStr}
      </div>
    </div>
  );
};
