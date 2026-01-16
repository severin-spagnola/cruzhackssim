import type { SimPoint } from '../types/api'
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

type Props = {
  baseline: SimPoint[]
  recommended: SimPoint[]
  naive: SimPoint[]
}

type MetricKey = keyof SimPoint

const chartInfos: { key: MetricKey; label: string; suffix: string }[] = [
  { key: 'infections', label: 'Active infections', suffix: '' },
  { key: 'hospitalLoad', label: 'Hospital load', suffix: ' beds' },
  { key: 'econIndex', label: 'Economic activity index', suffix: '' },
]

const makeChartData = (metric: MetricKey, baseline: SimPoint[], recommended: SimPoint[], naive: SimPoint[]) =>
  recommended.map((point, idx) => ({
    day: point.day,
    baseline: baseline[idx]?.[metric] ?? 0,
    recommended: point[metric],
    naive: naive[idx]?.[metric] ?? 0,
  }))

export default function OutcomeCharts({ baseline, recommended, naive }: Props) {
  if (!recommended.length) {
    return <p className="empty-state">Run a scenario to see outcome curves.</p>
  }

  return (
    <div className="charts-grid">
      {chartInfos.map((info) => {
        const data = makeChartData(info.key, baseline, recommended, naive)
        return (
          <div key={info.key} className="glass-panel chart-card">
            <div className="panel-header">
              <h2>{info.label}</h2>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={data} margin={{ top: 10, right: -10, left: -10, bottom: 0 }}>
                <CartesianGrid stroke="rgba(255,255,255,0.08)" />
                <XAxis dataKey="day" tick={{ fill: 'rgba(255,255,255,0.7)' }} />
                <YAxis tick={{ fill: 'rgba(255,255,255,0.7)' }} />
                <Tooltip
                  contentStyle={{
                    background: '#090e1a',
                    border: '1px solid rgba(255,255,255,0.15)',
                    borderRadius: '12px',
                  }}
                />
                <Legend wrapperStyle={{ color: 'rgba(255,255,255,0.75)' }} />
                <Line type="monotone" dataKey="baseline" stroke="rgba(255,255,255,0.4)" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="naive" stroke="#f97316" strokeDasharray="4 4" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="recommended" stroke="#32e0c4" strokeWidth={3} dot={{ r: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )
      })}
    </div>
  )
}
