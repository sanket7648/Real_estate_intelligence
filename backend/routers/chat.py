from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional, Any, Dict
import models, database
import re

router = APIRouter(prefix="/api/chat", tags=["AI Chatbot"])

class ChatRequest(BaseModel):
    message: str
    context: Dict = {} 

class ChatResponse(BaseModel):
    reply: str
    properties: List[Any] = []
    new_context: Dict = {} 

def extract_intent(text: str, current_context: dict, db: Session):
    text = text.lower()
    
    # Start with memory or empty default
    intent = current_context.copy() if current_context else {"city": None, "location": None, "bhk": None, "max_price": None, "status": "For Sale", "limit": 3}
    intent["limit"] = 3 

    # 1. HANDLE NEGATION FIRST
    negated_places = re.findall(r'(?:not in|outside|no|except)\s+([a-z\s]+)', text)
    for np in negated_places:
        np = np.strip()
        if intent.get("city") and intent["city"].lower() == np:
            intent["city"] = None 
        if intent.get("location") and intent["location"].lower() == np:
            intent["location"] = None
        text = text.replace(np, "") 
    
    # 2. Extract City & Handle Memory Reset
    cities = ['mumbai', 'bangalore', 'delhi', 'hyderabad', 'pune', 'chennai', 'kolkata', 'ahmedabad']
    for city in cities:
        if city in text:
            # If the user changes the city, erase the old neighborhood from memory!
            if intent.get("city") and intent["city"].lower() != city:
                intent["location"] = None 
            intent["city"] = city.capitalize()
            break
            
    # 3. SMART LOCATION (AREA) EXTRACTOR
    all_locations = [row[0] for row in db.query(models.Property.location).distinct().all()]
    
    for loc in all_locations:
        loc_lower = loc.lower()
        
        # A. Exact phrase match (e.g., user types "hsr layout")
        if loc_lower in text:
            intent["location"] = loc
            break
            
        # B. Partial/Fuzzy match (e.g., user types "hsr", DB has "HSR Layout")
        # This removes common suffixes to find the core area name
        core_name = re.sub(r'\s+(layout|nagar|phase|city|hills|park|village|road|block)$', '', loc_lower).strip()
        
        # Check if the core name (e.g., "hsr") exists as a standalone word in the text
        if core_name and re.search(rf'\b{re.escape(core_name)}\b', text):
            intent["location"] = loc
            break

    # 4. Extract BHK
    bhk_match = re.search(r'(\d+)\s*(?:bhk|bed|bedroom)', text)
    if bhk_match:
        intent["bhk"] = int(bhk_match.group(1))
        
    # 5. Extract Budget
    budget_match = re.search(r'(?:under|below|budget|max).+?(\d+(?:\.\d+)?)\s*(cr|crore|lakh|l)', text)
    if not budget_match:
        budget_match = re.search(r'(\d+(?:\.\d+)?)\s*(cr|crore|lakh|l)', text)
        
    if budget_match:
        value = float(budget_match.group(1))
        unit = budget_match.group(2)
        if unit in ['cr', 'crore']:
            intent["max_price"] = int(value * 10000000)
        elif unit in ['lakh', 'l']:
            intent["max_price"] = int(value * 100000)

    # 6. Extract Status
    if 'rent' in text or 'lease' in text:
        intent["status"] = "For Rent"
    elif 'sale' in text or 'buy' in text:
        intent["status"] = "For Sale"
        
    # 7. Extract Limit
    limit_match = re.search(r'\b(\d+)\s+(?:options|properties|results|matches|houses|apartments|villas|choices)\b', text)
    if limit_match:
        intent["limit"] = min(int(limit_match.group(1)), 20)
    else:
        top_match = re.search(r'\btop\s+(\d+)\b', text)
        if top_match:
            intent["limit"] = min(int(top_match.group(1)), 20)
            
    return intent


@router.post("/", response_model=ChatResponse)
def chat_with_ai(request: ChatRequest, db: Session = Depends(database.get_db)):
    intent = extract_intent(request.message, request.context, db)
    query = db.query(models.Property)
    
    filters_applied = []
    loc_strings = []
    
    # 1. Filter by Location (using ilike for case-insensitive robust matching)
    if intent.get("location"):
        query = query.filter(models.Property.location.ilike(f"%{intent['location']}%"))
        loc_strings.append(intent["location"])
        
    # 2. Filter by City
    if intent.get("city"):
        query = query.filter(models.Property.city == intent["city"])
        loc_strings.append(intent["city"])
        
    # Combine location + city for the reply text
    if loc_strings:
        filters_applied.append(f"in {', '.join(loc_strings)}")

    # 3. Filter by BHK
    if intent.get("bhk"):
        query = query.filter(models.Property.bhk == intent["bhk"])
        filters_applied.append(f"{intent['bhk']} BHK")
        
    # 4. Filter by Status
    if intent.get("status"):
        query = query.filter(models.Property.status == intent["status"])
        filters_applied.append(f"{intent['status'].lower()}")
        
    # 5. Filter by Price
    if intent.get("max_price"):
        query = query.filter(models.Property.price <= intent["max_price"])
        formatted_price = f"₹{intent['max_price']/10000000}Cr" if intent['max_price'] >= 10000000 else f"₹{intent['max_price']/100000}L"
        filters_applied.append(f"under {formatted_price}")

    results = query.order_by(models.Property.price.desc()).limit(intent["limit"]).all()
    
    # Generate human-like response
    if not filters_applied:
        reply = "Hello! I'm your AI Real Estate Concierge. Tell me what you're looking for, such as: 'Find me a 2 BHK in HSR, Bangalore under 2 Cr'."
    elif len(results) > 0:
        filter_str = " ".join(filters_applied)
        if len(results) < intent["limit"]:
            reply = f"I could only find {len(results)} options {filter_str}. Here they are:"
        else:
            reply = f"Here are {len(results)} excellent options {filter_str} for you:"
    else:
        filter_str = " ".join(filters_applied)
        reply = f"I couldn't find any matches {filter_str} at the moment. Try adjusting your budget or exploring a different area!"

    properties_data = []
    for p in results:
        properties_data.append({
            "id": p.id, "title": p.title, "price": p.price, "location": p.location, "city": p.city,
            "image": p.image, "bhk": p.bhk, "sqft": p.sqft, "status": p.status, "type": p.property_type
        })

    return {"reply": reply, "properties": properties_data, "new_context": intent}