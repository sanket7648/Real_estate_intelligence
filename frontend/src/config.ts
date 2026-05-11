// src/config.ts
const rawApiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Normalize to avoid accidental double slashes when concatenating routes.
export const API_BASE_URL = rawApiBaseUrl.replace(/\/+$/, '');
