import { useState, useEffect, useCallback } from 'react'
import WorkTimer from './components/WorkTimer'
import HistoryLog from './components/HistoryLog'
import Settings from './components/Settings'
import SideTimers from './components/SideTimers'
import Alarms from './components/Alarms'
import { useLocalStorage } from './hooks/useLocalStorage'
import { useAlarmSound } from './hooks/useAlarmSound'
import { formatTime } from './utils/formatTime'

export default function App() {
  const [mode, setMode] = useLocalStorage('bt-mode', 'idle') // idle | working | break
  const [workSeconds, setWorkSeconds] = useLocalStorage('bt-workSeconds', 0) // current session only
  const [bankedBreakSeconds, setBankedBreakSeconds] = useLocalStorage('bt-bankedBreak', 0) // accumulated break bank
  const [multiplier, setMultiplier] = useLocalStorage('bt-multiplier', 1 / 3)
  const [history, setHistory] = useLocalStorage('bt-history', [])
  const [sideTimers, setSideTimers] = useLocalStorage('bt-sideTimers', [])
  const [alarms, setAlarms] = useLocalStorage('bt-alarms', [])
  const [breakStartTime, setBreakStartTime] = useLocalStorage('bt-breakStart', null)
  const [workStartTime, setWorkStartTime] = useLocalStorage('bt-workStart', null)

  const { play: playAlarm } = useAlarmSound()

  // Break bank = saved bank + what current work session has earned so far
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

  // Side timer tick
  useEffect(() => {
    const hasRunning = sideTimers.some((t) => t.running && t.remainingSeconds > 0)
    if (!hasRunning) return

    const interval = setInterval(() => {
      setSideTimers((timers) =>
        timers.map((t) => {
          if (!t.running || t.remainingSeconds <= 0) return t
          const next = t.remainingSeconds - 1
          if (next <= 0) {
            playAlarm(2000)
            return { ...t, remainingSeconds: 0, running: false }
          }
          return { ...t, remainingSeconds: next }
        })
      )
    }, 1000)

    return () => clearInterval(interval)
  }, [sideTimers, setSideTimers, playAlarm])

  // Clock alarm checker
  useEffect(() => {
    const hasActive = alarms.some((a) => a.enabled && !a.fired)
    if (!hasActive) return

    const interval = setInterval(() => {
      const now = new Date()
      const nowStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`

      setAlarms((als) =>
        als.map((a) => {
          if (a.enabled && !a.fired && a.timeString === nowStr) {
            playAlarm(3000)
            return { ...a, fired: true }
          }
          return a
        })
      )
    }, 1000)

    return () => clearInterval(interval)
  }, [alarms, setAlarms, playAlarm])

  const handleStart = () => {
    if (workSeconds === 0) {
      setWorkStartTime(Date.now())
    }
    setMode('working')
  }

  const handlePause = () => setMode('idle')

  const handleStartBreak = () => {
    // Log the work session
    if (workStartTime) {
      setHistory((h) => [...h, { id: crypto.randomUUID(), type: 'work', startedAt: workStartTime, duration: workSeconds }])
    }
    // Bank the break time earned from this work session
    setBankedBreakSeconds((b) => b + workSeconds * multiplier)
    setWorkSeconds(0)
    setWorkStartTime(null)
    // Start break
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
    if (window.confirm('Reset everything? This clears all timers, history, and break bank.')) {
      setMode('idle')
      setWorkSeconds(0)
      setBankedBreakSeconds(0)
      setHistory([])
      setSideTimers([])
      setAlarms([])
      setBreakStartTime(null)
      setWorkStartTime(null)
    }
  }

  const toggleHideHistory = (id) => {
    setHistory((h) => h.map((e) => e.id === id ? { ...e, hidden: !e.hidden } : e))
  }

  // Side timer handlers
  const addSideTimer = (label, totalSeconds) => {
    setSideTimers((t) => [
      ...t,
      { id: Date.now(), label, totalSeconds, remainingSeconds: totalSeconds, running: false },
    ])
  }

  const removeSideTimer = (id) => {
    setSideTimers((t) => t.filter((x) => x.id !== id))
  }

  const toggleSideTimer = (id) => {
    setSideTimers((t) => t.map((x) => (x.id === id ? { ...x, running: !x.running } : x)))
  }

  const resetSideTimer = (id) => {
    setSideTimers((t) => t.map((x) => (x.id === id ? { ...x, remainingSeconds: x.totalSeconds, running: false } : x)))
  }

  // Alarm handlers
  const addAlarm = (label, timeString) => {
    setAlarms((a) => [...a, { id: Date.now(), label, timeString, enabled: true, fired: false }])
  }

  const removeAlarm = (id) => {
    setAlarms((a) => a.filter((x) => x.id !== id))
  }

  const toggleAlarm = (id) => {
    setAlarms((a) =>
      a.map((x) => (x.id === id ? { ...x, enabled: !x.enabled, fired: false } : x))
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
          <SideTimers
            timers={sideTimers}
            onAdd={addSideTimer}
            onRemove={removeSideTimer}
            onToggle={toggleSideTimer}
            onReset={resetSideTimer}
          />
          <Alarms
            alarms={alarms}
            onAdd={addAlarm}
            onRemove={removeAlarm}
            onToggle={toggleAlarm}
          />
        </div>
      </main>
    </div>
  )
}
