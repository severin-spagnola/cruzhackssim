# CruzHacksSim

Wireframe MVP for the **Local Scenario Planner** decision engine demo that pairs a polished UI with a deterministic placeholder simulator.

```
cruzhackssim/
  frontend/  # Vite + React + TS experience
  backend/   # FastAPI REST wrapper
  sim/       # Pure Python simulator / planner
```

## Running the backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

CORS lets the frontend proxy `/api` calls to `http://localhost:8000`.

## Backend tests

```bash
cd backend
pytest
```

`pytest` exercises `/api/plan`, `/api/whatif`, and validates the golden snapshot in `backend/tests/golden_plan_result.json`. The golden file is treated as a structural contract (schema shape only), so small simulator tuning won't break the test unless fields are added/removed.

## Running the frontend

```bash
cd frontend
npm install
npm run dev -- --host 0.0.0.0 --port 5173
```

Vite proxies `/api` to the backend automatically.

## Running both together

Launch the backend first, then `npm run dev` in the frontend directory. The UI talks to `/api/plan` and `/api/whatif` via the proxy; offline demos fall back to a local mock generator.

## Notes

- `sim/` exposes a pure Python engine that consumes slider-driven scenarios plus a seed and returns consistent `PlanResult`s; the backend merely proxies to it.
- This MVP prioritizes polish and structure, so the simulator can be swapped for a high-performance or GPU-scaled planner (such as for an NVIDIA hackathon build) without touching the UI or REST layer.
