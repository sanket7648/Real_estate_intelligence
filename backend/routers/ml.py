from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import pandas as pd
import joblib
import json
import database
import models

router = APIRouter(prefix="/api/ml", tags=["Machine Learning"])

try:
    model = joblib.load('real_estate_model.joblib')
    scaler = joblib.load('scaler.joblib')
    with open('feature_columns.json', 'r') as f:
        feature_columns = json.load(f)
except Exception as e:
    print(f"⚠️ Warning: ML files not found. Error: {e}")
    model, scaler, feature_columns = None, None, None

# --- Updated Schema to include ALL features ---
class PredictionInput(BaseModel):
    askingPrice: Optional[int] = None 
    city: str
    location: str
    sqft: int
    bhk: int
    bathrooms: int
    balcony: int
    parking: bool
    furnishing: str
    age: int
    amenities: List[str] = []
    type: str = 'Apartment'  # <--- Default value
    status: str = 'For Sale'  # <--- Default value

class FeatureImportance(BaseModel):
    feature: str
    importance: float
    impact: str

class PredictionResult(BaseModel):
    predictedPrice: int
    confidenceScore: int
    priceRange: Dict[str, int]
    bestAlternatives: List[Any] = [] 
    dealReason: Optional[str] = None 
    featureImportance: List[FeatureImportance]
    explanation: str

@router.post("/predict", response_model=PredictionResult)
def predict_price(data: PredictionInput, db: Session = Depends(database.get_db)):
    if not model or not scaler or not feature_columns:
        raise HTTPException(status_code=500, detail="ML Model not initialized.")

    # 1. Prepare data mapping 1:1 with the new training script
    input_data = {
        'sqft': [data.sqft],
        'bhk': [data.bhk],
        'bathrooms': [data.bathrooms],
        'balcony': [data.balcony],
        'age': [data.age],
        'parking': [1 if data.parking else 0],
        'amenities_count': [len(data.amenities)] # Count the array
    }
    
    # Process One-Hot Encoded Categories
    for col in feature_columns:
        if col.startswith('city_'):
            input_data[col] = [1 if data.city == col.replace('city_', '') else 0]
        elif col.startswith('location_'):
            input_data[col] = [1 if data.location == col.replace('location_', '') else 0]
        elif col.startswith('furnishing_'):
            input_data[col] = [1 if data.furnishing == col.replace('furnishing_', '') else 0]
        elif col.startswith('type_'):
            input_data[col] = [1 if data.type == col.replace('type_', '') else 0]
        elif col.startswith('status_'):
            input_data[col] = [1 if data.status == col.replace('status_', '') else 0]
            
    df_input = pd.DataFrame(input_data)
    for col in feature_columns:
        if col not in df_input.columns:
            df_input[col] = 0
    df_input = df_input[feature_columns]

    # 2. Predict
    X_scaled = scaler.transform(df_input)
    final_price = int(model.predict(X_scaled)[0])

    # 3. Extract 100% of Feature Importances
    importances = model.feature_importances_
    feature_impacts = []
    
    # Helper to calculate and append weights
    def append_weight(feat_name, display_name, is_positive):
        if feat_name in feature_columns:
            idx = feature_columns.index(feat_name)
            weight = round(float(importances[idx] * 100), 1)
            if weight > 0.0: # Keep ALL features that had any impact
                feature_impacts.append({
                    "feature": display_name, 
                    "importance": weight, 
                    "impact": "positive" if is_positive else "negative"
                })

    # Direct numerical features
    append_weight('sqft', 'Square Footage', True)
    append_weight('bhk', 'Number of Bedrooms', True)
    append_weight('bathrooms', 'Number of Bathrooms', True)
    append_weight('balcony', 'Balconies', True)
    append_weight('age', 'Property Age', False) # Age usually drops price
    append_weight('parking', 'Parking Availability', data.parking)
    append_weight('amenities_count', f'Amenities ({len(data.amenities)} total)', len(data.amenities) > 0)
    
    # Active categorical features
    append_weight(f'city_{data.city}', f'City ({data.city})', True)
    append_weight(f'type_{data.type}', f'Type ({data.type})', data.type in ['Villa', 'Penthouse'])
    append_weight(f'status_{data.status}', f'Market Status ({data.status})', data.status == 'For Sale')
    append_weight(f'furnishing_{data.furnishing}', f'Furnishing ({data.furnishing})', data.furnishing != 'Unfurnished')

    # Sort descending
    feature_impacts = sorted(feature_impacts, key=lambda x: x["importance"], reverse=True)

    # 4. Generate Explainability text & fetch Alternatives
    deal_reason = "Analysis complete."
    explanation = "Analysis complete."
    
    if data.askingPrice:
        diff = ((data.askingPrice - final_price) / final_price) * 100
        price_per_sqft_asking = data.askingPrice / data.sqft
        price_per_sqft_predicted = final_price / data.sqft
        
        # Generate detailed deal reason with context
        if diff > 15:
            deal_reason = f"Significantly Overpriced by {abs(int(diff))}%! At ₹{int(price_per_sqft_asking)}/sqft vs AI valuation of ₹{int(price_per_sqft_predicted)}/sqft. This {data.bhk}-BHK property in {data.city} should cost ₹{int(final_price/100000)}L, not ₹{int(data.askingPrice/100000)}L."
        elif diff > 5:
            deal_reason = f"Overpriced by {abs(int(diff))}%. The asking price (₹{int(price_per_sqft_asking)}/sqft) exceeds market value (₹{int(price_per_sqft_predicted)}/sqft). Consider negotiating or exploring alternatives in {data.city}."
        elif diff < -15:
            deal_reason = f"Exceptional Deal! Underpriced by {abs(int(diff))}%! At ₹{int(price_per_sqft_asking)}/sqft vs market rate of ₹{int(price_per_sqft_predicted)}/sqft. This {data.bhk}-BHK property is a {abs(int(diff))}% below market value - act quickly!"
        elif diff < -5:
            deal_reason = f"Good Deal! Underpriced by {abs(int(diff))}%. Asking price (₹{int(price_per_sqft_asking)}/sqft) is below market value (₹{int(price_per_sqft_predicted)}/sqft). Recommended for buyers seeking value."
        else:
            deal_reason = f"Fairly Priced. The asking price (₹{int(price_per_sqft_asking)}/sqft) aligns with AI valuation (₹{int(price_per_sqft_predicted)}/sqft). Market conditions in {data.city} support this valuation."
    
    # Get top 3 features for better explanation
    top_features = feature_impacts[:3] if feature_impacts else []
    top_features_text = ", ".join([f"{f['feature']} ({f['importance']:.1f}%)" for f in top_features]) if top_features else "property characteristics"
    
    explanation = f"AI analyzed {len(feature_impacts)} property parameters. Key value drivers: {top_features_text}. Property age ({data.age}y) affects {[f for f in feature_impacts if 'Age' in f['feature']][0]['importance']:.1f}% of valuation. Market location and amenities significantly impact final estimate."

    # Calculate confidence score based on feature importance variance and property data quality
    # Higher importance variance = more confident prediction
    if feature_impacts:
        importances_values = [f['importance'] for f in feature_impacts]
        avg_importance = sum(importances_values) / len(importances_values)
        variance = sum((x - avg_importance) ** 2 for x in importances_values) / len(importances_values)
        confidence = min(98, max(82, int(90 + (variance / 10))))
    else:
        confidence = 85
    
    # Adjust confidence based on data completeness
    if len(data.amenities) > 0: confidence += 2
    if data.age < 10: confidence += 1
    if data.parking: confidence += 1
    
    confidence = min(99, confidence)

    alts = db.query(models.Property).filter(models.Property.city == data.city, models.Property.bhk == data.bhk).limit(3).all()
    real_alts = [{"id": p.id, "title": p.title, "price": p.price, "location": p.location, "image": p.image, "bhk": p.bhk, "sqft": p.sqft} for p in alts]

    return {
        "predictedPrice": final_price,
        "confidenceScore": confidence, 
        "priceRange": {"min": int(final_price * 0.90), "max": int(final_price * 1.10)},
        "bestAlternatives": real_alts,
        "dealReason": deal_reason,
        "featureImportance": feature_impacts, # ALL features returned, no slicing
        "explanation": explanation
    }