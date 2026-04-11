import React, { useState, useEffect, useCallback } from 'react';
import { Package, Edit2, Trash2, Loader2 } from 'lucide-react';
import { getServices, deleteService } from '../../../api';
import { SkeletonCard } from '../../../components/ui/Skeleton';
import toast from 'react-hot-toast';

const ServicesTab = React.memo(({ search, onEdit }) => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchServices = useCallback(async () => {
    try {
      const res = await getServices();
      setServices(res.data);
    } catch {
      toast.error('Failed to load services.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this service?')) return;
    try {
      await deleteService(id);
      toast.success('Service deleted.');
      setServices(prev => prev.filter(s => s._id !== id));
    } catch {
      toast.error('Failed to delete service.');
    }
  };

  const q = search.toLowerCase();
  const filtered = services.filter(s => s.serviceName.toLowerCase().includes(q) || s.category.toLowerCase().includes(q));

  if (loading) return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
      {[...Array(6)].map((_, i) => <SkeletonCard key={i} className="h-48" />)}
    </div>
  );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {filtered.map(s => (
        <div key={s._id} className="border border-gray-100 rounded-2xl p-5 hover:shadow-md transition-all group bg-white shadow-sm">
          {s.image && (
            <img src={s.image} alt={s.serviceName}
              className="w-full h-32 object-cover rounded-xl mb-4 group-hover:scale-[1.02] transition-transform" />
          )}
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="font-black text-gray-900 text-sm leading-snug">{s.serviceName}</h3>
            <span className="text-[10px] font-bold bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full whitespace-nowrap">{s.category}</span>
          </div>
          <p className="text-xs text-gray-500 mb-3 line-clamp-2">{s.description}</p>
          <div className="flex items-center justify-between">
            <span className="text-lg font-black text-gray-900">₹{s.basePrice}</span>
            <div className="flex gap-2">
              <button onClick={() => onEdit(s)} className="p-2 text-indigo-500 hover:bg-indigo-50 rounded-xl transition-all">
                <Edit2 className="w-4 h-4" />
              </button>
              <button onClick={() => handleDelete(s._id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ))}
      {filtered.length === 0 && (
        <div className="col-span-3 py-16 text-center text-gray-300">
          <Package className="w-10 h-10 mx-auto mb-3 opacity-20" />
          <p className="font-bold">No services found</p>
        </div>
      )}
    </div>
  );
});

export default ServicesTab;
