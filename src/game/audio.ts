/**
 * Procedural Web Audio API Sound Generator & 8-Bit Chiptune Music Engine
 * for Mr. Rogers: Window Smash Defender.
 * Zero external audio files or network dependencies.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private muted: boolean = false;
  private isBgmRunning: boolean = false;
  private bgmMasterGain: GainNode | null = null;
  private schedulerTimerId: number | null = null;

  // Music Sequencer State (Lookahead scheduler)
  private currentStep: number = 0;
  private nextStepTime: number = 0;
  private readonly tempo: number = 136; // BPM
  private readonly lookaheadMs: number = 25; // How often scheduler fires
  private readonly scheduleAheadTime: number = 0.12; // In seconds

  // Music notes table (Hz)
  private readonly NOTES = {
    C3: 130.81, D3: 146.83, E3: 164.81, F3: 174.61, G3: 196.00, A3: 220.00, B3: 246.94,
    C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.00, A4: 440.00, B4: 493.88,
    C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99, A5: 880.00, B5: 987.77,
    C6: 1046.50, D6: 1174.66, E6: 1318.51,
  };

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public setMuted(mute: boolean) {
    this.muted = mute;
    if (this.bgmMasterGain && this.ctx) {
      this.bgmMasterGain.gain.setValueAtTime(mute ? 0.0001 : 0.14, this.ctx.currentTime);
    }
    if (!mute && !this.isBgmRunning) {
      this.startBgm();
    }
  }

  public isMuted(): boolean {
    return this.muted;
  }

  // ==========================================
  // RETRO 8-BIT / N64 BACKING MUSIC SYNTHESIZER
  // ==========================================

  public startBgm() {
    this.initContext();
    if (!this.ctx) return;
    if (this.isBgmRunning) return;

    // Create dedicated master gain for BGM
    if (!this.bgmMasterGain) {
      this.bgmMasterGain = this.ctx.createGain();
      this.bgmMasterGain.connect(this.ctx.destination);
    }
    this.bgmMasterGain.gain.setValueAtTime(this.muted ? 0.0001 : 0.14, this.ctx.currentTime);

    this.isBgmRunning = true;
    this.currentStep = 0;
    this.nextStepTime = this.ctx.currentTime + 0.05;

    // Start lookahead timer
    this.schedulerTimerId = window.setInterval(() => {
      this.schedulerTick();
    }, this.lookaheadMs);
  }

  public stopBgm() {
    this.isBgmRunning = false;
    if (this.schedulerTimerId !== null) {
      clearInterval(this.schedulerTimerId);
      this.schedulerTimerId = null;
    }
    if (this.bgmMasterGain && this.ctx) {
      this.bgmMasterGain.gain.setValueAtTime(0.0001, this.ctx.currentTime);
    }
  }

  private schedulerTick() {
    if (!this.ctx || !this.isBgmRunning) return;

    // Schedule all steps that fall within the lookahead window
    while (this.nextStepTime < this.ctx.currentTime + this.scheduleAheadTime) {
      this.scheduleStep(this.currentStep, this.nextStepTime);
      const secondsPer16th = (60 / this.tempo) / 4;
      this.nextStepTime += secondsPer16th;
      this.currentStep = (this.currentStep + 1) % 64; // 64-step sequence (4 bars of 4/4)
    }
  }

  /**
   * Schedule sound nodes for one 16th-note step across all 4 chiptune channels
   */
  private scheduleStep(step: number, time: number) {
    if (!this.ctx || !this.bgmMasterGain) return;

    const N = this.NOTES;
    const dur16th = (60 / this.tempo) / 4;

    // 1. LEAD MELODY CHANNEL (Punchy Square / Pulse wave)
    const melodySeq: (number | null)[] = [
      // Bar 1
      N.E5, null, N.G5, null, N.A5, N.C6, N.G5, null,
      N.E5, null, N.D5, null, N.C5, null, N.D5, N.E5,
      // Bar 2
      N.G5, null, N.E5, null, N.D5, null, null, null,
      N.C5, N.D5, N.E5, N.G5, N.A5, N.C6, N.D6, null,
      // Bar 3
      N.E6, null, N.D6, null, N.C6, null, N.A5, null,
      N.G5, N.A5, N.C6, null, N.A5, null, N.G5, null,
      // Bar 4
      N.E5, null, N.G5, null, N.D5, null, N.E5, null,
      N.C5, null, null, null, null, null, null, null,
    ];

    const leadNote = melodySeq[step % melodySeq.length];
    if (leadNote) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(leadNote, time);

      // Subtle vintage vibrato
      osc.frequency.setValueAtTime(leadNote, time + dur16th * 0.3);
      osc.frequency.linearRampToValueAtTime(leadNote * 1.015, time + dur16th * 0.7);

      gain.gain.setValueAtTime(0.01, time);
      gain.gain.linearRampToValueAtTime(0.24, time + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.001, time + dur16th * 1.4);

      osc.connect(gain);
      gain.connect(this.bgmMasterGain);
      osc.start(time);
      osc.stop(time + dur16th * 1.5);
    }

    // 2. RETRO CHORD ARPEGGIO CHANNEL (Triangle/Square Staccato)
    const arpChords = [
      [N.C4, N.E4, N.G4], // C
      [N.A3, N.C4, N.E4], // Am
      [N.F3, N.A3, N.C4], // F
      [N.G3, N.B3, N.D4], // G
    ];
    const chordIdx = Math.floor(step / 16) % 4;
    const chord = arpChords[chordIdx];
    const arpNote = chord[step % chord.length];

    if (arpNote) {
      const arpOsc = this.ctx.createOscillator();
      const arpGain = this.ctx.createGain();
      arpOsc.type = 'triangle';
      arpOsc.frequency.setValueAtTime(arpNote * 2, time);

      arpGain.gain.setValueAtTime(0.12, time);
      arpGain.gain.exponentialRampToValueAtTime(0.001, time + dur16th * 0.75);

      arpOsc.connect(arpGain);
      arpGain.connect(this.bgmMasterGain);
      arpOsc.start(time);
      arpOsc.stop(time + dur16th * 0.8);
    }

    // 3. WALKING BASS CHANNEL (Punchy Triangle wave)
    const bassPatterns = [
      // Bar 1: C
      [N.C3, null, N.G3, null, N.C4, null, N.G3, null, N.E3, null, N.G3, null, N.C3, null, N.E3, null],
      // Bar 2: Am
      [N.A3, null, N.E3, null, N.A3, null, N.C4, null, N.E3, null, N.A3, null, N.G3, null, N.E3, null],
      // Bar 3: F
      [N.F3, null, N.C3, null, N.F3, null, N.A3, null, N.C4, null, N.A3, null, N.F3, null, N.A3, null],
      // Bar 4: G
      [N.G3, null, N.D3, null, N.G3, null, N.B3, null, N.D4, null, N.B3, null, N.G3, null, N.B3, null],
    ];
    const barIdx = Math.floor(step / 16) % 4;
    const stepInBar = step % 16;
    const bassNote = bassPatterns[barIdx][stepInBar];

    if (bassNote) {
      const bassOsc = this.ctx.createOscillator();
      const bassGain = this.ctx.createGain();
      bassOsc.type = 'triangle';
      bassOsc.frequency.setValueAtTime(bassNote, time);

      bassGain.gain.setValueAtTime(0.35, time);
      bassGain.gain.exponentialRampToValueAtTime(0.001, time + dur16th * 1.6);

      bassOsc.connect(bassGain);
      bassGain.connect(this.bgmMasterGain);
      bassOsc.start(time);
      bassOsc.stop(time + dur16th * 1.7);
    }

    // 4. RETRO PERCUSSION CHANNEL (8-Bit Kick, Snare, Hi-hat)
    // Quarter note kicks: 0, 4, 8, 12
    if (stepInBar === 0 || stepInBar === 8) {
      // 8-Bit Kick Drum (rapid pitch drop sine)
      const kickOsc = this.ctx.createOscillator();
      const kickGain = this.ctx.createGain();
      kickOsc.type = 'sine';
      kickOsc.frequency.setValueAtTime(140, time);
      kickOsc.frequency.exponentialRampToValueAtTime(32, time + 0.1);

      kickGain.gain.setValueAtTime(0.4, time);
      kickGain.gain.exponentialRampToValueAtTime(0.001, time + 0.11);

      kickOsc.connect(kickGain);
      kickGain.connect(this.bgmMasterGain);
      kickOsc.start(time);
      kickOsc.stop(time + 0.12);
    }

    // Snare on 4 and 12
    if (stepInBar === 4 || stepInBar === 12) {
      // Noise burst for snare
      const bufferSize = Math.floor(this.ctx.sampleRate * 0.08);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.02));
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const snareFilter = this.ctx.createBiquadFilter();
      snareFilter.type = 'bandpass';
      snareFilter.frequency.setValueAtTime(1400, time);
      snareFilter.Q.setValueAtTime(1.5, time);

      const snareGain = this.ctx.createGain();
      snareGain.gain.setValueAtTime(0.22, time);
      snareGain.gain.exponentialRampToValueAtTime(0.001, time + 0.08);

      noise.connect(snareFilter);
      snareFilter.connect(snareGain);
      snareGain.connect(this.bgmMasterGain);
      noise.start(time);
      noise.stop(time + 0.08);
    }

    // Closed Hi-Hat on every other 16th
    if (stepInBar % 2 === 1) {
      const hhBufferSize = Math.floor(this.ctx.sampleRate * 0.025);
      const hhBuffer = this.ctx.createBuffer(1, hhBufferSize, this.ctx.sampleRate);
      const hhData = hhBuffer.getChannelData(0);
      for (let i = 0; i < hhBufferSize; i++) {
        hhData[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.006));
      }
      const hhNoise = this.ctx.createBufferSource();
      hhNoise.buffer = hhBuffer;

      const hhFilter = this.ctx.createBiquadFilter();
      hhFilter.type = 'highpass';
      hhFilter.frequency.setValueAtTime(7000, time);

      const hhGain = this.ctx.createGain();
      hhGain.gain.setValueAtTime(0.08, time);
      hhGain.gain.exponentialRampToValueAtTime(0.001, time + 0.025);

      hhNoise.connect(hhFilter);
      hhFilter.connect(hhGain);
      hhGain.connect(this.bgmMasterGain);
      hhNoise.start(time);
      hhNoise.stop(time + 0.026);
    }
  }

  // ==========================================
  // SFX SOUND EFFECTS
  // ==========================================

  /**
   * Super Shockwave / Sonic Slam ability blast
   */
  public playShockwave() {
    if (this.muted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;

    // Sub-bass rumble
    const sub = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    sub.type = 'sawtooth';
    sub.frequency.setValueAtTime(180, t);
    sub.frequency.exponentialRampToValueAtTime(25, t + 0.45);
    subGain.gain.setValueAtTime(0.7, t);
    subGain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);
    sub.connect(subGain);
    subGain.connect(this.ctx.destination);
    sub.start(t);
    sub.stop(t + 0.46);

    // Resonant synth blast sweep
    const sweep = this.ctx.createOscillator();
    const sweepFilter = this.ctx.createBiquadFilter();
    const sweepGain = this.ctx.createGain();
    sweep.type = 'triangle';
    sweep.frequency.setValueAtTime(440, t);
    sweep.frequency.exponentialRampToValueAtTime(120, t + 0.35);

    sweepFilter.type = 'lowpass';
    sweepFilter.frequency.setValueAtTime(3000, t);
    sweepFilter.frequency.exponentialRampToValueAtTime(400, t + 0.35);

    sweepGain.gain.setValueAtTime(0.5, t);
    sweepGain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

    sweep.connect(sweepFilter);
    sweepFilter.connect(sweepGain);
    sweepGain.connect(this.ctx.destination);
    sweep.start(t);
    sweep.stop(t + 0.36);
  }

  /**
   * Time Slow / Matrix Bullet Time activation
   */
  public playTimeSlow() {
    if (this.muted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, t);
    osc.frequency.exponentialRampToValueAtTime(220, t + 0.4);

    gain.gain.setValueAtTime(0.35, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.42);
  }

  /**
   * Mr. Rogers swinging his heavy hammer through the air
   */
  public playHammerSwing() {
    if (this.muted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(260, t);
    osc.frequency.exponentialRampToValueAtTime(80, t + 0.18);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, t);
    filter.frequency.exponentialRampToValueAtTime(200, t + 0.18);

    gain.gain.setValueAtTime(0.01, t);
    gain.gain.linearRampToValueAtTime(0.35, t + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.19);
  }

  /**
   * Sledgehammer pulverizing a rock, golf ball or projectile
   */
  public playHammerSmash() {
    if (this.muted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;

    // Heavy bass punch
    const subOsc = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(140, t);
    subOsc.frequency.exponentialRampToValueAtTime(35, t + 0.22);
    subGain.gain.setValueAtTime(0.65, t);
    subGain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
    subOsc.connect(subGain);
    subGain.connect(this.ctx.destination);
    subOsc.start(t);
    subOsc.stop(t + 0.23);

    // Crunchy noise burst
    const bufferSize = Math.floor(this.ctx.sampleRate * 0.15);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.04));
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1200, t);
    filter.Q.setValueAtTime(2.0, t);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.5, t);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.ctx.destination);
    noise.start(t);
    noise.stop(t + 0.16);
  }

  /**
   * Incoming object hits the glass window (Stage 1 or 2 crack)
   */
  public playGlassHit(hitStage: number) {
    if (this.muted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const freq = hitStage === 1 ? 2800 : 1800;

    // High brittle ping
    const ping = this.ctx.createOscillator();
    const pingGain = this.ctx.createGain();
    ping.type = 'sine';
    ping.frequency.setValueAtTime(freq, t);
    ping.frequency.exponentialRampToValueAtTime(800, t + 0.25);
    pingGain.gain.setValueAtTime(0.4, t);
    pingGain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
    ping.connect(pingGain);
    pingGain.connect(this.ctx.destination);
    ping.start(t);
    ping.stop(t + 0.26);

    // Crunch fracture noise
    const bufferSize = Math.floor(this.ctx.sampleRate * 0.18);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.05));
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = 'highpass';
    noiseFilter.frequency.setValueAtTime(2200, t);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.45, t);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.ctx.destination);
    noise.start(t);
    noise.stop(t + 0.19);
  }

  /**
   * Catastrophic Glass Shatter (Hit 3 - Game Over)
   */
  public playGlassShatter() {
    if (this.muted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;

    // Heavy crash white noise
    const bufferSize = Math.floor(this.ctx.sampleRate * 0.6);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.18));
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(3200, t);
    filter.frequency.linearRampToValueAtTime(800, t + 0.5);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.8, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.58);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    noise.start(t);
    noise.stop(t + 0.6);

    // Deep destructive thud
    const sub = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    sub.type = 'sawtooth';
    sub.frequency.setValueAtTime(120, t);
    sub.frequency.exponentialRampToValueAtTime(30, t + 0.45);
    subGain.gain.setValueAtTime(0.7, t);
    subGain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);
    sub.connect(subGain);
    subGain.connect(this.ctx.destination);
    sub.start(t);
    sub.stop(t + 0.46);
  }

  /**
   * Collected coin chime (crystal clear arcade double chime)
   */
  public playCoin() {
    if (this.muted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(987.77, t); // B5
    osc1.frequency.setValueAtTime(1318.51, t + 0.08); // E6

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(1975.53, t + 0.08); // B6

    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.ctx.destination);

    osc1.start(t);
    osc2.start(t + 0.08);
    osc1.stop(t + 0.36);
    osc2.stop(t + 0.36);
  }

  /**
   * Level cleared triumphant fanfare
   */
  public playLevelUp() {
    if (this.muted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      const noteTime = t + idx * 0.1;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, noteTime);

      gain.gain.setValueAtTime(0.25, noteTime);
      gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.start(noteTime);
      osc.stop(noteTime + 0.36);
    });
  }

  /**
   * Shield blocks incoming projectile
   */
  public playShieldBlock() {
    if (this.muted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(650, t);
    osc.frequency.exponentialRampToValueAtTime(1400, t + 0.06);
    osc.frequency.exponentialRampToValueAtTime(300, t + 0.22);

    gain.gain.setValueAtTime(0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.23);
  }

  /**
   * Glass repair tool used to mend cracks
   */
  public playRepair() {
    if (this.muted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const notes = [440, 554.37, 659.25, 880];
    notes.forEach((freq, i) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      const st = t + i * 0.06;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, st);
      gain.gain.setValueAtTime(0.2, st);
      gain.gain.exponentialRampToValueAtTime(0.001, st + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.start(st);
      osc.stop(st + 0.26);
    });
  }
}

export const soundEngine = new SoundEngine();
