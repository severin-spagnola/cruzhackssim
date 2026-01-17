import json
import sys
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parents[1]
REPO_ROOT = ROOT_DIR.parent
sys.path.extend([str(ROOT_DIR), str(REPO_ROOT)])

from fastapi.testclient import TestClient

from app.main import app
from sim import models

client = TestClient(app)

BASE_SCENARIO = {
    "region": "SF Demo",
    "horizonDays": 21,
    "initialEvents": 80,
    "intensity": 60,
    "compliance": 76,
    "objectiveWeight": 30,
    "seed": 1337,
}


def assert_plan_shape(payload: dict[str, object]) -> None:
    assert "score" in payload
    assert "deltas" in payload
    assert "reasons" in payload
    assert "timeline" in payload
    assert "zoneHeat" in payload
    for key in ("baseline", "recommended", "naive"):
        series = payload.get(key)
        assert isinstance(series, list)
        assert series, f"{key} series should not be empty"
        sample = series[0]
        for field in ("day", "events", "capacityLoad", "economicIndex"):
            assert field in sample

    deltas = payload["deltas"]
    for metric in ("eventsAvoided", "severeAvoided", "costMitigatedM", "overloadDaysAvoided"):
        assert metric in deltas


def test_plan_endpoint_returns_valid_planresult():
    response = client.post("/api/plan", json=BASE_SCENARIO)
    assert response.status_code == 200
    data = response.json()
    assert_plan_shape(data)


def test_whatif_endpoint_returns_valid_planresult():
    payload = {"scenario": BASE_SCENARIO, "delayDays": 2}
    response = client.post("/api/whatif", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert_plan_shape(data)


def test_golden_plan_result_remains_structurally_valid():
    path = Path(__file__).parent / "golden_plan_result.json"
    assert path.exists(), "Golden snapshot is missing"
    golden = json.loads(path.read_text())
    models.PlanResult.model_validate(golden)
