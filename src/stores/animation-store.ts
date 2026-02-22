import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'

// ─── Types ────────────────────────────────────────────────────
export type CharacterMood =
  | 'idle'
  | 'happy'
  | 'hungry'
  | 'eating'
  | 'sleeping'
  | 'celebrating'
  | 'waving'
  | 'curious'
  | 'sad'

// Mapped to Rive state machine numeric inputs
export const MOOD_VALUES: Record<CharacterMood, number> = {
  idle:        0,
  happy:       1,
  sleeping:    2,
  eating:      3,
  celebrating: 4,
  waving:      5,
  curious:     6,
  sad:         7,
  hungry:      8,
}

interface AnimationState {
  // ── Rive Companion ──────────────────────────────────────────
  characterMood: CharacterMood
  characterVisible: boolean
  setCharacterMood: (mood: CharacterMood) => void
  setCharacterVisible: (visible: boolean) => void

  // ── Cursor tracking (CSS custom properties approach — no canvas) ──
  cursorPosition: { x: number; y: number }
  setCursorPosition: (pos: { x: number; y: number }) => void

  // ── Page transitions ─────────────────────────────────────────
  isTransitioning: boolean
  transitionDirection: 'forward' | 'backward'
  setTransitioning: (isTransitioning: boolean, direction?: 'forward' | 'backward') => void

  // ── High-level triggers (called by feature components) ───────
  // These run the three-beat confirmation rhythm from the architecture doc:
  // Beat 1: input collapses (handled in component)
  // Beat 2: data visualization absorbs (nutrition ring fills)
  // Beat 3: companion mood shifts
  triggerFeedAnimation: () => void
  triggerVaccineAnimation: () => void
  triggerCelebration: () => void
  triggerPetAction: (mood: CharacterMood, durationMs?: number) => void

  // ── Accessibility ─────────────────────────────────────────────
  prefersReducedMotion: boolean
  setPrefersReducedMotion: (value: boolean) => void

  // ── Theme / Ambient ──────────────────────────────────────────
  timeOfDay: 'day' | 'night'
  setTimeOfDay: (time: 'day' | 'night') => void
}

// ─── Store ────────────────────────────────────────────────────
// subscribeWithSelector allows the Rive canvas to subscribe
// to ONLY characterMood changes — no unnecessary re-renders
export const useAnimationStore = create<AnimationState>()(
  subscribeWithSelector((set, get) => ({
    // ── Companion defaults ────────────────────────────────────
    characterMood: 'idle',
    characterVisible: true,

    setCharacterMood: (mood) => {
      if (get().prefersReducedMotion) return
      set({ characterMood: mood })
      // Reflect mood on body data attribute for CSS temperature shift
      if (typeof document !== 'undefined') {
        document.body.dataset.mood = mood === 'happy' || mood === 'celebrating'
          ? 'happy'
          : mood === 'hungry' || mood === 'curious'
            ? 'hungry'
            : 'idle'
      }
    },

    setCharacterVisible: (visible) => set({ characterVisible: visible }),

    // ── Cursor ────────────────────────────────────────────────
    cursorPosition: { x: 0, y: 0 },
    setCursorPosition: (pos) => {
      set({ cursorPosition: pos })
      // Drive CSS custom properties directly — zero React re-renders
      if (typeof document !== 'undefined') {
        document.documentElement.style.setProperty('--mx', String(pos.x))
        document.documentElement.style.setProperty('--my', String(pos.y))
      }
    },

    // ── Page transitions ─────────────────────────────────────
    isTransitioning: false,
    transitionDirection: 'forward',
    setTransitioning: (isTransitioning, direction = 'forward') =>
      set({ isTransitioning, transitionDirection: direction }),

    // ── Three-beat confirmation: Feed ─────────────────────────
    triggerFeedAnimation: () => {
      if (get().prefersReducedMotion) return
      // Beat 3: companion shifts hungry → eating → happy → idle
      set({ characterMood: 'eating' })
      setTimeout(() => set({ characterMood: 'happy' }), 2000)
      setTimeout(() => set({ characterMood: 'idle' }), 5000)
      // Apply mood temperature
      if (typeof document !== 'undefined') {
        document.body.dataset.mood = 'happy'
        setTimeout(() => { document.body.dataset.mood = 'idle' }, 5000)
      }
    },

    // ── Three-beat confirmation: Vaccine ──────────────────────
    triggerVaccineAnimation: () => {
      if (get().prefersReducedMotion) return
      set({ characterMood: 'celebrating' })
      setTimeout(() => set({ characterMood: 'happy' }), 2500)
      setTimeout(() => set({ characterMood: 'idle' }), 5500)
    },

    // ── Celebration (generic) ─────────────────────────────────
    triggerCelebration: () => {
      if (get().prefersReducedMotion) return
      set({ characterMood: 'celebrating' })
      setTimeout(() => set({ characterMood: 'happy' }), 3000)
      setTimeout(() => set({ characterMood: 'idle' }), 6000)
    },

    // ── Generic timed mood override ───────────────────────────
    triggerPetAction: (mood, durationMs = 3000) => {
      if (get().prefersReducedMotion) return
      const previous = get().characterMood
      set({ characterMood: mood })
      setTimeout(() => set({ characterMood: previous }), durationMs)
    },

    // ── Accessibility ─────────────────────────────────────────
    prefersReducedMotion: false,
    setPrefersReducedMotion: (value) => set({ prefersReducedMotion: value }),

    // ── Time of day ───────────────────────────────────────────
    timeOfDay: 'day',
    setTimeOfDay: (time) => set({ timeOfDay: time }),
  }))
)

// ─── Derived helpers (call outside React for Rive bridge) ────
export function getMoodValue(mood: CharacterMood): number {
  return MOOD_VALUES[mood] ?? 0
}
