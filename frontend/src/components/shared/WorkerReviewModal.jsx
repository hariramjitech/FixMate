import { useState, useEffect } from 'react';
import { X, Star, MessageSquare, Calendar, ShieldCheck } from 'lucide-react';
import axios from 'axios';

const WorkerReviewModal = ({ worker, onClose }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`/reviews/worker/${worker._id}`);
        setReviews(res.data);
      } catch (err) {
        console.error('Failed to fetch reviews:', err);
        setReviews([]);
      } finally {
        setLoading(false);
      }
    };
    if (worker?._id) fetchReviews();
  }, [worker]);

  const avgRating = worker.rating?.toFixed(1) || '5.0';

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg max-h-[82vh] overflow-hidden flex flex-col bg-white rounded-[2rem] shadow-2xl animate-scale-in border border-gray-100">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 flex-shrink-0 bg-gray-50/50 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white text-xl font-black flex-shrink-0 bg-indigo-600 shadow-md">
              {worker.name[0]}
            </div>
            <div>
              <h3 className="font-black text-gray-900 uppercase tracking-tight">{worker.name}</h3>
              <div className="flex items-center gap-2 mt-0.5">
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-black bg-yellow-50 text-yellow-700 border border-yellow-100 border-dashed">
                  <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                  {avgRating}
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">{worker.numReviews || 0} Reviews</span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Star summary bar */}
        <div className="px-6 py-5 flex items-center gap-6 flex-shrink-0 border-b border-gray-100 bg-white">
          <div className="text-center">
            <p className="text-4xl font-black text-gray-900 tracking-tighter">{avgRating}</p>
            <div className="flex gap-0.5 mt-1 justify-center">
              {[1,2,3,4,5].map(s => (
                <Star key={s} className={`w-3 h-3 ${s <= Math.round(parseFloat(avgRating)) ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-100 text-gray-200'}`} />
              ))}
            </div>
          </div>
          <div className="flex-1 space-y-2">
            {[5,4,3,2,1].map(star => {
              const count = reviews.filter(r => r.rating === star).length;
              const pct = reviews.length ? (count / reviews.length) * 100 : 0;
              return (
                <div key={star} className="flex items-center gap-2">
                  <span className="text-[10px] font-black w-3 text-right text-gray-400">{star}</span>
                  <Star className="w-2.5 h-2.5 fill-yellow-400 text-yellow-400 flex-shrink-0" />
                  <div className="flex-1 h-2 rounded-full overflow-hidden bg-gray-100">
                    <div className="h-full rounded-full transition-all duration-700 bg-indigo-500" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-[10px] font-bold w-4 text-gray-500">{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Reviews list */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-4 bg-gray-50/50">
          {loading ? (
            <div className="flex flex-col items-center py-16 gap-4">
              <div className="w-10 h-10 rounded-full border-4 animate-spin border-indigo-100 border-t-indigo-600" />
              <p className="text-xs font-black uppercase tracking-widest text-indigo-400">Loading reviews...</p>
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-14">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-white border border-gray-100 shadow-sm">
                <MessageSquare className="w-8 h-8 text-gray-300" />
              </div>
              <p className="font-bold text-gray-900 mb-1">No written reviews yet</p>
              <p className="text-xs text-gray-500 font-medium max-w-xs mx-auto">This professional is highly rated but hasn't received written feedback yet.</p>
            </div>
          ) : (
            reviews.map((r, idx) => (
              <div key={r._id} className="p-5 rounded-2xl animate-fade-in-up bg-white border border-gray-100 shadow-sm" style={{ animationDelay: `${idx * 0.07}s` }}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm text-indigo-700 bg-indigo-50 border border-indigo-100">
                      {r.user?.name?.[0] || r.userId?.name?.[0] || 'U'}
                    </div>
                    <div>
                      <p className="text-sm font-black text-gray-900 capitalize leading-tight">{r.user?.name || r.userId?.name || 'Customer'}</p>
                      <p className="text-[10px] font-bold flex items-center gap-1 text-gray-400 mt-0.5 uppercase tracking-widest">
                        <Calendar className="w-3 h-3" /> {new Date(r.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-black bg-yellow-50 text-yellow-700 border border-yellow-100">
                    <Star className="w-3.5 h-3.5 fill-yellow-500 text-yellow-500" />
                    {r.rating}
                  </div>
                </div>
                <p className="text-sm leading-relaxed font-medium italic text-gray-600 px-1 decoration-gray-100">
                  "{r.comment || 'Great service! Very professional and helpful.'}"
                </p>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 flex items-center justify-center gap-2 flex-shrink-0 bg-white border-t border-gray-100">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <p className="text-[10px] font-black uppercase tracking-widest text-emerald-700">All reviews are from verified bookings</p>
        </div>
      </div>
    </div>
  );
};

export default WorkerReviewModal;
