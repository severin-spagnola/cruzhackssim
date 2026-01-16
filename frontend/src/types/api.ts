export type Region = 'SF Demo' | 'Campus Demo'

export interface ScenarioConfig {
  region: Region
  horizonDays: number
  initialCases: number
  spread: number
  compliance: number
  healthWeight: number
  seed?: number
}

export interface WhatIfRequest {
  scenario: ScenarioConfig
  delayDays: number
}

export interface SimPoint {
  day: number
  infections: number
  hospitalLoad: number
  econIndex: number
}

export interface PlanAction {
  day: number
  scope: string
  title: string
  description: string
  tags: string[]
}

export interface PlanDeltas {
  infectionsAvoided: number
  deathsAvoided: number
  econLossMitigatedM: number
  hospOverCapDaysAvoided: number
}

export interface PlanResult {
  baseline: SimPoint[]
  recommended: SimPoint[]
  naive: SimPoint[]
  timeline: PlanAction[]
  reasons: string[]
  zoneHeatmap: number[]
  deltas: PlanDeltas
  config: ScenarioConfig
  whatifDelay?: number
}
