import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, BarChart3, Home, Activity, DollarSign, Loader2 } from 'lucide-react';
import StatCard from '../components/ui/StatCard';
import LineChart from '../components/ui/LineChart';
import BarChart from '../components/ui/BarChart';
import { API_BASE_URL } from '../config';

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/market/dashboard`);
        if (response.ok) {
          const result = await response.json();
          setData(result);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 animate-spin text-sky-400" />
          <p className="text-slate-400">Loading live market intelligence...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(14,165,233,0.15)' }}>
          <BarChart3 size={20} className="text-sky-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white font-grotesk">Analytics Dashboard</h1>
          <p className="text-slate-400 text-sm">Real-time market intelligence and trends</p>
        </div>
        <div className="ml-auto flex items-center gap-2 px-3 py-1.5 rounded-full glass border border-emerald-500/20 text-emerald-400 text-xs">
          <Activity size={12} className="animate-pulse" /> Live · Updated Just Now
        </div>
      </div>

      {/* Stat cards - Linked to database! */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="Total Listings" value={data.stats.totalListings.toLocaleString()} change={8.4} icon={<Home size={20} className="text-sky-400" />} />
        <StatCard title="Avg Market Price" value={`₹${data.stats.avgPrice.toLocaleString()}/sqft`} change={5.2} icon={<DollarSign size={20} className="text-emerald-400" />} iconBg="rgba(16,185,129,0.15)" />
        <StatCard title="Transactions This Month" value={data.stats.transactions.toLocaleString()} change={12.8} icon={<Activity size={20} className="text-amber-400" />} iconBg="rgba(245,158,11,0.15)" />
        <StatCard title="Avg Days on Market" value={`${data.stats.daysOnMarket} days`} change={-11.2} icon={<TrendingDown size={20} className="text-red-400" />} iconBg="rgba(239,68,68,0.15)" />
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 glass rounded-2xl p-6 border border-white/8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-white">Multi-City Price Trend 2024</h2>
            <div className="flex gap-3 text-xs">
              {[
                { label: 'Mumbai', color: '#ef4444' },
                { label: 'Bangalore', color: '#0ea5e9' },
                { label: 'Hyderabad', color: '#00ff88' },
                { label: 'Delhi', color: '#ffb700' },
              ].map(s => (
                <span key={s.label} className="flex items-center gap-1">
                  <span className="w-3 h-0.5 inline-block rounded" style={{ background: s.color }} />
                  <span className="text-slate-400">{s.label}</span>
                </span>
              ))}
            </div>
          </div>
          <LineChart
            series={[
              { label: 'Mumbai', data: data.trendData.mumbai, color: '#ef4444' },
              { label: 'Bangalore', data: data.trendData.bangalore, color: '#0ea5e9' },
              { label: 'Hyderabad', data: data.trendData.hyderabad, color: '#00ff88' },
              { label: 'Delhi', data: data.trendData.delhi, color: '#ffb700' },
            ]}
            labels={data.trendData.months}
            height={220}
          />
        </div>

        <div className="glass rounded-2xl p-6 border border-white/8">
          <h2 className="font-semibold text-white mb-4">City Demand Score</h2>
          <BarChart data={data.demandData} maxValue={100} height={220} showValues={false} />
        </div>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="glass rounded-2xl p-6 border border-white/8">
          <h2 className="font-semibold text-white mb-4">Monthly Transactions 2024</h2>
          <BarChart data={data.transactionData} height={200} />
        </div>

        <div className="glass rounded-2xl p-6 border border-white/8">
          <h2 className="font-semibold text-white mb-4">City Market Overview</h2>
          <div className="space-y-3">
            {data.marketInsights.map((m: any, i: number) => (
              <div key={i} className="flex items-center gap-3 py-2 border-b border-white/5 last:border-0">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white"
                  style={{ background: `hsl(${i * 50}, 70%, 40%)` }}>
                  {m.city.slice(0, 2)}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-white">{m.city}</div>
                  <div className="text-xs text-slate-400">₹{m.avgPrice.toLocaleString()}/sqft</div>
                </div>
                <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
                  m.priceChange > 0 ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'
                }`}>
                  {m.priceChange > 0 ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                  {m.priceChange > 0 ? '+' : ''}{m.priceChange}%
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-400">Invest.</div>
                  <div className="text-xs font-bold text-amber-400">{m.investmentScore}/100</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top investment areas */}
      <div className="glass rounded-2xl p-6 border border-white/8">
        <h2 className="font-semibold text-white mb-5">Top Investment Areas</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/8">
                <th className="text-left text-xs text-slate-400 pb-3 font-medium">#</th>
                <th className="text-left text-xs text-slate-400 pb-3 font-medium">Area</th>
                <th className="text-right text-xs text-slate-400 pb-3 font-medium">ROI</th>
                <th className="text-right text-xs text-slate-400 pb-3 font-medium">Transactions</th>
                <th className="text-right text-xs text-slate-400 pb-3 font-medium">Trend</th>
                <th className="text-right text-xs text-slate-400 pb-3 font-medium">Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {data.topAreas.map((a: any, i: number) => (
                <tr key={i} className="hover:bg-white/3 transition-colors">
                  <td className="py-3 text-slate-500 font-medium">{i + 1}</td>
                  <td className="py-3 text-white font-medium">{a.area}</td>
                  <td className="py-3 text-right text-emerald-400 font-bold">+{a.roi}%</td>
                  <td className="py-3 text-right text-slate-400">{a.transactions.toLocaleString()}</td>
                  <td className="py-3 text-right">
                    {a.trend === 'up'
                      ? <TrendingUp size={14} className="text-emerald-400 inline" />
                      : <TrendingDown size={14} className="text-red-400 inline" />}
                  </td>
                  <td className="py-3 text-right">
                    <span className="px-2 py-1 rounded-lg text-xs font-bold" style={{ background: 'rgba(0,255,136,0.1)', color: '#00ff88' }}>
                      {Math.round(70 + (a.roi / 25) * 30)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent listings */}
      <div className="glass rounded-2xl p-6 border border-white/8">
        <h2 className="font-semibold text-white mb-5">Recent High-Value Listings</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {data.recentListings.map((p: any) => (
            <div key={p.id} className="flex gap-3 p-3 rounded-xl border border-white/8 hover:border-sky-500/30 transition-all cursor-pointer">
              <img src={p.image} alt={p.title} className="w-16 h-12 rounded-lg object-cover flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-white truncate">{p.title}</div>
                <div className="text-xs text-slate-400 truncate">{p.location}, {p.city}</div>
                <div className="text-sm font-bold text-sky-400 mt-0.5">
                  {p.price >= 10000000 ? `₹${(p.price / 10000000).toFixed(1)}Cr` : `₹${(p.price / 100000).toFixed(0)}L`}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}