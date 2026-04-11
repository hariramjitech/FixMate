import React, { useState, useEffect } from 'react';
import { Banknote, CreditCard, Activity, Loader2 } from 'lucide-react';
import { getAdminBookings } from '../../../api';

const AnalyticsTab = React.memo(({ stats }) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getAdminBookings();
        setBookings(res.data);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) return (
    <div className="flex flex-col items-center py-20">
      <Loader2 className="w-10 h-10 animate-spin text-indigo-600 mb-4" />
      <p className="text-xs font-black uppercase tracking-widest text-indigo-400">Loading Treasury Data...</p>
    </div>
  );

  const finished = (bookings || []).filter(b => b.status === 'Finished');

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Treasury Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="p-6 rounded-[2rem] bg-indigo-900 text-white shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl group-hover:scale-150 transition-transform duration-700" />
          <div className="relative z-10">
            <p className="text-[10px] font-black uppercase tracking-widest text-indigo-300 mb-2">Total Platform Flow (Gross)</p>
            <h3 className="text-4xl font-black tracking-tighter mb-4">₹{(stats?.totalRevenue || 0).toLocaleString()}</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold py-2 border-t border-indigo-800">
                <span className="text-indigo-300">Net Platform Profit (Fees)</span>
                <span className="text-emerald-400">₹{(stats?.platformProfit || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xs font-bold py-2 border-t border-indigo-800 text-indigo-100">
                <span className="text-indigo-300">Materials & Parts Value</span>
                <span>₹{(stats?.materialsTotal || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xs font-bold py-2 border-t border-indigo-800 text-indigo-100">
                <span className="text-indigo-300">Net Worker Payouts</span>
                <span className="text-orange-300">₹{(stats?.totalPlatformEarnings || 0).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 grid grid-cols-2 gap-4">
          {stats?.paymentMethodStats?.map(m => (
            <div key={m._id} className="p-6 rounded-[2rem] bg-white border border-gray-100 shadow-sm flex flex-col justify-between">
              <div>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${m._id === 'Cash' || !m._id ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}>
                  {m._id === 'Cash' || !m._id ? <Banknote className="w-5 h-5" /> : <CreditCard className="w-5 h-5" />}
                </div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">{m._id || 'Cash'} Sales</p>
                <h4 className="text-2xl font-black text-gray-900">₹{(m.total || 0).toLocaleString()}</h4>
              </div>
              <p className="text-[10px] font-bold text-gray-400 mt-4 uppercase">{m.count} Finished Orders</p>
            </div>
          ))}
          {!stats?.paymentMethodStats?.length && (
            <div className="col-span-2 p-12 text-center bg-gray-50 rounded-[2rem] border border-dashed border-gray-200 text-gray-400 font-bold text-sm">
              No transaction pattern data available yet
            </div>
          )}
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
                <th className="py-4 px-6">ID / Method</th>
                <th className="py-4 px-6">Service Detail</th>
                <th className="py-4 px-6 text-center">Labor (₹)</th>
                <th className="py-4 px-6 text-center">Parts (₹)</th>
                <th className="py-4 px-6 text-center text-orange-400">Platform Fee</th>
                <th className="py-4 px-6 text-indigo-600 bg-indigo-50/50 text-center">Admin Take</th>
                <th className="py-4 px-6 text-emerald-600 text-center">Worker Net</th>
                <th className="py-4 px-6 text-right">Gross Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {finished.map(b => (
                <tr key={b._id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex flex-col gap-1">
                      <span className="font-mono text-gray-400">#{b._id.slice(-6).toUpperCase()}</span>
                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full w-fit ${b.paymentMethod === 'Cash' || !b.paymentMethod ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
                        {b.paymentMethod || 'Cash'}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex flex-col">
                      <span className="font-bold text-gray-900 truncate max-w-[120px]">{b.serviceId?.serviceName}</span>
                      <span className="text-[10px] text-gray-400">to {b.userId?.name}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 font-bold text-gray-600 text-center">{b.laborCost || 0}</td>
                  <td className="py-4 px-6 font-bold text-gray-600 text-center">{b.partsCost || 0}</td>
                  <td className="py-4 px-6 font-bold text-orange-400 text-center">{b.platformFee || 0}</td>
                  <td className="py-4 px-6 font-black text-indigo-600 bg-indigo-50/30 text-center">
                    {((b.platformFee || 0) + (b.partsCost || 0)).toLocaleString()}
                  </td>
                  <td className="py-4 px-6 font-black text-emerald-600 text-center">
                    {(b.workerEarnings || 0).toLocaleString()}
                  </td>
                  <td className="py-4 px-6 text-right font-black text-gray-900 text-sm">
                    {(b.finalPrice || 0).toLocaleString()}
                  </td>
                </tr>
              ))}
              {finished.length === 0 && (
                <tr><td colSpan={8} className="py-12 text-center text-gray-400 font-bold uppercase tracking-widest">No completed transactions to analyze</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
});

export default AnalyticsTab;
