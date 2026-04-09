import { useState } from 'react';
import { X, Star, Loader2, Check, Zap, ShieldCheck, Heart, Sparkles, Clock, UserCheck } from 'lucide-react';
import { submitReview } from '../../api';
import toast from 'react-hot-toast';

const QUICK_TAGS = [
  { id: 'punctual', label: 'Punctual', icon: Clock },
  { id: 'professional', label: 'Professional', icon: UserCheck },
  { id: 'clean', label: 'Clean Work', icon: Sparkles },
  { id: 'efficient', label: 'Efficient', icon: Zap },
  { id: 'polite', label: 'Very Polite', icon: Heart },
  { id: 'skilled', label: 'Highly Skilled', icon: ShieldCheck },
];

const RatingModal = ({ booking, onClose, onSuccess }) => {
  const [rating, setRating] = useState(0);
  const [hover, setHover]   = useState(0);
  const [comment, setComment] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const labels = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];
  const labelColors = ['', 'text-red-400', 'text-orange-400', 'text-yellow-400', 'text-lime-400', 'text-emerald-400'];

  const toggleTag = (label) => {
    setSelectedTags(prev =>
      prev.includes(label) ? prev.filter(t => t !== label) : [...prev, label]
    );
  };

  const handleSubmit = async () => {
    if (rating === 0) { toast.error('Please select a star rating ⭐'); return; }

    const finalComment = selectedTags.length > 0
      ? `[${selectedTags.join(', ')}] ${comment}`.trim()
      : comment.trim();

    if (!finalComment && rating < 5) { toast.error('Please share some feedback'); return; }

    setSubmitting(true);
    try {
      await submitReview({
        bookingId: booking._id,
        workerId: booking.workerId?._id || booking.workerId,
        rating,
        comment: finalComment || 'Excellent service!',
      });
      toast.success('Review submitted! Thank you 🚀');
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to submit review.');
    } finally {
      setSubmitting(false);
    }
  };

  const activeRating = hover || rating;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 animate-fade-in" style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(16px)' }}>
      <div className="w-full max-w-lg animate-scale-in" style={{
        background: 'linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 50%, #16213e 100%)',
        borderRadius: '2.5rem',
        border: '1px solid rgba(139,92,246,0.3)',
        boxShadow: '0 0 60px rgba(139,92,246,0.15), 0 25px 50px rgba(0,0,0,0.5)',
        overflow: 'hidden',
      }}>

        {/* Header */}
        <div className="relative overflow-hidden" style={{ padding: '2rem 2rem 1.5rem', background: 'linear-gradient(135deg, rgba(124,58,237,0.3), rgba(99,102,241,0.2))' }}>
          <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(circle at 80% 20%, rgba(139,92,246,0.2) 0%, transparent 60%)' }} />
          <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full transition-all" style={{ background: 'rgba(255,255,255,0.08)', color: '#a78bfa' }}>
            <X className="w-5 h-5" />
          </button>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-1">
              <div className="p-2 rounded-xl" style={{ background: 'rgba(139,92,246,0.2)', border: '1px solid rgba(139,92,246,0.3)' }}>
                <Star className="w-5 h-5" style={{ color: '#fbbf24' }} />
              </div>
              <p className="text-xs font-black uppercase tracking-widest" style={{ color: '#a78bfa' }}>Rate Your Experience</p>
            </div>
            <h2 className="text-2xl font-black text-white">How was the service?</h2>
          </div>
        </div>

        <div style={{ padding: '1.5rem 2rem 2rem' }}>

          {/* Worker Info */}
          <div className="flex items-center gap-4 mb-6 p-4 rounded-2xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-lg" style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}>
              {booking.workerId?.name?.[0] || 'W'}
            </div>
            <div>
              <p className="font-black text-white">{booking.workerId?.name || 'Your Professional'}</p>
              <p className="text-xs font-bold" style={{ color: '#a78bfa' }}>{booking.serviceId?.serviceName}</p>
            </div>
          </div>

          {/* Stars */}
          <div className="text-center mb-6">
            <div className="flex justify-center gap-2 mb-3">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onMouseEnter={() => setHover(star)}
                  onMouseLeave={() => setHover(0)}
                  onClick={() => setRating(star)}
                  className="transition-all hover:scale-125 active:scale-90 relative"
                  style={{ transform: star <= activeRating ? 'scale(1.1)' : 'scale(1)', transition: 'all 0.2s' }}
                >
                  <Star
                    className="w-12 h-12 transition-all duration-200"
                    style={{
                      color: star <= activeRating ? '#fbbf24' : 'rgba(255,255,255,0.1)',
                      fill: star <= activeRating ? '#fbbf24' : 'transparent',
                      filter: star <= activeRating ? 'drop-shadow(0 0 8px rgba(251,191,36,0.6))' : 'none',
                    }}
                  />
                </button>
              ))}
            </div>
            <div className="h-7 flex items-center justify-center">
              {activeRating > 0 && (
                <p className="text-sm font-black uppercase tracking-widest animate-fade-in" style={{ color: activeRating === 1 ? '#f87171' : activeRating === 2 ? '#fb923c' : activeRating === 3 ? '#fbbf24' : activeRating === 4 ? '#a3e635' : '#34d399' }}>
                  {labels[activeRating]}
                </p>
              )}
            </div>
          </div>

          {/* Quick Tags */}
          <div className="mb-5">
            <p className="text-xs font-black uppercase tracking-widest mb-3 text-center" style={{ color: 'rgba(255,255,255,0.4)' }}>What stood out?</p>
            <div className="flex flex-wrap justify-center gap-2">
              {QUICK_TAGS.map((tag) => {
                const isSelected = selectedTags.includes(tag.label);
                return (
                  <button
                    key={tag.id}
                    onClick={() => toggleTag(tag.label)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-2xl text-xs font-black uppercase tracking-wider transition-all"
                    style={{
                      background: isSelected ? 'rgba(124,58,237,0.4)' : 'rgba(255,255,255,0.05)',
                      border: `1px solid ${isSelected ? 'rgba(139,92,246,0.6)' : 'rgba(255,255,255,0.1)'}`,
                      color: isSelected ? '#c4b5fd' : 'rgba(255,255,255,0.5)',
                      boxShadow: isSelected ? '0 0 20px rgba(139,92,246,0.2)' : 'none',
                    }}
                  >
                    <tag.icon className="w-3 h-3" />
                    {tag.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Comment */}
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            placeholder="Share your experience... (optional for 5 stars)"
            className="w-full px-5 py-4 rounded-2xl outline-none resize-none text-sm font-medium transition-all mb-5"
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: 'rgba(255,255,255,0.85)',
              '::placeholder': { color: 'rgba(255,255,255,0.3)' },
            }}
          />

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all"
              style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              Skip
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex-[2] py-4 rounded-2xl flex items-center justify-center gap-2 font-black uppercase tracking-widest text-sm transition-all"
              style={{
                background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
                color: 'white',
                boxShadow: '0 8px 30px rgba(124,58,237,0.4)',
                opacity: submitting ? 0.7 : 1,
              }}
            >
              {submitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <span>Post Review</span>
                  <Check className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RatingModal;
