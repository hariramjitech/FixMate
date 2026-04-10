import React from 'react';
import { TrendingUp, Package, IndianRupee, ClipboardList } from 'lucide-react';

const StatsCards = React.memo(({ stats, loading }) => {
  const statCards = [
    { label: 'Platform Profit (Fees)', value: `₹${(stats?.platformProfit || 0).toLocaleString('en-IN')}`, icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Total Materials', value: `₹${(stats?.materialsTotal || 0).toLocaleString('en-IN')}`, icon: Package, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Platform Payouts', value: `₹${(stats?.totalPlatformEarnings || 0).toLocaleString('en-IN')}`, icon: IndianRupee, color: 'text-orange-600', bg: 'bg-orange-50' },
    { label: 'Total Bookings', value: stats?.totalBookings || 0, icon: ClipboardList, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  ];

  if (loading && !stats) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-gray-100 rounded-3xl animate-pulse" />)}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
      {statCards.map((card, i) => (
        <div key={i} className="bg-white p-6 rounded-[2rem] border border-gray-200 shadow-sm hover:shadow-md transition-all flex flex-col gap-2 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gray-50 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500" />
          <div className="relative z-10">
            <div className={`${card.bg} ${card.color} border w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm mb-4`}>
              <card.icon className="w-6 h-6" />
            </div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{card.label}</p>
            <h3 className="text-4xl font-black text-gray-900 tracking-tighter">{card.value}</h3>
          </div>
        </div>
      ))}
    </div>
  );
});

export default StatsCards;
