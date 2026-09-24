import type { SoundscapeType } from '../types';

export class SoundscapeEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private currentTrack: SoundscapeType = 'none';
  private activeNodes: (AudioNode | number)[] = [];
  private isMuted: boolean = false;
  private volume: number = 0.4;
  private isInitialized: boolean = false;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
      this.isInitialized = true;
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.masterGain && this.ctx) {
      const targetGain = this.isMuted ? 0 : this.volume;
      this.masterGain.gain.setTargetAtTime(targetGain, this.ctx.currentTime, 0.1);
    }
  }

  public setMute(muted: boolean) {
    this.isMuted = muted;
    if (this.masterGain && this.ctx) {
      const targetGain = muted ? 0 : this.volume;
      this.masterGain.gain.setTargetAtTime(targetGain, this.ctx.currentTime, 0.1);
    }
  }

  public play(track: SoundscapeType) {
    if (track === this.currentTrack && this.activeNodes.length > 0) return;
    this.stop();
    if (track === 'none') return;

    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    this.currentTrack = track;

    switch (track) {
      case 'rain':
        this.generateRain();
        break;
      case 'ocean':
        this.generateOcean();
        break;
      case 'forest':
        this.generateForest();
        break;
      case 'fireplace':
        this.generateFireplace();
        break;
      case 'space':
        this.generateSpace();
        break;
      case 'cafe':
        this.generateCafe();
        break;
      case 'meditation':
        this.generateMeditation();
        break;
    }
  }

  public stop() {
    // Clear any timers
    this.activeNodes.forEach(node => {
      if (typeof node === 'number') {
        window.clearInterval(node);
        window.clearTimeout(node);
      } else {
        try {
          if ('stop' in node && typeof (node as AudioScheduledSourceNode).stop === 'function') {
            (node as AudioScheduledSourceNode).stop();
          }
          node.disconnect();
        } catch {
          // already disconnected
        }
      }
    });
    this.activeNodes = [];
    this.currentTrack = 'none';
  }

  // --- GENERATORS ---

  private createNoiseBuffer(duration = 5): AudioBuffer {
    if (!this.ctx) throw new Error('No context');
    const bufferSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      // Pink noise approximation
      data[i] = (lastOut + (0.02 * white)) / 1.02;
      lastOut = data[i];
      data[i] *= 3.5;
    }
    return buffer;
  }

  private generateRain() {
    if (!this.ctx || !this.masterGain) return;

    // Pink noise base
    const noiseBuffer = this.createNoiseBuffer(5);
    const noise = this.ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    noise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1000, this.ctx.currentTime);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.35, this.ctx.currentTime);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    noise.start();

    this.activeNodes.push(noise, filter, gain);

    // Stochastic raindrop clicks
    const interval = window.setInterval(() => {
      if (!this.ctx || !this.masterGain || this.currentTrack !== 'rain') return;
      const osc = this.ctx.createOscillator();
      const dropGain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1200 + Math.random() * 1600, this.ctx.currentTime);

      dropGain.gain.setValueAtTime(0.08 * Math.random(), this.ctx.currentTime);
      dropGain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.04);

      osc.connect(dropGain);
      dropGain.connect(this.masterGain);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.05);
    }, 90);

    this.activeNodes.push(interval);
  }

  private generateOcean() {
    if (!this.ctx || !this.masterGain) return;

    const noiseBuffer = this.createNoiseBuffer(6);
    const noise = this.ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    noise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(400, this.ctx.currentTime);
    filter.Q.setValueAtTime(3.0, this.ctx.currentTime);

    // LFO for wave modulation
    const lfo = this.ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(0.08, this.ctx.currentTime); // 12.5s wave cycle

    const lfoGain = this.ctx.createGain();
    lfoGain.gain.setValueAtTime(350, this.ctx.currentTime);

    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.4, this.ctx.currentTime);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    noise.start();
    lfo.start();

    this.activeNodes.push(noise, filter, lfo, lfoGain, gain);
  }

  private generateForest() {
    if (!this.ctx || !this.masterGain) return;

    const noiseBuffer = this.createNoiseBuffer(6);
    const noise = this.ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    noise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(500, this.ctx.currentTime);
    filter.Q.setValueAtTime(1.5, this.ctx.currentTime);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.25, this.ctx.currentTime);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    noise.start();
    this.activeNodes.push(noise, filter, gain);
  }

  private generateFireplace() {
    if (!this.ctx || !this.masterGain) return;

    // Low rumble
    const noiseBuffer = this.createNoiseBuffer(5);
    const noise = this.ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    noise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(150, this.ctx.currentTime);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.35, this.ctx.currentTime);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    noise.start();
    this.activeNodes.push(noise, filter, gain);

    // Stochastic crackles
    const interval = window.setInterval(() => {
      if (!this.ctx || !this.masterGain || this.currentTrack !== 'fireplace') return;
      if (Math.random() > 0.45) return;

      const osc = this.ctx.createOscillator();
      const popGain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(400 + Math.random() * 900, this.ctx.currentTime);

      popGain.gain.setValueAtTime(0.12 * Math.random(), this.ctx.currentTime);
      popGain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.03);

      osc.connect(popGain);
      popGain.connect(this.masterGain);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.04);
    }, 140);

    this.activeNodes.push(interval);
  }

  private generateSpace() {
    if (!this.ctx || !this.masterGain) return;

    const freqs = [55, 110, 164.81, 220]; // A1, A2, E3, A3
    freqs.forEach((freq, idx) => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq + (Math.random() * 0.4 - 0.2), this.ctx.currentTime);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(320, this.ctx.currentTime);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.12 / freqs.length, this.ctx.currentTime);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      osc.start();
      this.activeNodes.push(osc, filter, gain);
    });
  }

  private generateCafe() {
    if (!this.ctx || !this.masterGain) return;

    const noiseBuffer = this.createNoiseBuffer(5);
    const noise = this.ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    noise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(600, this.ctx.currentTime);
    filter.Q.setValueAtTime(2.0, this.ctx.currentTime);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    noise.start();
    this.activeNodes.push(noise, filter, gain);
  }

  private generateMeditation() {
    if (!this.ctx || !this.masterGain) return;

    // 432 Hz healing fundamental + binaural beat at 434 Hz (2Hz theta wave)
    const baseFreq = 432;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    osc1.type = 'sine';
    osc2.type = 'sine';
    osc1.frequency.setValueAtTime(baseFreq, this.ctx.currentTime);
    osc2.frequency.setValueAtTime(baseFreq + 2.5, this.ctx.currentTime);

    const drone = this.ctx.createOscillator();
    drone.type = 'sine';
    drone.frequency.setValueAtTime(108, this.ctx.currentTime); // octave sub

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.12, this.ctx.currentTime);

    const droneGain = this.ctx.createGain();
    droneGain.gain.setValueAtTime(0.08, this.ctx.currentTime);

    osc1.connect(gain);
    osc2.connect(gain);
    drone.connect(droneGain);

    gain.connect(this.masterGain);
    droneGain.connect(this.masterGain);

    osc1.start();
    osc2.start();
    drone.start();

    this.activeNodes.push(osc1, osc2, drone, gain, droneGain);
  }
}

export const soundscapes = new SoundscapeEngine();
