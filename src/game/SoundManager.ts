/**
 * SoundManager - Web Audio API 기반 효과음 매니저
 *
 * 볼트 클릭, 머지, 게임 오버 등의 효과음을 생성합니다.
 */

const MUTE_KEY = 'bolt-merge-sound-muted';

class SoundManager {
  private audioContext: AudioContext | null = null;
  private muted = false;

  constructor() {
    try {
      this.muted = localStorage.getItem(MUTE_KEY) === '1';
    } catch {
      this.muted = false;
    }
  }

  isMuted(): boolean {
    return this.muted;
  }

  setMuted(muted: boolean): void {
    this.muted = muted;
    try {
      localStorage.setItem(MUTE_KEY, muted ? '1' : '0');
    } catch {
      // ignore
    }
  }

  private getContext(): AudioContext {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return this.audioContext;
  }

  /**
   * 볼트 클릭/이동 소리 - 금속 나사가 풀리는 '드르륵- 탁'
   */
  playBoltClick(): void {
    if (this.muted) return;
    try {
      const ctx = this.getContext();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.type = 'sawtooth';
      oscillator.frequency.setValueAtTime(200, ctx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.1);

      gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.15);
    } catch {
      // Audio not supported
    }
  }

  /**
   * 머지 발생 소리 - 통통 튀는 '퐁- 팡!'
   */
  playMerge(): void {
    if (this.muted) return;
    try {
      const ctx = this.getContext();

      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(523, ctx.currentTime);
      osc1.frequency.exponentialRampToValueAtTime(784, ctx.currentTime + 0.1);
      gain1.gain.setValueAtTime(0.4, ctx.currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc1.start(ctx.currentTime);
      osc1.stop(ctx.currentTime + 0.3);

      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(659, ctx.currentTime + 0.05);
      osc2.frequency.exponentialRampToValueAtTime(1047, ctx.currentTime + 0.15);
      gain2.gain.setValueAtTime(0.3, ctx.currentTime + 0.05);
      gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
      osc2.start(ctx.currentTime + 0.05);
      osc2.stop(ctx.currentTime + 0.35);
    } catch {
      // Audio not supported
    }
  }

  /**
   * 게임 오버 소리 - 무거운 금속이 떨어지는 소리
   */
  playGameOver(): void {
    if (this.muted) return;
    try {
      const ctx = this.getContext();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.type = 'sawtooth';
      oscillator.frequency.setValueAtTime(150, ctx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(30, ctx.currentTime + 0.8);

      gainNode.gain.setValueAtTime(0.5, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 1);
    } catch {
      // Audio not supported
    }
  }

  /**
   * 승리 소리 - 상승하는 멜로디
   */
  playWin(): void {
    if (this.muted) return;
    try {
      const ctx = this.getContext();
      const notes = [523, 659, 784, 1047];

      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.15);
        gain.gain.setValueAtTime(0.3, ctx.currentTime + i * 0.15);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.15 + 0.3);
        osc.start(ctx.currentTime + i * 0.15);
        osc.stop(ctx.currentTime + i * 0.15 + 0.3);
      });
    } catch {
      // Audio not supported
    }
  }

  /**
   * 잠긴 볼트 클릭 (실패) 소리
   */
  playLocked(): void {
    if (this.muted) return;
    try {
      const ctx = this.getContext();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.type = 'square';
      oscillator.frequency.setValueAtTime(100, ctx.currentTime);

      gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.1);
    } catch {
      // Audio not supported
    }
  }
}

export const soundManager = new SoundManager();
