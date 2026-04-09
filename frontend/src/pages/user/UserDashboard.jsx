import { useState, useEffect } from 'react';
import { getServices, getTopWorkers } from '../../api';
import BookingModal from '../../components/shared/BookingModal';
import WorkerReviewModal from '../../components/shared/WorkerReviewModal';
import { useAuth } from '../../context/AuthContext';
import { 
  Search, MapPin, Star, ShieldCheck, 
  ChevronRight, Sparkles, Loader2, Wrench 
} from 'lucide-react';
import toast from 'react-hot-toast';

const UserDashboard = () => {
  const { user } = useAuth();
  const [services, setServices] = useState([]);
  const [topWorkers, setTopWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  const [selectedService, setSelectedService] = useState(null);
  const [reviewWorker, setReviewWorker] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [servicesRes, workersRes] = await Promise.all([
          getServices(),
          getTopWorkers()
        ]);
        setServices(servicesRes.data);
        setTopWorkers(workersRes.data);
      } catch {
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredServices = services.filter(s => 
    s.serviceName.toLowerCase().includes(search.toLowerCase()) || 
    s.category.toLowerCase().includes(search.toLowerCase())
  );

  const getIcon = (category) => {
    const map = { Cleaning: '🧹', Plumbing: '🔧', Electrician: '⚡', 'AC Repair': '❄️', 'Appliance Repair': '🛠️' };
    return map[category] || '🏠';
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 pb-20 pt-28 px-4 md:px-6">
      <div className="max-w-6xl mx-auto animate-fade-in">
        
        {/* ── Welcome Header ── */}
        <div className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-3 bg-indigo-50 border border-indigo-100 text-indigo-600 shadow-sm">
               <Sparkles className="w-3.5 h-3.5 text-yellow-500" /> Welcome Back
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight">
              Hello, <span className="text-indigo-600">{user.name.split(' ')[0]}</span>
            </h1>
            <p className="text-gray-500 mt-2 font-medium flex items-center gap-2">
               <MapPin className="w-4 h-4 text-indigo-400" /> delivering to {user.address || 'your saved location'}
            </p>
          </div>
          
          <div className="relative w-full md:w-[400px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search for services..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white border border-gray-200 focus:border-indigo-500 outline-none shadow-sm transition-all text-gray-900 font-medium"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center py-20 gap-4">
             <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
             <p className="text-xs font-black uppercase tracking-widest text-indigo-400">Loading catalog...</p>
          </div>
        ) : (
          <div className="space-y-12">

            {/* ── Top Professionals Showcase ── */}
            {topWorkers?.length > 0 && !search && (
              <section className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2 tracking-tight">
                     <ShieldCheck className="w-6 h-6 text-emerald-500" /> Available Professionals
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {topWorkers.slice(0, 3).map((w, idx) => (
                    <div 
                      key={w._id} 
                      className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all flex items-start gap-4 mb-2 cursor-pointer"
                      onClick={() => setReviewWorker(w)}
                    >
                      <div className="w-16 h-16 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-2xl shadow-lg shadow-indigo-600/30 flex-shrink-0">
                        {w.name[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                         <h3 className="font-black text-lg text-gray-900 truncate">{w.name}</h3>
                         <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 truncate">
                           {w.skills?.slice(0, 2).join(' · ')}
                         </p>
                         <div className="flex items-center gap-3">
                           <div className="flex items-center gap-1 bg-yellow-50 px-2 py-0.5 rounded-lg border border-yellow-100">
                             <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                             <span className="text-xs font-black text-yellow-700">{w.rating?.toFixed(1) || '5.0'}</span>
                           </div>
                           <span className="text-[10px] font-bold text-indigo-500">{w.numReviews || 0} Reviews →</span>
                         </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* ── Services Grid ── */}
            <section className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <div className="mb-6">
                 <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2 tracking-tight">
                    <Wrench className="w-6 h-6 text-indigo-500" /> Categories
                 </h2>
              </div>
              
              {filteredServices.length === 0 ? (
                <div className="text-center py-20 bg-white border border-dashed border-gray-300 rounded-3xl">
                  <p className="text-gray-500 font-medium">No services matched your search.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  {filteredServices.map(service => (
                    <div 
                      key={service._id} 
                      onClick={() => setSelectedService(service)}
                      className="group p-5 rounded-3xl bg-white border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer flex flex-col h-full"
                    >
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center text-3xl mb-4 bg-gray-50 border border-gray-100 shadow-sm transition-transform group-hover:scale-110">
                        {getIcon(service.category)}
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="font-black text-lg text-gray-900 leading-tight mb-2 group-hover:text-indigo-600 transition-colors">{service.serviceName}</h3>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{service.category}</p>
                      </div>

                      <div className="flex items-end justify-between pt-4 mt-4 border-t border-gray-100">
                        <div>
                          <span className="text-[10px] text-gray-500 block mb-0.5">Starting at</span>
                          <span className="font-black text-lg text-gray-900 tracking-tight">₹{service.basePrice}</span>
                        </div>
                        <div className="w-10 h-10 rounded-[12px] bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm">
                          <ChevronRight className="w-5 h-5" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </div>

      {selectedService && (
        <BookingModal 
          service={selectedService} 
          onClose={() => setSelectedService(null)} 
        />
      )}

      {reviewWorker && (
         <WorkerReviewModal 
           worker={reviewWorker}
           onClose={() => setReviewWorker(null)}
         />
      )}
    </div>
  );
};

export default UserDashboard;
