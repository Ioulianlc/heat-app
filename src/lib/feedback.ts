import { getPreferences } from './preferences'

// Sons et vibrations du jeu, selon les préférences du téléphone.
// Les sons sont fabriqués par le téléphone (Web Audio) : aucun fichier à télécharger,
// ils marchent donc aussi hors ligne.
export type Sound = 'flip' | 'tick' | 'right' | 'wrong' | 'trap' | 'win'

let audio: AudioContext | null = null

// Le navigateur n'autorise le son qu'après un premier toucher : on crée le contexte à la demande
function audioContext() {
  if (!audio && typeof AudioContext !== 'undefined') audio = new AudioContext()
  if (audio?.state === 'suspended') void audio.resume()
  return audio
}

// Une note : forme d'onde, fréquence de départ et d'arrivée (glissando), début et durée en secondes
function note(
  context: AudioContext,
  wave: OscillatorType,
  from: number,
  to: number,
  start: number,
  duration: number,
  volume = 0.15,
) {
  const oscillator = context.createOscillator()
  const gain = context.createGain()
  const at = context.currentTime + start
  oscillator.type = wave
  oscillator.frequency.setValueAtTime(from, at)
  oscillator.frequency.exponentialRampToValueAtTime(to, at + duration)
  // Attaque et extinction rapides : pas de « clic » au début ni à la fin
  gain.gain.setValueAtTime(0.0001, at)
  gain.gain.exponentialRampToValueAtTime(volume, at + 0.01)
  gain.gain.exponentialRampToValueAtTime(0.0001, at + duration)
  oscillator.connect(gain).connect(context.destination)
  oscillator.start(at)
  oscillator.stop(at + duration + 0.02)
}

const SOUNDS: Record<Sound, (context: AudioContext) => void> = {
  flip: (context) => note(context, 'triangle', 300, 700, 0, 0.12, 0.08),
  tick: (context) => note(context, 'square', 1200, 1200, 0, 0.05, 0.04),
  right: (context) => {
    note(context, 'triangle', 659, 659, 0, 0.12)
    note(context, 'triangle', 988, 988, 0.1, 0.25)
  },
  wrong: (context) => note(context, 'sawtooth', 220, 90, 0, 0.45, 0.1),
  trap: (context) => {
    note(context, 'square', 520, 260, 0, 0.18, 0.06)
    note(context, 'square', 390, 190, 0.16, 0.25, 0.06)
  },
  win: (context) =>
    [523, 659, 784, 1047].forEach((frequency, index) =>
      note(context, 'triangle', frequency, frequency, index * 0.12, index === 3 ? 0.5 : 0.14),
    ),
}

export function playSound(sound: Sound) {
  if (!getPreferences().soundEffects) return
  try {
    const context = audioContext()
    if (context) SOUNDS[sound](context)
  } catch {
    // pas de son sur ce téléphone : le jeu continue
  }
}

export function vibrate(pattern: number | number[]) {
  if (getPreferences().vibrations) navigator.vibrate?.(pattern)
}
