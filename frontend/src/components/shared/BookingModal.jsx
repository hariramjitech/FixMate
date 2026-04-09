import { useState, useEffect } from 'react';
import { X, Calendar, Clock, MapPin, ChevronRight, CheckCircle2, Navigation, Loader2, LocateFixed } from 'lucide-react';
import { getNearbyWorkers, createBooking } from '../../api';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const STEPS = ['Select Date & Time', 'Location Details', 'Confirm & Pay'];

const BookingModal = ({ service, onClose }) => {
  const navigate = useNavigate();
  const { socket } = useAuth();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [workers, setWorkers] = useState([]);
  const [locating, setLocating] = useState(false);
  
  const [formData, setFormData] = useState({
    date: '',
    timeSlot: '',
    address: '',
    workerId: null
  });

  const timeSlots = ['09:00 AM - 11:00 AM', '11:00 AM - 01:00 PM', '02:00 PM - 04:00 PM', '04:00 PM - 06:00 PM'];

  useEffect(() => {
    const fetchWorkers = async () => {
      try {
        const queryParams = { skill: service.category || service.serviceName, skipGeo: true };
        const res = await getNearbyWorkers(queryParams);
        setWorkers(res.data);
      } catch (error) {
        console.error("Workers fetch error", error);
      }
    };
    fetchWorkers();

    if (socket) {
      socket.on('worker_updated', fetchWorkers);
      return () => socket.off('worker_updated', fetchWorkers);
    }
  }, [service, socket]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleNext = () => setStep(s => Math.min(s + 1, STEPS.length - 1));
  const handlePrev = () => setStep(s => Math.max(s - 1, 0));

  const detectLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          // Reverse geocode via Nominatim OSM (Free, no API key needed for light usage)
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          const data = await res.json();
          if (data && data.display_name) {
            setFormData(f => ({ ...f, address: data.display_name }));
            toast.success('Location updated!');
          } else {
            setFormData(f => ({ ...f, address: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}` }));
            toast.success('Coordinates saved!');
          }
        } catch (err) {
          toast.error('Failed to resolve address');
        } finally {
          setLocating(false);
        }
      },
      (err) => {
        setLocating(false);
        toast.error('Location access denied or failed.');
      }
    );
  };

  const handleSubmit = async () => {
    if (!formData.address || !formData.date || !formData.timeSlot) {
      toast.error('Please fill in all details.');
      return;
    }
    
    setLoading(true);
    try {
      await createBooking({
        serviceId: service._id,
        workerId: formData.workerId,
        date: formData.date,
        timeSlot: formData.timeSlot,
        location: { type: 'Point', coordinates: [0,0], address: formData.address },
        estimatedPrice: service.basePrice
      });
      toast.success('Booking confirmed!');
      onClose();
      navigate('/my-bookings');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to complete booking');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full pl-11 pr-4 py-4 rounded-xl text-sm font-bold bg-gray-50 border border-gray-200 focus:border-indigo-500 hover:bg-white transition-all outline-none text-gray-900";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-xl max-h-[92vh] overflow-hidden flex flex-col bg-white rounded-[2rem] shadow-2xl animate-scale-in border border-gray-100 relative">
        
        {/* Progress Bar Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 flex-shrink-0 bg-gray-50/50">
          <div className="flex-1 flex items-center gap-2 max-w-[70%]">
             <div className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-white bg-indigo-600 shadow-md">
               {step + 1}
             </div>
             <p className="font-bold text-gray-900 text-sm truncate">{STEPS[step]}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-black text-gray-900 tracking-tight mb-2">Book {service.serviceName}</h2>
            <p className="text-sm font-medium text-gray-500">Service starts strictly at the designated time slot.</p>
          </div>

          {step === 0 && (
            <div className="space-y-6 animate-fade-in">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Select Date</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-500" />
                  <input type="date" name="date" value={formData.date} onChange={handleChange} className={inputClass} min={new Date().toISOString().split('T')[0]} />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Select Time Slot</label>
                <div className="grid grid-cols-2 gap-3">
                  {timeSlots.map(time => (
                    <button
                      key={time}
                      onClick={() => setFormData({ ...formData, timeSlot: time })}
                      className={`px-4 py-3.5 rounded-xl text-sm font-bold transition-all border ${
                        formData.timeSlot === time 
                          ? 'bg-indigo-50 border-indigo-500 text-indigo-700 shadow-sm' 
                          : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-6 animate-fade-in">
               <div className="space-y-2">
                 <div className="flex items-center justify-between ml-1 mb-1">
                   <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Service Address</label>
                   <button 
                     onClick={detectLocation}
                     disabled={locating}
                     className="text-[10px] font-black uppercase tracking-widest text-indigo-500 hover:text-indigo-700 flex items-center gap-1 transition-all"
                   >
                     {locating ? <Loader2 className="w-3 h-3 animate-spin"/> : <LocateFixed className="w-3 h-3"/>}
                     Detect Location
                   </button>
                 </div>
                 <div className="relative">
                   <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-500" />
                   <input type="text" name="address" placeholder="Flat No, Building, Street..." value={formData.address} onChange={handleChange} className={inputClass} />
                 </div>
               </div>

               <div className="space-y-3 pt-2">
                 <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Preferred Professional (Optional)</label>
                 <div className="grid grid-cols-1 gap-3">
                   <button
                      onClick={() => setFormData({ ...formData, workerId: null })}
                      className={`p-4 rounded-xl flex items-center justify-between transition-all border ${
                        !formData.workerId ? 'bg-indigo-50 border-indigo-500 shadow-sm' : 'bg-white border-gray-200 hover:border-gray-300'
                      }`}
                   >
                     <span className={`text-sm font-bold ${!formData.workerId ? 'text-indigo-700' : 'text-gray-900'}`}>Assign fastest available</span>
                     {!formData.workerId && <CheckCircle2 className="w-5 h-5 text-indigo-600" />}
                   </button>
                   {workers.slice(0, 3).map(w => (
                     <button
                       key={w._id}
                       onClick={() => setFormData({ ...formData, workerId: w._id })}
                       className={`p-4 rounded-xl flex items-center justify-between transition-all border ${
                         formData.workerId === w._id ? 'bg-indigo-50 border-indigo-500 shadow-sm' : 'bg-white border-gray-200 hover:border-gray-300'
                       }`}
                     >
                       <div className="flex items-center gap-3">
                         <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 font-black flex items-center justify-center">
                           {w.name[0]}
                         </div>
                         <div className="text-left">
                           <p className="font-bold text-gray-900 text-sm">{w.name}</p>
                           <p className="text-[10px] font-bold text-gray-500">⭐ {w.rating?.toFixed(1) || '5.0'} ({w.numReviews} Reviews)</p>
                         </div>
                       </div>
                       {formData.workerId === w._id && <CheckCircle2 className="w-5 h-5 text-indigo-600" />}
                     </button>
                   ))}
                 </div>
               </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-fade-in">
              <div className="p-6 rounded-2xl bg-indigo-50 border border-indigo-100">
                <div className="flex items-center gap-4 mb-6 pb-6 border-b border-indigo-100/50">
                  <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
                     <Navigation className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-gray-900 tracking-tight">{service.serviceName}</h3>
                    <p className="text-xs font-bold text-indigo-600">Standard Service</p>
                  </div>
                </div>

                <div className="space-y-4 text-sm font-medium">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Date</span>
                    <span className="text-gray-900 font-bold">{formData.date || '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Time Slot</span>
                    <span className="text-gray-900 font-bold">{formData.timeSlot || '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Estimated Cost</span>
                    <span className="text-gray-900 font-black tracking-tighter">₹{service.basePrice}</span>
                  </div>
                </div>
              </div>
              
              <div className="p-4 rounded-xl bg-yellow-50 border border-yellow-100">
                 <p className="text-xs font-semibold text-yellow-800 flex gap-2"><CheckCircle2 className="w-4 h-4 text-yellow-600 flex-shrink-0" /> Pay safely after the service is completed.</p>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-100 bg-gray-50 flex gap-3">
          {step > 0 && (
            <button onClick={handlePrev} className="px-6 py-4 rounded-xl font-bold text-sm text-gray-700 bg-white border border-gray-200 shadow-sm hover:bg-gray-50 transition-all">
              Back
            </button>
          )}
          {step < STEPS.length - 1 ? (
             <button onClick={handleNext} className="flex-1 px-6 py-4 rounded-xl font-bold text-sm text-white bg-indigo-600 shadow-md hover:-translate-y-0.5 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2">
               Continue <ChevronRight className="w-4 h-4" />
             </button>
          ) : (
             <button disabled={loading} onClick={handleSubmit} className="flex-1 px-6 py-4 rounded-xl font-black text-sm text-white bg-indigo-600 shadow-lg shadow-indigo-600/30 hover:-translate-y-0.5 hover:shadow-indigo-600/50 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2">
               {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirm Booking'}
             </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingModal;
