import React, { useEffect, useRef } from 'react';
import type { ParticleType, PerformanceMode } from '../../types';

interface Props {
  type: ParticleType;
  performanceMode: PerformanceMode;
  reduceMotion?: boolean;
}

interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
  fadeSpeed: number;
  color: string;
}

export const AtmosphericOverlay: React.FC<Props> = ({
  type,
  performanceMode,
  reduceMotion = false
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (type === 'none' || reduceMotion || performanceMode === 'standard') {
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // Particle pool
    const particleCount = performanceMode === 'ultra' ? 45 : 24;
    const particles: Particle[] = [];

    const initParticles = () => {
      particles.length = 0;
      for (let i = 0; i < particleCount; i++) {
        let color = 'rgba(255, 255, 255, ';
        let size = Math.random() * 2 + 1;
        let speedX = (Math.random() - 0.5) * 0.4;
        let speedY = (Math.random() - 0.5) * 0.4;

        if (type === 'stars') {
          color = 'rgba(230, 240, 255, ';
          size = Math.random() * 1.8 + 0.6;
          speedX = (Math.random() - 0.5) * 0.05;
          speedY = (Math.random() - 0.5) * 0.05;
        } else if (type === 'rain') {
          color = 'rgba(180, 210, 255, ';
          size = Math.random() * 2 + 1;
          speedX = -0.5;
          speedY = Math.random() * 8 + 12;
        } else if (type === 'snow') {
          color = 'rgba(255, 255, 255, ';
          size = Math.random() * 3 + 1.5;
          speedX = (Math.random() - 0.5) * 0.8;
          speedY = Math.random() * 0.8 + 0.6;
        } else if (type === 'fireflies') {
          color = 'rgba(254, 240, 138, ';
          size = Math.random() * 3 + 1.5;
          speedX = (Math.random() - 0.5) * 0.8;
          speedY = (Math.random() - 0.5) * 0.8;
        } else if (type === 'bokeh') {
          color = 'rgba(255, 220, 180, ';
          size = Math.random() * 20 + 8;
          speedX = (Math.random() - 0.5) * 0.2;
          speedY = (Math.random() - 0.5) * 0.2;
        } else if (type === 'sakura') {
          // Soft pink and rose sakura petals
          const hues = ['rgba(251, 207, 232, ', 'rgba(244, 114, 182, ', 'rgba(253, 164, 175, '];
          color = hues[Math.floor(Math.random() * hues.length)];
          size = Math.random() * 4 + 3;
          speedX = Math.random() * 1.2 + 0.4; // drift rightwards
          speedY = Math.random() * 1.2 + 0.8; // gentle fall
        }

        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          size,
          speedX,
          speedY,
          opacity: Math.random() * 0.6 + 0.2,
          fadeSpeed: (Math.random() * 0.01 + 0.005) * (Math.random() > 0.5 ? 1 : -1),
          color
        });
      }
    };

    initParticles();

    // Aurora & Sakura wave state
    let auroraPhase = 0;
    let sakuraTick = 0;

    const render = () => {
      if (document.hidden) {
        animId = requestAnimationFrame(render);
        return;
      }

      ctx.clearRect(0, 0, width, height);

      // Render Aurora Shimmer
      if (type === 'aurora') {
        auroraPhase += 0.004;
        const grad = ctx.createLinearGradient(0, 0, width, height * 0.6);
        const alpha1 = Math.sin(auroraPhase) * 0.08 + 0.12;
        const alpha2 = Math.cos(auroraPhase * 0.8) * 0.06 + 0.08;
        grad.addColorStop(0, `rgba(52, 211, 153, ${alpha1})`);
        grad.addColorStop(0.5, `rgba(167, 139, 250, ${alpha2})`);
        grad.addColorStop(1, 'transparent');

        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height * 0.7);
      }

      sakuraTick += 0.02;

      // Render particles
      particles.forEach((p, idx) => {
        if (type === 'sakura') {
          // Swaying fluttering sakura physics
          p.x += p.speedX + Math.sin(sakuraTick + idx) * 0.8;
          p.y += p.speedY;
        } else {
          p.x += p.speedX;
          p.y += p.speedY;
        }

        // Wrap around bounds
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        // Twinkle / Pulse opacity
        p.opacity += p.fadeSpeed;
        if (p.opacity > 0.8 || p.opacity < 0.1) {
          p.fadeSpeed = -p.fadeSpeed;
        }

        ctx.beginPath();
        if (type === 'rain') {
          ctx.strokeStyle = `${p.color}${p.opacity * 0.6})`;
          ctx.lineWidth = 1.2;
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x + p.speedX * 2, p.y + p.speedY * 2);
          ctx.stroke();
        } else if (type === 'sakura') {
          // Draw delicate rotated petal ellipse
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(Math.sin(sakuraTick + idx * 0.5) * 0.8 + idx);
          ctx.fillStyle = `${p.color}${Math.max(0, Math.min(0.85, p.opacity))})`;
          ctx.ellipse(0, 0, p.size * 1.5, p.size * 0.8, Math.PI / 4, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        } else {
          ctx.fillStyle = `${p.color}${Math.max(0, Math.min(1, p.opacity))})`;
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
    };
  }, [type, performanceMode, reduceMotion]);

  if (type === 'none' || reduceMotion || performanceMode === 'standard') {
    return null;
  }

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-10"
    />
  );
};
