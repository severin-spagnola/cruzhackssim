from __future__ import annotations

import random
from typing import List

from . import models

_BASE_ACTIONS = [
    (0, 'Citywide', 'Activate protective guidance', ['Guidance', 'Visibility']),
    (3, 'District', 'Focus on high-stress nodes', ['Targeted support', 'Testing']),
    (7, 'Network', 'Adjust mobility and services', ['Transit shift', 'Spacing rules']),
    (14, 'System', 'Phase in conditional easing', ['Review metrics', 'Pulse surveys']),
]

_ZONE_NAMES = ['Zone A', 'Zone B', 'Zone C', 'Zone D', 'Zone E', 'Zone F', 'Zone G', 'Zone H', 'Zone I']


def _seeded_random(seed: int) -> random.Random:
    return random.Random(seed)


def _clamp(value: float, minimum: float, maximum: float) -> float:
    return max(minimum, min(maximum, value))


def _build_sim_points(
    config: models.ScenarioConfig,
    compliance_boost: int,
    intensity_factor: float,
    econ_bias: float,
    noise_seed: int,
) -> List[models.SimPoint]:
    seed = config.seed + noise_seed
    rng = _seeded_random(seed)
    compliance = int(_clamp(config.compliance + compliance_boost, 0, 100))
    base_events = config.initialEvents * (1 + config.intensity / 120)
    points: List[models.SimPoint] = []
    for day in range(config.horizonDays):
        horizon_ratio = day / max(1, config.horizonDays - 1)
        noise = 1 + (rng.random() - 0.5) * 0.12
        events = max(
            config.initialEvents,
            base_events * (1 + intensity_factor * horizon_ratio) * (1 - compliance / 200) * noise,
        )
        capacity_load = events * (0.09 + (100 - compliance) * 0.005) + day * 1.2
        econ_index = _clamp(98 - events / (base_events + 5) * 8 - horizon_ratio * econ_bias, 42, 100)
        points.append(
            models.SimPoint(
                day=day,
                events=int(round(events)),
                capacityLoad=round(capacity_load, 1),
                economicIndex=round(econ_index, 1),
            )
        )
    return points


def _build_timeline(config: models.ScenarioConfig) -> List[models.PlanAction]:
    actions: List[models.PlanAction] = []
    for day, scope, title, effects in _BASE_ACTIONS:
        if day <= config.horizonDays:
            actions.append(models.PlanAction(day=day, scope=scope, title=title, effects=effects))
    return actions


def _build_zone_heat(config: models.ScenarioConfig, delay_days: int) -> List[models.ZoneHeat]:
    rng = _seeded_random(config.seed + delay_days * 21)
    base = 0.25 + config.intensity / 200 + delay_days * 0.02
    heat: List[models.ZoneHeat] = []
    for zone in _ZONE_NAMES:
        noise = rng.random() * 0.2
        value = _clamp(base + noise + (ord(zone[0]) % 5) * 0.01, 0, 1)
        heat.append(models.ZoneHeat(zone=zone, value=round(value, 2)))
    return heat


def _sum_events(points: List[models.SimPoint]) -> int:
    return sum(point.events for point in points)


def _count_overload(points: List[models.SimPoint], threshold: float = 160.0) -> int:
    return sum(1 for point in points if point.capacityLoad > threshold)


def _build_result(config: models.ScenarioConfig, delay_days: int) -> models.PlanResult:
    baseline = _build_sim_points(config, 0, 0.7, 40, 7)
    recommended = _build_sim_points(config, 6, 0.4, 30, 13 - delay_days)
    naive = _build_sim_points(config, -12, 1.0, 60, 19)

    events_avoided = max(0, _sum_events(baseline) - _sum_events(recommended))
    severe_avoided = max(0, int(events_avoided * 0.015))
    cost_mitigated = round(max(0, _sum_events(naive) - _sum_events(recommended)) * 0.001, 1)
    overload_days = max(0, _count_overload(naive) - _count_overload(recommended))

    score = _clamp(64 + (config.compliance - delay_days * 2) * 0.3 - config.intensity * 0.1 + config.objectiveWeight * 0.15, 45, 100)

    reasons = [
        'Early activation keeps pressure predictable and schedules capacity.',
        f'{config.region} mix blends resilience ({config.objectiveWeight}%) with workflow continuity.',
        'Phase-based easing waits until measurable slack appears before relaxing rules.',
    ]
    if delay_days > 0:
        plural = '' if delay_days == 1 else 's'
        reasons.append(f'Delayed protective guidance by {delay_days} day{plural}, lifting peak stress.')

    return models.PlanResult(
        baseline=baseline,
        recommended=recommended,
        naive=naive,
        timeline=_build_timeline(config),
        reasons=reasons,
        zoneHeat=_build_zone_heat(config, delay_days),
        deltas=models.PlanDeltas(
            eventsAvoided=events_avoided,
            severeAvoided=severe_avoided,
            costMitigatedM=cost_mitigated,
            overloadDaysAvoided=overload_days,
        ),
        score=float(round(score, 1)),
        config=config,
        whatifDelay=delay_days or None,
    )


def plan(config: models.ScenarioConfig) -> models.PlanResult:
    return _build_result(config, 0)


def what_if(config: models.ScenarioConfig, delay_days: int) -> models.PlanResult:
    return _build_result(config, delay_days)
