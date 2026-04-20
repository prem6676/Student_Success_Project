from typing import Iterable, Dict, List


def find_skill_gap(resume_skills: Iterable[str], jd_skills: Iterable[str]) -> Dict[str, List[str]]:
    resume_set = {str(skill).lower().strip() for skill in resume_skills if str(skill).strip()}
    jd_set = {str(skill).lower().strip() for skill in jd_skills if str(skill).strip()}

    missing_skills = sorted(list(jd_set - resume_set))
    matched_skills = sorted(list(jd_set & resume_set))

    return {"matched_skills": matched_skills, "missing_skills": missing_skills}
