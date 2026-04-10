import { useState, useEffect } from 'react';
import { getMyBookings, cancelBooking } from '../../api';
import StatusBadge from '../../components/shared/StatusBadge';
import TrackingModal from '../../components/shared/TrackingModal';
import WorkerReviewModal from '../../components/shared/WorkerReviewModal';
import SubmitReviewModal from '../../components/shared/SubmitReviewModal';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { 
  Calendar, MapPin, Clock, IndianRupee, Loader2, Navigation,
  MessageSquare, User, ShieldCheck, Zap, XCircle
} from 'lucide-react';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [trackingDoc, setTrackingDoc] = useState(null);
  const [reviewWorker, setReviewWorker] = useState(null);
  const [submitReviewBooking, setSubmitReviewBooking] = useState(null);
  const [cancellingState, setCancellingState] = useState(null);
  const { socket } = useAuth();

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await getMyBookings();
      // Sort by newest first
      const sorted = res.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setBookings(sorted);
    } catch {
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  useEffect(() => {
    if (!socket) return;
    
    const handleUpdate = (updatedBooking) => {
      setBookings(prev => prev.map(b => b._id === updatedBooking._id ? updatedBooking : b));
      setTrackingDoc(prev => (prev && prev._id === updatedBooking._id) ? updatedBooking : prev);
    };

    socket.on('bookingUpdated', handleUpdate);

    return () => {
      socket.off('bookingUpdated', handleUpdate);
    };
  }, [socket]);

  const handleCancel = async (id) => {
    try {
      setCancellingState(id);
      await cancelBooking(id);
      toast.success('Booking cancelled successfully.');
      fetchBookings(); // Refresh list to reflect state change
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel booking.');
    } finally {
      setCancellingState(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 pb-20 px-4 md:px-6">
      <div className="max-w-5xl mx-auto animate-fade-in">
        
        <div className="mb-10 text-center sm:text-left">
          <h1 className="text-4xl font-black mb-3 tracking-tight text-gray-900">My Bookings</h1>
          <p className="text-gray-500 font-medium">Track your services, view invoices, and manage upcoming schedules.</p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center py-32 rounded-3xl bg-white border border-gray-200 shadow-sm">
            <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
            <p className="text-xs font-black uppercase tracking-widest text-indigo-400">Syncing database...</p>
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-32 rounded-3xl bg-white border border-gray-200 shadow-sm">
            <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Calendar className="w-8 h-8 text-indigo-300" />
            </div>
            <h3 className="text-xl font-bold mb-2">No Bookings Yet</h3>
            <p className="text-gray-500 mb-8 max-w-sm mx-auto">You haven't requested any services. Need a repair or some cleaning?</p>
            <a href="/" className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold text-white bg-indigo-600 shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 transition-all">
              <Zap className="w-4 h-4" /> Book a Service
            </a>
          </div>
        ) : (
          <div className="space-y-6">
            {bookings.map((booking, idx) => {
               const canCancel = booking.status === 'Pending' || booking.status === 'Accepted';

               return (
                 <div 
                   key={booking._id} 
                   className="bg-white rounded-[2rem] border border-gray-200 shadow-sm hover:shadow-xl transition-shadow p-6 md:p-8 animate-fade-in-up"
                   style={{ animationDelay: `${idx * 0.05}s` }}
                 >
                   
                   {/* ── Header ── */}
                   <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-6 border-b border-gray-100">
                     <div className="flex items-center gap-4">
                       <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-2xl shadow-sm">
                         {booking.serviceId?.serviceName.includes('Clean') ? '🧹' : 
                          booking.serviceId?.serviceName.includes('Plumb') ? '🔧' : 
                          booking.serviceId?.serviceName.includes('Electric') ? '⚡' : '🛠️'}
                       </div>
                       <div>
                         <StatusBadge status={booking.status} size="lg" />
                         <h3 className="text-2xl font-black text-gray-900 tracking-tight mt-1 truncate max-w-[280px] md:max-w-md">
                           {booking.serviceId?.serviceName}
                         </h3>
                       </div>
                     </div>
                     <div className="text-left md:text-right">
                       <p className="text-[10px] font-black uppercase text-gray-400 mb-0.5">Booking Reference</p>
                       <p className="font-bold text-indigo-600 font-mono tracking-widest">{booking._id?.slice(-8).toUpperCase()}</p>
                     </div>
                   </div>

                   {/* ── Body ── */}
                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                     
                     {/* Details Meta */}
                     <div className="space-y-4 lg:col-span-1">
                       {[
                         { icon: Calendar, label: 'Date', val: new Date(booking.date).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' }) },
                         { icon: Clock, label: 'Time Slot', val: booking.timeSlot },
                         { icon: MapPin, label: 'Address', val: booking.location?.address }
                       ].map(({ icon: Icon, label, val }) => (
                         <div key={label} className="flex gap-3">
                           <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0 border border-gray-100">
                             <Icon className="w-4 h-4 text-gray-500" />
                           </div>
                           <div className="min-w-0">
                             <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{label}</p>
                             <p className="font-semibold text-gray-800 text-sm truncate">{val || '—'}</p>
                           </div>
                         </div>
                       ))}
                     </div>

                     {/* Worker Card */}
                     {booking.workerId ? (
                       <div className="p-5 rounded-2xl bg-indigo-50/50 border border-indigo-100 flex flex-col justify-between">
                         <div>
                            <p className="text-[10px] font-black uppercase text-indigo-400 mb-3 tracking-widest">Assigned Professional</p>
                            <div className="flex items-center gap-3 mb-4">
                              <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white font-black text-lg flex items-center justify-center shadow-lg shadow-indigo-600/30">
                                {booking.workerId.name[0]}
                              </div>
                              <div>
                                <p className="font-black text-gray-900">{booking.workerId.name}</p>
                                <div className="flex flex-wrap items-center gap-2 mt-1">
                                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full flex gap-1 items-center">
                                    <ShieldCheck className="w-3 h-3" /> Verified
                                  </span>
                                </div>
                              </div>
                            </div>
                         </div>
                         <button onClick={() => setReviewWorker(booking.workerId)} className="w-full py-2.5 rounded-xl bg-white border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-colors flex justify-center items-center gap-2 shadow-sm">
                           <MessageSquare className="w-4 h-4" /> View Feedback
                         </button>
                       </div>
                     ) : (
                       <div className="p-5 rounded-2xl bg-gray-50 border border-gray-100 border-dashed flex flex-col items-center justify-center text-center">
                         <User className="w-8 h-8 text-gray-300 mb-2" />
                         <p className="text-sm font-bold text-gray-500">Auto-assigning worker...</p>
                         <p className="text-xs text-gray-400 mt-1">We'll alert you once assigned.</p>
                       </div>
                     )}

                     {/* Pricing Breakdown */}
                     <div className="p-5 rounded-2xl bg-gray-900 text-white shadow-xl shadow-gray-900/20 flex flex-col justify-between">
                        <div>
                          <p className="text-[10px] font-black uppercase text-gray-400 mb-3 tracking-widest">Invoice Details</p>
                          <div className="space-y-1 text-sm font-medium">
                            <div className="flex justify-between text-gray-400">
                              <span>Estimated Price</span>
                              <span>₹{booking.estimatedPrice}</span>
                            </div>
                            {booking.laborCost && (
                              <div className="flex justify-between text-gray-300">
                                <span>Labor Fees</span>
                                <span>₹{booking.laborCost}</span>
                              </div>
                            )}
                            {booking.partsCost > 0 && (
                              <div className="flex justify-between text-gray-300">
                                <span>Parts Replaced</span>
                                <span>₹{booking.partsCost}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="mt-4 pt-4 border-t border-gray-800 flex justify-between items-end">
                           <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">
                             {booking.finalPrice ? 'Final Total' : 'Estimated Total'}
                           </span>
                           <span className="text-3xl font-black tracking-tighter">
                             ₹{booking.finalPrice || booking.estimatedPrice}
                           </span>
                        </div>
                     </div>
                   </div>

                   {/* ── Actions ── */}
                   <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-100">
                     <button
                       onClick={() => setTrackingDoc(booking)}
                       className="flex-1 py-3.5 rounded-xl font-bold text-sm bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
                     >
                       <Navigation className="w-4 h-4" /> Live Tracking
                     </button>
                     
                     {canCancel && (
                       <button
                         onClick={() => handleCancel(booking._id)}
                         disabled={cancellingState === booking._id}
                         className="flex-1 py-3.5 rounded-xl font-bold text-sm text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 transition-all flex items-center justify-center gap-2"
                       >
                         {cancellingState === booking._id ? (
                           <Loader2 className="w-4 h-4 animate-spin" />
                         ) : (
                           <><XCircle className="w-4 h-4" /> Cancel Booking</>
                         )}
                       </button>
                     )}

                     {booking.status === 'Finished' && (
                        <button
                          onClick={() => setSubmitReviewBooking(booking)}
                          className="flex-1 py-3.5 rounded-xl font-bold text-sm text-emerald-600 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-all flex items-center justify-center gap-2"
                        >
                          <MessageSquare className="w-4 h-4" /> Leave Feedback
                        </button>
                     )}
                   </div>

                 </div>
               );
            })}
          </div>
        )}
      </div>

      {trackingDoc && <TrackingModal booking={trackingDoc} onClose={() => setTrackingDoc(null)} />}
      {reviewWorker && <WorkerReviewModal worker={reviewWorker} onClose={() => setReviewWorker(null)} />}
      {submitReviewBooking && <SubmitReviewModal booking={submitReviewBooking} onClose={() => setSubmitReviewBooking(null)} onSubmitted={fetchBookings} />}
    </div>
  );
};

export default MyBookings;
