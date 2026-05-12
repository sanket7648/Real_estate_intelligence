from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timedelta, timezone
import random
import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from jose import jwt
from dotenv import load_dotenv

import models, schemas, database

load_dotenv()

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

SECRET_KEY = os.getenv("JWT_SECRET_KEY")
ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("JWT_ACCESS_TOKEN_EXPIRE_MINUTES", "10080"))

# Email config
SMTP_SERVER = os.getenv("SMTP_SERVER", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", 587))
SMTP_EMAIL = os.getenv("SMTP_EMAIL")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def send_email_otp(to_email: str, otp: str):
    if not SMTP_EMAIL or not SMTP_PASSWORD:
        print("=========================================")
        print(f"🚨 MOCK EMAIL to {to_email}: OTP is {otp} 🚨") 
        print("=========================================")
        return
        
    try:
        msg = MIMEMultipart()
        msg['From'] = SMTP_EMAIL
        msg['To'] = to_email
        msg['Subject'] = "Your Real Estate AI Login Code"

        body = f"Hello,\n\nYour login code is: {otp}\n\nThis code will expire in 5 minutes."
        msg.attach(MIMEText(body, 'plain'))

        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
        server.starttls() # Secure the connection
        server.login(SMTP_EMAIL, SMTP_PASSWORD)
        server.send_message(msg)
        server.quit()
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

    # Call the actual email sending function
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