import { useState, useEffect, useCallback } from 'react'
import WorkTimer from './components/WorkTimer'
import HistoryLog from './components/HistoryLog'
import Settings from './components/Settings'
import AlertsPanel from './components/AlertsPanel'
import { useLocalStorage } from './hooks/useLocalStorage'
import { useAlarmSound } from './hooks/useAlarmSound'
import { formatTime } from './utils/formatTime'

export default function App() {
  const [mode, setMode] = useLocalStorage('bt-mode', 'idle') // idle | working | break
  const [workSeconds, setWorkSeconds] = useLocalStorage('bt-workSeconds', 0) // current session only
  const [bankedBreakSeconds, setBankedBreakSeconds] = useLocalStorage('bt-bankedBreak', 0)
  const [multiplier, setMultiplier] = useLocalStorage('bt-multiplier', 1 / 3)
  const [history, setHistory] = useLocalStorage('bt-history', [])
  const [alertItems, setAlertItems] = useLocalStorage('bt-alerts', [])
  const [breakStartTime, setBreakStartTime] = useLocalStorage('bt-breakStart', null)
  const [workStartTime, setWorkStartTime] = useLocalStorage('bt-workStart', null)

  const { play: playAlarm } = useAlarmSound()

  const breakBankSeconds = bankedBreakSeconds + (mode === 'break' ? 0 : workSeconds * multiplier)

  // Main tick loop
  useEffect(() => {
    if (mode === 'idle') return

    const interval = setInterval(() => {
      if (mode === 'working') {
        setWorkSeconds((s) => s + 1)
      } else if (mode === 'break') {
        setBankedBreakSeconds((s) => Math.max(0, s - 1))
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [mode, setWorkSeconds, setBankedBreakSeconds])

  // Update browser tab title
  useEffect(() => {
    if (mode === 'working') {
      document.title = `${formatTime(workSeconds)} working — Break Bank`
    } else if (mode === 'break') {
      const remaining = Math.max(0, Math.floor(bankedBreakSeconds))
      document.title = `${formatTime(remaining)} break — Break Bank`
    } else {
      document.title = 'Break Bank'
    }
  }, [mode, workSeconds, bankedBreakSeconds])

  // Check if break bank depleted
  useEffect(() => {
    if (mode === 'break' && bankedBreakSeconds <= 0) {
      handleEndBreak()
      playAlarm(3000)
    }
  }, [mode, bankedBreakSeconds])

  // Unified alert tick — handles countdowns, clock alarms, break alerts
  useEffect(() => {
    const hasActive = alertItems.some((a) =>
      (a.type === 'countdown' && a.running && a.remainingSeconds > 0) ||
      ((a.type === 'clock' || a.type === 'threshold' || a.type === 'lastsUntil') && a.enabled && !a.fired)
    )
    if (!hasActive) return

    const interval = setInterval(() => {
      const now = new Date()
      const nowStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
      const nowTotalSeconds = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds()

      setAlertItems((items) =>
        items.map((a) => {
          // Countdown tick
          if (a.type === 'countdown' && a.running && a.remainingSeconds > 0) {
            const next = a.remainingSeconds - 1
            if (next <= 0) {
              playAlarm(2000)
              return { ...a, remainingSeconds: 0, running: false }
            }
            return { ...a, remainingSeconds: next }
          }

          // Clock alarm
          if (a.type === 'clock' && a.enabled && !a.fired && a.timeString === nowStr) {
            playAlarm(3000)
            return { ...a, fired: true }
          }

          // Break bank threshold
          if (a.type === 'threshold' && a.enabled && !a.fired && breakBankSeconds >= a.thresholdSeconds) {
            playAlarm(3000)
            return { ...a, fired: true }
          }

          // Break lasts until
          if (a.type === 'lastsUntil' && a.enabled && !a.fired) {
            const [h, m] = a.targetTime.split(':').map(Number)
            const targetSeconds = h * 3600 + m * 60
            if (nowTotalSeconds + breakBankSeconds >= targetSeconds) {
              playAlarm(3000)
              return { ...a, fired: true }
            }
          }

          return a
        })
      )
    }, 1000)

    return () => clearInterval(interval)
  }, [alertItems, setAlertItems, breakBankSeconds, playAlarm])

  const handleStart = () => {
    if (workSeconds === 0) {
      setWorkStartTime(Date.now())
    }
    setMode('working')
  }

  const handlePause = () => setMode('idle')

  const handleStartBreak = () => {
    if (workStartTime) {
      setHistory((h) => [...h, { id: crypto.randomUUID(), type: 'work', startedAt: workStartTime, duration: workSeconds }])
    }
    setBankedBreakSeconds((b) => b + workSeconds * multiplier)
    setWorkSeconds(0)
    setWorkStartTime(null)
    setBreakStartTime(Date.now())
    setMode('break')
  }

  const handleEndBreak = useCallback(() => {
    setBreakStartTime((startTime) => {
      if (startTime) {
        const duration = Math.round((Date.now() - startTime) / 1000)
        setHistory((h) => [...h, { id: crypto.randomUUID(), type: 'break', startedAt: startTime, duration }])
      }
      return null
    })
    setMode('idle')
  }, [setHistory, setMode, setBreakStartTime])

  const handleEndBreakAndWork = useCallback(() => {
    setBreakStartTime((startTime) => {
      if (startTime) {
        const duration = Math.round((Date.now() - startTime) / 1000)
        setHistory((h) => [...h, { id: crypto.randomUUID(), type: 'break', startedAt: startTime, duration }])
      }
      return null
    })
    setWorkStartTime(Date.now())
    setWorkSeconds(0)
    setMode('working')
  }, [setHistory, setMode, setBreakStartTime, setWorkStartTime, setWorkSeconds])

  const handleReset = () => {
    if (window.confirm('Reset work timer, break bank, and history?')) {
      setMode('idle')
      setWorkSeconds(0)
      setBankedBreakSeconds(0)
      setHistory([])
      setBreakStartTime(null)
      setWorkStartTime(null)
    }
  }

  const toggleHideHistory = (id) => {
    setHistory((h) => h.map((e) => e.id === id ? { ...e, hidden: !e.hidden } : e))
  }

  // Unified alert handlers
  const addAlertItem = ({ type, label, totalSeconds, timeString, thresholdSeconds, targetTime }) => {
    const base = { id: Date.now(), type, label, enabled: true, fired: false }
    if (type === 'countdown') {
      setAlertItems((a) => [...a, { ...base, totalSeconds, remainingSeconds: totalSeconds, running: false }])
    } else if (type === 'clock') {
      setAlertItems((a) => [...a, { ...base, timeString }])
    } else if (type === 'threshold') {
      setAlertItems((a) => [...a, { ...base, thresholdSeconds }])
    } else if (type === 'lastsUntil') {
      setAlertItems((a) => [...a, { ...base, targetTime }])
    }
  }

  const removeAlertItem = (id) => {
    setAlertItems((a) => a.filter((x) => x.id !== id))
  }

  const toggleAlertItem = (id) => {
    setAlertItems((a) =>
      a.map((x) => {
        if (x.id !== id) return x
        if (x.type === 'countdown') {
          return { ...x, running: !x.running }
        }
        return { ...x, enabled: !x.enabled, fired: false }
      })
    )
  }

  const resetAlertItem = (id) => {
    setAlertItems((a) =>
      a.map((x) => (x.id === id ? { ...x, remainingSeconds: x.totalSeconds, running: false } : x))
    )
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Break Bank</h1>
        <div className="header-actions">
          <Settings multiplier={multiplier} onMultiplierChange={setMultiplier} />
        </div>
      </header>

      <main className="app-main">
        <WorkTimer
          mode={mode}
          workSeconds={workSeconds}
          breakBankSeconds={breakBankSeconds}
          onStart={handleStart}
          onPause={handlePause}
          onStartBreak={handleStartBreak}
          onEndBreak={handleEndBreak}
          onEndBreakAndWork={handleEndBreakAndWork}
          onReset={handleReset}
        />

        <div className="side-panels">
          <HistoryLog history={history} onToggleHide={toggleHideHistory} />
          <AlertsPanel
            items={alertItems}
            onAdd={addAlertItem}
            onRemove={removeAlertItem}
            onToggle={toggleAlertItem}
            onResetItem={resetAlertItem}
          />
        </div>
      </main>
    </div>
  )
}
