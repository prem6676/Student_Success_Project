import re
from typing import Dict, List, Set


def normalize_text(text: str) -> str:
    """Normalize text for better matching"""
    return text.lower().strip()


def extract_skills_from_text(text: str, skill_list: List[str]) -> Set[str]:
    """Extract skills from resume text based on skill list"""
    text_lower = normalize_text(text)
    found_skills = set()
    
    for skill in skill_list:
        skill_lower = normalize_text(skill)
        # Check for whole word match or as part of compound words
        pattern = r'\b' + re.escape(skill_lower) + r'\b'
        if re.search(pattern, text_lower):
            found_skills.add(skill)
    
    return found_skills


def count_experience_indicators(text: str, keywords: List[str]) -> int:
    """Count experience-related keywords in resume"""
    text_lower = normalize_text(text)
    count = 0
    
    for keyword in keywords:
        keyword_lower = normalize_text(keyword)
        # Count occurrences of experience keywords
        count += len(re.findall(r'\b' + re.escape(keyword_lower) + r'\b', text_lower))
    
    return count


def extract_years_of_experience(text: str) -> float:
    """Extract years of experience from resume text"""
    text_lower = normalize_text(text)
    
    # Patterns to match years of experience
    patterns = [
        r'(\d+)\s*(?:\+)?\s*years?\s+(?:of\s+)?experience',
        r'experience\s*[:]\s*(\d+)\s*(?:\+)?\s*years?',
        r'(\d+)\s*(?:\+)?\s*yrs?\s+(?:of\s+)?experience'
    ]
    
    max_years = 0
    for pattern in patterns:
        matches = re.findall(pattern, text_lower)
        for match in matches:
            years = int(match)
            max_years = max(max_years, years)
    
    return max_years


def calculate_section_score(found_items: Set[str], total_items: List[str], weight: float) -> float:
    """Calculate score for a section based on matched items"""
    if not total_items:
        return 0.0
    
    match_ratio = len(found_items) / len(total_items)
    # Use a curve to reward partial matches but not too harshly penalize missing some
    score = (match_ratio ** 0.7) * 100 * weight
    
    return score


def calculate_advanced_resume_score(
    resume_text: str,
    job_role_data: Dict,
    similarity_score: float = 0.0
) -> Dict:
    """
    Calculate comprehensive resume score based on job role requirements
    
    Args:
        resume_text: The extracted text from resume
        job_role_data: Job role data from dataset containing required skills, technical skills, etc.
        similarity_score: Semantic similarity score from embedder (0-100)
    
    Returns:
        Dictionary containing overall score and breakdown
    """
    
    weights = job_role_data.get("weight", {
        "technical_skills": 0.35,
        "required_skills": 0.25,
        "experience": 0.20,
        "soft_skills": 0.10,
        "education": 0.10
    })
    
    # Extract skills from resume
    required_skills = job_role_data.get("required_skills", [])
    technical_skills = job_role_data.get("technical_skills", [])
    soft_skills = job_role_data.get("soft_skills", [])
    education_keywords = job_role_data.get("education_keywords", [])
    experience_keywords = job_role_data.get("experience_keywords", [])
    
    # Find matched skills
    matched_required = extract_skills_from_text(resume_text, required_skills)
    matched_technical = extract_skills_from_text(resume_text, technical_skills)
    matched_soft = extract_skills_from_text(resume_text, soft_skills)
    matched_education = extract_skills_from_text(resume_text, education_keywords)
    
    # Calculate individual scores
    required_score = calculate_section_score(matched_required, required_skills, weights["required_skills"])
    technical_score = calculate_section_score(matched_technical, technical_skills, weights["technical_skills"])
    soft_score = calculate_section_score(matched_soft, soft_skills, weights["soft_skills"])
    education_score = calculate_section_score(matched_education, education_keywords, weights["education"])
    
    # Experience score based on keyword density and years
    experience_count = count_experience_indicators(resume_text, experience_keywords)
    years_experience = extract_years_of_experience(resume_text)
    
    # Experience scoring: combination of keywords and years
    experience_keyword_score = min(experience_count * 5, 60)  # Cap at 60
    experience_years_score = min(years_experience * 8, 40)  # Cap at 40
    experience_score = (experience_keyword_score + experience_years_score) * weights["experience"]
    
    # Base score from components
    base_score = (
        required_score +
        technical_score +
        soft_score +
        education_score +
        experience_score
    )
    
    # Incorporate semantic similarity if available (bonus up to 15 points)
    similarity_bonus = (similarity_score / 100) * 15 if similarity_score > 0 else 0
    
    # Calculate final score
    final_score = min(base_score + similarity_bonus, 100)
    
    # Ensure minimum score of 15 if resume has any content
    final_score = max(final_score, 15) if len(resume_text.strip()) > 100 else 0
    
    return {
        "overall_score": round(final_score, 1),
        "breakdown": {
            "required_skills": round(required_score / weights["required_skills"], 1) if weights["required_skills"] > 0 else 0,
            "technical_skills": round(technical_score / weights["technical_skills"], 1) if weights["technical_skills"] > 0 else 0,
            "soft_skills": round(soft_score / weights["soft_skills"], 1) if weights["soft_skills"] > 0 else 0,
            "education": round(education_score / weights["education"], 1) if weights["education"] > 0 else 0,
            "experience": round(experience_score / weights["experience"], 1) if weights["experience"] > 0 else 0,
        },
        "matched_skills": {
            "required": list(matched_required),
            "technical": list(matched_technical),
            "soft": list(matched_soft),
            "education": list(matched_education),
        },
        "missing_skills": {
            "required": list(set(required_skills) - matched_required),
            "technical": list(set(technical_skills) - matched_technical)[:10],  # Limit to top 10
            "soft": list(set(soft_skills) - matched_soft),
        },
        "experience_metrics": {
            "years": years_experience,
            "keyword_count": experience_count
        }
    }


def calculate_resume_score(skill_score, experience_score=70, ats_score=65):
    """Legacy function for backward compatibility"""
    final_score = (
        skill_score * 0.5 +
        experience_score * 0.3 +
        ats_score * 0.2
    )
    return round(final_score, 2)
