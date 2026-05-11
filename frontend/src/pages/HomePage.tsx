import { useState, useEffect } from 'react';
import { Search, ArrowRight, TrendingUp, Brain, Shield, Zap, MapPin, BarChart3, ChevronRight, Star } from 'lucide-react';
import { marketInsights } from '../data/mockData';
import PropertyCard from '../components/ui/PropertyCard';
import { Page, Property } from '../types';
import { API_BASE_URL } from '../config';

interface HomePageProps {
  onNavigate: (page: Page) => void;
  onSignIn?: () => void;
  isAuthenticated?: boolean;
}

const stats = [
  { value: '20000+', label: 'Properties Analyzed' },
  { value: '8', label: 'Cities Covered' },
];

const features = [
  { icon: Brain, title: 'AI Price Prediction', desc: 'ML-powered valuations with 99.2% accuracy', color: '#0ea5e9', page: 'prediction' as Page },
  { icon: Shield, title: 'Fair Price Analyzer', desc: 'Know if you are getting a fair deal instantly', color: '#00ff88', page: 'fair-price' as Page },
  { icon: TrendingUp, title: 'Investment Forecast', desc: '5-year appreciation predictions powered by AI', color: '#ffb700', page: 'appreciation' as Page },
  { icon: MapPin, title: 'Area Recommender', desc: 'Find the perfect neighborhood for your needs', color: '#f472b6', page: 'area-recommendation' as Page },
  { icon: BarChart3, title: 'Analytics Dashboard', desc: 'Real-time market trends and data insights', color: '#a78bfa', page: 'dashboard' as Page },
  { icon: Zap, title: 'Explainable AI', desc: 'Understand why a property is priced the way it is', color: '#fb923c', page: 'explainable-ai' as Page },
];

export default function HomePage({ onNavigate, onSignIn, isAuthenticated = false }: HomePageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  
  // State to hold properties from the backend
  const [liveProperties, setLiveProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch properties when the page loads
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const response = await fetch('${API_BASE_URL}/api/properties/');
        if (response.ok) {
          const data = await response.json();
          setLiveProperties(data.slice(0, 3)); // Only show top 3 on homepage
        }
      } catch (error) {
        console.error("Failed to fetch properties:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProperties();
  }, []);

  return (
    <div className="min-h-screen">
      {/* Navigation Bar */}
      <nav className="sticky top-0 z-40 bg-black/30 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain size={24} className="text-sky-400" />
            <span className="font-bold text-white text-lg">HomeSite AI</span>
          </div>
          {!isAuthenticated && onSignIn && (
            <button
              onClick={onSignIn}
              className="px-6 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-all hover:shadow-lg hover:shadow-blue-500/40"
            >
              Sign In
            </button>
          )}
          {isAuthenticated && (
            <div className="text-sm text-slate-400">
              ✓ Signed in
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden hero-gradient grid-pattern py-20 px-6">
        <div className="absolute top-20 right-10 w-72 h-72 rounded-full opacity-10 animate-float"
          style={{ background: 'radial-gradient(circle, #0ea5e9, transparent)', filter: 'blur(40px)' }} />
        <div className="absolute bottom-10 left-20 w-48 h-48 rounded-full opacity-10 animate-float"
          style={{ background: 'radial-gradient(circle, #00d4ff, transparent)', filter: 'blur(30px)', animationDelay: '2s' }} />

        <div className="max-w-4xl mx-auto text-center relative z-10">

          <h1 className="text-5xl md:text-6xl font-bold font-grotesk text-white leading-tight mb-6 animate-slide-up delay-100">
            AI-Powered Real Estate{' '}
            <span className="neon-text">Intelligence</span>
          </h1>

          <p className="text-lg text-slate-400 mb-10 max-w-2xl mx-auto animate-slide-up delay-200">
            Leverage cutting-edge AI to predict property prices, analyze fair value, forecast appreciation, and discover the best investment opportunities in real-time.
          </p>

          <div className="flex items-center gap-3 max-w-2xl mx-auto animate-slide-up delay-300">
            <div className="flex-1 flex items-center gap-3 glass-strong rounded-2xl px-5 py-4 border border-sky-500/20">
              <Search size={18} className="text-slate-400 flex-shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search city, location, or property type..."
                className="flex-1 bg-transparent text-white placeholder-slate-500 text-sm outline-none"
              />
              <button className="text-sky-400 hover:text-sky-300 transition-colors">
                <MapPin size={16} />
              </button>
            </div>
            <button
              onClick={() => onNavigate('prediction')}
              className="flex items-center gap-2 px-6 py-4 rounded-2xl font-semibold text-white text-sm transition-all hover:opacity-90 hover:scale-105"
              style={{ background: 'linear-gradient(135deg, #0ea5e9, #0284c7)', boxShadow: '0 0 20px rgba(14,165,233,0.4)' }}
            >
              Predict Price
              <ArrowRight size={16} />
            </button>
          </div>

          <div className="flex items-center justify-center gap-3 mt-5 flex-wrap animate-slide-up delay-400">
            {['Apartment', 'Villa', 'Penthouse', 'Studio', 'For Rent'].map((tag) => (
              <button key={tag} className="px-3 py-1.5 rounded-full glass border border-white/10 text-xs text-slate-400 hover:text-white hover:border-sky-500/40 transition-all">
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Centered Flexbox for the Stats */}
        <div className="max-w-3xl mx-auto mt-16 flex flex-wrap justify-center gap-6 animate-slide-up delay-500">
          {stats.map((s, i) => (
            <div key={i} className="glass rounded-2xl p-5 text-center border border-white/8 flex-1 min-w-[200px] max-w-[280px]">
              <div className="text-2xl font-bold text-white font-grotesk neon-text">{s.value}</div>
              <div className="text-xs text-slate-400 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section className="px-6 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <div className="text-sm text-sky-400 font-medium mb-2">AI CAPABILITIES</div>
            <h2 className="text-3xl font-bold text-white font-grotesk">Everything You Need to Invest Smart</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <button
                  key={i}
                  onClick={() => onNavigate(f.page)}
                  className="glass rounded-2xl p-6 border border-white/8 card-hover text-left group"
                >
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-all group-hover:scale-110"
                    style={{ background: `${f.color}20` }}>
                    <Icon size={22} style={{ color: f.color }} />
                  </div>
                  <h3 className="text-white font-semibold mb-2">{f.title}</h3>
                  <p className="text-slate-400 text-sm">{f.desc}</p>
                  <div className="flex items-center gap-1 mt-4 text-xs" style={{ color: f.color }}>
                    Explore <ChevronRight size={12} />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Market Insights */}
      <section className="px-6 py-8 pb-16">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="text-sm text-sky-400 font-medium mb-1">LIVE MARKET DATA</div>
              <h2 className="text-2xl font-bold text-white font-grotesk">Market Insights</h2>
            </div>
            <button onClick={() => onNavigate('dashboard')} className="flex items-center gap-1 text-sm text-sky-400 hover:text-sky-300 transition-colors">
              View All <ChevronRight size={14} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {marketInsights.map((m, i) => (
              <div key={i} className="glass rounded-2xl p-5 border border-white/8 card-hover">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-white">{m.city}</h3>
                  <span className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium ${
                    m.priceChange > 0 ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'
                  }`}>
                    <TrendingUp size={11} />
                    +{m.priceChange}%
                  </span>
                </div>
                <div className="text-xl font-bold text-white font-grotesk mb-1">
                  ₹{m.avgPrice.toLocaleString()}<span className="text-sm font-normal text-slate-400">/sqft</span>
                </div>
                <div className="flex gap-4 mt-3">
                  <div>
                    <div className="text-xs text-slate-500 mb-1">Demand</div>
                    <div className="flex items-center gap-2">
                      <div className="progress-bar w-20" style={{ height: '4px', borderRadius: '2px', background: 'rgba(255,255,255,0.1)' }}>
                        <div className="h-full rounded-full" style={{ width: `${m.demandScore}%`, background: '#0ea5e9' }} />
                      </div>
                      <span className="text-xs text-sky-400">{m.demandScore}</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 mb-1">Investment</div>
                    <div className="flex items-center gap-2">
                      <div className="progress-bar w-20" style={{ height: '4px', borderRadius: '2px', background: 'rgba(255,255,255,0.1)' }}>
                        <div className="h-full rounded-full" style={{ width: `${m.investmentScore}%`, background: '#00ff88' }} />
                      </div>
                      <span className="text-xs text-emerald-400">{m.investmentScore}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Properties (LIVE FROM BACKEND) */}
      <section className="px-6 py-8 pb-20" style={{ background: 'rgba(255,255,255,0.01)' }}>
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="text-sm text-sky-400 font-medium mb-1">CURATED SELECTION</div>
              <h2 className="text-2xl font-bold text-white font-grotesk">Live Properties</h2>
            </div>
            <div className="flex items-center gap-2">
              {['All', 'For Sale', 'For Rent'].map((f) => (
                <button key={f} className="text-sm px-3 py-1.5 rounded-lg glass border border-white/10 text-slate-400 hover:text-white hover:border-sky-500/40 transition-all">
                  {f}
                </button>
              ))}
            </div>
          </div>
          
          {loading ? (
            <div className="text-center text-sky-400 py-10">Loading properties from database...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {liveProperties.map((p) => (
                <PropertyCard key={p.id} property={p} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Trend preview CTA */}
      <section className="px-6 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="glass rounded-3xl p-8 md:p-12 border border-sky-500/20 relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, rgba(14,165,233,0.1), rgba(0,212,255,0.05))' }}>
            <div className="absolute top-0 right-0 w-64 h-64 opacity-20"
              style={{ background: 'radial-gradient(circle, #0ea5e9, transparent)', filter: 'blur(40px)' }} />
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Star size={16} className="text-amber-400" fill="currentColor" />
                  <span className="text-sm text-amber-400 font-medium">AI-Powered Intelligence</span>
                </div>
                <h2 className="text-3xl font-bold text-white font-grotesk mb-3">
                  Ready to Make Smarter<br />Real Estate Decisions?
                </h2>
                <p className="text-slate-400 max-w-md">
                  Use our AI engine to predict prices, analyze fair value, and find the perfect investment opportunity.
                </p>
              </div>
              <div className="flex flex-col gap-3 flex-shrink-0">
                <button
                  onClick={() => onNavigate('prediction')}
                  className="flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-semibold text-white transition-all hover:scale-105"
                  style={{ background: 'linear-gradient(135deg, #0ea5e9, #0284c7)', boxShadow: '0 0 30px rgba(14,165,233,0.4)' }}
                >
                  <Brain size={18} />
                  Predict Property Price
                </button>
                <button
                  onClick={() => onNavigate('area-recommendation')}
                  className="flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-semibold text-sky-400 border border-sky-500/40 glass transition-all hover:scale-105 hover:bg-sky-500/10"
                >
                  <MapPin size={18} />
                  Find Best Areas
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}