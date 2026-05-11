from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timedelta, timezone
import random
import os
import requests  # <-- Replaced smtplib with requests!
from jose import jwt
from dotenv import load_dotenv

import models, schemas, database

load_dotenv()

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

SECRET_KEY = os.getenv("JWT_SECRET_KEY")
ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("JWT_ACCESS_TOKEN_EXPIRE_MINUTES", "10080"))

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def send_email_otp(to_email: str, otp: str):
    api_key = os.getenv("RESEND_API_KEY")
    
    # Fallback to printing in the logs if you haven't set your API key yet
    if not api_key:
        print("=========================================")
        print(f"🚨 MOCK EMAIL (No API Key Found) 🚨")
        print(f"To: {to_email}")
        print(f"OTP: {otp}")
        print("=========================================")
        return
        
    try:
        # Send email via HTTP Request (Port 443) which Hugging Face allows!
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
        
        data = {
            "from": "onboarding@resend.dev", # Resend's default testing email
            "to": [to_email],
            "subject": "Your HomeSite AI Login Code",
            "html": f"Hello,<br><br>Your login code is: <strong>{otp}</strong><br><br>This code will expire in 5 minutes."
        }

        response = requests.post("https://api.resend.com/emails", headers=headers, json=data)
        
        if response.status_code != 200:
            print(f"Failed to send email via Resend: {response.text}")
            raise HTTPException(status_code=500, detail="Email service error. Try again later.")
            
    except Exception as e:
        print(f"Failed to send email: {e}")
        raise HTTPException(status_code=500, detail="Failed to send email. Please try again.")

@router.post("/send-otp")
def send_otp(request: schemas.SendOTPRequest, db: Session = Depends(database.get_db)):
    otp_code = str(random.randint(100000, 999999))
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=5)
    
    new_otp = models.OTP(
        email=request.email,
        otp_code=otp_code,
        expires_at=expires_at
    )
    db.add(new_otp)
    db.commit()

    # Call the new HTTP email function
    send_email_otp(request.email, otp_code)

    return {"message": "OTP sent successfully"}

@router.post("/verify-otp", response_model=schemas.Token)
def verify_otp(request: schemas.VerifyOTPRequest, db: Session = Depends(database.get_db)):
    db_otp = db.query(models.OTP).filter(
        models.OTP.email == request.email,
        models.OTP.otp_code == request.otp_code,
        models.OTP.is_used == False,
        models.OTP.expires_at > datetime.now(timezone.utc)
    ).first()

    if not db_otp:
        raise HTTPException(status_code=400, detail="Invalid or expired OTP")

    db_otp.is_used = True
    
    user = db.query(models.User).filter(models.User.email == request.email).first()
    if not user:
        user = models.User(email=request.email)
        db.add(user)
    
    db.commit()
    db.refresh(user)

    access_token = create_access_token(data={"sub": str(user.id)})
    
    return {"access_token": access_token, "token_type": "bearer"}