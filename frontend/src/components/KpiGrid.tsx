import type { PlanDeltas } from '../types/api'

type Props = {
  deltas: PlanDeltas | null
  score: number | null
}

const metrics = [
  {
    key: 'eventsAvoided',
    label: 'Risk events avoided',
    prefix: '',
    suffix: '',
  },
  {
    key: 'severeAvoided',
    label: 'Severe outcomes avoided',
    prefix: '',
    suffix: '',
  },
  {
    key: 'costMitigatedM',
    label: 'Disruption cost mitigated',
    prefix: '$',
    suffix: 'M',
  },
  {
    key: 'overloadDaysAvoided',
    label: 'Capacity overload days avoided',
    prefix: '',
    suffix: '',
  },
] as const

export default function KpiGrid({ deltas, score }: Props) {
  const highlight = score != null ? score.toFixed(1) : '—'

  return (
    <div className="glass-panel">
      <div className="panel-header">
        <h2>Impact summary</h2>
      </div>
      <div className="stats-grid">
        <div className="stat-card score-card">
          <h3>{highlight}</h3>
          <p>Planner score</p>
        </div>
        {metrics.map((metric) => {
          const raw = deltas ? deltas[metric.key] : 0
          const value = metric.key === 'costMitigatedM' ? raw.toFixed(1) : raw.toLocaleString()
          return (
            <div key={metric.key} className="stat-card">
              <h3>
                {metric.prefix}
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
