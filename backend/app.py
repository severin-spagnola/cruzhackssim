import hashlib
import json

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from sim import mock_engine, models

app = FastAPI(title='CruzHacksSim API', version='0.1')
app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)

_CACHE: dict[str, models.PlanResult] = {}


def _cache_key(route: str, payload: dict) -> str:
    signature = json.dumps({'route': route, 'payload': payload}, sort_keys=True)
    return hashlib.sha256(signature.encode()).hexdigest()


@app.get('/api/health')
async def health() -> dict[str, str]:
    return {'status': 'ok'}


@app.post('/api/plan', response_model=models.PlanResult)
async def plan(config: models.ScenarioConfig) -> models.PlanResult:
    cache_key = _cache_key('plan', config.dict())
    if cache_key in _CACHE:
        return _CACHE[cache_key]
    result = mock_engine.plan(config)
    _CACHE[cache_key] = result
    return result


@app.post('/api/whatif', response_model=models.PlanResult)
async def what_if(request: models.WhatIfRequest) -> models.PlanResult:
    cache_key = _cache_key('whatif', {
        'scenario': request.scenario.dict(),
        'delayDays': request.delayDays,
    })
    if cache_key in _CACHE:
        return _CACHE[cache_key]
    result = mock_engine.what_if(request.scenario, request.delayDays)
    _CACHE[cache_key] = result
    return result
