from __future__ import annotations

from typing import List, Literal, Optional

from pydantic import BaseModel, Field

Region = Literal['SF Demo', 'Campus Demo']

class ScenarioConfig(BaseModel):
    region: Region = Field('SF Demo')
    horizonDays: int = Field(21, gt=7, lt=61)
    initialCases: int = Field(50, gt=0)
    spread: float = Field(1.3, gt=0)
    compliance: float = Field(0.7, ge=0.3, le=1.0)
    healthWeight: float = Field(0.75, ge=0.0, le=1.0)
    seed: int = Field(1337, ge=0)

    class Config:
        schema_extra = {
            'example': {
                'region': 'SF Demo',
                'horizonDays': 21,
                'initialCases': 80,
                'spread': 1.4,
                'compliance': 0.7,
                'healthWeight': 0.75,
                'seed': 1337,
            }
        }

class SimPoint(BaseModel):
    day: int
    infections: float
    hospitalLoad: float
    econIndex: float

class PlanAction(BaseModel):
    day: int
    scope: str
    title: str
    description: str
    tags: List[str]

class PlanDeltas(BaseModel):
    infectionsAvoided: int
    deathsAvoided: int
    econLossMitigatedM: float
    hospOverCapDaysAvoided: int

class PlanResult(BaseModel):
    baseline: List[SimPoint]
    recommended: List[SimPoint]
    naive: List[SimPoint]
    timeline: List[PlanAction]
    reasons: List[str]
    zoneHeatmap: List[float]
    deltas: PlanDeltas
    config: ScenarioConfig
    whatifDelay: Optional[int] = None

class WhatIfRequest(BaseModel):
    scenario: ScenarioConfig
    delayDays: int = Field(0, ge=0, le=14)
