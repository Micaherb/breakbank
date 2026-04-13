import { useState } from 'react'
import { formatTime } from '../utils/formatTime'

export default function BreakAlerts({ alerts, onAdd, onRemove, onToggle }) {
  const [alertType, setAlertType] = useState('threshold') // threshold | lastsUntil
  const [minutes, setMinutes] = useState('')
  const [time, setTime] = useState('')
  const [label, setLabel] = useState('')

  const handleAdd = () => {
    if (alertType === 'threshold') {
      const mins = parseInt(minutes, 10)
      if (mins > 0) {
        onAdd({
          type: 'threshold',
          label: label || `Break bank reaches ${mins}m`,
          thresholdSeconds: mins * 60,
        })
        setLabel('')
        setMinutes('')
      }
    } else {
      if (time) {
        onAdd({
          type: 'lastsUntil',
          label: label || `Break lasts until ${time}`,
          targetTime: time,
        })
        setLabel('')
        setTime('')
      }
    }
  }

  return (
    <div className="panel">
      <h3>Break Alerts</h3>
      <div className="break-alert-type-toggle">
        <button
          className={`btn btn-small ${alertType === 'threshold' ? 'btn-active' : ''}`}
          onClick={() => setAlertType('threshold')}
        >
          Bank reaches...
        </button>
        <button
          className={`btn btn-small ${alertType === 'lastsUntil' ? 'btn-active' : ''}`}
          onClick={() => setAlertType('lastsUntil')}
        >
          Lasts until...
        </button>
      </div>
      <div className="side-timer-add">
        <input
          type="text"
          placeholder="Label"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          className="setting-input"
        />
        {alertType === 'threshold' ? (
          <input
            type="number"
            placeholder="Min"
            min="1"
            value={minutes}
            onChange={(e) => setMinutes(e.target.value)}
            className="setting-input small-input"
          />
        ) : (
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
      {alerts.length === 0 && <p className="empty-state">No break alerts set</p>}
      {alerts.map((a) => (
        <div key={a.id} className={`side-timer-item ${a.fired ? 'timer-done' : ''}`}>
          <span className="side-timer-label">{a.label}</span>
          <span className="side-timer-time break-alert-detail">
            {a.type === 'threshold'
              ? formatTime(a.thresholdSeconds)
              : a.targetTime}
          </span>
          <div className="side-timer-controls">
            <button className="btn btn-small" onClick={() => onToggle(a.id)}>
              {a.enabled ? 'On' : 'Off'}
            </button>
            <button className="btn btn-small btn-danger" onClick={() => onRemove(a.id)}>
              ×
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
