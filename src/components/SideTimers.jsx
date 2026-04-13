import { useState } from 'react'
import { formatTime } from '../utils/formatTime'

export default function SideTimers({ timers, onAdd, onRemove, onToggle, onReset }) {
  const [label, setLabel] = useState('')
  const [minutes, setMinutes] = useState('')

  const handleAdd = () => {
    const mins = parseInt(minutes, 10)
    if (mins > 0) {
      onAdd(label || `Timer`, mins * 60)
      setLabel('')
      setMinutes('')
    }
  }

  return (
    <div className="panel">
      <h3>Side Timers</h3>
      <div className="side-timer-add">
        <input
          type="text"
          placeholder="Label"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          className="setting-input"
        />
        <input
          type="number"
          placeholder="Min"
          min="1"
          value={minutes}
          onChange={(e) => setMinutes(e.target.value)}
          className="setting-input small-input"
        />
        <button className="btn btn-primary btn-small" onClick={handleAdd}>
          Add
        </button>
      </div>
      {timers.length === 0 && <p className="empty-state">No side timers</p>}
      {timers.map((t) => (
        <div key={t.id} className={`side-timer-item ${t.remainingSeconds <= 0 ? 'timer-done' : ''}`}>
          <span className="side-timer-label">{t.label}</span>
          <span className="side-timer-time">
            {t.remainingSeconds <= 0
              ? `Done! (${formatTime(t.totalSeconds)})`
              : `${formatTime(t.remainingSeconds)} / ${formatTime(t.totalSeconds)}`}
          </span>
          <div className="side-timer-controls">
            {t.remainingSeconds > 0 && (
              <button className="btn btn-small" onClick={() => onToggle(t.id)}>
                {t.running ? 'Pause' : 'Start'}
              </button>
            )}
            <button className="btn btn-small" onClick={() => onReset(t.id)} title="Reset timer">
              ↺
            </button>
            <button className="btn btn-small btn-danger" onClick={() => onRemove(t.id)}>
              ×
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
