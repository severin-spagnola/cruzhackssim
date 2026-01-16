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
  const objectiveSlider = Math.round((1 - scenario.healthWeight) * 100)

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
            onChange={(event) => onUpdate({ horizonDays: Number(event.target.value) })}
          >
            {horizons.map((days) => (
              <option key={days} value={days}>
                {days}
              </option>
            ))}
          </select>
        </div>

        <div className="control-group">
          <label htmlFor="initialCases">Initial cases</label>
          <input
            id="initialCases"
            type="range"
            min={10}
            max={400}
            step={5}
            value={scenario.initialCases}
            onChange={numberUpdate((value) => onUpdate({ initialCases: value }))}
          />
          <span className="range-value">{scenario.initialCases} active cases on day 0</span>
        </div>

        <div className="control-group">
          <label htmlFor="spread">Spread multiplier</label>
          <input
            id="spread"
            type="range"
            min={0.8}
            max={2.2}
            step={0.05}
            value={scenario.spread}
            onChange={numberUpdate((value) => onUpdate({ spread: value }))}
          />
          <span className="range-value">×{scenario.spread.toFixed(2)} transmission rate</span>
        </div>

        <div className="control-group">
          <label htmlFor="compliance">Compliance</label>
          <input
            id="compliance"
            type="range"
            min={0.4}
            max={0.95}
            step={0.05}
            value={scenario.compliance}
            onChange={numberUpdate((value) => onUpdate({ compliance: value }))}
          />
          <span className="range-value">{(scenario.compliance * 100).toFixed(0)}% population complying</span>
        </div>

        <div className="control-group">
          <label htmlFor="objective">Objective: Health vs Economy</label>
          <input
            id="objective"
            type="range"
            min={0}
            max={100}
            step={5}
            value={objectiveSlider}
            onChange={numberUpdate((value) => onUpdate({ healthWeight: 1 - value / 100 }))}
          />
          <span className="range-value">
            {objectiveSlider === 0
              ? 'Health focus'
              : objectiveSlider === 100
              ? 'Economy focus'
              : `${objectiveSlider}% economy tilt`}
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
