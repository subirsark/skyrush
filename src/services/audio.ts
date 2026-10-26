/**
 * SkyRush Web Audio API Synthesizer
 * Provides procedural sound effects for engine acceleration, cashouts, countdown pips, and crash explosions.
 */

class SoundController {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private engineOsc: OscillatorNode | null = null;
  private engineGain: GainNode | null = null;

  constructor() {
    // Check saved mute preference
    const savedMute = localStorage.getItem('skyrush_muted');
    this.isMuted = savedMute === 'true';
  }

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    localStorage.setItem('skyrush_muted', String(this.isMuted));
    if (this.isMuted) {
      this.stopEngine();
    }
    return this.isMuted;
  }

  // Countdown pip tone
  public playCountdownPip(isFinal: boolean = false) {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(isFinal ? 880 : 440, this.ctx.currentTime);

      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.15);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.16);
    } catch {
      // Audio autoplay policy fallback
    }
  }

  // Continuous ascending engine drone during flight
  public startEngine(multiplier: number = 1.0) {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      if (!this.engineOsc) {
        this.engineOsc = this.ctx.createOscillator();
        this.engineGain = this.ctx.createGain();

        this.engineOsc.type = 'sawtooth';
        // Base low pitch
        const baseFreq = 80;
        this.engineOsc.frequency.setValueAtTime(baseFreq, this.ctx.currentTime);

        // Low volume
        this.engineGain.gain.setValueAtTime(0.02, this.ctx.currentTime);

        // Subtle low-pass filter
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(400, this.ctx.currentTime);

        this.engineOsc.connect(filter);
        filter.connect(this.engineGain);
        this.engineGain.connect(this.ctx.destination);

        this.engineOsc.start();
      }

      this.updateEnginePitch(multiplier);
    } catch {
      // Audio context handling
    }
  }

  public updateEnginePitch(multiplier: number) {
    if (this.isMuted || !this.ctx || !this.engineOsc) return;
    try {
      // Pitch rises proportionally to multiplier
      const targetFreq = Math.min(600, 80 + Math.log(multiplier) * 90);
      this.engineOsc.frequency.setTargetAtTime(targetFreq, this.ctx.currentTime, 0.1);
    } catch {
      // Silently ignore
    }
  }

  public stopEngine() {
    if (this.engineOsc) {
      try {
        this.engineOsc.stop();
        this.engineOsc.disconnect();
      } catch {
        // Ignore
      }
      this.engineOsc = null;
      this.engineGain = null;
    }
  }

  // Crisp victory chime on cashout
  public playCashoutChime() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6

      notes.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.06);

        gain.gain.setValueAtTime(0.12, now + idx * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.3);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(now + idx * 0.06);
        osc.stop(now + idx * 0.06 + 0.32);
      });
    } catch {
      // Ignore
    }
  }

  // Crash rumble / flew away effect
  public playCrashSound() {
    this.stopEngine();
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(140, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(30, this.ctx.currentTime + 0.5);

      gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.5);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.52);
    } catch {
      // Ignore
    }
  }
}

export const soundManager = new SoundController();
