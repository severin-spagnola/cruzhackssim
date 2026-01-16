# CruzHacksSim

Wireframe MVP for the **Local Outbreak Planner** decision-engine demo tailored to CruzHacks. Built as a structured monorepo with:

- **sim/** – deterministic placeholder simulator and planner logic.
- **backend/** – FastAPI wrapper exposing `/api/*` routes.
- **frontend/** – Vite + React + TypeScript experience with charts, timeline, heatmap, and what-if controls.

## Running the backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app:app --reload --port 8000
```

CORS is enabled so the frontend can proxy requests to `http://localhost:8000/api/*`.

## Running the frontend

```bash
cd frontend
npm install
npm run dev -- --host 0.0.0.0 --port 5173
```

Vite automatically proxies `/api` to the backend, so no extra config is required locally.

## Running both together

Start the backend first (`uvicorn ... --port 8000`), then launch the frontend dev server in another shell. The UI will hit `http://localhost:8000/api/plan` and `/api/whatif` through the proxy.

## Notes

- The simulation library is pure Python and deterministic: it accepts a seed plus scenario sliders and returns realistic-looking curves, timelines, deltas, and zone maps, but it is intentionally lightweight/placeholding.
- This MVP is designed for polish over fidelity; the architecture keeps `sim/` isolated so a future GPU-scaled planner (e.g., the NVIDIA hackathon effort) can swap in a real simulator without touching the UI or REST layer.
