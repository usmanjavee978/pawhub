'use client'

import { useEffect, useRef } from 'react'
import { useRive, useStateMachineInput, Layout, Fit, Alignment } from '@rive-app/react-canvas'
import { useAnimationStore, getMoodValue, type CharacterMood } from '@/stores/animation-store'
import { cn } from '@/lib/utils'

// ─── Constants ────────────────────────────────────────────────
// State machine inputs — must match the .riv file's CompanionBrain state machine
const STATE_MACHINE_NAME = 'CompanionBrain'
const INPUT_MOOD = 'mood'     // Number: 0-8 (see MOOD_VALUES)
const INPUT_LOOK_X = 'lookX'    // Number: -100 to 100
const INPUT_LOOK_Y = 'lookY'    // Number: -100 to 100
const INPUT_IS_TOUCHED = 'isTouched' // Boolean

// During dev, we use a community placeholder.
// Replace '/rive/companion.riv' with your custom asset.
const COMPANION_RIV_SRC = '/rive/companion.riv'

export interface CompanionCharacterProps {
  className?: string
  size?: number
  enableEyeTracking?: boolean
  enableTouchInteraction?: boolean
}

export function CompanionCharacter({
  className,
  size = 200,
  enableEyeTracking = true,
  enableTouchInteraction = true,
}: CompanionCharacterProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const { characterMood, characterVisible, prefersReducedMotion } = useAnimationStore()

  // ── Rive Setup ──────────────────────────────────────────────
  const { rive, RiveComponent } = useRive({
    src: COMPANION_RIV_SRC,
    stateMachines: STATE_MACHINE_NAME,
    layout: new Layout({
      fit: Fit.Contain,
      alignment: Alignment.Center,
    }),
    autoplay: true,
    onLoadError: (e) => {
      // Silently fail — the fallback SVG renders below
      console.warn('[CompanionCharacter] Rive load error:', e)
    },
  })

  // ── State Machine Inputs ────────────────────────────────────
  const moodInput = useStateMachineInput(rive, STATE_MACHINE_NAME, INPUT_MOOD)
  const lookXInput = useStateMachineInput(rive, STATE_MACHINE_NAME, INPUT_LOOK_X)
  const lookYInput = useStateMachineInput(rive, STATE_MACHINE_NAME, INPUT_LOOK_Y)
  const touchInput = useStateMachineInput(rive, STATE_MACHINE_NAME, INPUT_IS_TOUCHED)

  // ── Subscribe to mood changes WITHOUT re-rendering ──────────
  // subscribeWithSelector means this callback fires on characterMood changes only
  useEffect(() => {
    return useAnimationStore.subscribe(
      (state) => state.characterMood,
      (mood: CharacterMood) => {
        if (moodInput) {
          moodInput.value = getMoodValue(mood)
        }
      },
      { fireImmediately: true }
    )
  }, [moodInput])

  // ── Eye Tracking ─────────────────────────────────────────────
  useEffect(() => {
    if (!enableEyeTracking || prefersReducedMotion || !lookXInput || !lookYInput) return

    const container = containerRef.current
    if (!container) return

    return useAnimationStore.subscribe(
      (state) => state.cursorPosition,
      (pos: { x: number; y: number }) => {
        const rect = container.getBoundingClientRect()
        const cx = rect.left + rect.width / 2
        const cy = rect.top + rect.height / 2

        // Normalize to -100…100 range
        const dx = ((pos.x - cx) / (window.innerWidth / 2)) * 100
        const dy = ((pos.y - cy) / (window.innerHeight / 2)) * 100

        if (lookXInput) lookXInput.value = Math.max(-100, Math.min(100, dx))
        if (lookYInput) lookYInput.value = Math.max(-100, Math.min(100, dy))
      }
    )
  }, [enableEyeTracking, prefersReducedMotion, lookXInput, lookYInput])

  // ── Touch / Click Interaction ────────────────────────────────
  const handlePet = () => {
    if (!enableTouchInteraction || !touchInput) return
    touchInput.value = true
    setTimeout(() => {
      if (touchInput) touchInput.value = false
    }, 1000)
  }

  if (!characterVisible) return null

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative select-none',
        enableTouchInteraction && 'cursor-pointer',
        className
      )}
      style={{ width: size, height: size }}
      onClick={handlePet}
      aria-label={`Pet companion — current mood: ${characterMood}`}
      role="img"
    >
      {/* Rive canvas — GPU accelerated */}
      <RiveComponent className="w-full h-full" />

      {/* Fallback SVG — shown while .riv loads or on load error */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <FallbackCompanion mood={characterMood} size={size} />
      </div>

      {/* Subtle glow that reacts to mood */}
      <div
        className={cn(
          'absolute inset-0 rounded-full blur-2xl opacity-20 -z-10 transition-colors duration-1000',
          characterMood === 'happy' || characterMood === 'celebrating'
            ? 'bg-amber-400'
            : characterMood === 'hungry' || characterMood === 'curious'
              ? 'bg-sky-300'
              : 'bg-orange-200'
        )}
      />
    </div>
  )
}

// ─── Fallback SVG Companion ───────────────────────────────────
// Shown while Rive loads. A simple CSS-animated cat/dog silhouette.
// Replace this entirely once the .riv asset is in place.
function FallbackCompanion({ mood, size }: { mood: CharacterMood; size: number }) {
  const emoji = {
    idle: '🐾',
    happy: '😸',
    hungry: '🐱',
    eating: '😋',
    sleeping: '😴',
    celebrating: '🎉',
    waving: '👋',
    curious: '🤔',
    sad: '😿',
  }[mood] ?? '🐾'

  return (
    <div
      className="flex items-center justify-center animate-float opacity-60"
      style={{ fontSize: size * 0.45 }}
      aria-hidden="true"
    >
      {emoji}
    </div>
  )
}
