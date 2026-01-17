from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parents[2]
sys.path.append(str(ROOT_DIR))

from sim import mock_engine, models


def main() -> None:
    config = models.ScenarioConfig(
        region='SF Demo',
        horizonDays=21,
        initialEvents=80,
        intensity=60,
        compliance=76,
        objectiveWeight=30,
        seed=1337,
    )
    result = mock_engine.plan(config)
    destination = Path(__file__).resolve().parents[1] / 'tests' / 'golden_plan_result.json'
    destination.parent.mkdir(parents=True, exist_ok=True)
    with destination.open('w', encoding='utf-8') as handle:
        json.dump(result.model_dump(), handle, indent=2)


if __name__ == '__main__':
    main()
