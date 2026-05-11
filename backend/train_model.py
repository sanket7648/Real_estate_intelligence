import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import StandardScaler
import joblib
import json

print("Loading real estate dataset...")
df = pd.read_csv('real_estate_dataset_20000.csv')

# We are now including EVERY critical feature from the CSV
features = ['city', 'location', 'sqft', 'bhk', 'bathrooms', 'balcony', 'age', 'parking', 'furnishing', 'type', 'status', 'amenities', 'price']
df = df[features].copy()

print("Preprocessing data...")
# Format booleans
df['parking'] = df['parking'].astype(str).str.lower() == 'true'
df['parking'] = df['parking'].astype(int)

# Count the number of amenities (A property with 8 amenities is worth more than one with 0)
df['amenities_count'] = df['amenities'].apply(lambda x: len(str(x).split(',')) if pd.notna(x) else 0)
df = df.drop('amenities', axis=1) # Drop the raw text after counting

X = df.drop('price', axis=1)
y = df['price']

# One-Hot Encode ALL text categories
X_encoded = pd.get_dummies(X, columns=['city', 'location', 'furnishing', 'type', 'status'])

# Save layout
feature_columns = list(X_encoded.columns)
with open('feature_columns.json', 'w') as f:
    json.dump(feature_columns, f)

print("Scaling features...")
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X_encoded)
joblib.dump(scaler, 'scaler.joblib')

print("Training Random Forest Regressor on ALL features...")
X_train, X_test, y_train, y_test = train_test_split(X_scaled, y, test_size=0.2, random_state=42)

model = RandomForestRegressor(n_estimators=100, random_state=42, n_jobs=-1)
model.fit(X_train, y_train)

score = model.score(X_test, y_test)
print(f"✅ Model trained successfully! R^2 Score: {score:.4f}")

joblib.dump(model, 'real_estate_model.joblib')
print("✅ Saved model to 'real_estate_model.joblib'")