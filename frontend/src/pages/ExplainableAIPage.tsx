import { useState } from 'react';
import { Zap, Loader2, TrendingUp, TrendingDown, ChevronDown } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { LOCATIONS } from '../data/mockData';
import { API_BASE_URL } from '../config';

export default function ExplainableAIPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    city: 'Mumbai',
    location: 'Bandra',
    sqft: 1500,
    bhk: 3,
    bathrooms: 3,
    balcony: 2,
    parking: true,
    furnishing: 'Furnished',
    age: 1,
    type: 'Apartment',
    status: 'For Sale',
    amenities: ['Security', 'Gym', 'Lift', 'Pool']
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev, 
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : type === 'number' ? Number(value) : value
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
      if (response.ok) setResult(await response.json());
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in">
      
      {/* Input Form with ALL features + Area/Location */}
      <div className="lg:col-span-4 glass rounded-3xl p-8 border border-white/10 h-fit">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-orange-500/20 rounded-xl text-orange-400">
            <Zap size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white font-grotesk">Explainable AI</h2>
            <p className="text-xs text-slate-400">Analyze 100% of dataset parameters</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">City</label>
              <div className="relative">
                <select name="city" value={formData.city} 
                  onChange={(e) => setFormData({...formData, city: e.target.value, location: LOCATIONS[e.target.value]?.[0] || ''})} 
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white appearance-none outline-none focus:border-orange-500/50">
                  {['Mumbai', 'Bangalore', 'Delhi', 'Hyderabad', 'Chennai', 'Pune'].map(c => <option key={c} value={c} className="bg-slate-900">{c}</option>)}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Location / Area</label>
              <div className="relative">
                <select name="location" value={formData.location} onChange={handleInputChange} 
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white appearance-none outline-none focus:border-orange-500/50">
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
                <select name="type" value={formData.type} onChange={handleInputChange} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white appearance-none outline-none focus:border-orange-500/50">
                  {['Apartment', 'Villa', 'Penthouse', 'Studio'].map(c => <option key={c} value={c} className="bg-slate-900">{c}</option>)}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Market Status</label>
              <div className="relative">
                <select name="status" value={formData.status} onChange={handleInputChange} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white appearance-none outline-none focus:border-orange-500/50">
                  {['For Sale', 'For Rent'].map(c => <option key={c} value={c} className="bg-slate-900">{c}</option>)}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm text-slate-400 mb-1">SqFt</label>
              <input type="number" name="sqft" value={formData.sqft} onChange={handleInputChange} className="w-full bg-black/20 border border-white/10 rounded-xl px-3 py-3 text-white outline-none focus:border-orange-500/50" />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">BHK</label>
              <input type="number" name="bhk" value={formData.bhk} onChange={handleInputChange} className="w-full bg-black/20 border border-white/10 rounded-xl px-3 py-3 text-white outline-none focus:border-orange-500/50" />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Age (Yrs)</label>
              <input type="number" name="age" value={formData.age} onChange={handleInputChange} className="w-full bg-black/20 border border-white/10 rounded-xl px-3 py-3 text-white outline-none focus:border-orange-500/50" />
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full mt-6 bg-orange-500 hover:bg-orange-400 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(249,115,22,0.3)] disabled:opacity-50">
            {loading ? <Loader2 className="animate-spin" /> : <><Zap size={18} /> Reveal AI Weights</>}
          </button>
        </form>
      </div>

      <div className="lg:col-span-8">
        {result ? (
          <div className="space-y-6">
            <div className="glass rounded-3xl p-8 border border-white/10">
              
              <div className="mb-8 border-b border-white/10 pb-6">
                <h3 className="text-slate-400 text-sm uppercase tracking-wider mb-2">Final AI Valuation</h3>
                <div className="text-4xl font-bold text-white font-grotesk">
                  ₹{result.predictedPrice >= 10000000 ? (result.predictedPrice / 10000000).toFixed(2) + ' Cr' : (result.predictedPrice / 100000).toFixed(1) + ' L'}
                </div>
                <p className="text-sm text-slate-400 mt-2">{result.explanation}</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-5 gap-8 items-start">
                
                {/* Visual Chart - EXPANDED HEIGHT TO FIT ALL FEATURES */}
                <div className="h-[500px] md:col-span-3 w-full">
                  <h4 className="text-sm font-bold text-white mb-4 text-center">Mathematical Impact (SHAP)</h4>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={result.featureImportance} layout="vertical" margin={{ top: 0, right: 30, left: 20, bottom: 0 }}>
                      <XAxis type="number" stroke="rgba(255,255,255,0.2)" tickFormatter={(val) => `${val}%`} />
                      <YAxis dataKey="feature" type="category" stroke="rgba(255,255,255,0.7)" width={130} axisLine={false} tickLine={false} fontSize={12} />
                      <Tooltip 
                        cursor={{fill: 'rgba(255,255,255,0.05)'}}
                        contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}
                        formatter={(value: any) => [`${value}% Impact`, 'Weight']}
                      />
                      <Bar dataKey="importance" radius={[0, 4, 4, 0]} barSize={16}>
                        {result.featureImportance.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={entry.impact === 'positive' ? '#10b981' : '#ef4444'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Plain English Translation - Scrollable */}
                <div className="space-y-3 md:col-span-2 h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                  <h4 className="text-sm font-bold text-white mb-2 sticky top-0 bg-[#0a1128] py-2 z-10">Top Drivers Breakdown</h4>
                  {result.featureImportance.map((feat: any, idx: number) => (
                    <div key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
                      <div className={`mt-0.5 p-1.5 rounded-lg ${feat.impact === 'positive' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                        {feat.impact === 'positive' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white flex items-center gap-2">
                          {feat.feature}
                          <span className={`text-xs px-2 py-0.5 rounded-full ${feat.impact === 'positive' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                            {feat.importance}%
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

              </div>
            </div>
          </div>
        ) : (
          <div className="glass rounded-3xl p-8 border border-white/10 h-full flex flex-col items-center justify-center text-center opacity-50 min-h-[400px]">
            <Zap size={64} className="text-orange-500/30 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Deconstruct the Algorithm</h3>
            <p className="text-slate-400 max-w-sm">Enter property details to visualize exactly how the machine learning model weights all features—from City and Neighborhood Location to Amenities—to arrive at a price.</p>
          </div>
        )}
      </div>
    </div>
  );
}