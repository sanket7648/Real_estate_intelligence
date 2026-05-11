from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
import models, database

router = APIRouter(prefix="/api/profile", tags=["Profile"])

class ProfileData(BaseModel):
    email: str
    name: str
    targetCity: str
    targetBhk: str
    maxBudget: str

@router.post("/")
def save_profile(data: ProfileData, db: Session = Depends(database.get_db)):
    # Check if user already has a profile
    profile = db.query(models.UserProfile).filter(models.UserProfile.email == data.email).first()
    
    if not profile:
        profile = models.UserProfile(email=data.email)
        db.add(profile)
    
    # Update the values
    profile.name = data.name
    profile.target_city = data.targetCity
    profile.target_bhk = data.targetBhk
    profile.max_budget = data.maxBudget
    
    db.commit()
    return {"message": "Profile saved to database successfully!"}

@router.get("/{email}")
def get_profile(email: str, db: Session = Depends(database.get_db)):
    profile = db.query(models.UserProfile).filter(models.UserProfile.email == email).first()
    if profile:
        return {
            "name": profile.name,
            "email": profile.email,
            "targetCity": profile.target_city,
            "targetBhk": profile.target_bhk,
            "maxBudget": profile.max_budget
        }
    return None

class FavoriteRequest(BaseModel):
    email: str
    property_id: str
    property_title: str
    property_price: int
    property_location: str
    property_city: str
    property_image: str
    property_bhk: int
    property_sqft: int

@router.post("/favorites/add")
def add_favorite(data: FavoriteRequest, db: Session = Depends(database.get_db)):
    # Check if already favorited
    existing = db.query(models.FavoriteProperty).filter(
        models.FavoriteProperty.email == data.email,
        models.FavoriteProperty.property_id == data.property_id
    ).first()
    
    if existing:
        return {"message": "Already in favorites", "isFavorite": True}
    
    favorite = models.FavoriteProperty(
        email=data.email,
        property_id=data.property_id,
        property_title=data.property_title,
        property_price=data.property_price,
        property_location=data.property_location,
        property_city=data.property_city,
        property_image=data.property_image,
        property_bhk=data.property_bhk,
        property_sqft=data.property_sqft
    )
    db.add(favorite)
    db.commit()
    return {"message": "Added to favorites", "isFavorite": True}

@router.delete("/favorites/remove/{email}/{property_id}")
def remove_favorite(email: str, property_id: str, db: Session = Depends(database.get_db)):
    favorite = db.query(models.FavoriteProperty).filter(
        models.FavoriteProperty.email == email,
        models.FavoriteProperty.property_id == property_id
    ).first()
    
    if favorite:
        db.delete(favorite)
        db.commit()
        return {"message": "Removed from favorites", "isFavorite": False}
    
    return {"message": "Not found in favorites", "isFavorite": False}

@router.get("/favorites/{email}")
def get_favorites(email: str, db: Session = Depends(database.get_db)):
    favorites = db.query(models.FavoriteProperty).filter(
        models.FavoriteProperty.email == email
    ).order_by(models.FavoriteProperty.created_at.desc()).all()
    
    return [
        {
            "id": fav.property_id,
            "title": fav.property_title,
            "price": fav.property_price,
            "location": fav.property_location,
            "city": fav.property_city,
            "image": fav.property_image,
            "bhk": fav.property_bhk,
            "sqft": fav.property_sqft
        }
        for fav in favorites
    ]

@router.get("/favorites/check/{email}/{property_id}")
def check_favorite(email: str, property_id: str, db: Session = Depends(database.get_db)):
    favorite = db.query(models.FavoriteProperty).filter(
        models.FavoriteProperty.email == email,
        models.FavoriteProperty.property_id == property_id
    ).first()
    return {"isFavorite": favorite is not None}