import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getServices, getRecentReviews } from '../api';
import {
  Hammer, Star, ArrowRight, Shield, Clock, ThumbsUp, ChevronRight,
  Sparkles, Zap, Check, User
} from 'lucide-react';

const steps = [
  { num: '01', title: 'Choose a Service', desc: 'Browse curated services tailored for you.', icon: '🔍' },
  { num: '02', title: 'Pick a Time Slot', desc: 'Select a date and time that fits your schedule.', icon: '📅' },
  { num: '03', title: 'Expert Arrives', desc: 'Our professional reaches your doorstep on time.', icon: '🚗' },
  { num: '04', title: 'Pay Safely', desc: 'Transparent pricing with a satisfaction guarantee.', icon: '💳' },
];

const LandingPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    // Dynamic Data fetching
    const fetchData = async () => {
      try {
        const [servicesRes, reviewsRes] = await Promise.all([
          getServices(),
          getRecentReviews()
        ]);
        setServices(servicesRes.data || []);
        setReviews(reviewsRes.data || []);
      } catch (err) {
        console.error("Failed to load initial dynamic data", err);
      }
    };
    fetchData();
  }, []);

  const handleGetStarted = () => {
    if (user) {
      if (user.role === 'admin') navigate('/admin/dashboard');
      else if (user.role === 'worker') navigate('/worker/dashboard');
      else navigate('/dashboard');
    } else {
      navigate('/register');
    }
  };

  const lightCard = {
    background: '#ffffff',
    border: '1px solid #f3f4f6',
    boxShadow: '0 10px 30px rgba(0,0,0,0.03)',
    borderRadius: '1.5rem',
  };

  // Map backend categories to generic emojis if no image field exists
  const getIcon = (category) => {
    const map = { Cleaning: '🧹', Plumbing: '🔧', Electrician: '⚡', 'AC Repair': '❄️', 'Appliance Repair': '🛠️' };
    return map[category] || '🏠';
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb', color: '#111827' }}>

      {/* ── Hero ── */}
      <section className="relative pt-40 pb-28 px-6 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(79,70,229,0.08) 0%, transparent 70%)' }} />
        <div className="absolute top-10 -left-20 w-96 h-96 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(56,189,248,0.08) 0%, transparent 70%)' }} />

        <div className="relative max-w-5xl mx-auto text-center z-10">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-sm font-bold mb-8 bg-white" style={{ border: '1px solid #e5e7eb', color: '#4f46e5', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
            <Sparkles className="w-4 h-4 text-yellow-500" />
            Voted #1 Home Service Platform
          </div>

          <h1 className="text-5xl md:text-7xl font-black mb-7 leading-tight tracking-tighter">
            Expert Home Services,<br/>
            <span style={{ color: '#4f46e5' }}>
              At Your Door.
            </span>
          </h1>

          <p className="text-xl mb-10 leading-relaxed max-w-2xl mx-auto text-gray-500 font-medium">
            Book verified professionals for cleaning, plumbing, electrical, and more instantly.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <button
              onClick={handleGetStarted}
              className="group flex items-center justify-center gap-2 px-10 py-4 rounded-2xl font-black text-white text-lg transition-all"
              style={{ background: '#4f46e5', boxShadow: '0 8px 25px rgba(79,70,229,0.35)' }}
            >
              Book a Service
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <Link
              to="/register"
              className="flex items-center justify-center gap-2 px-10 py-4 rounded-2xl font-black text-lg transition-all bg-white hover:bg-gray-50"
              style={{ border: '2px solid #e5e7eb', color: '#374151' }}
            >
              Join as Worker
            </Link>
          </div>

          <div className="flex flex-wrap justify-center gap-6 text-sm font-bold text-gray-500">
            {[
              { icon: Shield, text: 'Verified Experts', color: '#10b981' },
              { icon: Clock, text: 'On-Time', color: '#f59e0b' },
              { icon: ThumbsUp, text: 'Guaranteed', color: '#3b82f6' },
            ].map(({ icon: Icon, text, color }) => (
              <div key={text} className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-white shadow-sm border border-gray-100">
                  <Icon className="w-4 h-4" style={{ color }} />
                </div>
                {text}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Services Grid ── */}
      <section className="py-24 px-6 bg-white border-y border-gray-100">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-4 bg-indigo-50 text-indigo-600">
              <Zap className="w-3.5 h-3.5" /> Our Services
            </div>
            <h2 className="text-4xl font-black mb-3 tracking-tight">What Can We Fix?</h2>
            <p className="text-lg text-gray-500 font-medium">Professional services for every corner of your home</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.length === 0 ? (
                <div className="col-span-full text-center py-20 text-gray-400 font-bold">Loading services dynamically...</div>
            ) : (
                services.map((s) => (
                  <div
                    key={s._id}
                    onClick={handleGetStarted}
                    className="group cursor-pointer rounded-2xl overflow-hidden transition-all duration-300"
                    style={lightCard}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.08)'; e.currentTarget.style.borderColor = '#e5e7eb'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = lightCard.boxShadow; e.currentTarget.style.borderColor = lightCard.border; }}
                  >
                    <div className="p-6">
                      <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl mb-5 shadow-sm transition-transform group-hover:scale-110 duration-300" style={{ background: s.image || '#f3f4f6', border: '1px solid #e5e7eb' }}>
                        {getIcon(s.category)}
                      </div>
                      <h3 className="text-xl font-black mb-2 text-gray-900">{s.serviceName}</h3>
                      <p className="text-sm mb-5 leading-relaxed text-gray-500 font-medium line-clamp-2">{s.description || 'Professional home service you can trust.'}</p>
                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <span className="font-black text-lg text-indigo-600">₹{s.basePrice}</span>
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center transition-all bg-gray-50 text-indigo-500 group-hover:bg-indigo-600 group-hover:text-white">
                          <ChevronRight className="w-5 h-5" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="py-24 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black mb-3 tracking-tight text-gray-900">Book in 4 Simple Steps</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
            <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-px bg-gray-200" />
            {steps.map((s, i) => (
              <div key={i} className="flex flex-col items-center text-center group relative z-10">
                <div className="w-24 h-24 rounded-3xl bg-white border border-gray-100 shadow-xl flex items-center justify-center text-4xl mb-6 transition-transform group-hover:-translate-y-2 duration-300">
                  {s.icon}
                </div>
                <div className="px-3 py-1 rounded-full text-xs font-black mb-3 bg-indigo-100 text-indigo-700">{s.num}</div>
                <h3 className="text-lg font-black mb-2 text-gray-900">{s.title}</h3>
                <p className="text-sm leading-relaxed text-gray-500 font-medium">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Reviews (Dynamic) ── */}
      <section className="py-24 px-6 bg-white border-t border-gray-100">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-4 bg-yellow-50 text-yellow-700">
              <Star className="w-3.5 h-3.5 fill-yellow-500" /> Top Rated
            </div>
            <h2 className="text-4xl font-black mb-3 tracking-tight text-gray-900">What Our Customers Say</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             {reviews.length === 0 ? (
                <div className="col-span-full text-center py-10 text-gray-400 font-bold">No reviews found yet. Be the first!</div>
             ) : (
                reviews.slice(0,3).map((r, i) => (
                  <div key={r._id || i} className="p-7 rounded-3xl bg-white border border-gray-100 shadow-lg hover:shadow-xl transition-shadow cursor-default">
                    <div className="flex gap-1 mb-5">
                      {Array.from({ length: r.rating }).map((_, j) => (
                        <Star key={j} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                      ))}
                    </div>
                    <p className="text-gray-600 leading-relaxed mb-6 italic font-medium">"{r.comment}"</p>
                    <div className="flex items-center gap-3 pt-5 border-t border-gray-100">
                      <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-sm">
                        {r.userId?.name?.[0] || 'U'}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{r.userId?.name || 'Customer'}</p>
                        <p className="text-xs text-gray-500 font-semibold">{r.bookingId?.serviceId?.serviceName || 'Service'}</p>
                      </div>
                    </div>
                  </div>
                ))
             )}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 px-6 text-center bg-gray-50 border-t border-gray-200">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-4xl font-black mb-6 tracking-tight text-gray-900">Ready to get started?</h2>
          <p className="text-lg mb-10 text-gray-500 font-medium">
            Join over 50,000 homeowners who trust FixMate.
          </p>
          <button
            onClick={handleGetStarted}
            className="px-12 py-5 rounded-2xl font-black text-white text-lg transition-all"
            style={{ background: '#4f46e5', boxShadow: '0 8px 25px rgba(79,70,229,0.3)' }}
          >
            Find a Professional
          </button>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="py-8 px-6 text-center bg-white border-t border-gray-200">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="p-1.5 rounded-lg bg-indigo-600 text-white">
            <Hammer className="w-4 h-4" />
          </div>
          <span className="font-black text-lg text-gray-900">FixMate</span>
        </div>
        <p className="text-gray-400 text-sm font-semibold">© 2026 FixMate. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
