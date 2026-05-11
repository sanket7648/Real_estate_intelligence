import { useState } from 'react';
import { Calculator, ArrowRight, Loader2, MapPin, Calendar, TrendingUp } from 'lucide-react';
import LineChart from '../components/ui/LineChart';
import { LOCATIONS } from '../data/mockData'; 
import { API_BASE_URL } from '../config';

export default function AppreciationPage() {
  const [city, setCity] = useState('Mumbai');
  const [location, setLocation] = useState(LOCATIONS['Mumbai']?.[0] || '');
  const [currentPrice, setCurrentPrice] = useState<number>(10000000);
  const [duration, setDuration] = useState<number>(6); 
  
  const [forecast, setForecast] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetchForecast = async () => {
    setLoading(true);
    try {
      const response = await fetch('${API_BASE_URL}/api/market/forecast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          current_price: currentPrice, 
          city: city,
          location: location,
          years: duration
        })
      });
      if (response.ok) {
        const data = await response.json();
        setForecast(data);
      }
    } catch (err) {
      console.error("Failed to fetch forecast:", err);
    } finally {
      setLoading(false);
    }
  };

  // REMOVED the useEffect so the API does NOT fire on page load!

  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCity = e.target.value;
    setCity(newCity);
    setLocation(LOCATIONS[newCity]?.[0] || ''); 
  };

  const formatPrice = (p: number) => {
    if (p >= 10000000) return `₹${(p / 10000000).toFixed(2)}Cr`;
    return `₹${(p / 100000).toFixed(1)}L`;
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white font-grotesk flex items-center gap-2">
          <TrendingUp className="text-sky-400" /> Investment Forecast
        </h1>
        <p className="text-slate-400 text-sm">Dynamic appreciation projections driven by live neighborhood market data.</p>
      </div>

      <div className="glass rounded-3xl p-8 border border-white/10 flex gap-8 flex-col lg:flex-row">
        
        {/* Input Sidebar */}
        <div className="lg:w-1/3 space-y-6">
          <div>
            <h2 className="text-xl font-bold text-white font-grotesk flex items-center gap-2 mb-6">
              <Calculator className="text-sky-400" /> Parameters
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1 flex items-center gap-1">
                  <MapPin size={14}/> City
                </label>
                <select 
                  value={city} 
                  onChange={handleCityChange} 
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-sky-500/50 transition-colors"
                >
                  {['Mumbai', 'Bangalore', 'Hyderabad', 'Pune', 'Delhi', 'Chennai'].map(c => <option key={c} value={c} className="bg-[#0a1128]">{c}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-1">Area / Location</label>
                <select 
                  value={location} 
                  onChange={(e) => setLocation(e.target.value)} 
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-sky-500/50 transition-colors"
                >
                  {(LOCATIONS[city] || []).map((l: string) => <option key={l} value={l} className="bg-[#0a1128]">{l}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-1 flex items-center gap-1">
                  <Calendar size={14}/> Forecast Duration: <span className="text-sky-400 font-bold">{duration} Years</span>
                </label>
                <input 
                  type="range" 
                  min="1" 
                  max="15" 
                  value={duration} 
                  onChange={(e) => setDuration(Number(e.target.value))} 
                  className="w-full accent-sky-500 mb-2"
                />
                <div className="flex justify-between text-xs text-slate-500">
                  <span>1 Yr</span>
                  <span>15 Yrs</span>
                </div>
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-1 mt-2">Current Property Value (₹)</label>
                <input 
                  type="number" 
                  value={currentPrice} 
                  onChange={(e) => setCurrentPrice(Number(e.target.value))} 
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white outline-none mb-2 focus:border-sky-500/50 transition-colors" 
                />
              </div>
            </div>
            
            <button 
              onClick={fetchForecast} 
              disabled={loading} 
              className="w-full mt-4 bg-sky-500 hover:bg-sky-400 text-white font-bold py-3 rounded-xl flex justify-center items-center gap-2 transition-all shadow-[0_0_15px_rgba(14,165,233,0.4)] disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : 'Generate Forecast'} 
              {!loading && <ArrowRight size={16} />}
            </button>
          </div>
        </div>

        {/* Results Area */}
        <div className="lg:w-2/3">
          {loading ? (
            <div className="h-full flex flex-col items-center justify-center space-y-4 min-h-[400px]">
              <Loader2 className="animate-spin text-sky-400 w-12 h-12" />
              <p className="text-sky-400 font-medium animate-pulse">Calculating Market Trajectory...</p>
            </div>
          ) : forecast ? (
            <div className="glass bg-black/10 rounded-2xl p-6 border border-white/5 h-full flex flex-col animate-fade-in">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-white">{duration}-Year Trajectory ({location})</h3>
                <div className="flex gap-4 text-xs">
                  <span className="flex items-center gap-1"><span className="w-3 h-1 bg-emerald-400 rounded"></span> Optimistic</span>
                  <span className="flex items-center gap-1"><span className="w-3 h-1 bg-sky-400 rounded"></span> Moderate</span>
                  <span className="flex items-center gap-1"><span className="w-3 h-1 bg-purple-500 rounded"></span> Conservative</span>
                </div>
              </div>
              
              <div className="flex-1">
                <LineChart
                  series={[
                    { label: 'Optimistic', data: forecast.optimistic, color: '#10b981' },
                    { label: 'Moderate', data: forecast.moderate, color: '#0ea5e9' },
                    { label: 'Conservative', data: forecast.conservative, color: '#8b5cf6' }
                  ]}
                  labels={forecast.years}
                  height={300}
                />
              </div>

              {/* Dynamically access the last index of the array based on user's duration choice */}
              {(() => {
                const lastIdx = forecast.years.length - 1;
                return (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                    <div className="p-4 rounded-xl border border-white/5 bg-slate-500/10 text-center">
                      <div className="text-slate-400 text-xs mb-1">Conservative ROI</div>
                      <div className="text-white font-bold text-lg">{formatPrice(forecast.conservative[lastIdx])}</div>
                      <div className={`text-xs mt-1 ${forecast.conservative[lastIdx] >= currentPrice ? 'text-emerald-400' : 'text-red-400'}`}>
                        {forecast.conservative[lastIdx] >= currentPrice ? '+' : ''}
                        {((forecast.conservative[lastIdx] - currentPrice) / currentPrice * 100).toFixed(1)}%
                      </div>
                    </div>
                    <div className="p-4 rounded-xl border border-sky-500/20 bg-sky-500/10 text-center shadow-[0_0_15px_rgba(14,165,233,0.1)]">
                      <div className="text-sky-400 text-xs mb-1">Expected ROI</div>
                      <div className="text-white font-bold text-xl">{formatPrice(forecast.moderate[lastIdx])}</div>
                      <div className={`text-xs mt-1 font-bold ${forecast.moderate[lastIdx] >= currentPrice ? 'text-emerald-400' : 'text-red-400'}`}>
                        {forecast.moderate[lastIdx] >= currentPrice ? '+' : ''}
                        {((forecast.moderate[lastIdx] - currentPrice) / currentPrice * 100).toFixed(1)}%
                      </div>
                    </div>
                    <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-center">
                      <div className="text-emerald-400 text-xs mb-1">Optimistic ROI</div>
                      <div className="text-white font-bold text-lg">{formatPrice(forecast.optimistic[lastIdx])}</div>
                      <div className={`text-xs mt-1 ${forecast.optimistic[lastIdx] >= currentPrice ? 'text-emerald-400' : 'text-red-400'}`}>
                        {forecast.optimistic[lastIdx] >= currentPrice ? '+' : ''}
                        {((forecast.optimistic[lastIdx] - currentPrice) / currentPrice * 100).toFixed(1)}%
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          ) : (
            <div className="glass rounded-3xl p-8 border border-white/10 h-full flex flex-col items-center justify-center text-center opacity-50 min-h-[400px]">
              <TrendingUp size={64} className="text-sky-500/30 mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Project Future Value</h3>
              <p className="text-slate-400 max-w-sm">Enter your property parameters and click "Generate Forecast" to see AI-driven appreciation projections for your desired timeline.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}