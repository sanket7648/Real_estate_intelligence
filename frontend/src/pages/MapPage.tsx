import { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Map as MapIcon, Search, MapPin, BedDouble, Square, Filter } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import FavoriteButton from '../components/ui/FavoriteButton';
import { API_BASE_URL } from '../config';

// Create custom icons with different colors
const createCustomIcon = (color: string) => {
  return new L.Icon({
    iconUrl: `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 25 41'%3E%3Cpath d='M12.5 0C5.6 0 0 5.6 0 12.5c0 12.5 12.5 28.5 12.5 28.5s12.5-16 12.5-28.5C25 5.6 19.4 0 12.5 0z' fill='${encodeURIComponent(color)}'/%3E%3Ccircle cx='12.5' cy='12.5' r='4' fill='white'/%3E%3C/svg%3E`,
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    shadowSize: [41, 41],
    shadowAnchor: [13, 41],
    popupAnchor: [1, -34]
  });
};

export default function MapPage() {
  const [properties, setProperties] = useState<any[]>([]);
  const [cityFilter, setCityFilter] = useState('All');
  const [activeProperty, setActiveProperty] = useState<any | null>(null);

  useEffect(() => {
    // Fetch 200 real properties to plot on the map
    const url = cityFilter === 'All' 
      ? `${API_BASE_URL}/api/properties/?limit=200`
      : `${API_BASE_URL}/api/properties/?city=${cityFilter}&limit=200`;

    fetch(url)
      .then(res => res.json())
      .then(data => setProperties(data))
      .catch(err => console.error("Error fetching map properties:", err));
  }, [cityFilter]);

  // Calculate price statistics
  const priceStats = useMemo(() => {
    if (properties.length === 0) return { median: 0, p75: 0 };
    const prices = properties.map(p => p.price).sort((a, b) => a - b);
    const median = prices[Math.floor(prices.length / 2)];
    const p75 = prices[Math.floor(prices.length * 0.75)];
    return { median, p75 };
  }, [properties]);

  const formatPrice = (p: number) => {
    if (p >= 10000000) return `₹${(p / 10000000).toFixed(2)}Cr`;
    return `₹${(p / 100000).toFixed(1)}L`;
  };

  // Get icon color based on price
  const getMarkerColor = (price: number) => {
    if (price > priceStats.p75) return '#FF6B35'; // Orange-Red for expensive
    if (price > priceStats.median) return '#F7931E'; // Orange for above average
    return '#4CAF50'; // Green for affordable
  };

  const getPriceCategory = (price: number) => {
    if (price > priceStats.p75) return 'Premium';
    if (price > priceStats.median) return 'Above Average';
    return 'Affordable';
  };

  // Center of India
  const defaultCenter: [number, number] = [20.5937, 78.9629];

  return (
    <div className="p-6 max-w-7xl mx-auto h-[calc(100vh-100px)] flex flex-col animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-violet-500/15">
            <MapIcon size={20} className="text-violet-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white font-grotesk">Interactive Property Map</h1>
            <p className="text-slate-400 text-sm">Real geographic data with price indicators • {properties.length} properties shown</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Filter size={16} className="text-slate-400" />
          <select 
            value={cityFilter} 
            onChange={(e) => setCityFilter(e.target.value)}
            className="bg-black/20 border border-white/10 rounded-xl px-4 py-2 text-white outline-none focus:border-violet-500/50"
          >
            {['All', 'Mumbai', 'Bangalore', 'Delhi', 'Hyderabad', 'Pune', 'Chennai'].map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      <div className="flex-1 glass rounded-3xl border border-white/10 overflow-hidden relative">
        {/* The Real Interactive Map */}
        <MapContainer 
          center={defaultCenter} 
          zoom={5} 
          style={{ height: '100%', width: '100%', zIndex: 10 }}
        >
          {/* Dark Mode Map Tiles */}
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />

          {properties.map(property => (
            <Marker 
              key={property.id} 
              position={[property.lat, property.lng]} 
              icon={createCustomIcon(getMarkerColor(property.price))}
              eventHandlers={{ click: () => setActiveProperty(property) }}
            >
              <Popup className="custom-popup">
                <div className="text-slate-900 w-56">
                  <div className="relative">
                    <img src={property.image} alt={property.title} className="w-full h-24 object-cover rounded-lg mb-2" />
                    <div className="absolute top-2 right-2 z-[30]" onClick={(e) => e.stopPropagation()}>
                      <FavoriteButton
                        propertyId={String(property.id)}
                        propertyTitle={property.title}
                        price={Number(property.price)}
                        location={property.location}
                        city={property.city}
                        image={property.image}
                        bhk={Number(property.bhk)}
                        sqft={Number(property.sqft)}
                        size="sm"
                      />
                    </div>
                  </div>
                  <h3 className="font-bold text-sm line-clamp-1">{property.title}</h3>
                  <div className="text-violet-600 font-bold my-1">{formatPrice(property.price)}</div>
                  <div className={`text-xs font-semibold mb-2 px-2 py-1 rounded ${
                    getPriceCategory(property.price) === 'Premium' ? 'bg-orange-100 text-orange-700' :
                    getPriceCategory(property.price) === 'Above Average' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {getPriceCategory(property.price)}
                  </div>
                  <div className="text-xs text-slate-500 flex justify-between">
                    <span>{property.bhk} BHK</span>
                    <span>{property.sqft} sqft</span>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {/* Legend Box */}
        <div className="absolute top-6 right-6 z-[20] glass bg-black/70 backdrop-blur-xl p-4 rounded-2xl border border-white/20 shadow-2xl">
          <h3 className="text-white font-bold text-sm mb-3">Price Indicators</h3>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#FF6B35' }}></div>
              <span className="text-xs text-slate-300">Premium (Top 25%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#F7931E' }}></div>
              <span className="text-xs text-slate-300">Above Average</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#4CAF50' }}></div>
              <span className="text-xs text-slate-300">Affordable</span>
            </div>
          </div>
        </div>

        {/* Selected Property Overlay */}
        {activeProperty && (
          <div className="absolute bottom-6 left-6 z-[20] w-80 glass bg-black/60 backdrop-blur-xl p-4 rounded-2xl border border-white/20 shadow-2xl animate-slide-up">
            <button onClick={() => setActiveProperty(null)} className="absolute top-2 right-3 text-slate-400 hover:text-white">✕</button>
            <img src={activeProperty.image} alt={activeProperty.title} className="w-full h-32 object-cover rounded-xl mb-3" />
            <h3 className="text-white font-bold">{activeProperty.title}</h3>
            <div className="flex items-center gap-1 text-slate-400 text-xs mt-1 mb-2">
              <MapPin size={12} /> {activeProperty.location}, {activeProperty.city}
            </div>
            <div className="text-xl font-bold text-violet-400">{formatPrice(activeProperty.price)}</div>
            <div className="flex gap-4 mt-3 pt-3 border-t border-white/10 text-xs text-slate-300">
              <span className="flex items-center gap-1"><BedDouble size={14} className="text-slate-400" /> {activeProperty.bhk} BHK</span>
              <span className="flex items-center gap-1"><Square size={14} className="text-slate-400" /> {activeProperty.sqft} sqft</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}