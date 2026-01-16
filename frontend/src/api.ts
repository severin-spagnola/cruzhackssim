import type { PlanResult, ScenarioConfig, WhatIfRequest } from './types/api'

const headers = {
  'Content-Type': 'application/json',
}

async function request<T>(endpoint: string, payload: unknown): Promise<T> {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`API request failed: ${response.status} ${response.statusText} ${text}`)
  }

  return response.json()
}

export function fetchPlan(config: ScenarioConfig): Promise<PlanResult> {
  return request('/api/plan', config)
}

export function fetchWhatIf(payload: WhatIfRequest): Promise<PlanResult> {
  return request('/api/whatif', payload)
}
