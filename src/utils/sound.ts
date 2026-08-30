// Web Audio API-based soft, premium acoustic click synthesizer
// Produces a soft, tactile, whisper-level click reminiscent of a luxury camera dial or fine instrument

let audioCtx: AudioContext | null = null;
let soundEnabled = true;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

/**
 * Plays a soft, elegant, subtle micro-click sound.
 * Engineered to be whisper-soft and tactile rather than a loud beep.
 */
export function playSubtleClick() {
  if (!soundEnabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    // Gentle low-pass filter to eliminate harsh high-frequency buzz
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2200, now);
    filter.Q.setValueAtTime(1.1, now);

    // Warm, organic pitch envelope (subtle click transition)
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1050, now);
    osc.frequency.exponentialRampToValueAtTime(360, now + 0.024);

    // Soft volume envelope - subtle and non-intrusive (peak gain: ~0.04)
    gain.gain.setValueAtTime(0.04, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.026);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.028);
  } catch {
    // Graceful fallback if audio context is blocked
  }
}

/**
 * Returns whether click sound effects are currently active
 */
export function isSoundEnabled(): boolean {
  return soundEnabled;
}

/**
 * Toggle or set sound effects enabled status
 */
export function setSoundEnabled(enabled: boolean) {
  soundEnabled = enabled;
}

/**
 * Initializes global click listener to automatically trigger subtle click sound
 * on any button, role=button, checkbox, radio, or cursor-pointer click.
 */
export function initGlobalClickSound(): () => void {
  if (typeof window === 'undefined') return () => {};

  const handleClick = (e: MouseEvent) => {
    const target = e.target as HTMLElement | null;
    if (!target) return;

    // Check if the clicked element or any parent is interactive
    const interactive = target.closest(
      'button, [role="button"], input[type="checkbox"], input[type="radio"], select, .cursor-pointer'
    );

    if (interactive) {
      playSubtleClick();
    }
  };

  // Attach capture listener so all button clicks trigger sound smoothly
  window.addEventListener('click', handleClick, { capture: true, passive: true });

  return () => {
    window.removeEventListener('click', handleClick, { capture: true });
  };
}
