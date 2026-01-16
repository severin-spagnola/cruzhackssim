import type { ChangeEvent } from 'react'
import type { ScenarioConfig } from '../types/api'

type Props = {
  scenario: ScenarioConfig
  loading: boolean
  onUpdate: (updates: Partial<ScenarioConfig>) => void
  onGenerate: () => void
  onReset: () => void
}

const regions = ['SF Demo', 'Campus Demo'] as const
const horizons = [14, 21, 28]

const numberUpdate = (fn: (value: number) => void) => (event: ChangeEvent<HTMLInputElement>) => {
  const value = Number(event.target.value)
  if (!Number.isNaN(value)) {
    fn(value)
  }
}

export default function ScenarioPanel({ scenario, loading, onUpdate, onGenerate, onReset }: Props) {
const objectiveSlider = scenario.objectiveWeight

  return (
    <section className="glass-panel" aria-label="Scenario setup">
      <div className="panel-header">
        <h2>Scenario setup</h2>
        <span className="text-muted">Seed {scenario.seed ?? 1337}</span>
      </div>

      <div className="section-split">
        <div className="control-group">
          <label htmlFor="region">Region</label>
          <select
            id="region"
            value={scenario.region}
            onChange={(event) => onUpdate({ region: event.target.value as ScenarioConfig['region'] })}
          >
            {regions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <div className="control-group">
          <label htmlFor="horizon">Horizon (days)</label>
          <select
            id="horizon"
            value={scenario.horizonDays}
            onChange={(event) =>
              onUpdate({ horizonDays: Number(event.target.value) as ScenarioConfig['horizonDays'] })
            }
          >
            {horizons.map((days) => (
              <option key={days} value={days}>
                {days}
              </option>
            ))}
          </select>
        </div>

        <div className="control-group">
          <label htmlFor="initialEvents">Initial events</label>
          <input
            id="initialEvents"
            type="range"
            min={10}
            max={400}
            step={5}
            value={scenario.initialEvents}
            onChange={numberUpdate((value) => onUpdate({ initialEvents: value }))}
          />
          <span className="range-value">{scenario.initialEvents} initial stress points</span>
        </div>

        <div className="control-group">
          <label htmlFor="intensity">Intensity slider</label>
          <input
            id="intensity"
            type="range"
            min={0}
            max={100}
            step={5}
            value={scenario.intensity}
            onChange={numberUpdate((value) => onUpdate({ intensity: value }))}
          />
          <span className="range-value">{scenario.intensity}% system intensity</span>
        </div>

        <div className="control-group">
          <label htmlFor="compliance">Compliance</label>
          <input
            id="compliance"
            type="range"
            min={0}
            max={100}
            step={5}
            value={scenario.compliance}
            onChange={numberUpdate((value) => onUpdate({ compliance: value }))}
          />
          <span className="range-value">{scenario.compliance}% adherence to guidance</span>
        </div>

        <div className="control-group">
          <label htmlFor="objective">Objective: Resilience vs Disruption</label>
          <input
            id="objective"
            type="range"
            min={0}
            max={100}
            step={5}
            value={objectiveSlider}
            onChange={(event) => onUpdate({ objectiveWeight: Number(event.target.value) })}
          />
          <span className="range-value">
            {objectiveSlider === 0
              ? 'Resilience focus'
              : objectiveSlider === 100
              ? 'Disruption focus'
              : `${objectiveSlider}% disruption tilt`}
          </span>
        </div>
      </div>

      <div className="button-row">
        <button className="button-secondary" onClick={onReset} type="button">
          Reset
        </button>
        <button className="button-primary" onClick={onGenerate} type="button" disabled={loading}>
          {loading ? 'Planning…' : 'Generate plan'}
        </button>
      </div>
    </section>
  )
}
