import motor.motor_asyncio
import os
from dotenv import load_dotenv

load_dotenv()

MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
DATABASE_NAME = "student_success_db"

client = motor.motor_asyncio.AsyncIOMotorClient(MONGODB_URL)
db = client[DATABASE_NAME]

def get_database():
    return db

# Collection helpers
users_collection = db["users"]
assessments_collection = db["assessments"]
resumes_collection = db["resumes"]
interviews_collection = db["interviews"]