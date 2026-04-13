import { useState } from 'react'

export default function Alarms({ alarms, onAdd, onRemove, onToggle }) {
  const [time, setTime] = useState('')
  const [label, setLabel] = useState('')

  const handleAdd = () => {
    if (time) {
      onAdd(label || 'Alarm', time)
      setLabel('')
      setTime('')
    }
  }

  return (
    <div className="panel">
      <h3>Alarms</h3>
      <div className="side-timer-add">
        <input
          type="text"
          placeholder="Label"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          className="setting-input"
        />
        <input
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          className="setting-input"
        />
        <button className="btn btn-primary btn-small" onClick={handleAdd}>
          Add
        </button>
      </div>
      {alarms.length === 0 && <p className="empty-state">No alarms set</p>}
      {alarms.map((a) => (
        <div key={a.id} className={`side-timer-item ${a.fired ? 'timer-done' : ''}`}>
          <span className="side-timer-label">{a.label}</span>
          <span className="side-timer-time">{a.timeString}</span>
          <div className="side-timer-controls">
            <button className="btn btn-small" onClick={() => onToggle(a.id)}>
              {a.enabled ? 'Disable' : 'Enable'}
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
