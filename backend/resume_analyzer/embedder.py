from sentence_transformers import SentenceTransformer
import numpy as np

model = SentenceTransformer("all-MiniLM-L6-v2")

def calculate_similarity(resume_text: str, jd_text: str) -> float:
    emb1 = model.encode(resume_text, convert_to_tensor=False)
    emb2 = model.encode(jd_text, convert_to_tensor=False)

    # Cosine similarity via numpy — no PyTorch tensor ops required
    dot = np.dot(emb1, emb2)
    norm = np.linalg.norm(emb1) * np.linalg.norm(emb2)
    similarity = dot / norm if norm > 0 else 0.0
    return round(float(similarity) * 100, 2)
