from sentence_transformers import SentenceTransformer, util

model = SentenceTransformer("all-MiniLM-L6-v2")

def calculate_similarity(resume_text: str, jd_text: str) -> float:
    emb1 = model.encode(resume_text, convert_to_tensor=True)
    emb2 = model.encode(jd_text, convert_to_tensor=True)

    similarity = util.cos_sim(emb1, emb2)
    return round(float(similarity[0][0]) * 100, 2)
