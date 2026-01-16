import type { PlanResult } from '../types/api'

type Props = {
  zoneHeatmap: PlanResult['zoneHeatmap']
}

export default function ZoneHeatmap({ zoneHeatmap }: Props) {
  if (!zoneHeatmap || !zoneHeatmap.length) {
    return <p className="empty-state">Zone heatmap will populate after planning.</p>
  }

  const maxValue = Math.max(...zoneHeatmap, 0.1)

  return (
    <div className="glass-panel">
      <div className="panel-header">
        <h2>Zone intensity</h2>
      </div>
      <div className="zone-grid">
        {zoneHeatmap.map((relative, index) => {
          const normalized = relative / maxValue
          const intensity = Math.min(1, Math.max(0.15, normalized))
          const alpha = (0.15 + intensity * 0.6).toFixed(2)
          return (
            <div
              key={`zone-${index}`}
              className="zone-cell"
              style={{ background: `rgba(50, 224, 196, ${alpha})` }}
            >
              <span className="zone-label">Z{index + 1}</span>
              <span className="zone-value">{(relative * 100).toFixed(0)}%</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
