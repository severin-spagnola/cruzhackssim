import type { PlanDeltas } from '../types/api'

type Props = {
  deltas: PlanDeltas | null
}

const metrics = [
  {
    key: 'infectionsAvoided',
    label: 'Infections avoided',
    suffix: '',
  },
  {
    key: 'deathsAvoided',
    label: 'Deaths avoided (est.)',
    suffix: '',
  },
  {
    key: 'econLossMitigatedM',
    label: 'Economic loss mitigated',
    suffix: 'M',
  },
  {
    key: 'hospOverCapDaysAvoided',
    label: 'Hospital over-capacity days avoided',
    suffix: '',
  },
] as const

export default function KpiGrid({ deltas }: Props) {
  return (
    <div className="glass-panel">
      <div className="panel-header">
        <h2>Key performance</h2>
      </div>
      <div className="stats-grid">
        {metrics.map((metric) => {
          const raw = deltas ? deltas[metric.key] : 0
          const value = metric.key === 'econLossMitigatedM' ? raw.toFixed(1) : raw.toLocaleString()
          return (
            <div key={metric.key} className="stat-card">
              <h3>
                {metric.key === 'econLossMitigatedM' ? '$' : ''}
                {value}
                {metric.suffix}
              </h3>
              <p>{metric.label}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
