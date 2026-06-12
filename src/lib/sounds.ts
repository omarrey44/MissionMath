type SoundType = "correct" | "wrong" | "complete" | "badge";

function ctx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  return Ctx ? new Ctx() : null;
}

function tone(ac: AudioContext, freq: number, start: number, dur: number, vol = 0.18) {
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.connect(gain);
  gain.connect(ac.destination);
  osc.type = "sine";
  osc.frequency.setValueAtTime(freq, start);
  gain.gain.setValueAtTime(vol, start);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + dur);
  osc.start(start);
  osc.stop(start + dur + 0.02);
}

export function playSound(type: SoundType) {
  try {
    const ac = ctx();
    if (!ac) return;
    const t = ac.currentTime;
    if (type === "correct") {
      tone(ac, 523, t, 0.12);       // C5
      tone(ac, 659, t + 0.1, 0.15); // E5
    } else if (type === "wrong") {
      tone(ac, 349, t, 0.12);       // F4
      tone(ac, 294, t + 0.1, 0.18); // D4
    } else if (type === "complete") {
      tone(ac, 523, t, 0.1);        // C5
      tone(ac, 659, t + 0.09, 0.1); // E5
      tone(ac, 784, t + 0.18, 0.1); // G5
      tone(ac, 1047, t + 0.28, 0.22, 0.22); // C6
    } else if (type === "badge") {
      tone(ac, 880, t, 0.08, 0.15);  // A5
      tone(ac, 1109, t + 0.07, 0.08, 0.15); // C#6
      tone(ac, 1319, t + 0.14, 0.12, 0.15); // E6
    }
  } catch {
    // AudioContext blocked or unavailable — silently skip
  }
}
