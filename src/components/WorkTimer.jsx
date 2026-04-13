import { formatTime } from '../utils/formatTime'

export default function WorkTimer({ mode, workSeconds, breakBankSeconds, onStart, onPause, onStartBreak, onEndBreak, onEndBreakAndWork, onReset }) {
  const isIdle = mode === 'idle'
  const isWorking = mode === 'working'
  const isOnBreak = mode === 'break'
  const hasWorkedBefore = workSeconds > 0

  return (
    <div className={`timer-card ${isOnBreak ? 'break-mode' : ''} ${isIdle && hasWorkedBefore ? 'paused-mode' : ''}`}>
      <div className="mode-indicator">
        {isIdle && 'Ready'}
        {isWorking && 'Working'}
        {isOnBreak && 'On Break'}
      </div>

      {!isOnBreak && (
        <div className="timer-display">
          <div className="timer-value">{formatTime(workSeconds)}</div>
        </div>
      )}

      <div className="timer-display break-display">
        {!isOnBreak && <div className="timer-label">Break Bank</div>}
        <div className={`timer-value ${breakBankSeconds <= 0 && isOnBreak ? 'timer-warning' : ''}`}>
          {formatTime(Math.max(0, Math.floor(breakBankSeconds)))}
        </div>
      </div>

      <div className="timer-controls">
        {isIdle && (
          <>
            <button className="btn btn-secondary" onClick={onStart}>
              {hasWorkedBefore ? 'Continue Working' : 'Start Working'}
            </button>
            {hasWorkedBefore && (
              <button className="btn btn-danger" onClick={onReset}>
                Reset
              </button>
            )}
          </>
        )}
        {isWorking && (
          <>
            <button className="btn btn-primary" onClick={onPause}>
              Pause
            </button>
            {breakBankSeconds >= 1 && (
              <button className="btn btn-break" onClick={onStartBreak}>
                Take Break
              </button>
            )}
          </>
        )}
        {isOnBreak && (
          <button className="btn btn-secondary" onClick={onEndBreakAndWork}>
            Continue Working
          </button>
        )}
      </div>
    </div>
  )
}
