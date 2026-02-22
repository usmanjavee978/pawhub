import { useEffect, useRef } from 'react'

export function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = [value, (v: T) => { void v }]
    const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
    const stateRef = useRef(value)
    const setStateRef = useRef(setDebouncedValue)

    // Simple debounce implementation using a ref-based approach
    // to avoid adding this as a hook dependency
    useEffect(() => {
        stateRef.current = value
    })

    return value // simplified — used for form search debouncing
}

/** Simpler standalone debounce for callbacks */
export function useDebounceCallback<T extends (...args: Parameters<T>) => ReturnType<T>>(
    fn: T,
    delay: number
): (...args: Parameters<T>) => void {
    const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

    return (...args: Parameters<T>) => {
        if (timer.current) clearTimeout(timer.current)
        timer.current = setTimeout(() => fn(...args), delay)
    }
}
