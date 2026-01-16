type Props = {
  delayDays: number
  loading: boolean
  onChange: (value: number) => void
  onSubmit: () => void
}

export default function WhatIfPanel({ delayDays, loading, onChange, onSubmit }: Props) {
  return (
    <section className="glass-panel" aria-label="What-if analysis">
      <div className="panel-header">
        <h2>What-if</h2>
        <span className="text-muted">Mask mandate delay</span>
      </div>
      <div className="control-group">
        <label htmlFor="delay">Delay mask mandate (days)</label>
        <input
          id="delay"
          type="range"
          min={0}
          max={7}
          step={1}
          value={delayDays}
          onChange={(event) => onChange(Number(event.target.value))}
        />
        <span className="range-value">{delayDays} day{delayDays === 1 ? '' : 's'} delay</span>
      </div>
      <div className="button-row">
        <button className="button-primary" onClick={onSubmit} type="button" disabled={loading}>
          {loading ? 'Re-evaluating…' : 'Recompute plan'}
        </button>
      </div>
    </section>
  )
}
