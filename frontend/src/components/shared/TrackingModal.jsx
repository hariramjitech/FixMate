import { useState, useEffect } from 'react';
import { X, MapPin, Phone, Calendar, Clock, CheckCircle2, Navigation, CreditCard, Banknote, Loader2, Wrench, Package } from 'lucide-react';
import StatusBadge from './StatusBadge';
import axios from 'axios';
import toast from 'react-hot-toast';

const STATUS_STEPS = [
  'Pending',
  'Accepted',
  'Worker On The Way',
  'Work Started',
  'Work Completed',
  'Payment Pending',
  'Finished',
];

const loadRazorpayConfig = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const TrackingModal = ({ booking, onClose, onPaymentComplete }) => {
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadRazorpayConfig();
  }, []);

  if (!booking) return null;

  const currentIdx = STATUS_STEPS.indexOf(booking.status);
  const isTrackingLive = ['Accepted', 'Worker On The Way'].includes(booking.status);
  const isPaymentPending = booking.status === 'Payment Pending';

  const handlePayOnline = async () => {
    setProcessing(true);
    try {
      // 1. Create Order on Backend
      const { data: orderData } = await axios.post('/payment/create-order', {
        amount: booking.finalPrice || booking.estimatedPrice,
        bookingId: booking._id
      });

      // 2. Initialize Razorpay Checkout
      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'FixMate',
        description: `Service Payment: ${booking.serviceId?.serviceName}`,
        order_id: orderData.id,
        handler: async function (response) {
          // 3. Verify Payment
          try {
            await axios.post('/payment/verify', {
              ...response,
              bookingId: booking._id
            });
            toast.success('Payment successful! Booking finished.');
            if (onPaymentComplete) onPaymentComplete();
            onClose();
          } catch (err) {
            toast.error('Payment verification failed. Please contact support.');
          }
        },
        modal: {
          ondismiss: function() {
            setProcessing(false);
            toast.error('Payment cancelled. You can try again or pay cash.');
          }
        },
        prefill: {
          name: booking.userId?.name || 'Customer',
          email: booking.userId?.email || '',
          contact: booking.userId?.phone || ''
        },
        theme: {
          color: '#4f46e5'
        }
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (err) {
      toast.error('Failed to initialize payment gateway.');
    } finally {
      setProcessing(false);
    }
  };

  const handlePayCash = async () => {
    setProcessing(true);
    try {
      // For cash, we can optionally update status to Finished directly or let worker do it. 
      // The prompt specified we can let them pay cash. We'll update the booking status to Finished.
      await axios.put(`/bookings/${booking._id}/status`, { status: 'Finished', paymentMethod: 'Cash' });
      toast.success('Opted for Cash Payment. Booking marked finished.');
      if (onPaymentComplete) onPaymentComplete();
      onClose();
    } catch (err) {
      toast.error('Failed to update cash payment status.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg max-h-[92vh] overflow-y-auto no-scrollbar animate-slide-up bg-white rounded-[2rem] shadow-2xl relative border border-gray-100">

        {/* Map simulation header */}
        <div className="relative h-48 overflow-hidden rounded-t-[2rem] bg-indigo-50">
          {/* Grid lines */}
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: 'linear-gradient(#4f46e5 1px, transparent 1px), linear-gradient(90deg, #4f46e5 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }} />

          {/* Close button */}
          <div className="absolute top-4 right-4 z-20">
            <button onClick={onClose} className="p-2 rounded-xl bg-white/50 backdrop-blur border border-white/40 text-gray-600 hover:text-gray-900 hover:bg-white shadow-sm transition-all">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Service tag */}
          <div className="absolute top-4 left-4 z-20 px-4 py-2 rounded-xl bg-white shadow-md border border-gray-100 backdrop-blur">
            <p className="text-xs font-black uppercase tracking-widest text-indigo-600">{booking.serviceId?.serviceName}</p>
            <p className="text-[10px] font-bold text-gray-400">#{booking._id?.slice(-6).toUpperCase()}</p>
          </div>

          {/* Live tracking animation */}
          {isTrackingLive && (
            <div className="absolute inset-0 z-10 flex items-center justify-center">
              <div className="relative flex items-center justify-center">
                <div className="absolute w-24 h-24 rounded-full animate-ping bg-indigo-500/20" />
                <div className="absolute w-16 h-16 rounded-full animate-ping bg-indigo-500/40" style={{ animationDelay: '0.3s' }} />
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-white z-10 bg-indigo-600 shadow-xl shadow-indigo-600/30">
                  <Navigation className="w-5 h-5" />
                </div>
              </div>
            </div>
          )}

          {/* Idle state */}
          {!isTrackingLive && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-4xl mb-2 drop-shadow-sm">📍</div>
                <p className="text-xs font-black uppercase tracking-widest text-indigo-400 bg-white px-3 py-1 rounded-full shadow-sm">Map Offline</p>
              </div>
            </div>
          )}
        </div>

        <div className="p-6">
          {/* Status banner */}
          <div className="flex items-center justify-between p-5 rounded-2xl mb-6 bg-gray-50 border border-gray-100 shadow-inner">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest mb-1.5 flex items-center gap-1.5 text-indigo-600">
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-float" /> Live Status
              </p>
              <StatusBadge status={booking.status} size="lg" />
            </div>
            <div className="text-right">
              <p className="text-[10px] uppercase font-bold mb-1 text-gray-400">Total Due</p>
              <p className="text-2xl font-black text-gray-900 tracking-tighter">₹{booking.finalPrice || booking.estimatedPrice}</p>
            </div>
          </div>

          {/* Pricing Breakdown (V2) */}
          {(booking.laborCost || booking.partsCost) && (
            <div className="mb-6 px-5 py-4 rounded-2xl bg-white border border-gray-100 shadow-sm space-y-2">
               <div className="flex justify-between items-center text-xs font-bold text-gray-500 uppercase tracking-widest">
                  <span className="flex items-center gap-2"><Wrench className="w-3.5 h-3.5 text-indigo-400" /> Labor Fees</span>
                  <span className="text-gray-900">₹{booking.laborCost || 0}</span>
               </div>
               {booking.partsCost > 0 && (
                 <div className="flex justify-between items-center text-xs font-bold text-gray-500 uppercase tracking-widest">
                    <span className="flex items-center gap-2"><Package className="w-3.5 h-3.5 text-indigo-400" /> Parts & Materials</span>
                    <span className="text-gray-900">₹{booking.partsCost}</span>
                 </div>
               )}
               <div className="pt-2 mt-2 border-t border-dashed border-gray-200 flex justify-between items-center">
                  <span className="text-[10px] font-black uppercase text-indigo-600 tracking-wider">Net Amount</span>
                  <span className="text-lg font-black text-gray-900">₹{booking.finalPrice}</span>
               </div>
            </div>
          )}

          {/* Payment Section (V2) */}
          {isPaymentPending && (
            <div className="mb-8 p-5 rounded-2xl bg-indigo-50 border border-indigo-100 animate-fade-in group relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/30 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl group-hover:scale-125 transition-transform duration-700" />
                <div className="relative z-10">
                  <h3 className="text-sm font-black text-indigo-900 mb-4 uppercase tracking-widest flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-indigo-500" /> Select Payment Method
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      onClick={handlePayOnline}
                      disabled={processing}
                      className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl bg-white border-2 border-indigo-200 hover:border-indigo-600 hover:shadow-md transition-all text-indigo-700 group/btn disabled:opacity-70"
                    >
                      {processing ? <Loader2 className="w-6 h-6 animate-spin text-indigo-600" /> : <CreditCard className="w-6 h-6 group-hover/btn:scale-110 transition-transform" />}
                      <span className="text-xs font-black uppercase tracking-widest">Pay Online</span>
                    </button>
                    <button 
                      onClick={handlePayCash}
                      disabled={processing}
                      className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl bg-white border-2 border-gray-200 hover:border-emerald-500 hover:shadow-md transition-all text-gray-700 hover:text-emerald-600 group/btn disabled:opacity-70"
                    >
                      {processing ? <Loader2 className="w-6 h-6 animate-spin text-gray-400" /> : <Banknote className="w-6 h-6 group-hover/btn:scale-110 transition-transform" />}
                      <span className="text-xs font-black uppercase tracking-widest">Pay Cash</span>
                    </button>
                  </div>
                </div>
            </div>
          )}

          {/* Progress Timeline */}
          <div className="mb-8">
            <p className="text-sm font-black text-gray-900 mb-6 uppercase tracking-widest">Progress Tracker</p>
            <div className="relative pl-2">
              <div className="absolute left-[15px] top-6 bottom-4 w-0.5 bg-gray-100" />
              <div className="space-y-6">
                {STATUS_STEPS.filter(s => s !== 'Cancelled').map((step, idx) => {
                  const done = idx <= currentIdx;
                  const active = idx === currentIdx;
                  return (
                    <div key={step} className="flex items-center gap-5 relative group">
                      <div
                        className={`relative z-10 w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                          done ? 'bg-indigo-600 shadow-md shadow-indigo-600/30' : 'bg-white border-2 border-gray-200'
                        }`}
                        style={{ transform: active ? 'scale(1.2)' : 'scale(1)' }}
                      >
                        {done && <CheckCircle2 className="w-4 h-4 text-white" />}
                      </div>
                      <div className="flex-1">
                        <span className={`block transition-all duration-300 ${
                          active ? 'text-indigo-600 font-black text-[15px]' : done ? 'text-gray-900 font-bold text-sm' : 'text-gray-400 font-medium text-sm'
                        }`}>
                          {step}
                        </span>
                        {active && <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mt-0.5 block">Current Stage</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Worker info */}
          {booking.workerId && (
            <div className="flex items-center justify-between p-4 rounded-2xl mb-6 bg-gray-50 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-black text-xl bg-gray-800 shadow-md">
                  {booking.workerId.name?.[0]?.toUpperCase() || 'W'}
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest mb-0.5 text-gray-400">Professional</p>
                  <p className="font-black text-gray-900 text-sm">{booking.workerId.name}</p>
                </div>
              </div>
              {booking.workerId.phone && (
                <a href={`tel:${booking.workerId.phone}`} className="w-10 h-10 rounded-xl flex items-center justify-center transition-all bg-emerald-100 text-emerald-600 hover:bg-emerald-200 shadow-sm">
                  <Phone className="w-4 h-4" />
                </a>
              )}
            </div>
          )}

          {/* Booking Meta */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {[
              { icon: MapPin, label: 'Location', val: booking.location?.address },
              { icon: Calendar, label: 'Date', val: booking.date ? new Date(booking.date).toLocaleDateString('en-IN') : '—' },
              { icon: Clock, label: 'Time Slot', val: booking.timeSlot },
            ].map(({ icon: Icon, label, val }) => (
              <div key={label} className="p-4 rounded-2xl bg-white border border-gray-100 shadow-sm flex flex-col justify-center">
                <div className="flex items-center gap-2 mb-2">
                  <Icon className="w-3.5 h-3.5 text-indigo-500" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">{label}</span>
                </div>
                <p className="text-xs font-black text-gray-900 truncate">{val || '—'}</p>
              </div>
            ))}
          </div>

          <button
            onClick={onClose}
            className="w-full py-4 rounded-xl font-black text-sm uppercase tracking-widest text-white transition-all bg-gray-900 shadow-lg hover:shadow-xl hover:-translate-y-0.5 hover:bg-black"
          >
            Close Tracker
          </button>
        </div>
      </div>
    </div>
  );
};

export default TrackingModal;
