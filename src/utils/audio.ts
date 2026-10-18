// Audio & Speech Utilities for Special Education Fruit Learning

class SoundController {
  private audioCtx: AudioContext | null = null;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  // Soft tap click sound for tactile feedback
  playTap() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(220, ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } catch {
      // Audio not supported or blocked
    }
  }

  // Pleasant 3-note ascending chime for correct answer
  playSuccess() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const startTime = ctx.currentTime + i * 0.1;

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.2, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.35);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(startTime);
        osc.stop(startTime + 0.35);
      });
    } catch {
      // Audio fallback
    }
  }

  // Gentle low-frequency double chime for non-punitive retry
  playGentlePrompt() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      
      const notes = [392.00, 440.00]; // G4, A4
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const startTime = ctx.currentTime + i * 0.12;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.12, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.25);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(startTime);
        osc.stop(startTime + 0.25);
      });
    } catch {
      // Audio fallback
    }
  }

  // Celebratory fanfare for level complete
  playFanfare() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      
      const melody = [
        { freq: 523.25, time: 0, dur: 0.12 },
        { freq: 659.25, time: 0.12, dur: 0.12 },
        { freq: 783.99, time: 0.24, dur: 0.14 },
        { freq: 1046.5, time: 0.40, dur: 0.45 },
      ];

      melody.forEach(item => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const startTime = ctx.currentTime + item.time;

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(item.freq, startTime);

        gain.gain.setValueAtTime(0.25, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + item.dur);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(startTime);
        osc.stop(startTime + item.dur);
      });
    } catch {
      // Audio fallback
    }
  }
}

export const soundController = new SoundController();

// Korean Text-to-Speech Helper
export function speakText(
  text: string,
  options: { rate?: number; pitch?: number; onEnd?: () => void } = {}
) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return;
  }

  try {
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ko-KR';
    utterance.rate = options.rate ?? 0.85; // slightly slower for special education clarity
    utterance.pitch = options.pitch ?? 1.05;

    // Try to find a high quality Korean voice
    const voices = window.speechSynthesis.getVoices();
    const koreanVoice = voices.find(v => v.lang.startsWith('ko') || v.name.includes('Korean') || v.name.includes('한국어'));
    if (koreanVoice) {
      utterance.voice = koreanVoice;
    }

    if (options.onEnd) {
      utterance.onend = () => options.onEnd?.();
    }

    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.warn('SpeechSynthesis error:', err);
  }
}
