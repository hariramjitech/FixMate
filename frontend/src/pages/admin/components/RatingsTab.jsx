import React, { useState, useEffect } from 'react';
import { Star, Trash2, MessageCircle, User, HardHat, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';
import { getAdminReviews, deleteAdminReview } from '../../../api';
import { SkeletonList } from '../../../components/ui/Skeleton';

const RatingsTab = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReviews = async () => {
    try {
      const res = await getAdminReviews();
      setReviews(res.data);
    } catch {
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
    const interval = setInterval(fetchReviews, 15000); // 15s sync
    return () => clearInterval(interval);
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this review? This will affect the worker\'s average rating.')) return;
    try {
      await deleteAdminReview(id);
      toast.success('Review removed');
      fetchReviews();
    } catch {
      toast.error('Delete failed');
    }
  };

  if (loading) return (
    <div className="p-6 bg-white rounded-[2rem] border border-gray-100 shadow-sm">
      <table className="w-full">
        <SkeletonList rows={6} cols={5} />
      </table>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {reviews.map((r) => (
          <div key={r._id} className="p-6 rounded-[2rem] bg-white border border-gray-100 shadow-sm group hover:shadow-xl transition-all duration-500">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center font-black">
                  {r.userId?.name?.[0].toUpperCase()}
                </div>
                <div>
                   <h4 className="text-xs font-black text-gray-900 truncate max-w-[120px]">{r.userId?.name}</h4>
                   <p className="text-[10px] font-bold text-gray-400">posted a review</p>
                </div>
              </div>
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-3 h-3 ${i < r.rating ? 'fill-orange-400 text-orange-400' : 'text-gray-200'}`} />
                ))}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-gray-50 mb-4 relative">
               <span className="absolute -top-2 -left-1 text-2xl opacity-20 select-none">"</span>
               <p className="text-xs font-medium text-gray-700 leading-relaxed italic line-clamp-3">{r.comment}</p>
            </div>

            <div className="flex flex-col gap-2 pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-gray-400">
                 <div className="flex items-center gap-1.5"><HardHat className="w-3 h-3" /> {r.workerId?.name}</div>
                 <div className="flex items-center gap-1.5"><Calendar className="w-3 h-3" /> {new Date(r.createdAt).toLocaleDateString()}</div>
              </div>
              <div className="flex items-center justify-between mt-2">
                 <span className="text-[9px] font-black uppercase tracking-widest px-2 py-1 bg-indigo-50 text-indigo-600 rounded-lg">
                    {r.bookingId?.serviceId?.serviceName || 'Service'}
                 </span>
                 <button 
                   onClick={() => handleDelete(r._id)}
                   className="p-2 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all"
                   title="Moderate Review"
                 >
                   <Trash2 className="w-4 h-4" />
                 </button>
              </div>
            </div>
          </div>
        ))}
        {reviews.length === 0 && (
           <div className="col-span-full p-20 text-center bg-gray-50 rounded-[2rem] border-2 border-dashed border-gray-200 text-gray-300 font-bold uppercase tracking-widest">
              No platform reviews to manage yet
           </div>
        )}
      </div>
    </div>
  );
};

export default RatingsTab;
