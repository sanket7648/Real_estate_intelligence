export interface Property {
  id: string;
  title: string;
  location: string;
  city: string;
  price: number;
  sqft: number;
  bhk: number;
  bathrooms: number;
  balcony: number;
  parking: boolean;
  furnishing: 'Furnished' | 'Semi-Furnished' | 'Unfurnished';
  age: number;
  amenities: string[];
  image: string;
  lat: number;
  lng: number;
  type: 'Apartment' | 'Villa' | 'Penthouse' | 'Studio';
  status: 'For Sale' | 'For Rent';
  rating: number;
}

export interface PredictionInput {
  city: string;
  location: string;
  sqft: number;
  bhk: number;
  bathrooms: number;
  balcony: number;
  parking: boolean;
  furnishing: string;
  age: number;
  amenities: string[];
}

export interface PredictionResult {
  predictedPrice: number;
  confidenceScore: number;
  priceRange: { min: number; max: number };
  similarProperties: Property[];
  featureImportance: FeatureImportance[];
  explanation: string;
}

export interface FeatureImportance {
  feature: string;
  importance: number;
  impact: 'positive' | 'negative';
}

export interface MarketInsight {
  city: string;
  avgPrice: number;
  priceChange: number;
  demandScore: number;
  investmentScore: number;
}

export interface AreaRecommendation {
  area: string;
  city: string;
  affordabilityScore: number;
  connectivityScore: number;
  safetyScore: number;
  amenitiesScore: number;
  avgPrice: number;
  overallScore: number;
  description: string;
  image: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export type Page =
  | 'home'
  | 'prediction'
  | 'explainable-ai'
  | 'fair-price'
  | 'appreciation'
  | 'area-recommendation'
  | 'map'
  //| 'dashboard'
  | 'chat'
  | 'profile';
