from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from auth import router as auth_router
from resume_api import router as resume_router
from ai_routes import router as ai_router
from dashboard_api import router as dashboard_router
from assessment_api import router as assessment_router
from dotenv import load_dotenv
load_dotenv()
# Force reload triggers
app = FastAPI(title="Student Success API", version="1.0.0")

# CORS middleware to allow frontend requests
# CORS middleware to allow frontend requests (dev-friendly: allow all)
# NOTE: With allow_credentials=True, allow_origins cannot be "*".
# Use a dev-friendly allowlist that covers common Vite origins.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://student-success-project.vercel.app",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
        "http://localhost:5175",
        "http://127.0.0.1:5175",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include auth routes
app.include_router(auth_router)
app.include_router(resume_router)
app.include_router(ai_router)
app.include_router(dashboard_router)
app.include_router(assessment_router)

@app.get("/")
def root():
    return {"status": "Backend is running", "message": "Student Success API"}

@app.get("/health")
def health():
    return {"status": "healthy"}
