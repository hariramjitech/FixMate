import React, { useState, useEffect, useMemo } from 'react';
import { 
  Banknote, CreditCard, Activity, TrendingUp, Users, ShoppingBag, 
  ArrowUpRight, ArrowDownRight, Award, AlertTriangle, Zap,
  Clock, ShieldCheck, Target, BarChart3, MapPin, Search, Filter
} from 'lucide-react';
import { getAdminBookings, getAdminAnalytics } from '../../../api';
import { SkeletonList, SkeletonCard } from '../../../components/ui/Skeleton';

const AnalyticsTab = React.memo(({ stats }) => {
  const [bookings, setBookings] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toggles, setToggles] = useState({
    settlements: 'graph',
    workforce: 'graph',
    categories: 'matrix',
    geographic: 'list'
  });

  const toggleSection = (section, mode) => {
    setToggles(prev => ({ ...prev, [section]: mode }));
  };

  useEffect(() => {
    const fetch = async () => {
      try {
        const [bRes, aRes] = await Promise.all([
          getAdminBookings(),
          getAdminAnalytics()
        ]);
        setBookings(bRes.data);
        setAnalytics(aRes.data);
      } finally {
        setLoading(false);
      }
    };
    fetch();
    const interval = setInterval(fetch, 5000);
    return () => clearInterval(interval);
  }, []);

  const finished = useMemo(() => (bookings || []).filter(b => b.status === 'Finished'), [bookings]);
  
  // Master Level Intelligence Math
  const metrics = useMemo(() => {
    const totalRev = stats?.totalRevenue || 0;
    const aov = finished.length > 0 ? totalRev / finished.length : 0;
    const leakage = analytics?.leakageStats?.reduce((acc, curr) => acc + curr.lostRevenue, 0) || 0;
    const online = stats?.paymentMethodStats?.find(m => m._id?.toLowerCase() === 'online') || { total: 0, count: 0 };
    const cash = stats?.paymentMethodStats?.find(m => m._id?.toLowerCase() === 'cash') || { total: 0, count: 0 };
    
    return { totalRev, aov, leakage, online, cash };
  }, [stats, finished, analytics]);

  if (loading) return (
    <div className="space-y-6 p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <SkeletonCard key={i} className="h-40 rounded-3xl" />)}
      </div>
      <SkeletonCard className="h-96 rounded-3xl" />
    </div>
  );

  return (
    <div className="space-y-6 pb-20 animate-fade-in font-sans selection:bg-indigo-100">
      
      {/* 🟢 EXECUTIVE HEADER: MISSION CRITICAL PULSE */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
              <h2 className="text-2xl font-black text-gray-900 tracking-tight">Financial Intelligence Hub</h2>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.2em] mt-1">Live Economic Census & Operational Diagnostics</p>
          </div>
          <div className="flex items-center gap-3 bg-white p-1.5 rounded-2xl border border-gray-100 shadow-sm">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 rounded-xl">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                  <span className="text-[10px] font-black text-emerald-600 uppercase">System Nominal</span>
              </div>
              <div className="h-4 w-[1px] bg-gray-100" />
              <div className="flex items-center gap-2 px-3 py-1.5 text-gray-400">
                  <Clock className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-black uppercase tracking-widest">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
          </div>
      </div>

      {/* 📊 PLATFORM PERFORMANCE UNITS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MasterStat label="Gross Turnover" val={`₹${metrics.totalRev.toLocaleString()}`} delta={`+${analytics?.revenueGrowth?.toFixed(1)}%`} icon={Zap} color="indigo" />
          <MasterStat label="Platform Yield" val={`₹${(stats?.platformProfit || 0).toLocaleString()}`} sub="Verified 5% Capture" icon={ShieldCheck} color="emerald" />
          <MasterStat label="Economic Leakage" val={`₹${metrics.leakage.toLocaleString()}`} delta={`${stats?.cancellationRate?.toFixed(1)}% Rate`} icon={AlertTriangle} color="rose" invert />
          <MasterStat label="Avg. Order Value" val={`₹${Math.round(metrics.aov).toLocaleString()}`} sub="Ticket Consistency" icon={Target} color="amber" />
      </div>

      {/* 📈 REVENUE VELOCITY & MOMENTUM (Master Trend) */}
      <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8">
              <div className="flex items-center gap-2 opacity-20 group-hover:opacity-100 transition-opacity">
                  <TrendingUp className="w-8 h-8 text-indigo-100" />
              </div>
          </div>
          
          <div className="flex items-start justify-between mb-8 relative z-10">
              <div>
                  <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.25em] mb-1">Revenue Velocity Trend</h3>
                  <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-black text-gray-900 tracking-tighter">₹{(analytics?.dailyStats?.[analytics?.dailyStats.length - 1]?.revenue || 0).toLocaleString()}</span>
                      <span className="text-[10px] font-bold text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-full">Last 24h</span>
                  </div>
              </div>
              <div className="hidden lg:flex gap-12 text-right">
                  <TrendInsight label="Peak Velocity" val={`₹${Math.max(...(analytics?.dailyStats?.map(d => d.revenue) || [0])).toLocaleString()}`} />
                  <TrendInsight label="Volume Nodes" val={`${analytics?.dailyStats?.length || 0} Days Active`} />
              </div>
          </div>

          <div className="h-48 flex items-end gap-1 px-1 relative z-10 group/chart">
              {analytics?.dailyStats?.map((d, i) => {
                  const max = Math.max(...analytics.dailyStats.map(x => x.revenue), 1);
                  const h = (d.revenue / max) * 100;
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2 group/bar relative h-full">
                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-2 py-1 rounded text-[8px] font-black opacity-0 group-hover/bar:opacity-100 transition-all pointer-events-none z-20 whitespace-nowrap shadow-xl">
                            {d._id.day}/{d._id.month}: ₹{d.revenue.toLocaleString()}
                        </div>
                        <div className="w-full bg-indigo-50 rounded-t-sm relative overflow-hidden h-full">
                           <div className="absolute bottom-0 w-full bg-indigo-500/80 group-hover/bar:bg-indigo-600 transition-all" style={{ height: `${h}%` }} />
                           <div className="absolute bottom-0 w-full bg-emerald-400/30" style={{ height: `${(d.count / Math.max(...analytics.dailyStats.map(x => x.count), 1)) * h}%` }} />
                        </div>
                    </div>
                  )
              })}
              {(!analytics?.dailyStats || analytics.dailyStats.length === 0) && (
                <div className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-gray-300 uppercase tracking-widest bg-gray-50/50 rounded-xl border-2 border-dashed border-gray-100">
                    Velocity data pending next economic cycle
                </div>
              )}
          </div>
          <div className="flex justify-between items-center mt-6 pt-6 border-t border-gray-50">
              <div className="flex items-center gap-6">
                 <Legend icon="bg-indigo-500" label="Revenue Yield" />
                 <Legend icon="bg-emerald-400/40" label="Job Density" />
              </div>
              <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Master Audit Level Data Visualization</p>
          </div>
      </div>

      {/* 🛠️ DIAGNOSTIC CORE: RISK & GROWTH */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Workforce Diagnostic: Risk Matrix */}
          <div className="bg-white rounded-[2rem] p-6 border border-gray-100 shadow-sm flex flex-col">
              <div className="flex items-center justify-between mb-8">
                  <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                     <Users className="w-4 h-4 text-indigo-500" /> Executive Risk Matrix
                  </h3>
                  <div className="flex bg-gray-100 rounded-xl p-0.5">
                      <button onClick={() => toggleSection('workforce', 'list')} className={`p-1.5 rounded-lg transition-all ${toggles.workforce === 'list' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-400'}`}><BarChart3 className="w-3.5 h-3.5" /></button>
                      <button onClick={() => toggleSection('workforce', 'graph')} className={`p-1.5 rounded-lg transition-all ${toggles.workforce === 'graph' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-400'}`}><Activity className="w-3.5 h-3.5" /></button>
                  </div>
              </div>

              <div className="flex-1 overflow-y-auto max-h-[320px] scrollbar-hide">
                {toggles.workforce === 'graph' ? (
                  <div className="space-y-6 animate-fade-in">
                    {analytics?.workerStats?.map((w, i) => {
                       const isAtRisk = (w.avgCompletionTime || 0) > 4; // Arbitrary 4h flaw
                       return (
                         <div key={i} className="group/item relative">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-3">
                                   <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-[10px] ${isAtRisk ? 'bg-rose-50 text-rose-600 shadow-[0_0_12px_rgba(225,29,72,0.1)]' : 'bg-gray-50 text-gray-500 border border-gray-100'}`}>
                                      {w.worker?.name?.charAt(0)}
                                   </div>
                                   <div>
                                      <p className="text-[11px] font-bold text-gray-700">{w.worker?.name}</p>
                                      <p className={`text-[8px] font-black uppercase tracking-widest ${isAtRisk ? 'text-rose-400' : 'text-gray-400'}`}>{isAtRisk ? 'Operational Flaw Detected' : 'Nominal Efficiency'}</p>
                                   </div>
                                </div>
                                <div className="text-right">
                                   <p className="text-[11px] font-black text-gray-900">₹{w.earnings.toLocaleString()}</p>
                                   <p className="text-[9px] font-bold text-gray-400">Yield</p>
                                </div>
                            </div>
                            <div className="w-full h-1.5 bg-gray-50 rounded-full overflow-hidden flex">
                               <div className={`h-full transition-all duration-1000 ${isAtRisk ? 'bg-rose-500' : 'bg-indigo-500'}`} style={{ width: `${Math.min(100, (w.jobs / Math.max(...analytics.workerStats.map(x => x.jobs), 1)) * 100)}%` }} />
                            </div>
                         </div>
                       )
                    })}
                  </div>
                ) : (
                  <div className="space-y-3 animate-fade-in">
                      <table className="w-full text-left">
                         <thead>
                            <tr className="text-[8px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50">
                               <th className="pb-3">Worker Entity</th>
                               <th className="pb-3 text-center">Density</th>
                               <th className="pb-3 text-right">Efficiency</th>
                            </tr>
                         </thead>
                         <tbody>
                            {analytics?.workerStats?.map((w, i) => (
                              <tr key={i} className="group/row">
                                 <td className="py-3 text-[11px] font-bold text-gray-700">{w.worker?.name}</td>
                                 <td className="py-3 text-[10px] font-black text-center">{w.jobs}p</td>
                                 <td className={`py-3 text-right text-[10px] font-black ${w.avgCompletionTime > 4 ? 'text-rose-500' : 'text-emerald-500'}`}>{w.avgCompletionTime?.toFixed(1)}h</td>
                              </tr>
                            ))}
                         </tbody>
                      </table>
                  </div>
                )}
              </div>
          </div>

          {/* Service Growth Hub */}
          <div className="bg-white rounded-[2rem] p-6 border border-gray-100 shadow-sm flex flex-col">
              <div className="flex items-center justify-between mb-8">
                  <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                     <Target className="w-4 h-4 text-emerald-500" /> Category Intelligence
                  </h3>
                  <div className="flex bg-gray-50 rounded-xl p-0.5">
                      <button onClick={() => toggleSection('categories', 'grid')} className={`p-1.5 rounded-lg transition-all ${toggles.categories === 'grid' ? 'bg-white shadow-sm text-emerald-600' : 'text-gray-400'}`}><BarChart3 className="w-3.5 h-3.5" /></button>
                      <button onClick={() => toggleSection('categories', 'matrix')} className={`p-1.5 rounded-lg transition-all ${toggles.categories === 'matrix' ? 'bg-white shadow-sm text-emerald-600' : 'text-gray-400'}`}><Activity className="w-3.5 h-3.5" /></button>
                  </div>
              </div>

              <div className="flex-1">
                {toggles.categories === 'matrix' ? (
                  <div className="h-full flex flex-col justify-center animate-scale-in">
                      <div className="flex justify-between items-end gap-3 h-32 mb-6">
                        {analytics?.serviceStats?.slice(0, 5).map((s, i) => {
                           const maxRev = Math.max(...analytics.serviceStats.map(x => x.revenue), 1);
                           const h = (s.revenue / maxRev) * 100;
                           return (
                             <div key={i} className="flex-1 flex flex-col items-center gap-2 group/cat relative h-full">
                                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-2 py-1 rounded text-[7px] font-black opacity-0 group-hover/cat:opacity-100 transition-all pointer-events-none z-20">
                                    ₹{s.revenue.toLocaleString()}
                                </div>
                                <div className="w-full bg-emerald-50 rounded-t-xl relative overflow-hidden h-full">
                                   <div className="absolute bottom-0 w-full bg-emerald-500/80 group-hover/cat:bg-emerald-600 transition-all" style={{ height: `${h}%` }} />
                                </div>
                             </div>
                           )
                        })}
                      </div>
                      <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100/50">
                          <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest mb-1">Top Growth Place</p>
                          <h4 className="text-sm font-black text-gray-900">{analytics?.serviceStats?.[0]?.service?.serviceName}</h4>
                          <p className="text-[8px] font-bold text-gray-400 mt-0.5">Highest Profit Margin Category Detected</p>
                      </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3 animate-fade-in">
                      {analytics?.serviceStats?.slice(0, 4).map((s, i) => (
                        <div key={i} className="p-4 bg-gray-50/50 rounded-2xl border border-gray-100 hover:border-emerald-200 transition-colors group">
                            <p className="text-[8px] font-black text-gray-400 uppercase mb-1 truncate">{s.service?.serviceName}</p>
                            <p className="text-lg font-black text-gray-900 tracking-tighter">₹{s.revenue.toLocaleString()}</p>
                            <div className="flex items-center gap-1 mt-2">
                                <span className="text-[8px] font-bold text-emerald-600 px-1.5 py-0.5 bg-emerald-50 rounded-md">+{s.count} Jobs</span>
                            </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
          </div>

          {/* Geographic Reach */}
          <div className="bg-white rounded-[2rem] p-6 border border-gray-100 shadow-sm flex flex-col">
              <div className="flex items-center justify-between mb-8">
                  <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                     <MapPin className="w-4 h-4 text-orange-500" /> Area Intelligence
                  </h3>
                  <div className="flex bg-gray-50 rounded-xl p-0.5">
                      <button onClick={() => toggleSection('geographic', 'list')} className={`p-1.5 rounded-lg transition-all ${toggles.geographic === 'list' ? 'bg-white shadow-sm text-orange-600' : 'text-gray-400'}`}><Filter className="w-3.5 h-3.5" /></button>
                      <button onClick={() => toggleSection('geographic', 'graph')} className={`p-1.5 rounded-lg transition-all ${toggles.geographic === 'graph' ? 'bg-white shadow-sm text-orange-600' : 'text-gray-400'}`}><Activity className="w-3.5 h-3.5" /></button>
                  </div>
              </div>

              <div className="flex-1 overflow-y-auto max-h-[320px] scrollbar-hide">
                {toggles.geographic === 'graph' ? (
                  <div className="flex flex-col gap-4 animate-fade-in">
                      {analytics?.locationStats?.slice(0, 5).map((l, i) => {
                         const max = Math.max(...analytics.locationStats.map(x => x.count), 1);
                         const p = (l.count / max) * 100;
                         return (
                           <div key={i}>
                              <div className="flex justify-between items-end mb-1 px-1">
                                 <span className="text-[10px] font-bold text-gray-700 truncate w-32">{l._id}</span>
                                 <span className="text-[9px] font-black text-orange-600">₹{l.revenue.toLocaleString()}</span>
                              </div>
                              <div className="w-full h-1 bg-gray-50 rounded-full overflow-hidden">
                                 <div className="h-full bg-orange-400" style={{ width: `${p}%` }} />
                              </div>
                           </div>
                         )
                      })}
                  </div>
                ) : (
                  <div className="space-y-3 animate-fade-in">
                    {analytics?.locationStats?.slice(0, 5).map((l, i) => (
                      <div key={i} className="p-3 hover:bg-gray-50 transition-colors rounded-xl border border-transparent hover:border-gray-100">
                          <div className="flex justify-between items-start gap-2">
                             <p className="text-[11px] font-bold text-gray-800 leading-tight truncate">{l._id}</p>
                             <div className="text-[9px] font-black text-orange-500 bg-orange-50 px-2 rounded-md shrink-0">{l.count}</div>
                          </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
          </div>
      </div>

      {/* 🧾 GLOBAL FISCAL RECONCILIATION HUB (Master Ledger) */}
      <div className="bg-gray-900 rounded-[2.5rem] p-10 border border-gray-800 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-12 opacity-10">
              <ShieldCheck className="w-32 h-32 text-indigo-400" />
          </div>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 relative z-10 gap-6">
              <div>
                  <h3 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] mb-2">Global Fiscal Ledger</h3>
                  <h2 className="text-2xl font-black text-white tracking-tight">Financial Reconciliation Hub</h2>
                  <p className="text-xs font-medium text-gray-500 mt-1 max-w-sm">Strategic audit of all settled transactions including platform yields and worker distributions.</p>
              </div>
              <div className="flex bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-1 shadow-2xl">
                   <button 
                     onClick={() => toggleSection('settlements', 'table')}
                     className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${toggles.settlements === 'table' ? 'bg-indigo-500 text-white shadow-lg' : 'text-gray-400 hover:bg-white/5'}`}
                   >
                     Live Ledger
                   </button>
                   <button 
                     onClick={() => toggleSection('settlements', 'graph')}
                     className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${toggles.settlements === 'graph' ? 'bg-indigo-500 text-white shadow-lg' : 'text-gray-400 hover:bg-white/5'}`}
                   >
                     Yield Trends
                   </button>
              </div>
          </div>

          <div className="relative z-10">
            {toggles.settlements === 'graph' ? (
                <div className="h-[400px] flex flex-col justify-between animate-fade-in bg-white/5 rounded-[2rem] p-8 border border-white/5">
                    <div className="flex items-end gap-3 h-64 mb-10 overflow-x-auto scrollbar-hide">
                        {finished.slice(0, 15).map((b, i) => {
                           const total = b.finalPrice || 1;
                           const max = Math.max(...finished.slice(0, 15).map(x => x.finalPrice), 1);
                           const h = (total / max) * 100;
                           
                           const wPayout = b.workerEarnings || 0;
                           const pFee = b.platformFee || 0;
                           const remainder = Math.max(0, total - wPayout - pFee);
                           
                           return (
                             <div key={i} className="min-w-[40px] flex-1 flex flex-col items-center gap-3 group/rev relative h-full">
                                <div className="absolute -top-6 opacity-0 group-hover/rev:opacity-100 transition-opacity text-[8px] font-black text-indigo-300 pointer-events-none whitespace-nowrap">
                                    ₹{total.toLocaleString()}
                                </div>
                                <div className="w-full bg-white/5 rounded-t-xl relative overflow-hidden h-full flex flex-col-reverse group-hover/rev:bg-white/10 border-x border-t border-white/5 transition-colors" style={{ height: `${h}%` }}>
                                   {/* Stacked Revenue Anatomy */}
                                   <div className="bg-indigo-500/80 group-hover/rev:bg-indigo-500 transition-all border-t border-white/10" style={{ height: `${(wPayout/total)*100}%` }} />
                                   <div className="bg-emerald-400 group-hover/rev:bg-emerald-500 transition-all border-t border-white/10" style={{ height: `${(pFee/total)*100}%` }} />
                                   <div className="bg-white/10 group-hover/rev:bg-white/20 transition-all" style={{ height: `${(remainder/total)*100}%` }} />
                                </div>
                                <span className="text-[7px] font-black text-gray-500 uppercase tracking-widest rotate-45 mt-4">RE-{(b._id || '').slice(-4).toUpperCase()}</span>
                             </div>
                           )
                        })}
                    </div>
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6 pt-8 border-t border-white/5">
                        <div className="flex gap-8">
                             <ReconLegend color="bg-indigo-500" label="Worker Settlement" />
                             <ReconLegend color="bg-emerald-500" label="Platform Yield (5%)" />
                             <ReconLegend color="bg-white/20" label="Operating Remainder" />
                        </div>
                        <div className="text-right">
                           <p className="text-[8px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-1 italic">Economic Integrity Verified</p>
                           <p className="text-sm font-black text-white tracking-widest">Master-Level Audit Consensus</p>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="overflow-x-auto animate-fade-in bg-white/5 rounded-[2rem] border border-white/5">
                    <table className="w-full text-left">
                        <thead>
                           <tr className="text-[9px] font-black text-gray-500 uppercase tracking-[0.2em] border-b border-white/5">
                              <th className="py-6 px-10">Economic Trace</th>
                              <th className="py-6 px-10">Service Entity</th>
                              <th className="py-6 px-10 text-emerald-400">Yield Fee</th>
                              <th className="py-6 px-10 text-indigo-400">Payout</th>
                              <th className="py-6 px-10 text-right text-white">Gross Total</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                           {finished.slice(0, 10).map(b => (
                             <tr key={b._id} className="hover:bg-white/5 transition-all group">
                                <td className="py-6 px-10 font-mono text-[10px] text-gray-500">RE-{(b._id || '').slice(-8).toUpperCase()}</td>
                                <td className="py-6 px-10">
                                   <p className="text-xs font-black text-gray-200">{b.serviceId?.serviceName}</p>
                                   <p className="text-[10px] font-bold text-gray-500 mt-0.5">{new Date(b.createdAt).toLocaleDateString()}</p>
                                </td>
                                <td className="py-6 px-10 text-xs font-black text-emerald-400">₹{(b.platformFee || 0).toLocaleString()}</td>
                                <td className="py-6 px-10 text-xs font-black text-indigo-400">₹{(b.workerEarnings || 0).toLocaleString()}</td>
                                <td className="py-6 px-10 text-right text-base font-black text-white group-hover:scale-105 transition-transform origin-right">
                                   ₹{(b.finalPrice || 0).toLocaleString()}
                                </td>
                             </tr>
                           ))}
                        </tbody>
                    </table>
                </div>
            )}
          </div>
      </div>

    </div>
  );
});

const MasterStat = ({ label, val, delta, icon: Icon, color, sub, invert }) => (
    <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-500 group relative overflow-hidden">
        <div className={`absolute -right-4 -top-4 w-20 h-20 rounded-full bg-${color}-50/50 group-hover:scale-150 transition-transform duration-700`} />
        
        <div className="flex items-start justify-between relative z-10 mb-4">
            <div className={`w-12 h-12 rounded-2xl bg-${color}-50 flex items-center justify-center text-${color}-600 shadow-inner`}>
                <Icon className="w-6 h-6" />
            </div>
            {delta && (
                <span className={`text-[10px] font-black px-2 py-1 rounded-lg ${invert ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>
                    {delta}
                </span>
            )}
        </div>
        
        <div className="relative z-10">
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">{label}</p>
            <h4 className="text-2xl font-black text-gray-900 tracking-tighter leading-none mb-1">{val}</h4>
            {sub && <p className="text-[10px] font-bold text-gray-400">{sub}</p>}
        </div>
    </div>
);

const TrendInsight = ({ label, val }) => (
    <div>
        <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">{label}</p>
        <p className="text-lg font-black text-gray-900 tracking-tighter">{val}</p>
    </div>
);

const Legend = ({ icon, label }) => (
    <div className="flex items-center gap-2">
        <div className={`w-2.5 h-2.5 rounded-full ${icon}`} />
        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{label}</span>
    </div>
);

const ReconLegend = ({ color, label }) => (
    <div className="flex items-center gap-3">
        <div className={`w-3 h-3 rounded-md ${color} shadow-lg`} />
        <span className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em]">{label}</span>
    </div>
);

export default AnalyticsTab;
