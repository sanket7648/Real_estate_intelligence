from sqlalchemy import Column, Integer, String, Boolean, DateTime, Float, JSON
from sqlalchemy.sql import func
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False) # Changed
    name = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class OTP(Base):
    __tablename__ = "otps"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, index=True, nullable=False) # Changed
    otp_code = Column(String, nullable=False)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    is_used = Column(Boolean, default=False)


class Property(Base):
    __tablename__ = "properties"

    id = Column(String, primary_key=True, index=True) # Using String to match your mockData IDs
    title = Column(String, nullable=False)
    location = Column(String, index=True, nullable=False)
    city = Column(String, index=True, nullable=False)
    price = Column(Integer, index=True, nullable=False)
    sqft = Column(Integer, nullable=False)
    bhk = Column(Integer, nullable=False)
    bathrooms = Column(Integer, nullable=False)
    balcony = Column(Integer, nullable=False)
    parking = Column(Boolean, default=False)
    furnishing = Column(String, nullable=False)
    age = Column(Integer, nullable=False)
    amenities = Column(JSON, nullable=False) # Store amenities as a JSON array
    image = Column(String, nullable=False)
    lat = Column(Float, nullable=False)
    lng = Column(Float, nullable=False)
    property_type = Column(String, nullable=False) # 'type' is a reserved keyword in python
    status = Column(String, nullable=False)
    rating = Column(Float, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class UserProfile(Base):
    __tablename__ = "user_profiles"
    email = Column(String, primary_key=True, index=True)
    name = Column(String)
    target_city = Column(String)
    target_bhk = Column(String)
    max_budget = Column(String)

class FavoriteProperty(Base):
    __tablename__ = "favorite_properties"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, index=True, nullable=False)
    property_id = Column(String, nullable=False)
    property_title = Column(String, nullable=False)
    property_price = Column(Integer, nullable=False)
    property_location = Column(String, nullable=False)
    property_city = Column(String, nullable=False)
    property_image = Column(String, nullable=False)
    property_bhk = Column(Integer, nullable=False)
    property_sqft = Column(Integer, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())