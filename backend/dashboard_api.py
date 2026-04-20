from fastapi import APIRouter, HTTPException
from typing import List, Optional
from database import assessments_collection, resumes_collection, interviews_collection, users_collection
from bson import ObjectId
import datetime

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])

def serialize_doc(doc):
    if doc and "_id" in doc:
        doc["_id"] = str(doc["_id"])
    return doc

@router.get("/stats/{user_id}")
async def get_dashboard_stats(user_id: str):
    try:
        assessments_count = await assessments_collection.count_documents({"user_id": user_id})
        resumes_count = await resumes_collection.count_documents({"user_id": user_id})
        interviews_count = await interviews_collection.count_documents({"user_id": user_id})

        # Overall score = avg of assessments + interviews combined
        pipeline = [
            {"$match": {"user_id": user_id}},
            {"$group": {"_id": None, "avgScore": {"$avg": "$score_percentage"}}}
        ]
        cursor = assessments_collection.aggregate(pipeline)
        agg_result = await cursor.to_list(length=1)
        assess_avg = agg_result[0]["avgScore"] if agg_result else 0

        # Also include interview total scores in overall
        interview_pipeline = [
            {"$match": {"user_id": user_id}},
            {"$group": {"_id": None, "avgScore": {"$avg": "$total_score"}}}
        ]
        icursor = interviews_collection.aggregate(interview_pipeline)
        iagg = await icursor.to_list(length=1)
        interview_avg = iagg[0]["avgScore"] if iagg else 0

        # Weighted average: assessments + interviews
        total_count = assessments_count + interviews_count
        if total_count > 0:
            avg_score = round(
                (assess_avg * assessments_count + interview_avg * interviews_count) / total_count
            )
        else:
            avg_score = 0

        return {
            "overallScore": avg_score,
            "assessmentsCompleted": assessments_count,
            "resumesAnalyzed": resumes_count,
            "mockInterviewsTaken": interviews_count,
            "skillsMastered": assessments_count + (1 if avg_score > 70 else 0)
        }
    except Exception as e:
        print(f"Error fetching dashboard stats: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/skills/{user_id}")
async def get_skill_distribution(user_id: str):
    # ── Step 1: Scores from assessments (Technical, Aptitude, Problem Solving) ──
    pipeline = [
        {"$match": {"user_id": user_id}},
        {"$group": {"_id": "$category", "avgScore": {"$avg": "$score_percentage"}}}
    ]
    cursor = assessments_collection.aggregate(pipeline)
    assessment_results = await cursor.to_list(length=10)

    category_map = {
        "technical": "Technical Skills",
        "aptitude": "Aptitude",
        "problem_solving": "Problem Solving",
    }

    skills = {}
    for cat_id, cat_name in category_map.items():
        score = 0
        for r in assessment_results:
            if r["_id"] == cat_id:
                score = round(r["avgScore"])
                break
        skills[cat_name] = score

    # ── Step 2: Communication score from interviews collection ──
    # communication_score is saved per interview — take the average
    interview_pipeline = [
        {"$match": {"user_id": user_id, "communication_score": {"$exists": True, "$gt": 0}}},
        {"$group": {
            "_id": None,
            "avgCommunication": {"$avg": "$communication_score"},
            "avgTechnical":     {"$avg": "$technical_score"},
            "avgConfidence":    {"$avg": "$confidence_score"},
        }}
    ]
    icursor = interviews_collection.aggregate(interview_pipeline)
    iresults = await icursor.to_list(length=1)

    if iresults:
        comm_score = round(iresults[0].get("avgCommunication", 0))
        # Blend interview technical score into Technical Skills if assessments didn't cover it
        interview_tech = round(iresults[0].get("avgTechnical", 0))
        if skills["Technical Skills"] == 0 and interview_tech > 0:
            skills["Technical Skills"] = interview_tech
    else:
        comm_score = 0

    skills["Communication"] = comm_score

    # ── Return in consistent order ──
    return [
        {"name": "Technical Skills",  "value": skills["Technical Skills"]},
        {"name": "Aptitude",          "value": skills["Aptitude"]},
        {"name": "Problem Solving",   "value": skills["Problem Solving"]},
        {"name": "Communication",     "value": skills["Communication"]},
    ]


@router.get("/progress/{user_id}")
async def get_progress_data(user_id: str):
    six_months_ago = datetime.datetime.utcnow() - datetime.timedelta(days=180)

    # Assessment scores by month
    pipeline = [
        {"$match": {"user_id": user_id, "timestamp": {"$gte": six_months_ago}}},
        {"$project": {
            "month": {"$dateToString": {"format": "%b", "date": "$timestamp"}},
            "score": "$score_percentage"
        }},
        {"$group": {"_id": "$month", "avgScore": {"$avg": "$score"}, "count": {"$sum": 1}}}
    ]
    cursor = assessments_collection.aggregate(pipeline)
    assess_results = await cursor.to_list(length=12)

    # Interview total scores by month
    interview_pipeline = [
        {"$match": {"user_id": user_id, "timestamp": {"$gte": six_months_ago}}},
        {"$project": {
            "month": {"$dateToString": {"format": "%b", "date": "$timestamp"}},
            "score": "$total_score"
        }},
        {"$group": {"_id": "$month", "avgScore": {"$avg": "$score"}, "count": {"$sum": 1}}}
    ]
    icursor = interviews_collection.aggregate(interview_pipeline)
    interview_results = await icursor.to_list(length=12)

    months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
              "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    current_month_idx = datetime.datetime.now().month - 1

    last_6 = []
    for i in range(5, -1, -1):
        idx = (current_month_idx - i) % 12
        m = months[idx]

        # Merge assessment + interview scores for this month
        a_score, a_count = 0, 0
        for r in assess_results:
            if r["_id"] == m:
                a_score = r["avgScore"]
                a_count = r["count"]
                break

        iv_score, iv_count = 0, 0
        for r in interview_results:
            if r["_id"] == m:
                iv_score = r["avgScore"]
                iv_count = r["count"]
                break

        total_count = a_count + iv_count
        if total_count > 0:
            blended = round((a_score * a_count + iv_score * iv_count) / total_count)
        else:
            blended = 0

        last_6.append({"month": m, "score": blended})

    return last_6


@router.get("/insights/{user_id}")
async def get_ai_insights(user_id: str):
    stats = await get_dashboard_stats(user_id)
    skills = await get_skill_distribution(user_id)

    strengths = []
    weaknesses = []

    for s in skills:
        if s["value"] > 70:
            strengths.append(s["name"])
        elif 0 < s["value"] < 50:
            weaknesses.append(s["name"])

    # Dynamic recommendations based on actual weak areas
    recommendations = []
    skill_values = {s["name"]: s["value"] for s in skills}

    if skill_values.get("Communication", 0) < 60:
        recommendations.append("Take more mock interviews to improve your Communication score.")
    if skill_values.get("Technical Skills", 0) < 60:
        recommendations.append("Practice more Technical assessments and coding problems.")
    if skill_values.get("Aptitude", 0) < 60:
        recommendations.append("Take 2 more Aptitude tests to boost your logical reasoning.")
    if skill_values.get("Problem Solving", 0) < 60:
        recommendations.append("Review Problem Solving questions in 'Answer Review' mode.")
    if not recommendations:
        recommendations.append("Great performance! Keep taking assessments to maintain your scores.")

    return {
        "strengths": strengths if strengths else ["Keep taking assessments to find your strengths!"],
        "weaknesses": weaknesses if weaknesses else ["No significant weak areas found yet."],
        "trend": "improving" if stats["overallScore"] > 60 else "stagnant",
        "recommendations": recommendations
    }