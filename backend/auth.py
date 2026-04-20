from typing import Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import httpx
import os
import secrets
import smtplib
import datetime
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

# ── Router (must be defined before any @router decorators) ──────────────────
router = APIRouter(prefix="/api/auth", tags=["auth"])

# ── In-memory token store (use Redis or DB for production) ──────────────────
reset_tokens: dict = {}


# ── Request Models ───────────────────────────────────────────────────────────
class GoogleCredentialRequest(BaseModel):
    credential: str

class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str

class LoginRequest(BaseModel):
    email: str
    password: str

class ForgotPasswordRequest(BaseModel):
    email: str

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

class UpdateProfileRequest(BaseModel):
    name: str
    phone: Optional[str] = ""
    location: Optional[str] = ""
    job_title: Optional[str] = ""
    college: Optional[str] = ""
    bio: Optional[str] = ""


# ── Routes ───────────────────────────────────────────────────────────────────

@router.post("/google")
async def verify_google_token(request: GoogleCredentialRequest):
    credential = request.credential
    if not credential:
        raise HTTPException(status_code=400, detail="Credential is required")
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                "https://oauth2.googleapis.com/tokeninfo",
                params={"id_token": credential},
                timeout=10.0
            )
            if response.status_code != 200:
                raise HTTPException(status_code=401, detail="Invalid Google token")
            token_info = response.json()

            from database import users_collection
            email = token_info.get("email", "")
            if not email:
                raise HTTPException(status_code=400, detail="Email not found in token")

            user_data = {
                "name": token_info.get("name", ""),
                "email": email,
                "picture": token_info.get("picture", ""),
                "provider": "google",
                "email_verified": token_info.get("email_verified", False),
                "last_login": datetime.datetime.utcnow()
            }
            await users_collection.update_one(
                {"email": email}, {"$set": user_data}, upsert=True
            )
            db_user = await users_collection.find_one({"email": email})
            user_data["id"] = str(db_user["_id"])
            return user_data

    except httpx.RequestError as e:
        raise HTTPException(status_code=503, detail=f"Failed to verify token with Google: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing Google authentication: {str(e)}")


@router.post("/register")
async def register_user(request: RegisterRequest):
    from database import users_collection
    existing_user = await users_collection.find_one({"email": request.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="User already registered with this email")

    user_doc = {
        "name": request.name,
        "email": request.email,
        "password": request.password,  # Hash in production!
        "provider": "manual",
        "created_at": datetime.datetime.utcnow(),
        "last_login": datetime.datetime.utcnow()
    }
    result = await users_collection.insert_one(user_doc)
    user_doc["id"] = str(result.inserted_id)
    del user_doc["password"]
    return user_doc


@router.post("/login")
async def login_user(request: LoginRequest):
    from database import users_collection
    user = await users_collection.find_one({
        "email": request.email,
        "password": request.password  # Verify hashed password in production!
    })
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    await users_collection.update_one(
        {"_id": user["_id"]},
        {"$set": {"last_login": datetime.datetime.utcnow()}}
    )
    return {
        "id": str(user["_id"]),
        "name": user["name"],
        "email": user["email"],
        "provider": user.get("provider", "manual")
    }


@router.post("/forgot-password")
async def forgot_password(request: ForgotPasswordRequest):
    from database import users_collection
    user = await users_collection.find_one({"email": request.email})

    if user:
        token = secrets.token_urlsafe(32)
        expiry = datetime.datetime.utcnow() + datetime.timedelta(hours=1)
        reset_tokens[token] = {"email": request.email, "expires_at": expiry}

        frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173")
        reset_link = f"{frontend_url}/reset-password?token={token}"

        try:
            smtp_host     = os.getenv("SMTP_HOST", "smtp.gmail.com")
            smtp_port     = int(os.getenv("SMTP_PORT", "587"))
            smtp_user     = os.getenv("SMTP_USER")
            smtp_password = os.getenv("SMTP_PASSWORD")
            email_from    = os.getenv("EMAIL_FROM", smtp_user)

            if not smtp_user or not smtp_password:
                raise ValueError("SMTP_USER and SMTP_PASSWORD env vars are not set")

            msg = MIMEMultipart("alternative")
            msg["Subject"] = "Reset your password"
            msg["From"]    = email_from
            msg["To"]      = request.email
            msg.attach(MIMEText(f"""
                <p>Hi,</p>
                <p>Click the link below to reset your password. Expires in <b>1 hour</b>.</p>
                <p><a href="{reset_link}">{reset_link}</a></p>
                <p>If you didn't request this, ignore this email.</p>
            """, "html"))

            with smtplib.SMTP(smtp_host, smtp_port) as server:
                server.starttls()
                server.login(smtp_user, smtp_password)
                server.sendmail(email_from, request.email, msg.as_string())

            print(f"✅ Password reset email sent to {request.email}")

        except Exception as e:
            print(f"❌ Failed to send reset email: {e}")

    return {"message": "If this email is registered, a password reset link has been sent."}


@router.post("/reset-password")
async def reset_password(request: ResetPasswordRequest):
    token_data = reset_tokens.get(request.token)
    if not token_data:
        raise HTTPException(status_code=400, detail="Invalid or expired reset token")
    if datetime.datetime.utcnow() > token_data["expires_at"]:
        del reset_tokens[request.token]
        raise HTTPException(status_code=400, detail="Reset token has expired")

    from database import users_collection
    result = await users_collection.update_one(
        {"email": token_data["email"]},
        {"$set": {"password": request.new_password}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")

    del reset_tokens[request.token]
    return {"message": "Password reset successfully"}


@router.put("/update-profile/{user_id}")
async def update_profile(user_id: str, request: UpdateProfileRequest):
    from database import users_collection
    from bson import ObjectId
    try:
        result = await users_collection.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": {
                "name": request.name,
                "phone": request.phone,
                "location": request.location,
                "job_title": request.job_title,
                "college": request.college,
                "bio": request.bio,
                "updated_at": datetime.datetime.utcnow(),
            }}
        )
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="User not found")
        return {"success": True, "message": "Profile updated"}
    except Exception as e:
        print(f"❌ Error updating profile: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to update profile: {str(e)}")