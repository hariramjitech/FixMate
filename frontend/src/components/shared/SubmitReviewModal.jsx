import { useState } from 'react';
import { X, Star, Loader2, MessageSquare } from 'lucide-react';
import { submitReview } from '../../api';
import toast from 'react-hot-toast';

const SubmitReviewModal = ({ booking, onClose, onSubmitted }) => {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [review, setReview] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating) {
      toast.error('Please provide a rating');
      return;
    }
    
    setLoading(true);
    try {
      await submitReview({
        bookingId: booking._id,
        workerId: booking.workerId?._id || booking.workerId,
        rating,
        comment: review || 'No additional comments provided.'
      });
      toast.success('Thank you for your feedback!');
      if (onSubmitted) onSubmitted();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-white rounded-[2rem] shadow-2xl animate-scale-in border border-gray-100 overflow-hidden relative">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-gray-50/50">
          <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
             <MessageSquare className="w-5 h-5 text-indigo-500" /> Leave Feedback
          </h2>
          <button onClick={onClose} className="p-2 rounded-xl text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="text-center">
            <p className="text-sm font-bold text-gray-500 mb-2">How was your service with <span className="text-gray-900">{booking.workerId?.name}</span>?</p>
            <div className="flex items-center justify-center gap-1.5 cursor-pointer">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="transition-all hover:scale-110 p-1"
                >
                  <Star 
                    className={`w-10 h-10 transition-colors ${
                      (hoverRating || rating) >= star 
                      ? 'fill-yellow-400 text-yellow-400 drop-shadow-md' 
                      : 'fill-gray-100 text-gray-200'
                    }`} 
                  />
                </button>
              ))}
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mt-3">
              {rating === 5 ? 'Excellent' : rating === 4 ? 'Very Good' : rating === 3 ? 'Good' : rating === 2 ? 'Fair' : 'Poor'}
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Comments (Optional)</label>
            <textarea 
              rows={3}
              value={review} 
              onChange={e => setReview(e.target.value)} 
              placeholder="Tell us what you loved or what we could improve..."
              className="w-full px-4 py-3 rounded-xl text-sm font-medium bg-gray-50 border border-gray-200 focus:border-indigo-500 hover:bg-white transition-all outline-none text-gray-900 resize-none" 
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-4 rounded-xl font-black text-sm text-white bg-indigo-600 shadow-lg shadow-indigo-600/30 hover:-translate-y-0.5 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Submit Review'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SubmitReviewModal;
