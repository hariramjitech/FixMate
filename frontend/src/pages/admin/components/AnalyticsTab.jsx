import React, { useState, useEffect } from 'react';
import { Banknote, CreditCard, Activity } from 'lucide-react';
import { getAdminBookings, getAdminAnalytics } from '../../../api';
import { SkeletonList, SkeletonCard } from '../../../components/ui/Skeleton';

const AnalyticsTab = React.memo(({ stats }) => {
  const [bookings, setBookings] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSplit, setSelectedSplit] = useState(null);

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
    const interval = setInterval(fetch, 5000); // 5s sync
    return () => clearInterval(interval);
  }, []);

  if (loading) return (
    <div className="space-y-8 animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <SkeletonCard className="h-64" />
        <SkeletonCard className="h-64 lg:col-span-2" />
      </div>
      <div className="bg-white rounded-[2rem] p-6 border border-gray-100 shadow-sm">
        <table className="w-full">
          <SkeletonList rows={8} cols={7} />
        </table>
      </div>
    </div>
  );

  const finished = (bookings || []).filter(b => b.status === 'Finished');

  // Chart Data Preparation
  const onlineStats = stats?.paymentMethodStats?.find(m => m._id === 'Online') || { total: 0, count: 0 };
  const cashStats = stats?.paymentMethodStats?.find(m => m._id === 'Cash') || { total: 0, count: 0 };
  const onlinePerc = stats?.totalRevenue > 0 ? (onlineStats.total / stats.totalRevenue) * 100 : 0;

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Treasury Cards & Method Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Main Treasury Card */}
        <div className="p-8 rounded-[2rem] bg-indigo-950 text-white shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl group-hover:scale-150 transition-transform duration-700" />
          <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center">
            <div className="flex-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-indigo-300 mb-2">Total Platform Flow (Gross)</p>
              <h3 className="text-5xl font-black tracking-tighter mb-8 bg-gradient-to-r from-white to-indigo-300 bg-clip-text text-transparent">₹{(stats?.totalRevenue || 0).toLocaleString()}</h3>
              <div className="space-y-3">
                {[
                  { label: 'Net Platform Profit (Fees)', val: stats?.platformProfit, col: 'text-emerald-400' },
                  { label: 'Materials & Parts Value', val: stats?.materialsTotal, col: 'text-white' },
                  { label: 'Net Worker Payouts', val: stats?.totalPlatformEarnings, col: 'text-orange-300' },
                ].map(item => (
                  <div key={item.label} className="flex justify-between text-xs font-bold py-2 border-t border-indigo-900/50 transition-colors hover:bg-white/5 px-2 rounded-lg">
                    <span className="text-indigo-300">{item.label}</span>
                    <span className={item.col}>₹{(item.val || 0).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* CSS Donut Chart */}
            <div className="relative w-40 h-40 flex-shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="16" fill="none" className="stroke-indigo-900" strokeWidth="3" />
                <circle cx="18" cy="18" r="16" fill="none" className="stroke-indigo-500 transition-all duration-1000" strokeWidth="3" 
                  strokeDasharray={`${onlinePerc} 100`} strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-xl font-black">{Math.round(onlinePerc)}%</span>
                <span className="text-[8px] font-black uppercase tracking-widest text-indigo-300">Online</span>
              </div>
            </div>
          </div>
        </div>

        {/* Monthly Revenue Bar Chart (CSS) */}
        <div className="p-8 rounded-[2rem] bg-white border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h4 className="text-xs font-black uppercase tracking-widest text-gray-400">Monthly Revenue Trend</h4>
            <div className="flex gap-4">
              <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-indigo-500" /> <span className="text-[10px] font-bold text-gray-500">Revenue</span></div>
            </div>
          </div>
          <div className="flex items-end justify-between gap-2 h-40">
            {analytics?.monthlyStats?.map((m, i) => {
              const maxRev = Math.max(...analytics.monthlyStats.map(x => x.revenue), 1);
              const height = (m.revenue / maxRev) * 100;
              const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
              return (
                <div key={i} className="flex-1 flex flex-col items-center group gap-2">
                  <div className="w-full bg-indigo-50 rounded-lg relative overflow-hidden flex flex-col justify-end" style={{ height: '160px' }}>
                    <div className="bg-indigo-500 w-full rounded-t-lg transition-all duration-1000 hover:bg-indigo-600 cursor-pointer" style={{ height: `${height}%` }}>
                      <div className="absolute top-1 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 -translate-y-full bg-gray-900 text-white text-[9px] px-2 py-1 rounded font-bold transition-all z-20">₹{Math.round(m.revenue)}</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-black text-gray-400 uppercase">{months[m._id.month - 1]}</span>
                </div>
              );
            })}
            {(!analytics?.monthlyStats || analytics.monthlyStats.length === 0) && (
               <div className="w-full h-full flex items-center justify-center text-gray-300 font-bold text-sm uppercase tracking-widest pb-8">No historical trend data</div>
            )}
          </div>
        </div>
      </div>

      {/* Transaction Detail Log */}
      <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden text-gray-900">
        <div className="px-6 py-5 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
          <h3 className="text-sm font-black uppercase tracking-widest text-gray-900 flex items-center gap-2">
            <Activity className="w-4 h-4 text-indigo-600" /> Treasury Split Journal
          </h3>
          <span className="text-[10px] font-bold bg-white px-3 py-1 rounded-full text-gray-500 uppercase border border-gray-100 shadow-sm">{finished.length} Completed Records</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-gray-50 text-gray-400 font-black uppercase tracking-widest border-b border-gray-100">
                <th className="py-4 px-6">Transaction ID</th>
                <th className="py-4 px-6">Service & User</th>
                <th className="py-4 px-6 text-center">Split Distribution</th>
                <th className="py-4 px-6 text-indigo-600 bg-indigo-50/50 text-center">Admin Take</th>
                <th className="py-4 px-6 text-emerald-600 text-center">Worker Net</th>
                <th className="py-4 px-6 text-right">Gross Total</th>
                <th className="py-4 px-6 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {finished.map(b => {
                 const adminTake = (b.platformFee || 0) + (b.partsCost || 0);
                 const workerTake = b.workerEarnings || 0;
                 const adminPerc = b.finalPrice > 0 ? (adminTake / b.finalPrice) * 100 : 0;

                 return (
                <tr key={b._id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex flex-col gap-1">
                      <span className="font-mono text-gray-400 uppercase tracking-tighter">#{b._id.slice(-6)}</span>
                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full w-fit ${b.paymentMethod === 'Cash' || !b.paymentMethod ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
                        {b.paymentMethod || 'Cash'}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex flex-col">
                      <span className="font-bold text-gray-900 truncate max-w-[120px]">{b.serviceId?.serviceName}</span>
                      <span className="text-[10px] text-gray-400 font-medium">Customer: {b.userId?.name}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-center min-w-[120px]">
                    <div className="flex flex-col gap-1 items-center">
                       <div className="w-full h-1.5 bg-emerald-500 rounded-full overflow-hidden flex">
                          <div className="h-full bg-indigo-500 transition-all duration-1000" style={{ width: `${adminPerc}%` }} />
                       </div>
                       <div className="flex justify-between w-full text-[8px] font-black uppercase tracking-tighter">
                          <span className="text-indigo-600">Admin {Math.round(adminPerc)}%</span>
                          <span className="text-emerald-600">Worker {100 - Math.round(adminPerc)}%</span>
                       </div>
                    </div>
                  </td>
                  <td className="py-4 px-6 font-black text-indigo-600 bg-indigo-50/30 text-center text-sm">
                    ₹{adminTake.toLocaleString()}
                  </td>
                  <td className="py-4 px-6 font-black text-emerald-600 text-center text-sm">
                    ₹{workerTake.toLocaleString()}
                  </td>
                  <td className="py-4 px-6 text-right font-black text-gray-900 text-sm">
                    ₹{(b.finalPrice || 0).toLocaleString()}
                  </td>
                  <td className="py-4 px-6 text-center">
                     <button 
                        onClick={() => setSelectedSplit(b)}
                        className="text-[9px] font-black uppercase tracking-widest px-3 py-1.5 bg-gray-900 text-white rounded-lg hover:bg-black transition-all shadow-sm active:scale-95"
                     >
                        See Split
                     </button>
                  </td>
                </tr>
                 )
              })}
              {finished.length === 0 && (
                <tr><td colSpan={7} className="py-12 text-center text-gray-400 font-bold uppercase tracking-widest">No completed transactions to analyze</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Split Details Modal */}
      {selectedSplit && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-950/80 backdrop-blur-md animate-fade-in">
           <div className="w-full max-w-sm bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-scale-in border border-white/20">
              <div className="p-8 bg-indigo-950 text-white text-center relative">
                 <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-indigo-500/20 rounded-full -translate-y-1/2 blur-2xl" />
                 <p className="text-[10px] font-black uppercase tracking-widest text-indigo-300 mb-2">Payment Completion Receipt</p>
                 <h4 className="text-sm font-bold opacity-80 mb-2">Booking #{selectedSplit._id.slice(-6).toUpperCase()}</h4>
                 <div className="text-4xl font-black tracking-tighter">₹{selectedSplit.finalPrice.toLocaleString()}</div>
                 <div className={`mt-4 inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${selectedSplit.paymentMethod === 'Online' ? 'bg-blue-500' : 'bg-emerald-500'}`}>
                    Paid Via {selectedSplit.paymentMethod || 'Cash'}
                 </div>
              </div>
              <div className="p-8 space-y-6">
                 {[
                   { label: 'Admin Net Profit (5% Fee)', val: selectedSplit.platformFee, col: 'text-indigo-600', icon: '🏦' },
                   { label: 'Materials & Parts Cost', val: selectedSplit.partsCost, col: 'text-gray-900', icon: '📦' },
                   { label: 'Worker Net Earning', val: selectedSplit.workerEarnings, col: 'text-emerald-600', icon: '🔧' },
                 ].map(row => (
                   <div key={row.label} className="flex items-center justify-between border-b border-gray-50 pb-4 last:border-0 last:pb-0">
                      <div className="flex items-center gap-3">
                         <span className="text-xl">{row.icon}</span>
                         <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 leading-tight">{row.label}</span>
                      </div>
                      <span className={`text-lg font-black ${row.col}`}>₹{row.val || 0}</span>
                   </div>
                 ))}
                 <button 
                    onClick={() => setSelectedSplit(null)}
                    className="w-full py-4 mt-4 bg-gray-900 text-white rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-black transition-all shadow-xl active:scale-95"
                 >
                    Close breakdown
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
});

export default AnalyticsTab;
