import { useState, useEffect } from 'react';
import { User, Mail, MapPin, Home, Wallet, Save, Loader2, CheckCircle2, Heart, MapPin as MapPinIcon, BedDouble, Square } from 'lucide-react';
import { API_BASE_URL } from '../config';

export default function ProfilePage() {
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loadingFavorites, setLoadingFavorites] = useState(true);
  
  const realUserEmail = localStorage.getItem('user_email') || 'user@example.com';

  const [profile, setProfile] = useState({
    name: 'New User', 
    email: realUserEmail, 
    targetCity: 'Bangalore',
    targetBhk: '2',
    maxBudget: '20000000'
  });

  useEffect(() => {
    const fetchDBProfile = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/profile/${realUserEmail}`);
        if (response.ok) {
          const data = await response.json();
          if (data && data.email) {
            setProfile(data);
            localStorage.setItem('user_profile', JSON.stringify(data)); 
          }
        }
      } catch (error) {
        console.error("No existing profile found or DB offline.", error);
      }
    };
    
    const fetchFavorites = async () => {
      try {
        setLoadingFavorites(true);
        const response = await fetch(`${API_BASE_URL}/api/profile/favorites/${realUserEmail}`);
        if (response.ok) {
          const data = await response.json();
          setFavorites(data);
        }
      } catch (error) {
        console.error("Failed to fetch favorites:", error);
      } finally {
        setLoadingFavorites(false);
      }
    };
    
    fetchDBProfile();
    fetchFavorites();
  }, [realUserEmail]);

  const handleRemoveFavorite = async (propertyId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/profile/favorites/remove/${realUserEmail}/${propertyId}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        setFavorites(favorites.filter(fav => fav.id !== propertyId));
      }
    } catch (error) {
      console.error("Failed to remove favorite:", error);
    }
  };

  const formatPrice = (price: number) => {
    if (price >= 10000000) return `₹${(price / 10000000).toFixed(2)}Cr`;
    return `₹${(price / 100000).toFixed(1)}L`;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
    setSaved(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await fetch('${API_BASE_URL}/api/profile/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile)
      });
      
      localStorage.setItem('user_profile', JSON.stringify(profile));
      window.dispatchEvent(new Event('profileUpdated'));
      
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error("Failed to save profile:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto animate-fade-in">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-sky-500/20 border border-white/10"
             style={{ background: 'linear-gradient(135deg, #0ea5e9, #00d4ff)' }}>
          <User size={32} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white font-grotesk">My Profile</h1>
          <p className="text-slate-400 text-sm">Manage your account and favorite properties</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="glass rounded-3xl p-8 border border-white/10">
          <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <User size={18} className="text-sky-400" /> Personal Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm text-slate-400 mb-2 flex items-center gap-2">
                <User size={14} className="text-slate-500" /> Full Name
              </label>
              <input type="text" name="name" value={profile.name} onChange={handleChange} required
                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-sky-500/50 transition-colors" />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-2 flex items-center gap-2">
                <Mail size={14} className="text-slate-500" /> Email Address
              </label>
              <input type="email" name="email" value={profile.email} disabled
                className="w-full bg-black/20 border border-white/5 rounded-xl px-4 py-3 text-slate-500 outline-none cursor-not-allowed opacity-70" />
            </div>
          </div>
        </div>

        <div className="glass rounded-3xl p-8 border border-white/10">
          <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <Heart size={18} className="text-red-400" /> My Favorite Properties ({favorites.length})
          </h2>
          
          {loadingFavorites ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="animate-spin text-sky-400" size={24} />
            </div>
          ) : favorites.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {favorites.map(fav => (
                <div key={fav.id} className="glass rounded-2xl overflow-hidden border border-white/10 hover:border-red-500/30 transition-all group">
                  <div className="relative h-40 overflow-hidden">
                    <img src={fav.image} alt={fav.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <button 
                      onClick={() => handleRemoveFavorite(fav.id)}
                      className="absolute top-3 right-3 w-8 h-8 rounded-full bg-red-500/80 flex items-center justify-center text-white hover:bg-red-600 transition-all"
                    >
                      <Heart size={14} fill="currentColor" />
                    </button>
                    <div className="absolute bottom-2 left-2">
                      <div className="text-lg font-bold text-white font-grotesk">{formatPrice(fav.price)}</div>
                    </div>
                  </div>
                  <div className="p-3">
                    <h3 className="font-semibold text-white text-sm line-clamp-1 mb-1">{fav.title}</h3>
                    <div className="flex items-center gap-1 text-slate-400 text-xs mb-2">
                      <MapPinIcon size={11} />
                      <span className="line-clamp-1">{fav.location}, {fav.city}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-400 pt-2 border-t border-white/8">
                      <span className="flex items-center gap-1"><BedDouble size={11} /> {fav.bhk} BHK</span>
                      <span className="flex items-center gap-1"><Square size={11} /> {fav.sqft} sqft</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center">
              <Heart size={40} className="text-slate-500 mx-auto mb-3 opacity-50" />
              <p className="text-slate-400 text-sm">No favorite properties yet. Click the heart icon on any property to add it!</p>
            </div>
          )}
        </div>

        <div className="flex justify-end items-center gap-4 pt-4">
          {saved && (
            <span className="flex items-center gap-2 text-emerald-400 text-sm font-bold animate-fade-in px-4 py-2 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
              <CheckCircle2 size={18} /> Database Updated
            </span>
          )}
          <button type="submit" disabled={loading}
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-[0_0_20px_rgba(37,99,235,0.4)] disabled:opacity-50 flex items-center gap-2">
            {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
            Save Profile
          </button>
        </div>
      </form>
    </div>
  );
}