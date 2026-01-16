import type { ZoneHeat } from '../types/api'

type Props = {
  zoneHeat: ZoneHeat[]
}

export default function ZoneHeatmap({ zoneHeat }: Props) {
  if (!zoneHeat || !zoneHeat.length) {
    return <p className="empty-state">Zone heatmap will populate after planning.</p>
  }

  const visible = zoneHeat.slice(0, 9)
  const maxValue = Math.max(...visible.map((zone) => zone.value), 0.1)

  return (
    <div className="glass-panel">
      <div className="panel-header">
        <h2>Zone intensity</h2>
      </div>
      <div className="zone-grid">
        {visible.map((zone) => {
          const ratio = zone.value / maxValue
          const intensity = Math.min(1, Math.max(0.15, ratio))
          const alpha = (0.15 + intensity * 0.6).toFixed(2)
          return (
            <div
              key={zone.zone}
              className="zone-cell"
              style={{ background: `rgba(50, 224, 196, ${alpha})` }}
            >
              <span className="zone-label">{zone.zone}</span>
              <span className="zone-value">{(zone.value * 100).toFixed(0)}%</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
