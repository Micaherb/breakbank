import { useRef, useCallback } from 'react'

// Sound type definitions — each is a function that schedules oscillator nodes
const SOUNDS = {
  // Break bank depleted — alternating beep pattern (original)
  breakDepleted(ctx, now) {
    const beepCount = 6
    for (let i = 0; i < beepCount; i++) {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.frequency.value = i % 2 === 0 ? 880 : 660
      osc.type = 'sine'
      const t = now + i * 0.5
      gain.gain.setValueAtTime(0.3, t)
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4)
      osc.start(t)
      osc.stop(t + 0.4)
    }
  },

  // Countdown timer done — short cheerful double-ding
  countdownDone(ctx, now) {
    const notes = [523, 659, 784, 1047] // C5 E5 G5 C6
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.type = 'sine'
      osc.frequency.value = freq
      const t = now + i * 0.15
      gain.gain.setValueAtTime(0.25, t)
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3)
      osc.start(t)
      osc.stop(t + 0.3)
    })
  },

  // Clock alarm — classic repeating beep
  clockAlarm(ctx, now) {
    for (let i = 0; i < 8; i++) {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.type = 'sine'
      osc.frequency.value = 880
      const t = now + i * 0.25
      gain.gain.setValueAtTime(0.3, t)
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15)
      osc.start(t)
      osc.stop(t + 0.15)
    }
  },

  // Break bank threshold / lasts-until — gentle rising chime
  chime(ctx, now) {
    const notes = [392, 494, 587] // G4 B4 D5
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.type = 'triangle'
      osc.frequency.value = freq
      const t = now + i * 0.25
      gain.gain.setValueAtTime(0.25, t)
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.6)
      osc.start(t)
      osc.stop(t + 0.6)
    })
  },

  // Strict mode — annoying persistent buzzer
  strictBuzz(ctx, now) {
    for (let i = 0; i < 10; i++) {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.type = 'sawtooth'
      osc.frequency.value = 220
      const t = now + i * 0.4
      gain.gain.setValueAtTime(0.15, t)
      gain.gain.setValueAtTime(0.15, t + 0.2)
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25)
      osc.start(t)
      osc.stop(t + 0.25)
    }
  },
}

export function useAlarmSound() {
  const audioCtxRef = useRef(null)

  const play = useCallback((soundType = 'clockAlarm') => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)()
      }
      const ctx = audioCtxRef.current
      const fn = SOUNDS[soundType]
      if (fn) {
        fn(ctx, ctx.currentTime)
      }
    } catch {
      // Web Audio not available
    }
  }, [])

  return { play }
}
