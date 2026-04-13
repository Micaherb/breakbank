export function formatTime(totalSeconds) {
  const sign = totalSeconds < 0 ? '-' : ''
  const abs = Math.abs(Math.floor(totalSeconds))
  const h = Math.floor(abs / 3600)
  const m = Math.floor((abs % 3600) / 60)
  const s = abs % 60
  const pad = (n) => String(n).padStart(2, '0')
  if (h > 0) {
    return `${sign}${h}:${pad(m)}:${pad(s)}`
  }
  return `${sign}${pad(m)}:${pad(s)}`
}

export function formatTimeOfDay(date) {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}
