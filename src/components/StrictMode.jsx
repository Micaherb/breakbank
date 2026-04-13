export default function StrictMode({ startTime, endTime, onChangeStart, onChangeEnd }) {
  const enabled = startTime && endTime

  return (
    <div className={`panel strict-mode-panel ${enabled ? 'strict-mode-active' : ''}`}>
      <div className="strict-mode-header">
        <h3
          title="When enabled, an alarm will sound continuously if the timer is paused or idle during the scheduled period."
        >
          Strict Mode
          <span className="strict-mode-status">{enabled ? ' (Active)' : ''}</span>
        </h3>
      </div>
      <div className="strict-mode-inputs">
        <div className="strict-mode-field">
          <label>Start</label>
          <input
            type="time"
            value={startTime || ''}
            onChange={(e) => onChangeStart(e.target.value || null)}
            className="setting-input"
          />
        </div>
        <div className="strict-mode-field">
          <label>End</label>
          <input
            type="time"
            value={endTime || ''}
            onChange={(e) => onChangeEnd(e.target.value || null)}
            className="setting-input"
          />
        </div>
      </div>
      {enabled && (
        <p className="setting-hint">
          Alarm will sound if timer is idle between {startTime} and {endTime}.
        </p>
      )}
    </div>
  )
}
