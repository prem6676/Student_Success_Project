from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from database import assessments_collection
import datetime

router = APIRouter(prefix="/api/assessments", tags=["assessments"])

class SaveAssessmentRequest(BaseModel):
    user_id: str
    category: str
    total_questions: int
    score: int
    score_percentage: float

@router.post("/save")
async def save_assessment(request: SaveAssessmentRequest):
    try:
        doc = {
            "user_id": request.user_id,
            "category": request.category,
            "total_questions": request.total_questions,
            "score": request.score,
            "score_percentage": request.score_percentage,
            "timestamp": datetime.datetime.utcnow()
        }
        result = await assessments_collection.insert_one(doc)
        return {"status": "success", "id": str(result.inserted_id)}
    except Exception as e:
        print(f"Error saving assessment: {e}")
        raise HTTPException(status_code=500, detail=str(e))
