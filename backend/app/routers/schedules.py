from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List, Tuple
from ..core.scheduler import (
    parse_csv, group_by_course_section, backtrack_courses, compute_metrics,
    blocks_to_dict
)

class Preferences(BaseModel):
    earliest: int = Field(9, ge=0, le=23, description="Preferred earliest start hour (0-23)")
    latest: int = Field(18, ge=0, le=23, description="Preferred latest end hour (0-23)")
    limit: int = Field(10, ge=1, le=100, description="Top-N results to return")

class GenerateRequest(BaseModel):
    csv: str
    preferences: Preferences = Preferences()

router = APIRouter()

@router.post("/generate")
def generate(data: GenerateRequest):
    try:
        blocks = parse_csv(data.csv)
        cs = group_by_course_section(blocks)
        courses = sorted(cs.keys())
        if not courses:
            return {"count": 0, "solutions": []}

        solutions: List[Tuple[Dict[str, str], list]] = []
        backtrack_courses(courses, cs, 0, {}, [], solutions, max_solutions=5000)

        scored = []
        for choice, sched_blocks in solutions:
            m = compute_metrics(sched_blocks, data.preferences.earliest, data.preferences.latest)
            scored.append((m["score"], m, choice, sched_blocks))
        scored.sort(key=lambda x: x[0])
        top = scored[: data.preferences.limit]

        out = []
        for score, metrics, choice, sched_blocks in top:
            out.append({
                "choice": choice,
                "metrics": metrics,
                "blocks": [blocks_to_dict(b) for b in sched_blocks],
            })

        return {"count": len(solutions), "returned": len(out), "solutions": out}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
