export type Region = 'SF Demo' | 'Campus Demo'

export interface ScenarioConfig {
  region: Region
  horizonDays: 14 | 21 | 28
  initialEvents: number
  intensity: number
  compliance: number
  objectiveWeight: number
  seed?: number
}

export interface WhatIfRequest {
  scenario: ScenarioConfig
  delayDays: number
}

export interface SimPoint {
  day: number
  events: number
  capacityLoad: number
  economicIndex: number
}

export interface PlanAction {
  day: number
  scope: string
  title: string
  effects: string[]
}

export interface PlanDeltas {
  eventsAvoided: number
  severeAvoided: number
  costMitigatedM: number
  overloadDaysAvoided: number
}

export interface ZoneHeat {
  zone: string
  value: number
}

export interface PlanResult {
  baseline: SimPoint[]
  recommended: SimPoint[]
  naive: SimPoint[]
  timeline: PlanAction[]
  reasons: string[]
  zoneHeat: ZoneHeat[]
  deltas: PlanDeltas
  score: number
  config: ScenarioConfig
  whatifDelay?: number
}
