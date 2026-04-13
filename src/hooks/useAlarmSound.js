import { useRef, useCallback } from 'react'

export function useAlarmSound() {
  const audioCtxRef = useRef(null)
  const timeoutRef = useRef(null)

  const play = useCallback((durationMs = 2000) => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)()
      }
      const ctx = audioCtxRef.current
      const now = ctx.currentTime
      const end = now + durationMs / 1000

      // Play a pleasant repeating beep pattern
      const beepCount = Math.floor(durationMs / 500)
      for (let i = 0; i < beepCount; i++) {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.frequency.value = i % 2 === 0 ? 880 : 660
        osc.type = 'sine'
        const start = now + i * 0.5
        gain.gain.setValueAtTime(0.3, start)
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.4)
        osc.start(start)
        osc.stop(start + 0.4)
      }
    } catch {
      // Web Audio not available
    }
  }, [])

  const stop = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }, [])

  return { play, stop }
}
