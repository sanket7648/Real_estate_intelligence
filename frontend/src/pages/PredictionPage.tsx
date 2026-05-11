import { useState } from 'react';
import { Brain, Sparkles, ChevronDown, CheckSquare, Square, BarChart3, TrendingUp, Home, Loader2 } from 'lucide-react';
import { CITIES, LOCATIONS, AMENITIES } from '../data/mockData';
import { PredictionInput, PredictionResult, Property } from '../types';
import PropertyCard from '../components/ui/PropertyCard';
import ScoreGauge from '../components/ui/ScoreGauge';
import FavoriteButton from '../components/ui/FavoriteButton';
import { API_BASE_URL } from '../config';

const FURNISHING_OPTIONS = ['Furnished', 'Semi-Furnished', 'Unfurnished'];
const PROPERTY_TYPES = ['Apartment', 'Villa', 'Penthouse', 'Studio'];
const STATUS_OPTIONS = ['For Sale', 'For Rent'];

const formatPrice = (p: number) => {
  if (p >= 10000000) return `₹${(p / 10000000).toFixed(2)} Cr`;
  return `₹${(p / 100000).toFixed(1)} L`;
};

export default function PredictionPage() {
  // Added type and status to the form state to capture 100% of features
  const [form, setForm] = useState<PredictionInput & { type: string, status: string }>({
    city: 'Mumbai', location: 'Bandra', sqft: 1200, bhk: 2,
    bathrooms: 2, balcony: 1, parking: true, furnishing: 'Semi-Furnished',
    age: 3, type: 'Apartment', status: 'For Sale', amenities: [],
  });
  
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const locations = LOCATIONS[form.city] || [];

  const handlePredict = async () => {
    setLoading(true);
    
    try {
      // Calling the REAL Machine Learning API
      const response = await fetch(`${API_BASE_URL}/api/ml/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      
      if (response.ok) {
        const data = await response.json();
        setResult(data);
      }
    } catch (error) {
      console.error("Prediction failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleAmenity = (a: string) => {
    setForm(f => ({
      ...f,
      amenities: f.amenities.includes(a) ? f.amenities.filter(x => x !== a) : [...f.amenities, a],
    }));
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-sky-500/20">
            <Brain size={20} className="text-sky-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white font-grotesk">House Price Prediction</h1>
            <p className="text-slate-400 text-sm">Validating against 20,000+ real listings in your database</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-2 space-y-5">
          <div className="glass rounded-2xl p-6 border border-white/8">
            <h2 className="text-base font-semibold text-white mb-5 flex items-center gap-2">
              <Home size={16} className="text-sky-400" /> Property Details
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1.5">City</label>
                <div className="relative">
                  <select
                    value={form.city}
                    onChange={e => setForm(f => ({ ...f, city: e.target.value, location: LOCATIONS[e.target.value]?.[0] || '' }))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm appearance-none focus:outline-none focus:border-sky-500/50 transition-colors"
                  >
                    {CITIES.map(c => <option key={c} value={c} className="bg-slate-900">{c}</option>)}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1.5">Location / Area</label>
                <div className="relative">
                  <select
                    value={form.location}
                    onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm appearance-none focus:outline-none focus:border-sky-500/50 transition-colors"
                  >
                    {locations.map(l => <option key={l} value={l} className="bg-slate-900">{l}</option>)}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {/* NEW: Property Type and Status */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5">Property Type</label>
                  <div className="relative">
                    <select
                      value={form.type}
                      onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm appearance-none focus:outline-none focus:border-sky-500/50 transition-colors"
                    >
                      {PROPERTY_TYPES.map(c => <option key={c} value={c} className="bg-slate-900">{c}</option>)}
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5">Market Status</label>
                  <div className="relative">
                    <select
                      value={form.status}
                      onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm appearance-none focus:outline-none focus:border-sky-500/50 transition-colors"
                    >
                      {STATUS_OPTIONS.map(c => <option key={c} value={c} className="bg-slate-900">{c}</option>)}
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1.5">Square Feet: <span className="text-sky-400">{form.sqft.toLocaleString()} sqft</span></label>
                <input type="range" min="300" max="10000" step="50" value={form.sqft}
                  onChange={e => setForm(f => ({ ...f, sqft: +e.target.value }))} className="w-full" />
                <div className="flex justify-between text-xs text-slate-500 mt-1"><span>300</span><span>10,000</span></div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5">BHK</label>
                  <div className="flex gap-2">
                    {[1,2,3,4,5].map(n => (
                      <button key={n} onClick={() => setForm(f => ({ ...f, bhk: n }))}
                        className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                          form.bhk === n ? 'bg-sky-500 text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10'
                        }`}>{n}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5">Bathrooms</label>
                  <div className="flex gap-2">
                    {[1,2,3,4].map(n => (
                      <button key={n} onClick={() => setForm(f => ({ ...f, bathrooms: n }))}
                        className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                          form.bathrooms === n ? 'bg-sky-500 text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10'
                        }`}>{n}</button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5">Balconies</label>
                  <div className="flex gap-2">
                    {[0,1,2,3].map(n => (
                      <button key={n} onClick={() => setForm(f => ({ ...f, balcony: n }))}
                        className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                          form.balcony === n ? 'bg-sky-500 text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10'
                        }`}>{n}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5">Property Age: <span className="text-sky-400">{form.age}y</span></label>
                  <input type="range" min="0" max="30" step="1" value={form.age}
                    onChange={e => setForm(f => ({ ...f, age: +e.target.value }))} className="w-full mt-2" />
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1.5">Furnishing Status</label>
                <div className="flex gap-2">
                  {FURNISHING_OPTIONS.map(opt => (
                    <button key={opt} onClick={() => setForm(f => ({ ...f, furnishing: opt }))}
                      className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${
                        form.furnishing === opt ? 'bg-sky-500 text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10'
                      }`}>{opt}</button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between py-2 px-3 rounded-xl bg-white/5 border border-white/8">
                <span className="text-sm text-slate-300">Parking Available</span>
                <button onClick={() => setForm(f => ({ ...f, parking: !f.parking }))}
                  className={`w-11 h-6 rounded-full transition-all relative ${form.parking ? 'bg-sky-500' : 'bg-white/10'}`}>
                  <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${form.parking ? 'right-0.5' : 'left-0.5'}`} />
                </button>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-2">Amenities ({form.amenities.length} selected)</label>
                <div className="grid grid-cols-2 gap-1.5">
                  {AMENITIES.map(a => (
                    <button key={a} onClick={() => toggleAmenity(a)}
                      className={`flex items-center gap-2 text-xs px-3 py-2 rounded-lg transition-all text-left ${
                        form.amenities.includes(a) ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30' : 'bg-white/5 text-slate-400 border border-transparent hover:bg-white/10'
                      }`}>
                      {form.amenities.includes(a) ? <CheckSquare size={12} /> : <Square size={12} />}
                      {a}
                    </button>
                  ))}
                </div>
              </div>

              <button onClick={handlePredict} disabled={loading}
                className="w-full py-4 rounded-2xl font-semibold text-white flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:opacity-70"
                style={{ background: 'linear-gradient(135deg, #0ea5e9, #0284c7)', boxShadow: '0 0 20px rgba(14,165,233,0.3)' }}>
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Querying ML Model...
                  </>
                ) : (
                  <>
                    <Sparkles size={18} />
                    Predict Price
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-5">
          {!result && !loading && (
            <div className="glass rounded-2xl p-12 border border-white/8 text-center flex flex-col items-center">
              <div className="w-20 h-20 rounded-full flex items-center justify-center mb-4 bg-sky-500/10 border border-sky-500/20">
                <Brain size={36} className="text-sky-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Ready to Predict</h3>
              <p className="text-slate-400 text-sm max-w-xs">Fill in the property details on the left and click "Predict Price" to query the full Machine Learning model.</p>
            </div>
          )}

          {loading && (
            <div className="glass rounded-2xl p-12 border border-sky-500/20 text-center flex flex-col items-center">
              <div className="w-20 h-20 rounded-full flex items-center justify-center mb-4 relative border-2 border-sky-500/20">
                <Brain size={32} className="text-sky-400 animate-pulse" />
                <div className="absolute inset-0 rounded-full border-2 border-sky-500/40 border-t-sky-400 animate-spin" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">AI is Analyzing...</h3>
              <p className="text-slate-400 text-sm">Processing current dataset factors and neural weights</p>
            </div>
          )}

          {result && !loading && (
            <>
              <div className="glass rounded-2xl p-6 border border-sky-500/20"
                style={{ background: 'linear-gradient(135deg, rgba(14,165,233,0.08), rgba(0,212,255,0.04))' }}>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="text-sm text-sky-400 mb-1 flex items-center gap-1 font-bold">
                      <Sparkles size={14} /> AI PREDICTED PRICE
                    </div>
                    <div className="text-4xl font-black text-white font-grotesk tracking-tight">{formatPrice(result.predictedPrice)}</div>
                    <div className="text-slate-400 text-xs mt-1 font-medium uppercase tracking-wider">
                      Confidence Range: {formatPrice(result.priceRange.min)} – {formatPrice(result.priceRange.max)}
                    </div>
                  </div>
                  <ScoreGauge score={result.confidenceScore} label="Confidence" size="lg" />
                </div>

                <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-white/8">
                  <div className="text-center">
                    <div className="text-[10px] text-slate-500 mb-1 uppercase font-bold">Per Sqft</div>
                    <div className="font-bold text-white text-sm">₹{Math.round(result.predictedPrice / form.sqft).toLocaleString()}</div>
                  </div>
                  <div className="text-center border-x border-white/8">
                    <div className="text-[10px] text-slate-500 mb-1 uppercase font-bold">Market Score</div>
                    <div className="font-bold text-emerald-400 text-sm">A+ High</div>
                  </div>
                  <div className="text-center">
                    <div className="text-[10px] text-slate-500 mb-1 uppercase font-bold">Database Sample</div>
                    <div className="font-bold text-sky-400 text-sm">20k Rows</div>
                  </div>
                </div>
              </div>

              <div className="glass rounded-2xl p-6 border border-white/8">
                <h3 className="font-bold text-white mb-4 flex items-center gap-2 text-sm">
                  <BarChart3 size={16} className="text-sky-400" /> VALUATION DRIVERS
                </h3>
                <div className="space-y-4">
                  {/* Map through the real feature importance returned from the API */}
                  {result.featureImportance.map((f: any, i: number) => (
                    <div key={i} className="space-y-1.5">
                      <div className="flex justify-between text-[10px] font-black uppercase tracking-tighter">
                         <span className="text-slate-400">{f.feature}</span>
                         <span className={f.impact === 'positive' ? 'text-emerald-400' : 'text-red-400'}>{f.importance}% Impact</span>
                      </div>
                      <div className="flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-1000"
                          style={{
                            width: `${f.importance}%`,
                            background: f.impact === 'positive' ? '#10b981' : '#ef4444',
                            boxShadow: `0 0 8px ${f.impact === 'positive' ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
                          }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>


            </>
          )}
        </div>
      </div>
    </div>
  );
}