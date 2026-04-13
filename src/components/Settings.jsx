import { useState } from 'react'

export default function Settings({ multiplier, onMultiplierChange }) {
  const [open, setOpen] = useState(false)
  const [inputValue, setInputValue] = useState(String(multiplier))

  const handleSave = () => {
    const val = parseFloat(inputValue)
    if (!isNaN(val) && val > 0 && val <= 10) {
      onMultiplierChange(val)
    }
    setOpen(false)
  }

  const presets = [
    { label: '1/5', value: 0.2 },
    { label: '1/4', value: 0.25 },
    { label: '1/3', value: 1 / 3 },
    { label: '1/2', value: 0.5 },
    { label: '1/1', value: 1 },
  ]

  if (!open) {
    return (
      <button className="btn btn-small" onClick={() => { setInputValue(String(Math.round(multiplier * 1000) / 1000)); setOpen(true) }}>
        Settings (rate: {Math.round(multiplier * 100)}%)
      </button>
    )
  }

  return (
    <div className="panel settings-panel">
      <h3>Settings</h3>
      <div className="setting-row">
        <label>Break time multiplier:</label>
        <input
          type="number"
          step="0.01"
          min="0.01"
          max="10"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="setting-input"
        />
      </div>
      <div className="preset-buttons">
        {presets.map((p) => (
          <button
            key={p.label}
            className={`btn btn-small ${Math.abs(parseFloat(inputValue) - p.value) < 0.001 ? 'btn-active' : ''}`}
            onClick={() => setInputValue(String(Math.round(p.value * 1000) / 1000))}
          >
            {p.label}
          </button>
        ))}
      </div>
      <p className="setting-hint">
        At {Math.round(parseFloat(inputValue || 0) * 100)}%, working 15 min earns{' '}
        {Math.round(15 * parseFloat(inputValue || 0) * 10) / 10} min of break.
      </p>
      <div className="setting-actions">
        <button className="btn btn-primary" onClick={handleSave}>Save</button>
        <button className="btn btn-secondary" onClick={() => setOpen(false)}>Cancel</button>
      </div>
    </div>
  )
}
