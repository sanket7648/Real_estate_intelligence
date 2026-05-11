import { useState, useEffect } from 'react';
import { MapPin, Shield, Zap, Home, Loader2, ArrowUpRight } from 'lucide-react';
import FavoriteButton from '../components/ui/FavoriteButton';
import { API_BASE_URL } from '../config';


export default function AreaRecommendationPage() {
  const [city, setCity] = useState('Bangalore');
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`${API_BASE_URL}/api/market/recommendations?city=${city}`)
      .then(res => res.json())
      .then(data => {
        setRecommendations(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch recommendations", err);
        setLoading(false);
      });
  }, [city]);

  return (
    <div className="p-6 max-w-7xl mx-auto animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white font-grotesk">AI Area Recommender</h1>
          <p className="text-slate-400 text-sm">Real-time neighborhood analysis based on database listings.</p>
        </div>
        <select 
          value={city} 
          onChange={(e) => setCity(e.target.value)} 
          className="bg-black/20 border border-white/10 rounded-xl px-5 py-3 text-white outline-none focus:border-sky-500/50 transition-all min-w-[200px]"
        >
          {['Mumbai', 'Bangalore', 'Hyderabad', 'Pune', 'Delhi', 'Chennai'].map(c => <option key={c}>{c}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="min-h-[400px] flex flex-col items-center justify-center text-sky-400 gap-4">
          <Loader2 className="w-10 h-10 animate-spin" />
          <p className="text-slate-400 text-sm">Analyzing properties in {city}...</p>
        </div>
      ) : recommendations.length === 0 ? (
        <div className="min-h-[400px] flex flex-col items-center justify-center border border-white/10 rounded-3xl glass bg-white/5">
          <MapPin className="w-12 h-12 text-slate-500 mb-4" />
          <h3 className="text-white text-lg font-bold">No Data Available</h3>
          <p className="text-slate-400">We don't have enough property data for {city} yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recommendations.map((rec, idx) => (
            <div key={idx} className="glass rounded-3xl overflow-hidden border border-white/10 hover:border-sky-500/50 transition-all group flex flex-col h-full hover:shadow-[0_0_30px_rgba(14,165,233,0.15)] relative">
              
              {/* Rank Badge */}
              <div className="absolute top-4 left-4 z-10 w-8 h-8 rounded-full bg-black/60 backdrop-blur-md border border-white/20 flex items-center justify-center text-white font-bold text-sm">
                #{idx + 1}
              </div>

              <div className="h-48 overflow-hidden relative flex-shrink-0">
                <img src={rec.image} alt={rec.area} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a1128] via-[#0a1128]/40 to-transparent"></div>

                {/* Favorites */}
                <div className="absolute top-3 right-3 z-10">
                  <FavoriteButton
                    propertyId={String(rec.id ?? rec.area)}
                    propertyTitle={rec.area}
                    price={Number(rec.avgPrice ?? 0)}
                    location={rec.area}
                    city={city}
                    image={rec.image}
                    bhk={1}
                    sqft={1}
                    size="sm"
                  />
                </div>

                <div className="absolute bottom-4 left-4 right-4">
                  <div className="flex justify-between items-end">
                    <div>
                      <h3 className="text-xl font-bold text-white leading-tight">{rec.area}</h3>
                      <div className="text-sm text-sky-400 mt-1 font-medium">₹{rec.avgPrice.toLocaleString()}/sqft Avg</div>
                    </div>
                    <div className="text-center bg-sky-500 text-white font-bold px-3 py-1.5 rounded-xl shadow-lg border border-sky-400">
                      <div className="text-[10px] uppercase tracking-wider opacity-80 leading-none mb-0.5">Score</div>
                      <div className="text-lg leading-none">{rec.overallScore}</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-6 flex-1 flex flex-col">
                <p className="text-sm text-slate-400 mb-6 flex-1">{rec.description}</p>
                
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center text-xs mb-1.5">
                      <span className="flex items-center gap-1.5 text-slate-300">
                        <Zap size={14} className="text-sky-400"/> Demand/Listings
                      </span>
                      <span className="font-bold text-white">{rec.connectivityScore}/100</span>
                    </div>
                    <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-sky-400 h-full rounded-full transition-all duration-1000" style={{ width: `${rec.connectivityScore}%` }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center text-xs mb-1.5">
                      <span className="flex items-center gap-1.5 text-slate-300">
                        <ArrowUpRight size={14} className="text-emerald-400"/> Affordability
                      </span>
                      <span className="font-bold text-white">{rec.affordabilityScore}/100</span>
                    </div>
                    <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-emerald-400 h-full rounded-full transition-all duration-1000 delay-100" style={{ width: `${rec.affordabilityScore}%` }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center text-xs mb-1.5">
                      <span className="flex items-center gap-1.5 text-slate-300">
                        <Home size={14} className="text-amber-400"/> Modernity (Avg Age)
                      </span>
                      <span className="font-bold text-white">{rec.amenitiesScore}/100</span>
                    </div>
                    <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-amber-400 h-full rounded-full transition-all duration-1000 delay-200" style={{ width: `${rec.amenitiesScore}%` }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}