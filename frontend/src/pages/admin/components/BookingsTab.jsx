import React, { useState, useEffect, useCallback } from 'react';
import { ClipboardList, Loader2 } from 'lucide-react';
import { getAdminBookings, assignWorker, getAdminWorkers } from '../../../api';
import StatusBadge from '../../../components/shared/StatusBadge';
import toast from 'react-hot-toast';

const BookingsTab = React.memo(({ search }) => {
  const [bookings, setBookings] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [bookingsRes, workersRes] = await Promise.all([
        getAdminBookings(),
        getAdminWorkers()
      ]);
      setBookings(bookingsRes.data);
      setWorkers(workersRes.data);
    } catch {
      toast.error('Failed to load bookings.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    // Poll bookings every 30s as they are dynamic
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const handleAssign = async (bookingId, workerId) => {
    if (!workerId) return;
    try {
      await assignWorker(bookingId, workerId);
      toast.success('Worker assigned successfully.');
      // Update local state without full refresh
      setBookings(prev => prev.map(b => b._id === bookingId ? { ...b, workerId: workers.find(w => w._id === workerId), status: 'Worker On The Way' } : b));
    } catch {
      toast.error('Failed to assign worker.');
    }
  };

  const q = search.toLowerCase();
  const filtered = bookings.filter(b => b.serviceId?.serviceName?.toLowerCase().includes(q) || b.userId?.name?.toLowerCase().includes(q));

  if (loading) return (
    <div className="flex flex-col items-center py-20">
      <Loader2 className="w-10 h-10 animate-spin text-indigo-600 mb-4" />
      <p className="text-xs font-black uppercase tracking-widest text-indigo-400">Syncing Bookings...</p>
    </div>
  );

  return (
    <table className="w-full text-left">
      <thead>
        <tr className="text-gray-400 text-xs font-bold uppercase tracking-widest border-b border-gray-100">
          <th className="pb-4 px-4">ID</th>
          <th className="pb-4 px-4">Service</th>
          <th className="pb-4 px-4">Customer</th>
          <th className="pb-4 px-4">Worker</th>
          <th className="pb-4 px-4">Pay Method</th>
          <th className="pb-4 px-4">Status</th>
          <th className="pb-4 px-4 text-right">Amount</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100">
        {filtered.map(b => (
          <tr key={b._id} className="hover:bg-gray-50/50 transition-colors">
            <td className="py-4 px-4 text-xs font-mono text-gray-400">#{b._id.slice(-6).toUpperCase()}</td>
            <td className="py-4 px-4 font-bold text-gray-900 text-sm">{b.serviceId?.serviceName || '—'}</td>
            <td className="py-4 px-4 text-sm text-gray-600">{b.userId?.name || '—'}</td>
            <td className="py-4 px-4 text-sm text-gray-600">
              {b.workerId?.name ? (
                b.workerId.name
              ) : (
                <select
                  className="bg-gray-50 border border-gray-200 rounded-xl text-xs py-1.5 px-3 text-gray-700 outline-none focus:ring-2 focus:ring-indigo-300 max-w-[180px] shadow-sm cursor-pointer"
                  onChange={(e) => handleAssign(b._id, e.target.value)}
                  defaultValue=""
                  title="Only verified workers shown"
                >
                  <option value="" disabled>Assign...</option>
                  {workers.filter(w => w.isVerified).length === 0 ? (
                    <option disabled>No verified workers yet</option>
                  ) : (
                    workers.filter(w => w.isVerified).map(w => (
                      <option key={w._id} value={w._id}>{w.name} ({w.skills?.slice(0, 2).join(', ')})</option>
                    ))
                  )}
                </select>
              )}
            </td>
            <td className="py-4 px-4">
              <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-lg ${b.paymentMethod === 'Online' ? 'bg-blue-50 text-blue-600 border border-blue-100' : 'bg-gray-50 text-gray-500 border border-gray-100'}`}>
                {b.paymentMethod || 'Cash'}
              </span>
            </td>
            <td className="py-4 px-4"><StatusBadge status={b.status} /></td>
            <td className="py-4 px-4 text-right font-bold text-indigo-600 text-sm">₹{(b.finalPrice || b.estimatedPrice).toLocaleString()}</td>
          </tr>
        ))}
        {filtered.length === 0 && (
          <tr><td colSpan={7} className="py-16 text-center text-gray-300">
            <ClipboardList className="w-10 h-10 mx-auto mb-3 opacity-20" />
            <p className="font-bold">No bookings found</p>
          </td></tr>
        )}
      </tbody>
    </table>
  );
});

export default BookingsTab;
