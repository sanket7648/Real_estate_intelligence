import { useState, useEffect } from 'react';
import {
  Home, Brain, Scale, TrendingUp, MapPin, Map, BarChart3,
  Sparkles, ChevronLeft, ChevronRight, Building2, User
} from 'lucide-react';
import { Page } from '../../types';

interface SidebarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  onCollapsedChange?: (collapsed: boolean) => void;
}

const navItems: { id: Page; label: string; icon: typeof Home; badge?: string }[] = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'prediction', label: 'Price Prediction', icon: Brain, badge: 'AI' },
  { id: 'explainable-ai', label: 'Explainable AI', icon: Sparkles, badge: 'XAI' },
  { id: 'fair-price', label: 'Fair Price Analyzer', icon: Scale },
  { id: 'appreciation', label: 'Appreciation Forecast', icon: TrendingUp },
  { id: 'area-recommendation', label: 'Area Recommender', icon: MapPin, badge: 'AI' },
  { id: 'map', label: 'Property Map', icon: Map },
  //{ id: 'dashboard', label: 'Analytics Dashboard', icon: BarChart3 }
];

export default function Sidebar({ currentPage, onNavigate, onCollapsedChange }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  
  const defaultEmail = localStorage.getItem('user_email') || 'user@example.com';
  const [user, setUser] = useState({ name: 'My Profile', email: defaultEmail });

  useEffect(() => {
    const loadProfile = () => {
      const realEmail = localStorage.getItem('user_email') || 'user@example.com';
      try {
        const saved = localStorage.getItem('user_profile');
        if (saved) {
          const parsedUser = JSON.parse(saved);
          // CRITICAL FIX: Only use the saved profile if it belongs to the logged-in user AND isn't null!
          if (parsedUser && parsedUser.email === realEmail) {
            setUser(parsedUser);
            return;
          }
        }
        // Fallback if no profile is saved for this specific email
        setUser({ name: 'My Profile', email: realEmail });
      } catch (e) {
        // Fallback if JSON parsing fails
        setUser({ name: 'My Profile', email: realEmail });
      }
    };
    
    loadProfile(); 
    window.addEventListener('profileUpdated', loadProfile);
    return () => window.removeEventListener('profileUpdated', loadProfile);
  }, []);

  const handleCollapse = (val: boolean) => {
    setCollapsed(val);
    onCollapsedChange?.(val);
  };

  return (
    <aside
      className={`fixed top-0 left-0 h-screen z-40 flex flex-col transition-all duration-300 ease-in-out glass border-r border-white/8 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
      style={{ background: 'rgba(2,8,24,0.95)', backdropFilter: 'blur(20px)' }}
    >
      <div className="flex items-center gap-3 px-4 py-5 border-b border-white/8">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 relative"
          style={{ background: 'linear-gradient(135deg, #0ea5e9, #00d4ff)' }}>
          <Building2 size={20} className="text-white" />
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-sky-400 rounded-full animate-pulse" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <div className="text-sm font-bold text-white font-grotesk leading-tight">HomeSite AI</div>
            {/*<div className="text-xs text-sky-400">Intelligence System</div>*/}
          </div>
        )}
      </div>

      <nav className="flex-1 py-4 overflow-y-auto custom-scrollbar">
        <div className="space-y-1 px-3">
          {navItems.filter(item => item.id !== 'home').map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 relative group border ${
                  isActive
                    ? 'nav-active border-sky-500/40 text-sky-400'
                    : 'border-transparent text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon size={18} className={`flex-shrink-0 ${isActive ? 'text-sky-400' : ''}`} />
                {!collapsed && <span className="truncate">{item.label}</span>}
                {!collapsed && item.badge && (
                  <span className="ml-auto text-xs px-1.5 py-0.5 rounded-md font-semibold"
                    style={{ background: 'rgba(14,165,233,0.2)', color: '#0ea5e9', fontSize: '10px' }}>
                    {item.badge}
                  </span>
                )}
                {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r bg-sky-400" />}
                {collapsed && (
                  <div className="absolute left-full ml-3 px-2 py-1 bg-slate-900 text-white text-xs rounded-lg
                    whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border border-white/10 z-50">
                    {item.label}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Real User Profile Footer */}
      <div 
        className="p-4 border-t border-white/8 hover:bg-white/5 transition-colors cursor-pointer"
        onClick={() => onNavigate('profile')}
      >
        <div className={`flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}>
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-sky-600 to-sky-400 flex items-center justify-center flex-shrink-0 text-white font-bold shadow-lg shadow-sky-500/20 uppercase">
            {/* CRITICAL FIX: Safe fallback so it never crashes if user name is missing */}
            {user?.name ? user.name.charAt(0) : 'U'}
          </div>
          {!collapsed && (
            <div className="text-xs text-slate-400 overflow-hidden text-left flex-1">
              <div className="text-white font-medium truncate text-sm">{user?.name || 'My Profile'}</div>
              <div className="truncate">{user?.email || 'Loading...'}</div>
            </div>
          )}
        </div>
      </div>

      <button
        onClick={() => handleCollapse(!collapsed)}
        className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full border border-sky-500/40
          flex items-center justify-center text-sky-400 hover:bg-sky-500/20 transition-colors z-50"
        style={{ background: '#020818' }}
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>
    </aside>
  );
}