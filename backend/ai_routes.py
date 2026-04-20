from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
import os
from groq import Groq

router = APIRouter(prefix="/api/ai", tags=["ai"])


# ─── Chat with Groq ───────────────────────────────────────────────────────────

class ChatMessage(BaseModel):
    role: str      # "user" or "assistant"
    content: str

class ChatRequest(BaseModel):
    messages: List[ChatMessage]

@router.post("/chat")
async def chat(request: ChatRequest):
    """Chat endpoint powered by Groq — used by the ChatBot component."""
    try:
        client = Groq(api_key=os.environ.get("VITE_GROQ_API_KEY"))

        full_messages = [
            {
                "role": "system",
                "content": (
                    "You are a helpful AI assistant embedded in a Resume Analyzer & Career Preparation platform. "
                    "You help users with:\n"
                    "- Resume analysis and improvement tips\n"
                    "- Skill assessment guidance\n"
                    "- Mock interview preparation\n"
                    "- Job search strategies\n"
                    "- Placement preparation\n"
                    "- Learning resources for Java, Python, DSA, Web Development, Database, and Data Science\n\n"
                    "When a user asks for resources on any topic, always mention that the Resources page "
                    "in this platform has curated materials for that topic and suggest they visit it. "
                    "Be concise, friendly, and actionable. "
                    "Format responses clearly with bullet points or numbered lists when appropriate."
                ),
            }
        ] + [{"role": m.role, "content": m.content} for m in request.messages]

        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=full_messages,
            max_tokens=1000,
            temperature=0.7,
        )

        return {"content": response.choices[0].message.content}

    except Exception as e:
        print(f"❌ Chat error: {e}")
        raise HTTPException(status_code=500, detail=f"Chat failed: {str(e)}")


# ─── Save interview result ────────────────────────────────────────────────────

class SaveInterviewRequest(BaseModel):
    user_id: str
    job_role: str
    total_score: int
    communication_score: int
    technical_score: int
    confidence_score: int
    grade: str
    questions_answered: int

@router.post("/save-interview")
async def save_interview(request: SaveInterviewRequest):
    """
    Persist a completed mock interview to MongoDB.
    user_id is stored as a plain string — matches dashboard stats query.
    """
    from database import interviews_collection

    try:
        doc = {
            "user_id": request.user_id,
            "job_role": request.job_role,
            "total_score": request.total_score,
            "communication_score": request.communication_score,
            "technical_score": request.technical_score,
            "confidence_score": request.confidence_score,
            "grade": request.grade,
            "questions_answered": request.questions_answered,
            "completed_at": datetime.utcnow(),
        }

        result = await interviews_collection.insert_one(doc)
        print(f"✅ Interview saved with id={result.inserted_id} for user_id={request.user_id}")

        return {"success": True, "id": str(result.inserted_id)}

    except Exception as e:
        print(f"❌ Error saving interview: {repr(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to save interview: {str(e)}")
