/**
 * Circular progress indicator.
 * @param {number} value  - current step (1-indexed)
 * @param {number} total  - total steps
 * @param {number} size   - diameter in px (default 64)
 */
export default function ProgressCircle({ value, total, size = 64 }) {
  const radius = (size - 8) / 2
  const circumference = 2 * Math.PI * radius
  const progress = total > 0 ? value / total : 0
  const offset = circumference - progress * circumference

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth={6}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#29b8dc"
          strokeWidth={6}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.4s ease' }}
        />
      </svg>
      <span className="text-xs text-muted font-medium">
        {value} / {total}
      </span>
    </div>
  )
}
