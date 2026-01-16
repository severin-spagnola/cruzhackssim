import type { PlanResult, ScenarioConfig, ZoneHeat } from './types/api'
import type { SimPoint } from './types/api'

const ACTIONS = [
  {
    day: 0,
    scope: 'Citywide',
    title: 'Activate protective guidance',
    effects: ['Guidance', 'Visibility'],
  },
  {
    day: 3,
    scope: 'District',
    title: 'Focus on high-stress nodes',
    effects: ['Target testing', 'Focused support'],
  },
  {
    day: 7,
    scope: 'Network',
    title: 'Adjust mobility and services',
    effects: ['Transit shift', 'Spacing rules'],
  },
  {
    day: 14,
    scope: 'System',
    title: 'Phase in conditional easing',
    effects: ['Review metrics', 'Pulse surveys'],
  },
]

const ZONES = ['Zone A', 'Zone B', 'Zone C', 'Zone D', 'Zone E', 'Zone F', 'Zone G', 'Zone H', 'Zone I']

const seededRandom = (seed: number) => {
  let value = seed % 2147483647
  return () => {
    value = (value * 48271) % 2147483647
    return (value - 1) / 2147483646
  }
}

const buildSeries = (
  config: ScenarioConfig,
  complianceBoost: number,
  intensityFactor: number,
  econBias: number,
  noiseSeed: number,
): SimPoint[] => {
  const rng = seededRandom((config.seed ?? 1337) + noiseSeed)
  const compliance = Math.max(0, Math.min(100, config.compliance + complianceBoost))
  const baseEvents = config.initialEvents * (1 + config.intensity / 120)
  const steps: SimPoint[] = []
  for (let day = 0; day < config.horizonDays; day += 1) {
    const horizonRatio = day / Math.max(1, config.horizonDays - 1)
    const noise = 1 + (rng() - 0.5) * 0.12
    const events = Math.max(
      config.initialEvents,
      baseEvents * (1 + intensityFactor * horizonRatio) * (1 - compliance / 200) * noise,
    )
    const capacityLoad = events * (0.09 + (100 - compliance) * 0.005) + day * 1.2
    const economicIndex = Math.max(42, 98 - events / (baseEvents + 5) * 8 - horizonRatio * econBias)
    steps.push({
      day,
      events: Math.round(events),
      capacityLoad: Math.round(capacityLoad),
      economicIndex: Number(economicIndex.toFixed(1)),
    })
  }
  return steps
}

const buildZoneHeat = (config: ScenarioConfig, delayDays: number): ZoneHeat[] => {
  const rng = seededRandom((config.seed ?? 1337) + delayDays * 21)
  const base = 0.25 + config.intensity / 200 + delayDays * 0.02
  const result: ZoneHeat[] = []
  for (const zone of ZONES) {
    const noise = rng() * 0.2
    const value = Math.max(0, Math.min(1, base + noise + (zone.charCodeAt(0) % 5) * 0.01))
    result.push({ zone, value })
  }
  return result
}

const buildResult = (config: ScenarioConfig, delayDays: number): PlanResult => {
  const normalized = { ...config, seed: config.seed ?? 1337 }
  const baseline = buildSeries(normalized, 0, 0.7, 40, 7)
  const recommended = buildSeries(normalized, 6, 0.4, 30, 13 - delayDays)
  const naive = buildSeries(normalized, -12, 1.0, 60, 19)

  const sum = (series: SimPoint[]) => series.reduce((total, point) => total + point.events, 0)
  const eventsAvoided = Math.max(0, Math.round(sum(baseline) - sum(recommended)))
  const severeAvoided = Math.max(0, Math.round(eventsAvoided * 0.015))
  const costMitigatedM = Number(Math.max(0, sum(naive) - sum(recommended)) * 0.001).toFixed(1)
  const overloadDaysAvoided = Math.max(0, Math.round(sum(naive) / 500 - sum(recommended) / 600))

  const score = Math.min(100, Math.max(45, 64 + (normalized.compliance - delayDays * 2) * 0.3 - normalized.intensity * 0.1 + normalized.objectiveWeight * 0.15))

  const reasons = [
    'Early activation shapes the wave and keeps pressure predictable.',
    `${normalized.region} plan balances resilience (${normalized.objectiveWeight}%) with normal operations.`,
    'Phase-based easing waits for measurable slack before relaxing restrictions.',
  ]
  if (delayDays > 0) {
    reasons.push(`Delayed guidance by ${delayDays} day${delayDays === 1 ? '' : 's'}, which lifts peak further.`)
  }

  return {
    baseline,
    recommended,
    naive,
    timeline: ACTIONS.filter((action) => action.day <= normalized.horizonDays).map((action) => ({
      day: action.day,
      scope: action.scope,
      title: action.title,
      effects: action.effects,
    })),
    reasons,
    zoneHeat: buildZoneHeat(normalized, delayDays),
    deltas: {
      eventsAvoided,
      severeAvoided,
      costMitigatedM: Number(costMitigatedM),
      overloadDaysAvoided,
    },
    score: Number(score.toFixed(1)),
    config: normalized,
    whatifDelay: delayDays || undefined,
  }
}

export const mockPlan = (config: ScenarioConfig): PlanResult => buildResult(config, 0)
export const mockWhatIf = (config: ScenarioConfig, delayDays: number): PlanResult => buildResult(config, delayDays)
