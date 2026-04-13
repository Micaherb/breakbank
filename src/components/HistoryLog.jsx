import { useState } from 'react'
import { formatTime, formatTimeOfDay } from '../utils/formatTime'

export default function HistoryLog({ history, onToggleHide }) {
  const [showHidden, setShowHidden] = useState(false)

  const hiddenCount = history.filter((e) => e.hidden).length
  const entries = showHidden ? history : history.filter((e) => !e.hidden)

  if (history.length === 0) {
    return (
      <div className="panel">
        <h3>History</h3>
        <p className="empty-state">No activity yet</p>
      </div>
    )
  }

  return (
    <div className="panel">
      <div className="history-header">
        <h3>History</h3>
        {hiddenCount > 0 && (
          <button className="btn btn-small" onClick={() => setShowHidden(!showHidden)}>
            {showHidden ? 'Hide hidden' : `Show hidden (${hiddenCount})`}
          </button>
        )}
      </div>
      <div className="history-list">
        {[...entries].reverse().map((entry) => (
          <div
            key={entry.id || entry.startedAt}
            className={`history-item ${entry.type === 'work' ? 'history-work' : 'history-break'} ${entry.hidden ? 'history-hidden' : ''}`}
          >
            <span className="history-type-badge">
              {entry.type === 'work' ? 'Work' : 'Break'}
            </span>
            <span className="history-time">
              {formatTimeOfDay(new Date(entry.startedAt))}
            </span>
            <span className="history-duration">
              {formatTime(entry.duration)}
            </span>
            <button
              className="btn btn-small history-hide-btn"
              onClick={() => onToggleHide(entry.id)}
              title={entry.hidden ? 'Show' : 'Hide'}
            >
              {entry.hidden ? '👁️' : '🙈'}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
