import pandas as pd
import math
from dotenv import load_dotenv
import os

# 1. CRITICAL FIX: Load the .env file FIRST before importing database!
load_dotenv()

# 2. Now import the database connection (it will now see the Neon URL)
from database import SessionLocal
import models

# Quick debug print to verify it's using Neon
print(f"Connecting to: {os.getenv('DATABASE_URL')[:30]}...")

print("Loading CSV...")
df = pd.read_csv('real_estate_dataset_20000.csv')

# 1. Clean and map the data to match our SQLAlchemy models
print("Formatting data...")
df['parking'] = df['parking'].astype(str).str.lower() == 'true'
df = df.rename(columns={'type': 'property_type'})

# Convert the comma-separated amenities string into a proper Python list (JSON)
df['amenities'] = df['amenities'].apply(lambda x: x.split(',') if isinstance(x, str) else [])

# 2. Connect to the database
db = SessionLocal()

try:
    print("Clearing old mock properties...")
    db.query(models.Property).delete()
    db.commit()

    print(f"Importing {len(df)} properties into PostgreSQL. This might take a minute...")
    
    # Convert dataframe to a list of dictionaries for ultra-fast bulk insertion
    records = df.to_dict(orient='records')
    
    # Clean up any NaN values that might break the database insertion
    for record in records:
        for key, value in record.items():
            if isinstance(value, float) and math.isnan(value):
                record[key] = None

    db.bulk_insert_mappings(models.Property, records)
    db.commit()
    print("✅ Successfully imported all 20,000 properties into the Neon database!")

except Exception as e:
    print(f"❌ Error importing data: {e}")
    db.rollback()
finally:
    db.close()