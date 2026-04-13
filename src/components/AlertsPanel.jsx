import { useState } from 'react'
import { formatTime } from '../utils/formatTime'

const TYPES = [
  { key: 'countdown', label: 'Countdown' },
  { key: 'clock', label: 'Clock Alarm' },
  { key: 'threshold', label: 'Bank Reaches', tooltip: 'Alert when your break bank accumulates to a certain number of minutes' },
  { key: 'lastsUntil', label: 'Lasts Until', tooltip: 'Alert when your break bank is large enough to last until a specific time of day' },
]

export default function AlertsPanel({ items, onAdd, onRemove, onToggle, onResetItem }) {
  const [type, setType] = useState('countdown')
  const [label, setLabel] = useState('')
  const [minutes, setMinutes] = useState('')
  const [time, setTime] = useState('')

  const handleAdd = () => {
    if (type === 'countdown') {
      const mins = parseInt(minutes, 10)
      if (mins > 0) {
        onAdd({
          type: 'countdown',
          label: label || `${mins}m timer`,
          totalSeconds: mins * 60,
        })
      }
    } else if (type === 'clock') {
      if (time) {
        onAdd({
          type: 'clock',
          label: label || `Alarm at ${time}`,
          timeString: time,
        })
      }
    } else if (type === 'threshold') {
      const mins = parseInt(minutes, 10)
      if (mins > 0) {
        onAdd({
          type: 'threshold',
          label: label || `Bank reaches ${mins}m`,
          thresholdSeconds: mins * 60,
        })
      }
    } else if (type === 'lastsUntil') {
      if (time) {
        onAdd({
          type: 'lastsUntil',
          label: label || `Break lasts until ${time}`,
          targetTime: time,
        })
      }
    }
    setLabel('')
    setMinutes('')
    setTime('')
  }

  const needsMinutes = type === 'countdown' || type === 'threshold'
  const needsTime = type === 'clock' || type === 'lastsUntil'

  return (
    <div className="panel">
      <h3>Alerts & Timers</h3>
      <div className="alert-type-toggle">
        {TYPES.map((t) => (
          <button
            key={t.key}
            className={`btn btn-small ${type === t.key ? 'btn-active' : ''}`}
            onClick={() => setType(t.key)}
            title={t.tooltip || ''}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="side-timer-add">
        <input
          type="text"
          placeholder="Label"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          className="setting-input"
        />
        {needsMinutes && (
          <input
            type="number"
            placeholder="Min"
            min="1"
            value={minutes}
            onChange={(e) => setMinutes(e.target.value)}
            className="setting-input small-input"
          />
        )}
        {needsTime && (
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="setting-input"
          />
        )}
        <button className="btn btn-primary btn-small" onClick={handleAdd}>
          Add
        </button>
      </div>

      {items.length === 0 && <p className="empty-state">No alerts or timers set</p>}
      {items.map((item) => (
        <div key={item.id} className={`side-timer-item ${item.fired || (item.type === 'countdown' && item.remainingSeconds <= 0) ? 'timer-done' : ''}`}>
          <span className="alert-type-badge">{badgeLabel(item.type)}</span>
          <span className="side-timer-label">{item.label}</span>
          <span className="side-timer-time">
            {renderDetail(item)}
          </span>
          <div className="side-timer-controls">
            {item.type === 'countdown' && item.remainingSeconds > 0 && (
              <button className="btn btn-small" onClick={() => onToggle(item.id)}>
                {item.running ? 'Pause' : 'Start'}
              </button>
            )}
            {item.type === 'countdown' && (
              <button className="btn btn-small" onClick={() => onResetItem(item.id)} title="Reset">
                ↺
              </button>
            )}
            {item.type !== 'countdown' && (
              <button className="btn btn-small" onClick={() => onToggle(item.id)}>
                {item.enabled ? 'On' : 'Off'}
              </button>
            )}
            <button className="btn btn-small btn-danger" onClick={() => onRemove(item.id)}>
              ×
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

function badgeLabel(type) {
  switch (type) {
    case 'countdown': return '⏱️'
    case 'clock': return '⏰'
    case 'threshold': return '🏦'
    case 'lastsUntil': return '🎯'
    default: return ''
  }
}

function renderDetail(item) {
  switch (item.type) {
    case 'countdown':
      return item.remainingSeconds <= 0
        ? `Done! (${formatTime(item.totalSeconds)})`
        : `${formatTime(item.remainingSeconds)} / ${formatTime(item.totalSeconds)}`
    case 'clock':
      return item.timeString
    case 'threshold':
      return formatTime(item.thresholdSeconds)
    case 'lastsUntil':
      return item.targetTime
    default:
      return ''
  }
}
