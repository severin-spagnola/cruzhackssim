import type { PlanAction } from '../types/api'

type Props = {
  timeline: PlanAction[]
  reasons: string[]
}

export default function PlanTimeline({ timeline, reasons }: Props) {
  if (!timeline.length) {
    return <p className="empty-state">Timeline will appear once a plan is generated.</p>
  }

  return (
    <div className="glass-panel">
      <div className="panel-header">
        <h2>Recommended timeline</h2>
      </div>
      <ul className="timeline-list">
        {timeline.map((action) => (
          <li key={`${action.scope}-${action.day}-${action.title}`} className="timeline-item">
            <div className="meta">
              <span>Day {action.day}</span>
              <span>{action.scope}</span>
            </div>
            <h3>{action.title}</h3>
            <p>{action.description}</p>
            <div className="button-row" style={{ marginTop: '0.75rem' }}>
              {action.tags.map((tag) => (
                <span key={tag} className="pill">
                  {tag}
                </span>
              ))}
            </div>
          </li>
        ))}
      </ul>
      {reasons.length > 0 && (
        <div style={{ marginTop: '1rem' }}>
          <h3>Why this plan</h3>
          <ul className="why-list">
            {reasons.map((reason, index) => (
              <li key={`${reason}-${index}`}>{reason}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
