# Resume Analyzer - Job Roles Dataset Implementation

## Overview
The Resume Analyzer now uses a comprehensive backend dataset for job roles to calculate **actual resume scores** instead of returning a static score of 75.

## Changes Made

### 1. New Job Roles Dataset (`resume_analyzer/job_roles_dataset.py`)
- Created comprehensive dataset for 9 job roles:
  - Software Engineer
  - Associate Software Engineer
  - Data Analyst
  - Web Developer
  - Frontend Developer
  - Backend Developer
  - Full Stack Developer
  - DevOps Engineer
  - Machine Learning Engineer

- Each role includes:
  - **Required Skills**: Core competencies needed for the role
  - **Technical Skills**: Programming languages, frameworks, tools
  - **Soft Skills**: Communication, teamwork, problem-solving
  - **Experience Keywords**: Action verbs and experience indicators
  - **Education Keywords**: Relevant degrees and fields
  - **Weights**: Scoring weights for each category

### 2. Advanced Scoring Algorithm (`resume_analyzer/scorer.py`)
Implemented `calculate_advanced_resume_score()` function with:

- **Skill Extraction**: Uses regex to find skills in resume text
- **Multi-dimensional Scoring**:
  - Required Skills Score (typically 25% weight)
  - Technical Skills Score (typically 35% weight)
  - Soft Skills Score (typically 10% weight)
  - Education Score (typically 10% weight)
  - Experience Score (typically 20% weight)

- **Experience Analysis**:
  - Detects years of experience (e.g., "3 years of experience")
  - Counts experience keywords (developed, implemented, led, etc.)

- **Semantic Similarity Bonus**: Up to 15 bonus points based on overall content match

- **Score Range**: 15-100 (minimum 15 if resume has content)

### 3. Updated Resume API (`resume_api.py`)
- Uses job role dataset when `job_role` parameter is provided
- Falls back to simpler scoring for custom job descriptions
- Generates meaningful feedback based on:
  - Matched skills vs. missing skills
  - Experience indicators
  - Semantic similarity
- Provides actionable improvements

### 4. Frontend Fix (`src/pages/ResumeAnalyzer.tsx`)
- Removed static fallback score of 75
- Now properly displays errors if backend is unavailable
- Shows actual calculated scores from backend

## How It Works

1. **User uploads resume** and selects a job role (e.g., "Software Engineer")

2. **Backend extracts** resume text from PDF

3. **Scoring algorithm**:
   - Extracts required skills from resume (e.g., "python", "algorithms", "git")
   - Extracts technical skills (e.g., "react", "docker", "aws")
   - Counts experience keywords and years
   - Calculates weighted score for each category
   - Adds semantic similarity bonus
   - Produces final score (15-100)

4. **Response includes**:
   - Overall score (e.g., 67.5/100)
   - Matched skills (skills found in resume)
   - Missing skills (skills not found but required)
   - Strengths (what's good about the resume)
   - Improvements (what to add/improve)
   - Keywords (detected in resume)
   - Detailed feedback

## Example Scoring

For a **Software Engineer** role with resume containing:
- Python, Java, Git, REST APIs (technical skills found)
- Data structures, algorithms (required skills found)
- 2 years experience mentioned
- Missing: Docker, Kubernetes, AWS

**Score breakdown**:
- Technical Skills: 40/100 (12 of 33 skills matched) × 0.35 = 14.0
- Required Skills: 60/100 (6 of 9 skills matched) × 0.25 = 15.0
- Experience: 50/100 (2 years + some keywords) × 0.20 = 10.0
- Soft Skills: 30/100 × 0.10 = 3.0
- Education: 80/100 × 0.10 = 8.0
- Semantic Similarity Bonus: +8.0

**Final Score: 58.0/100**

## Testing

To test the system:
1. Ensure backend is running: `cd project/Backend && uvicorn main:app --reload`
2. Upload a PDF resume
3. Select a job role from dropdown
4. Click "Analyze Resume"
5. View actual calculated score (not static 75!)

## API Response Example

```json
{
  "score": 67.5,
  "similarity": 72.3,
  "matched_skills": ["python", "java", "git", "rest api", "sql"],
  "missing_skills": ["docker", "kubernetes", "aws", "microservices"],
  "strengths": [
    "Strong match on required skills: python, algorithms, git",
    "Good technical skills: java, sql, rest api, git"
  ],
  "improvements": [
    "Add required skills: docker, kubernetes",
    "Consider adding: aws, microservices, ci/cd"
  ],
  "keywords": ["python", "java", "git", "sql", "rest api"],
  "feedback": "Your resume scored 67.5/100 for the Software Engineer role. Semantic match: 72.3%. Good match! With some improvements, you'll be very competitive. Key matched skills: python, java, git, sql, rest api."
}
```

## Notes
- Scores are now **dynamic** and based on actual resume content
- Different resumes will get different scores (15-100 range)
- More relevant skills = higher score
- Experience indicators boost the score
- Missing critical skills will lower the score






