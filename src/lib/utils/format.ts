export function formatSalary(
  min: number | null,
  max: number | null,
  currency: string
): string {
  if (!min && !max) return 'Salary not disclosed'
  const fmt = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  })
  if (min && max) return `${fmt.format(min)} - ${fmt.format(max)}`
  if (min) return `From ${fmt.format(min)}`
  return `Up to ${fmt.format(max!)}`
}

export function formatTimeAgo(dateStr: string): string {
  const now = Date.now()
  const then = new Date(dateStr).getTime()
  const diffSecs = Math.floor((now - then) / 1000)

  if (diffSecs < 60) return 'just now'
  if (diffSecs < 3600) return `${Math.floor(diffSecs / 60)}m ago`
  if (diffSecs < 86400) return `${Math.floor(diffSecs / 3600)}h ago`
  if (diffSecs < 604800) return `${Math.floor(diffSecs / 86400)}d ago`
  return new Date(dateStr).toLocaleDateString()
}

export function formatDuration(secs: number): string {
  const m = Math.floor(secs / 60)
  const s = secs % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export function formatScore(score: number | null): string {
  if (score === null) return '--'
  return `${Math.round(score)}%`
}
