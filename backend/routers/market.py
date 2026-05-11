from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
import models, database
import random
import math
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

router = APIRouter(prefix="/api/market", tags=["Market Intelligence"])

@router.get("/dashboard")
def get_dashboard_data(db: Session = Depends(database.get_db)):
    # 1. Calculate Real Stats from PostgreSQL Database
    total_listings = db.query(models.Property).count()
    
    # Calculate global average price per sqft
    avg_price_row = db.query(func.avg(models.Property.price / models.Property.sqft)).scalar()
    avg_price = int(avg_price_row) if avg_price_row else 9200

    # Get the 3 most recent high-value properties
    recent_listings = db.query(models.Property).order_by(models.Property.price.desc()).limit(3).all()
    
    # Format properties for the frontend
    formatted_listings = []
    for p in recent_listings:
        formatted_listings.append({
            "id": p.id,
            "title": p.title,
            "location": p.location,
            "city": p.city,
            "price": p.price,
            "image": p.image
        })

    # 2. Dynamic City Market Overview
    cities = ['Mumbai', 'Bangalore', 'Hyderabad', 'Delhi', 'Pune', 'Chennai']
    market_insights = []
    for city in cities:
        # Get actual average price for the city if properties exist
        city_avg = db.query(func.avg(models.Property.price / models.Property.sqft)).filter(models.Property.city == city).scalar()
        
        market_insights.append({
            "city": city,
            "avgPrice": int(city_avg) if city_avg else random.randint(6000, 15000),
            "priceChange": round(random.uniform(-2.0, 12.0), 1),
            "demandScore": random.randint(75, 98),
            "investmentScore": random.randint(70, 95)
        })

    # 3. Return the complete dashboard payload
    return {
        "stats": {
            "totalListings": total_listings,
            "avgPrice": avg_price,
            "transactions": 3100, # Simulated live data
            "daysOnMarket": 18    # Simulated live data
        },
        "recentListings": formatted_listings,
        "marketInsights": market_insights,
        "topAreas": [
            {"area": "Bandra, Mumbai", "roi": 18.4, "transactions": 342, "trend": "up"},
            {"area": "Koramangala, Bangalore", "roi": 16.2, "transactions": 287, "trend": "up"},
            {"area": "Jubilee Hills, Hyderabad", "roi": 21.3, "transactions": 198, "trend": "up"},
            {"area": "Koregaon Park, Pune", "roi": 14.7, "transactions": 156, "trend": "up"},
            {"area": "South Delhi", "roi": 11.2, "transactions": 421, "trend": "down"},
            {"area": "Powai, Mumbai", "roi": 15.8, "transactions": 264, "trend": "up"}
        ],
        "transactionData": [
            {"label": "Jan", "value": 1820}, {"label": "Feb", "value": 1950},
            {"label": "Mar", "value": 2100}, {"label": "Apr", "value": 2280},
            {"label": "May", "value": 2150}, {"label": "Jun", "value": 2400},
            {"label": "Jul", "value": 2600}, {"label": "Aug", "value": 2450},
            {"label": "Sep", "value": 2700}, {"label": "Oct", "value": 2900},
            {"label": "Nov", "value": 2750}, {"label": "Dec", "value": 3100}
        ],
        "trendData": {
            "months": ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            "mumbai": [16200, 16800, 17100, 17400, 17200, 17800, 18100, 17900, 18400, 18700, 18500, 18500],
            "bangalore": [7200, 7400, 7500, 7600, 7800, 7900, 8000, 7950, 8100, 8150, 8200, 8200],
            "hyderabad": [6600, 6800, 7000, 7100, 7300, 7400, 7500, 7600, 7700, 7750, 7800, 7800],
            "delhi": [11200, 11400, 11500, 11600, 11700, 11800, 11900, 11950, 12000, 12050, 12000, 12000]
        },
        "demandData": [
            {"label": "Mumbai", "value": 94, "color": "linear-gradient(to top, #ef4444, #f87171)"},
            {"label": "Bangalore", "value": 92, "color": "linear-gradient(to top, #f97316, #fb923c)"},
            {"label": "Hyderabad", "value": 89, "color": "linear-gradient(to top, #eab308, #facc15)"},
            {"label": "Delhi", "value": 85, "color": "linear-gradient(to top, #22c55e, #4ade80)"},
            {"label": "Pune", "value": 86, "color": "linear-gradient(to top, #0ea5e9, #38bdf8)"},
            {"label": "Chennai", "value": 81, "color": "linear-gradient(to top, #a855f7, #c084fc)"}
        ]
    }

class ForecastRequest(BaseModel):
    current_price: int
    city: str
    location: str
    years: int

@router.post("/forecast")
def get_investment_forecast(data: ForecastRequest, db: Session = Depends(database.get_db)):
    # 1. Calculate actual average price for this SPECIFIC LOCATION (Area)
    loc_avg_row = db.query(func.avg(models.Property.price / models.Property.sqft)).filter(
        models.Property.city == data.city,
        models.Property.location == data.location
    ).scalar()
    
    # Fallback to city average if the specific location has no data
    if not loc_avg_row:
        loc_avg_row = db.query(func.avg(models.Property.price / models.Property.sqft)).filter(
            models.Property.city == data.city
        ).scalar()
        
    local_avg = float(loc_avg_row) if loc_avg_row else 8000.0
    
    # 2. Calculate global average to see if this neighborhood is over/under performing
    global_avg_row = db.query(func.avg(models.Property.price / models.Property.sqft)).scalar()
    global_avg = float(global_avg_row) if global_avg_row else 8000.0

    # 3. Dynamic Growth Rates
    market_ratio = global_avg / local_avg if local_avg > 0 else 1.0
    base_cagr = 0.05 
    adjusted_cagr = base_cagr * (market_ratio ** 0.5) 
    
    cons_rate = 1.0 + max(0.03, adjusted_cagr)
    mod_rate = 1.0 + max(0.06, adjusted_cagr + 0.03)
    opt_rate = 1.0 + max(0.09, adjusted_cagr + 0.06)
    
    # 4. Generate the dynamic X-Axis (Years) based on user's slider
    current_year = datetime.now().year
    years_array = [current_year + i for i in range(data.years + 1)]
    
    cons, mod, opt = [data.current_price], [data.current_price], [data.current_price]
    
    # 5. Apply standard compounding for the EXACT number of years requested
    for _ in range(data.years):
        cons.append(int(cons[-1] * cons_rate))
        mod.append(int(mod[-1] * mod_rate))
        opt.append(int(opt[-1] * opt_rate))
        
    return {
        "years": years_array,
        "conservative": cons,
        "moderate": mod,
        "optimistic": opt
    }

@router.get("/recommendations")
def get_area_recommendations(city: str = "Bangalore", db: Session = Depends(database.get_db)):
    # 1. Get city overall stats to establish baselines
    city_stats = db.query(
        func.avg(models.Property.price / models.Property.sqft).label('city_avg_price')
    ).filter(models.Property.city == city).first()
    
    city_avg_price = float(city_stats.city_avg_price) if city_stats and city_stats.city_avg_price else 10000

    # 2. Group real properties by location within the city
    locations = db.query(
        models.Property.location,
        func.count(models.Property.id).label('total_listings'),
        func.avg(models.Property.price / models.Property.sqft).label('avg_price_sqft'),
        func.avg(models.Property.age).label('avg_age')
    ).filter(models.Property.city == city).group_by(models.Property.location).having(func.count(models.Property.id) > 5).all()

    recommendations = []
    
    for loc in locations:
        loc_name = loc.location
        listings = int(loc.total_listings)
        avg_price = float(loc.avg_price_sqft)
        avg_age = float(loc.avg_age)
        
        # --- Calculate Real Scores ---
        affordability = min(max(int((city_avg_price / avg_price) * 50), 10), 98)
        connectivity = min(max(int(math.log(listings) * 20), 40), 95)
        amenities_score = min(max(int(100 - (avg_age * 2)), 50), 98)
        overall = int((affordability * 0.4) + (connectivity * 0.3) + (amenities_score * 0.3))
        
        desc = f"A {'premium' if avg_price > city_avg_price else 'value-driven'} neighborhood with {listings} active listings. "
        desc += f"Properties here have an average age of {round(avg_age, 1)} years."

        img_url = "https://images.pexels.com/photos/2635038/pexels-photo-2635038.jpeg?auto=compress&cs=tinysrgb&w=600" if avg_price > city_avg_price else "https://images.pexels.com/photos/1396132/pexels-photo-1396132.jpeg?auto=compress&cs=tinysrgb&w=600"

        recommendations.append({
            "area": loc_name,
            "city": city,
            "affordabilityScore": affordability,
            "connectivityScore": connectivity,
            "safetyScore": amenities_score,
            "amenitiesScore": amenities_score,
            "avgPrice": int(avg_price),
            "overallScore": overall,
            "description": desc,
            "image": img_url
        })

    recommendations = sorted(recommendations, key=lambda x: x['overallScore'], reverse=True)
    return recommendations[:6]