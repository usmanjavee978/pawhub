'use client'

import { useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'

interface NutritionRingProps {
  /** 0 to 1 — current fill percentage */
  progress: number
  /** Target calories for the day */
  targetCalories?: number
  /** Calories logged so far */
  loggedCalories?: number
  size?: number
  strokeWidth?: number
  className?: string
  label?: string
  color?: string
  animate?: boolean
}

export function NutritionRing({
  progress,
  targetCalories,
  loggedCalories,
  size = 120,
  strokeWidth = 10,
  className,
  label,
  color = 'hsl(var(--accent))',
  animate = true,
}: NutritionRingProps) {
  const progressRef = useRef<SVGCircleElement>(null)
  const prevProgressRef = useRef(0)

  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const clampedProg = Math.min(1, Math.max(0, progress))

  useEffect(() => {
    const circle = progressRef.current
    if (!circle) return

    const targetOffset = circumference * (1 - clampedProg)

    if (!animate) {
      circle.style.strokeDashoffset = String(targetOffset)
      return
    }

    // Animate from previous value to new value (pour/fill effect)
    const startOffset = circumference * (1 - prevProgressRef.current)
    const duration = 1000
    const start = performance.now()

    function tick(now: number) {
      const elapsed = now - start
      const t = Math.min(elapsed / duration, 1)
      // Ease out cubic
      const eased = 1 - Math.pow(1 - t, 3)
      const currentOffset = startOffset + (targetOffset - startOffset) * eased
      circle!.style.strokeDashoffset = String(currentOffset)
      if (t < 1) requestAnimationFrame(tick)
    }

    requestAnimationFrame(tick)
    prevProgressRef.current = clampedProg
  }, [clampedProg, circumference, animate])

  const percentage = Math.round(clampedProg * 100)
  const isComplete = clampedProg >= 1

  return (
    <div
      className={cn('relative inline-flex items-center justify-center', className)}
      role="progressbar"
      aria-valuenow={percentage}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`Nutrition: ${percentage}% of daily goal`}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{ transform: 'rotate(-90deg)' }}
        className="overflow-visible"
      >
        <defs>
          <filter id="liquid-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <linearGradient id="ring-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={isComplete ? '#4ade80' : color} stopOpacity="0.8" />
            <stop offset="50%" stopColor={isComplete ? '#22c55e' : color} />
            <stop offset="100%" stopColor={isComplete ? '#16a34a' : color} stopOpacity="0.9" />
          </linearGradient>
        </defs>

        {/* Background track - Physical depth style */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="hsl(var(--surface-overlay))"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="hsl(var(--border))"
          strokeWidth={strokeWidth}
          className="opacity-40"
        />

        {/* Progress arc - Liquid Glow */}
        <circle
          ref={progressRef}
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#ring-gradient)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference}
          filter="url(#liquid-glow)"
          className="transition-all duration-500"
        />
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className="font-semibold tabular-nums"
          style={{ fontSize: size * 0.18 }}
        >
          {isComplete ? '✓' : `${percentage}%`}
        </span>
        {label && (
          <span
            className="text-[hsl(var(--foreground-muted))] leading-none"
            style={{ fontSize: size * 0.1 }}
          >
            {label}
          </span>
        )}
        {loggedCalories !== undefined && targetCalories !== undefined && (
          <span
            className="text-[hsl(var(--foreground-muted))] leading-none mt-0.5"
            style={{ fontSize: size * 0.09 }}
          >
            {loggedCalories}/{targetCalories}
          </span>
        )}
      </div>
    </div>
  )
}
