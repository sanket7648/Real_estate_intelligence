import { useState } from 'react';
import { Shield, MapPin, Loader2, TrendingDown, Scale, AlertCircle, CheckCircle2, Info, ChevronDown } from 'lucide-react';
import FavoriteButton from '../components/ui/FavoriteButton';
import { LOCATIONS } from '../data/mockData';
import { API_BASE_URL } from '../config';

export default function FairPricePage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    city: 'Mumbai',
    location: 'Bandra',
    askingPrice: 25000000, 
    sqft: 1200,
    bhk: 2,
    bathrooms: 2,
    balcony: 1,
    parking: true,
    furnishing: 'Semi-Furnished',
    age: 2,
    type: 'Apartment',
    status: 'For Sale',
    amenities: ['Security', 'Gym']
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
              type === 'number' ? Number(value) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/ml/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        const data = await response.json();
        setResult({
          ...data,
          askingPrice: formData.askingPrice
        });
      }
    } catch (error) {
      console.error("Analysis failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (p: number) => {
    if (p >= 10000000) return `₹${(p / 10000000).toFixed(2)}Cr`;
    return `₹${(p / 100000).toFixed(1)}L`;
  };

  const getDealStatus = (asking: number, predicted: number) => {
    const diff = ((asking - predicted) / predicted) * 100;
    if (diff > 5) return { text: 'Overpriced', color: 'text-red-400', bg: 'bg-red-500/20', icon: AlertCircle, border: 'border-red-500/50' };
    if (diff < -5) return { text: 'Great Deal', color: 'text-emerald-400', bg: 'bg-emerald-500/20', icon: CheckCircle2, border: 'border-emerald-500/50' };
    return { text: 'Fair Price', color: 'text-sky-400', bg: 'bg-sky-500/20', icon: Info, border: 'border-sky-500/50' };
  };

  return (
    <div className="p-6 max-w-7xl mx-auto animate-fade-in grid grid-cols-1 lg:grid-cols-12 gap-8">
      
      <div className="lg:col-span-4 glass rounded-3xl p-8 border border-white/10 h-fit">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-emerald-500/20 rounded-xl text-emerald-400">
            <Shield size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white font-grotesk">Fair Price Analyzer</h2>
            <p className="text-xs text-slate-400">Evaluate an asking price</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1">Seller's Asking Price (₹)</label>
            <input type="number" name="askingPrice" value={formData.askingPrice} onChange={handleInputChange} className="w-full bg-black/20 border border-emerald-500/30 rounded-xl px-4 py-3 text-emerald-400 font-bold outline-none focus:border-emerald-500 transition-colors" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">City</label>
              <div className="relative">
                <select name="city" value={formData.city} 
                  onChange={(e) => setFormData({...formData, city: e.target.value, location: LOCATIONS[e.target.value]?.[0] || ''})} 
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white appearance-none outline-none focus:border-sky-500/50">
                  {['Mumbai', 'Bangalore', 'Delhi', 'Hyderabad', 'Chennai', 'Pune'].map(c => <option key={c} value={c} className="bg-slate-900">{c}</option>)}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Location / Area</label>
              <div className="relative">
                <select name="location" value={formData.location} onChange={handleInputChange} 
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white appearance-none outline-none focus:border-sky-500/50">
                  {(LOCATIONS[formData.city] || []).map((l: string) => <option key={l} value={l} className="bg-slate-900">{l}</option>)}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">Property Type</label>
              <div className="relative">
                <select name="type" value={formData.type} onChange={handleInputChange} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white appearance-none outline-none focus:border-sky-500/50">
                  {['Apartment', 'Villa', 'Penthouse', 'Studio'].map(c => <option key={c} value={c} className="bg-slate-900">{c}</option>)}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Market Status</label>
              <div className="relative">
                <select name="status" value={formData.status} onChange={handleInputChange} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white appearance-none outline-none focus:border-sky-500/50">
                  {['For Sale', 'For Rent'].map(c => <option key={c} value={c} className="bg-slate-900">{c}</option>)}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm text-slate-400 mb-1">SqFt</label>
              <input type="number" name="sqft" value={formData.sqft} onChange={handleInputChange} className="w-full bg-black/20 border border-white/10 rounded-xl px-3 py-3 text-white outline-none focus:border-sky-500/50" />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">BHK</label>
              <input type="number" name="bhk" value={formData.bhk} onChange={handleInputChange} className="w-full bg-black/20 border border-white/10 rounded-xl px-3 py-3 text-white outline-none focus:border-sky-500/50" />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Age (Yrs)</label>
              <input type="number" name="age" value={formData.age} onChange={handleInputChange} className="w-full bg-black/20 border border-white/10 rounded-xl px-3 py-3 text-white outline-none focus:border-sky-500/50" />
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full mt-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.3)] disabled:opacity-50">
            {loading ? <Loader2 className="animate-spin" /> : <><Scale size={18} /> Analyze Deal</>}
          </button>
        </form>
      </div>

      <div className="lg:col-span-8">
        {result ? (
          <div className="space-y-6">
            
            {/* Top Analysis Card with Reason */}
            {(() => {
              const status = getDealStatus(result.askingPrice, result.predictedPrice);
              const StatusIcon = status.icon;
              return (
                <div className={`glass rounded-3xl overflow-hidden border ${status.border} transition-all`}>
                  
                  <div className={`p-4 ${status.bg} flex items-start gap-3 border-b ${status.border}`}>
                    <StatusIcon className={`mt-1 flex-shrink-0 ${status.color}`} size={20} />
                    <div>
                      <h3 className={`font-bold ${status.color}`}>{status.text}</h3>
                      <p className="text-sm text-white/90 leading-relaxed mt-1">{result.dealReason}</p>
                    </div>
                  </div>

                  <div className="p-8 flex flex-col md:flex-row items-center gap-8 justify-between">
                    <div className="text-center md:text-left">
                      <p className="text-slate-400 text-sm mb-1">Asking Price</p>
                      <div className="text-4xl font-bold text-white font-grotesk">{formatPrice(result.askingPrice)}</div>
                      <div className="text-xs text-slate-500 mt-1">₹{Math.round(result.askingPrice / formData.sqft).toLocaleString()}/sqft</div>
                    </div>

                    <div className="hidden md:flex flex-col items-center justify-center">
                      <div className="w-[2px] h-10 bg-white/10 mb-2"></div>
                      <div className="text-xs text-slate-500 font-bold tracking-widest uppercase">VS</div>
                      <div className="w-[2px] h-10 bg-white/10 mt-2"></div>
                    </div>

                    <div className="text-center md:text-right">
                      <p className="text-slate-400 text-sm mb-1 flex items-center justify-center md:justify-end gap-1">
                        AI True Valuation <Shield size={12} className="text-sky-400" />
                      </p>
                      <div className="text-4xl font-bold text-sky-400 font-grotesk">{formatPrice(result.predictedPrice)}</div>
                      <div className="text-xs text-slate-500 mt-1">₹{Math.round(result.predictedPrice / formData.sqft).toLocaleString()}/sqft</div>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Best Alternatives List */}
            <div className="glass rounded-3xl p-8 border border-white/10">
              <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <MapPin className="text-emerald-400" size={18} /> Best Alternative Choices in {formData.city}
              </h3>
              
              {result.bestAlternatives && result.bestAlternatives.length > 0 ? (
                <div className="space-y-4">
                  {result.bestAlternatives.map((prop: any, index: number) => {
                    const savings = result.askingPrice - prop.price;
                    const isBetterDeal = savings > 0;
                    
                    return (
                      <div key={prop.id || index} className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-emerald-500/30 transition-colors group">
                        <div className="relative">
                          <img src={prop.image} alt={prop.title} className="w-full sm:w-24 h-20 rounded-xl object-cover" />
                          <div className="absolute top-1 right-1 z-[30]" onClick={(e) => e.stopPropagation()}>
                            <FavoriteButton
                              propertyId={String(prop.id ?? index)}
                              propertyTitle={prop.title}
                              price={Number(prop.price ?? 0)}
                              location={prop.location}
                              city={formData.city}  // Safety fallback for favorite button
                              image={prop.image}
                              bhk={Number(prop.bhk ?? 1)}
                              sqft={Number(prop.sqft ?? 1)}
                              size="sm"
                              showLabel={false}
                            />
                          </div>
                        </div>
                        
                        <div className="flex-1 text-center sm:text-left">
                          <h4 className="text-white font-semibold line-clamp-1 group-hover:text-emerald-400 transition-colors">{prop.title}</h4>
                          <div className="text-xs text-slate-400 mt-1">{prop.location}, {prop.city}</div>
                          <div className="flex items-center justify-center sm:justify-start gap-3 mt-2 text-xs text-slate-300">
                            <span className="bg-black/30 px-2 py-1 rounded-md">{prop.bhk} BHK</span>
                            <span className="bg-black/30 px-2 py-1 rounded-md">{prop.sqft} sqft</span>
                          </div>
                        </div>

                        <div className="text-center sm:text-right w-full sm:w-auto mt-4 sm:mt-0">
                          <div className="text-lg font-bold text-white">{formatPrice(prop.price)}</div>
                          
                          {isBetterDeal ? (
                            <div className="text-xs font-bold mt-1 flex items-center justify-center sm:justify-end gap-1 text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-lg">
                              <TrendingDown size={12} /> Saves you {formatPrice(savings)}
                            </div>
                          ) : (
                            <div className="text-xs font-medium mt-1 text-slate-500">
                              Alternative Option
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 bg-black/20 rounded-2xl border border-white/5">
                  <p className="text-slate-400 text-sm">No alternative properties found in this location currently.</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="glass rounded-3xl p-8 border border-white/10 h-full flex flex-col items-center justify-center text-center opacity-50 min-h-[400px]">
            <Scale size={64} className="text-emerald-500/30 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Evaluate Real Estate Deals</h3>
            <p className="text-slate-400 max-w-sm">Enter the seller's asking price. Our AI will analyze the true value, provide a specific reason for the price gap, and find better alternatives in the same neighborhood.</p>
          </div>
        )}
      </div>
    </div>
  );
}