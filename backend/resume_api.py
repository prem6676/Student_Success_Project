"""
Resume Analysis API v2
Handles resume upload, parsing, scoring, skill gap analysis,
personalized roadmaps, course recommendations, and certifications.

Drop-in replacement for your existing resume_api.py
All imports match your original project structure.
"""
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from typing import Optional
import tempfile
import os

# ---- these imports match YOUR existing project structure exactly ----
from resume_analyzer.parser import extract_text_from_pdf
from resume_analyzer.scorer import calculate_advanced_resume_score
from resume_analyzer.job_roles_dataset import get_job_role_data, get_all_job_roles
from resume_analyzer.embedder import calculate_similarity
from database import resumes_collection
import datetime
# --------------------------------------------------------------------

router = APIRouter(prefix="/api/resume", tags=["resume"])


# ---------------------------------------------------------------------------
# Helper: determine candidate level from score + years of experience
# ---------------------------------------------------------------------------
def _get_level(overall_score: float, years_exp: int) -> str:
    if overall_score < 35 or years_exp == 0:
        return "beginner"
    elif overall_score < 65 or years_exp <= 2:
        return "intermediate"
    else:
        return "advanced"


# ---------------------------------------------------------------------------
# Helper: build personalized roadmap from role data + candidate gaps
# ---------------------------------------------------------------------------
def _build_roadmap(score_result: dict, job_role_data: dict) -> dict:
    roadmap        = job_role_data.get("roadmap", {})
    courses        = job_role_data.get("courses", [])
    certifications = job_role_data.get("certifications", [])

    missing_required  = score_result["missing_skills"]["required"]
    missing_technical = score_result["missing_skills"]["technical"][:8]
    years_exp         = score_result["experience_metrics"]["years"]
    overall_score     = score_result["overall_score"]

    level = _get_level(overall_score, years_exp)

    next_level_map = {
        "beginner": "intermediate",
        "intermediate": "advanced",
        "advanced": "advanced"
    }
    focus_steps      = roadmap.get(level, [])
    next_level_steps = roadmap.get(next_level_map[level], [])[:3]

    # Build priority actions from the candidate's actual gaps
    priority_actions = []
    if missing_required:
        priority_actions.append(
            f"Critical: Learn missing core skills — {', '.join(missing_required[:4])}"
        )
    if missing_technical:
        priority_actions.append(
            f"Recommended: Add these tools to your stack — {', '.join(missing_technical[:5])}"
        )
    if years_exp == 0:
        priority_actions.append(
            "Build 2-3 real projects to demonstrate hands-on experience "
            "and add them to your portfolio / GitHub"
        )

    # Only return High/Medium relevance certs
    relevant_certs = [
        c for c in certifications
        if c.get("relevance") in ("High", "Medium")
    ]

    return {
        "current_level":    level,
        "focus_roadmap":    focus_steps,
        "next_steps":       next_level_steps,
        "priority_actions": priority_actions,
        "courses":          courses,
        "certifications":   relevant_certs,
    }


# ---------------------------------------------------------------------------
# Helper: generate targeted improvement suggestions
# ---------------------------------------------------------------------------
def _build_improvements(score_result: dict, job_role: str) -> list:
    suggestions       = []
    missing_required  = score_result["missing_skills"]["required"]
    missing_technical = score_result["missing_skills"]["technical"][:5]
    years_exp         = score_result["experience_metrics"]["years"]
    keyword_count     = score_result["experience_metrics"]["keyword_count"]
    breakdown         = score_result.get("breakdown", {})

    if missing_required:
        suggestions.append(
            f"Add critical missing skills to your resume: {', '.join(missing_required[:5])}. "
            f"These are non-negotiable for {job_role} roles and will significantly boost your ATS score."
        )

    if missing_technical:
        suggestions.append(
            f"Expand your technical stack with: {', '.join(missing_technical)}. "
            "Include these in your skills section and show them in project descriptions."
        )

    if keyword_count < 5:
        suggestions.append(
            "Your experience section lacks action verbs and impact statements. "
            "Start each bullet with strong verbs (built, optimized, scaled, designed) "
            "and quantify achievements — e.g. 'Reduced API response time by 40%'."
        )

    if years_exp == 0:
        suggestions.append(
            "No years of experience detected. If you have work history or internships, "
            "state the duration explicitly (e.g. '2 years of experience in Python development'). "
            "If you are a fresher, highlight academic and personal projects prominently."
        )

    if breakdown.get("education", 0) < 40:
        suggestions.append(
            "Strengthen your education section by including relevant coursework, "
            "academic projects, GPA (if strong), and any certifications completed."
        )

    if breakdown.get("soft_skills", 0) < 40:
        suggestions.append(
            "Include soft skills relevant to the role — teamwork, agile/scrum experience, "
            "communication skills, or leadership experiences in your summary or job descriptions."
        )

    suggestions.append(
        "Optimize for ATS: use standard section headings (Experience, Education, Skills), "
        "include exact keywords from the job description, and avoid tables or graphics "
        "that break parsing."
    )

    return suggestions


# ---------------------------------------------------------------------------
# Main endpoint
# ---------------------------------------------------------------------------
@router.post("/analyze")
async def analyze_resume(
    resume: UploadFile = File(...),
    job_role: Optional[str] = Form(None),
    job_description: Optional[str] = Form(None),
    user_id: Optional[str] = Form(None)
):
    """
    Analyze a resume PDF against a job role or custom job description.

    Returns:
        score, similarity, level, matched_skills, missing_skills,
        strengths, improvements, keywords, feedback,
        breakdown, experience_metrics,
        roadmap  { current_level, focus_steps, next_steps, priority_actions },
        courses  [ { name, platform, url, level, free } ],
        certifications [ { name, provider, url, relevance } ]
    """

    # ---- Input validation ------------------------------------------------
    if not job_role and not job_description:
        raise HTTPException(
            status_code=400,
            detail="Either 'job_role' or 'job_description' must be provided"
        )
    if job_role and job_description:
        raise HTTPException(
            status_code=400,
            detail="Provide either 'job_role' OR 'job_description', not both"
        )
    if not resume.filename.lower().endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")

    # ---- Save temp file ---------------------------------------------------
    temp_file_path = None
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as tmp:
            content = await resume.read()
            tmp.write(content)
            temp_file_path = tmp.name

        # ---- Extract text ------------------------------------------------
        try:
            resume_text = extract_text_from_pdf(temp_file_path)
        except Exception as e:
            raise HTTPException(
                status_code=400,
                detail=f"Failed to extract text from PDF: {str(e)}"
            )

        if not resume_text or len(resume_text.strip()) < 50:
            raise HTTPException(
                status_code=400,
                detail="Resume PDF appears to be empty or could not be parsed"
            )

        similarity_score = 0.0

        # ==================================================================
        # PATH A — Predefined job role
        # ==================================================================
        if job_role:
            job_role_data = get_job_role_data(job_role)
            if not job_role_data:
                available = ", ".join(get_all_job_roles())
                raise HTTPException(
                    status_code=400,
                    detail=f"Invalid job role. Available roles: {available}"
                )

            # Semantic similarity
            try:
                similarity_score = calculate_similarity(
                    resume_text, job_role_data.get("description", "")
                )
            except Exception:
                similarity_score = 0.0

            # Score
            score_result = calculate_advanced_resume_score(
                resume_text=resume_text,
                job_role_data=job_role_data,
                similarity_score=similarity_score
            )

            # Flatten matched / missing skills
            matched_skills = (
                score_result["matched_skills"]["required"] +
                score_result["matched_skills"]["technical"] +
                score_result["matched_skills"]["soft"]
            )
            missing_skills = (
                score_result["missing_skills"]["required"] +
                score_result["missing_skills"]["technical"][:5]
            )

            # Roadmap + recommendations
            roadmap_data = _build_roadmap(score_result, job_role_data)
            improvements = _build_improvements(score_result, job_role)

            # Strengths
            strengths = []
            if score_result["matched_skills"]["required"]:
                top = score_result["matched_skills"]["required"][:5]
                strengths.append(
                    f"Strong match on core required skills: {', '.join(top)}"
                )
            if score_result["matched_skills"]["technical"]:
                top = score_result["matched_skills"]["technical"][:5]
                strengths.append(
                    f"Good technical proficiency in: {', '.join(top)}"
                )
            if score_result["experience_metrics"]["years"] > 0:
                strengths.append(
                    f"Relevant work experience: "
                    f"{score_result['experience_metrics']['years']} years detected"
                )
            if score_result["experience_metrics"]["keyword_count"] >= 8:
                strengths.append(
                    "Strong use of action verbs and impact-oriented language "
                    "in experience section"
                )
            if similarity_score > 70:
                strengths.append(
                    f"High semantic alignment with job description "
                    f"(similarity: {similarity_score}%)"
                )

            # Feedback string
            score = score_result["overall_score"]
            if score >= 80:
                feedback = (
                    f"Excellent! Your resume scores {score}/100 for {job_role}. "
                    "You're a strong candidate — focus on tailoring your summary "
                    "and quantifying achievements."
                )
            elif score >= 65:
                feedback = (
                    f"Good match! Your resume scores {score}/100 for {job_role}. "
                    "Closing the skill gaps identified below will make you very competitive."
                )
            elif score >= 50:
                feedback = (
                    f"Moderate match. Your resume scores {score}/100 for {job_role}. "
                    "Significant improvements in skills and experience documentation are recommended."
                )
            elif score >= 35:
                feedback = (
                    f"Below average match. Your resume scores {score}/100 for {job_role}. "
                    "Follow the roadmap below to systematically build the required skills."
                )
            else:
                feedback = (
                    f"Early stage match. Your resume scores {score}/100 for {job_role}. "
                    "Start with the beginner roadmap and build foundational skills first."
                )

            if similarity_score > 0:
                feedback += f" Semantic similarity: {similarity_score}%."

            result_doc = {
                "score":              score,
                "similarity":         similarity_score,
                "level":              roadmap_data["current_level"],
                "matched_skills":     matched_skills[:10],
                "missing_skills":     missing_skills[:10],
                "strengths":          strengths,
                "improvements":       improvements,
                "keywords":           matched_skills[:15],
                "feedback":           feedback,
                "breakdown":          score_result.get("breakdown", {}),
                "experience_metrics": score_result["experience_metrics"],
                "roadmap": {
                    "current_level":    roadmap_data["current_level"],
                    "focus_steps":      roadmap_data["focus_roadmap"],
                    "next_steps":       roadmap_data["next_steps"],
                    "priority_actions": roadmap_data["priority_actions"],
                },
                "courses":        roadmap_data["courses"],
                "certifications": roadmap_data["certifications"],
            }

            if user_id:
                await resumes_collection.insert_one({
                    "user_id":   user_id,
                    "score":     result_doc["score"],
                    "job_role":  job_role,
                    "level":     result_doc["level"],
                    "timestamp": datetime.datetime.utcnow()
                })

            return result_doc

        # ==================================================================
        # PATH B — Custom job description
        # ==================================================================
        else:
            try:
                similarity_score = calculate_similarity(resume_text, job_description)
            except Exception:
                similarity_score = 0.0

            job_desc_lower   = job_description.lower()
            resume_lower     = resume_text.lower()
            job_keywords     = [w.strip() for w in job_desc_lower.split() if len(w) > 3]
            matched_keywords = [kw for kw in job_keywords if kw in resume_lower]

            keyword_match_ratio = len(matched_keywords) / len(job_keywords) if job_keywords else 0
            base_score          = keyword_match_ratio * 60
            similarity_bonus    = (similarity_score / 100) * 40
            final_score         = min(max(base_score + similarity_bonus, 15), 100)

            strengths = []
            if matched_keywords:
                strengths.append(
                    f"Matched keywords from JD: {', '.join(matched_keywords[:5])}"
                )
            if similarity_score > 70:
                strengths.append(
                    f"Strong semantic similarity with job description: {similarity_score}%"
                )

            improvements = [
                "Add more keywords directly from the job description into your "
                "skills and experience sections.",
                "Tailor your professional summary to mirror the job description's language.",
                "Quantify achievements (e.g. 'Improved performance by 30%') "
                "to strengthen your match.",
                "Ensure your resume uses exact skill names from the JD — "
                "case-insensitive keyword matching matters for ATS.",
            ]

            fs = round(final_score, 1)
            feedback = f"Your resume scores {fs}/100 against the custom job description."
            if similarity_score > 0:
                feedback += f" Semantic similarity: {similarity_score}%."
            if final_score >= 75:
                feedback += " Strong match!"
            elif final_score >= 60:
                feedback += " Good match!"
            elif final_score >= 45:
                feedback += " Moderate match — see improvements below."
            else:
                feedback += " Needs significant alignment with the job description."

            result_doc = {
                "score":          fs,
                "similarity":     similarity_score,
                "matched_skills": matched_keywords[:10],
                "missing_skills": [
                    kw for kw in job_keywords[:10]
                    if kw not in matched_keywords
                ],
                "strengths":      strengths,
                "improvements":   improvements,
                "keywords":       matched_keywords[:15],
                "feedback":       feedback,
                "roadmap":        None,
                "courses":        [],
                "certifications": [],
            }

            if user_id:
                await resumes_collection.insert_one({
                    "user_id":   user_id,
                    "score":     result_doc["score"],
                    "job_role":  "Custom",
                    "timestamp": datetime.datetime.utcnow()
                })

            return result_doc

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error analyzing resume: {str(e)}"
        )
    finally:
        if temp_file_path and os.path.exists(temp_file_path):
            try:
                os.unlink(temp_file_path)
            except Exception:
                pass


# ---------------------------------------------------------------------------
# Bonus endpoint — list all available roles
# ---------------------------------------------------------------------------
@router.get("/roles")
async def get_available_roles():
    """Return all available job roles with their descriptions."""
    from resume_analyzer.job_roles_dataset import JOB_ROLES_DATASET
    return {
        "roles": [
            {"name": k, "description": v["description"]}
            for k, v in JOB_ROLES_DATASET.items()
        ]
    }
