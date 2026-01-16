from __future__ import annotations

import math
import random
from typing import List

from . import models

_BASE_ACTIONS = [
    (0, 'Citywide', 'Mask mandate', 'Enforce masks in all indoor public spaces and transit.', ['mask']),
    (3, 'District', 'Targeted restrictions', 'Limit gatherings in high-transmission zones and boost testing.', ['targeted']),
    (7, 'Transit', 'Transit capacity shift', 'Cap transit occupancy at 60% and expand outdoor routes.', ['transit']),
    (14, 'Statewide', 'Conditional easing', 'Easing only if hospital load stays below threshold.', ['easing']),
]


def _clamped(value: float, minimum: float, maximum: float) -> float:
    return max(minimum, min(maximum, value))


def _build_sim_points(
    config: models.ScenarioConfig,
    peak_multiplier: float,
    rate_offset: float,
    compliance_offset: float,
    noise_seed: int,
    econ_bias: float,
) -> List[models.SimPoint]:
    rng = random.Random(config.seed + noise_seed)
    compliance = _clamped(config.compliance + compliance_offset, 0.3, 0.95)
    center = config.horizonDays / 2
    base_peak = config.initialCases * (1 + config.spread * 6)
    peak = base_peak * peak_multiplier
    rate = 0.25 + config.spread * 0.02 + rate_offset - compliance * 0.01

    points: List[models.SimPoint] = []
    for day in range(config.horizonDays):
        logistic = peak / (1 + math.exp(-rate * (day - center)))
        noise = 1 + (rng.random() - 0.5) * 0.08
        infections = max(config.initialCases, logistic * noise)
        hospital_load = infections * (0.08 + (1 - compliance) * 0.05 + config.healthWeight * 0.02) + day * 1.5
        econ_base = 96 - infections / (peak + config.initialCases) * 10 - day * (1 - econ_bias) * 0.35
        econ_index = _clamped(econ_base + config.healthWeight * 2 + compliance * 5, 48, 100)
        points.append(
            models.SimPoint(
                day=day,
                infections=round(infections, 1),
                hospitalLoad=round(hospital_load, 1),
                econIndex=round(econ_index, 1),
            ),
        )
    return points


def _build_timeline(config: models.ScenarioConfig) -> List[models.PlanAction]:
    actions: List[models.PlanAction] = []
    for day, scope, title, description, tags in _BASE_ACTIONS:
        if day <= config.horizonDays:
            actions.append(
                models.PlanAction(
                    day=day,
                    scope=scope,
                    title=title,
                    description=f"{description} for the {config.region} footprint.",
                    tags=tags,
                ),
            )
    return actions


def _build_zone_heatmap(config: models.ScenarioConfig, delay_days: int) -> List[float]:
    rng = random.Random(config.seed + delay_days * 13)
    base = 0.35 + (config.spread - 1.0) * 0.15
    adjustment = delay_days * 0.03
    zones: List[float] = []
    for idx in range(9):
        noise = rng.random() * 0.25
        value = _clamped(base + adjustment + noise + (idx / 20), 0, 1)
        zones.append(round(value, 2))
    return zones


def _count_over_capacity(points: List[models.SimPoint], threshold: float = 165.0) -> int:
    return sum(1 for point in points if point.hospitalLoad > threshold)


def _summed_infections(points: List[models.SimPoint]) -> float:
    return sum(point.infections for point in points)


def plan_result(config: models.ScenarioConfig, delay_days: int = 0) -> models.PlanResult:
    baseline = _build_sim_points(config, 1.05, 0.05, 0.0, 5, config.healthWeight)
    recommended = _build_sim_points(
        config,
        0.8,
        -0.03,
        -delay_days * 0.02,
        11,
        config.healthWeight,
    )
    naive = _build_sim_points(config, 1.2, 0.08, -0.25, 17, 0.4)

    infections_delta = max(0, int(_summed_infections(baseline) - _summed_infections(recommended)))
    deaths_delta = max(0, int(infections_delta * 0.014 + 0.5))
    econ_delta = round(max(0, _summed_infections(naive) - _summed_infections(recommended)) * 0.001, 1)
    hosp_delta = max(0, _count_over_capacity(naive) - _count_over_capacity(recommended))

    deltas = models.PlanDeltas(
        infectionsAvoided=infections_delta,
        deathsAvoided=deaths_delta,
        econLossMitigatedM=econ_delta,
        hospOverCapDaysAvoided=hosp_delta,
    )

    reasons = [
        'Early mask mandate keeps transmission predictable across zones.',
        f'{config.region} timeline balances health focus ({int(config.healthWeight * 100)}%) with essential commerce.',
        'Phased easing depends on measurable hospital slack to avoid reactive shutdowns.',
    ]
    if delay_days:
        reasons.append(f'Delaying the mask mandate by {delay_days} day{"s" if delay_days != 1 else ""} increases peak pressure.')

    return models.PlanResult(
        baseline=baseline,
        recommended=recommended,
        naive=naive,
        timeline=_build_timeline(config),
        reasons=reasons,
        zoneHeatmap=_build_zone_heatmap(config, delay_days),
        deltas=deltas,
        config=config,
        whatifDelay=delay_days or None,
    )


def plan(config: models.ScenarioConfig) -> models.PlanResult:
    return plan_result(config, delay_days=0)


def what_if(config: models.ScenarioConfig, delay_days: int) -> models.PlanResult:
    return plan_result(config, delay_days=delay_days)
