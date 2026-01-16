import { useEffect, useState } from 'react'
import ScenarioPanel from './components/ScenarioPanel'
import WhatIfPanel from './components/WhatIfPanel'
import KpiGrid from './components/KpiGrid'
import OutcomeCharts from './components/OutcomeCharts'
import PlanTimeline from './components/PlanTimeline'
import ZoneHeatmap from './components/ZoneHeatmap'
import { fetchPlan, fetchWhatIf } from './api'
import { mockPlan, mockWhatIf } from './mockPlan'
import type { PlanResult, ScenarioConfig } from './types/api'

const defaultScenario: ScenarioConfig = {
  region: 'SF Demo',
  horizonDays: 21,
  initialEvents: 80,
  intensity: 60,
  compliance: 76,
  objectiveWeight: 30,
  seed: 1337,
}

function App() {
  const [scenario, setScenario] = useState(defaultScenario)
  const [planResult, setPlanResult] = useState<PlanResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [whatIfLoading, setWhatIfLoading] = useState(false)
  const [whatIfDelay, setWhatIfDelay] = useState(0)
  const [offlineMode, setOfflineMode] = useState(false)

  const runPlan = async (payload: ScenarioConfig) => {
    setLoading(true)
    try {
      const result = await fetchPlan(payload)
      setPlanResult(result)
      setScenario(result.config)
      setOfflineMode(false)
    } catch (error) {
      console.error('Plan request failed', error)
      setOfflineMode(true)
      const fallback = mockPlan(payload)
      setPlanResult(fallback)
      setScenario(fallback.config)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void runPlan(defaultScenario)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleGenerate = () => {
    void runPlan({ ...scenario, seed: scenario.seed ?? 1337 })
  }

  const handleReset = () => {
    setScenario(defaultScenario)
    setWhatIfDelay(0)
    void runPlan(defaultScenario)
  }

  const handleWhatIf = async () => {
    if (!planResult) return
    setWhatIfLoading(true)
    try {
      const next = await fetchWhatIf({ scenario: planResult.config, delayDays: whatIfDelay })
      setPlanResult(next)
      setOfflineMode(false)
    } catch (error) {
      console.error('What-if failed', error)
      setOfflineMode(true)
      const fallback = mockWhatIf(planResult.config, whatIfDelay)
      setPlanResult(fallback)
    } finally {
      setWhatIfLoading(false)
    }
  }

  const updateScenario = (updates: Partial<ScenarioConfig>) => {
    setScenario((prev) => ({ ...prev, ...updates }))
  }

  return (
    <main>
      {offlineMode && (
        <div className="glass-panel" style={{ marginBottom: '1rem' }}>
          <p style={{ margin: 0, color: 'var(--text-muted)' }}>Planner backend is unavailable; showing local mock data.</p>
        </div>
      )}
      <div className="page-heading">
        <h1>Local Scenario Planner</h1>
        <p>Configure a regional scenario, generate an action timeline, and compare impact across baselines and naive alternatives.</p>
      </div>

      <div className="columns">
        <div className="section-split" style={{ flex: 1, minWidth: '280px' }}>
          <ScenarioPanel
            scenario={scenario}
            loading={loading}
            onUpdate={updateScenario}
            onGenerate={handleGenerate}
            onReset={handleReset}
          />
          <WhatIfPanel delayDays={whatIfDelay} loading={whatIfLoading} onChange={setWhatIfDelay} onSubmit={handleWhatIf} />
        </div>
        <div className="dashboard">
          <KpiGrid deltas={planResult?.deltas ?? null} score={planResult?.score ?? null} />
          <OutcomeCharts
            baseline={planResult?.baseline ?? []}
            recommended={planResult?.recommended ?? []}
            naive={planResult?.naive ?? []}
          />
          <div className="columns" style={{ marginTop: '1rem' }}>
            <PlanTimeline timeline={planResult?.timeline ?? []} reasons={planResult?.reasons ?? []} />
            <ZoneHeatmap zoneHeat={planResult?.zoneHeat ?? []} />
          </div>
        </div>
      </div>
    </main>
  )
}

export default App
