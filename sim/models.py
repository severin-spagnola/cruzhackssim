from __future__ import annotations

from typing import List, Literal, Optional

from pydantic import BaseModel, Field

Region = Literal['SF Demo', 'Campus Demo']

class ScenarioConfig(BaseModel):
    region: Region = Field('SF Demo')
    horizonDays: int = Field(21, ge=14, le=28)
    initialEvents: int = Field(50, gt=0)
    intensity: int = Field(50, ge=0, le=100)
    compliance: int = Field(70, ge=0, le=100)
    objectiveWeight: int = Field(50, ge=0, le=100)
    seed: int = Field(1337, ge=0)

class SimPoint(BaseModel):
    day: int
    events: int
    capacityLoad: float
    economicIndex: float

class PlanAction(BaseModel):
    day: int
    scope: str
    title: str
    effects: List[str]

class PlanDeltas(BaseModel):
    eventsAvoided: int
    severeAvoided: int
    costMitigatedM: float
    overloadDaysAvoided: int

class ZoneHeat(BaseModel):
    zone: str
    value: float

class PlanResult(BaseModel):
    baseline: List[SimPoint]
    recommended: List[SimPoint]
    naive: List[SimPoint]
    timeline: List[PlanAction]
    reasons: List[str]
    zoneHeat: List[ZoneHeat]
    deltas: PlanDeltas
    score: float
    config: ScenarioConfig
    whatifDelay: Optional[int] = None

class WhatIfRequest(BaseModel):
    scenario: ScenarioConfig
    delayDays: int = Field(0, ge=0, le=7)
