import { useState, useEffect, useCallback } from 'react';
import { getMyJobs, updateBookingStatus, updateAvailability } from '../../api';
import { useAuth } from '../../context/AuthContext';
import StatusBadge from '../../components/shared/StatusBadge';
import axios from 'axios';
import {
  Calendar, MapPin, Clock, CheckCircle2,
  DollarSign, User, Briefcase, XCircle, Loader2,
  RefreshCw, IndianRupee, Star, MessageSquare, Zap, ShieldCheck
} from 'lucide-react';
import toast from 'react-hot-toast';

const STATUS_FLOW = {
  'Accepted': 'Worker On The Way',
  'Worker On The Way': 'Work Started',
  'Work Started': 'Work Completed',
};

const STATUS_BTN_LABEL = {
  'Accepted': '🚗 On My Way',
  'Worker On The Way': '🔨 Start Work',
  'Work Started': '✅ Mark Completed',
};

const BillingForm = ({ job, onSubmit }) => {
  const [labor, setLabor] = useState('');
  const [parts, setParts] = useState('');
  const [saving, setSaving] = useState(false);

  const total = (parseFloat(labor) || 0) + (parseFloat(parts) || 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!labor) { toast.error('Enter labour cost'); return; }
    setSaving(true);
    try {
      await onSubmit(job._id, {
        status: 'Payment Pending',
        laborCost: parseFloat(labor),
        partsCost: parseFloat(parts) || 0,
        finalPrice: total,
      });
      toast.success('Invoice submitted!');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 pt-4 border-t border-gray-200 animate-fade-in">
      <p className="text-xs font-black uppercase tracking-widest mb-4 flex items-center gap-2 text-indigo-600">
        <DollarSign className="w-4 h-4" /> Generate Invoice
      </p>
      <div className="grid grid-cols-2 gap-3 mb-4">
        {[
          { label: 'Labour (Service)', val: labor, set: setLabor },
          { label: 'Parts / Materials', val: parts, set: setParts },
        ].map(({ label, val, set }) => (
          <div key={label} className="space-y-1.5">
            <label className="text-[10px] font-black uppercase ml-1 text-gray-500">{label}</label>
            <div className="relative">
              <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <input
                type="number" min="0" value={val}
                onChange={(e) => set(e.target.value)}
                className="w-full pl-9 pr-4 py-3 rounded-xl outline-none text-sm font-bold bg-white border border-gray-200 focus:border-indigo-500 text-gray-900 shadow-sm"
                placeholder="0"
              />
            </div>
          </div>
        ))}
      </div>
      <div className="space-y-2 mb-4 p-4 rounded-xl bg-gray-50 border border-gray-100">
        <div className="flex justify-between text-[11px] font-bold text-gray-500 uppercase tracking-wider">
          <span>Subtotal (Labour)</span>
          <span>₹{parseFloat(labor) || 0}</span>
        </div>
        <div className="flex justify-between text-[11px] font-bold text-red-400 uppercase tracking-wider">
          <span>Platform Fee (5%)</span>
          <span>- ₹{((parseFloat(labor) || 0) * 0.05).toFixed(2)}</span>
        </div>
        <div className="pt-2 border-t border-dashed border-gray-200 flex justify-between items-center bg-indigo-50 -mx-4 px-4 py-2 mt-2">
          <span className="text-xs font-black uppercase tracking-widest text-indigo-600">You Earn</span>
          <span className="text-xl font-black text-indigo-700">₹{((parseFloat(labor) || 0) * 0.95).toFixed(2)}</span>
        </div>
      </div>
      <div className="flex items-center justify-between px-4 mb-4">
        <span className="text-[10px] font-black uppercase text-gray-400">Total Customer Bill (inc. parts)</span>
        <span className="text-sm font-bold text-gray-900">₹{(total).toLocaleString()}</span>
      </div>
      <button type="submit" disabled={saving} className="w-full py-4 rounded-xl flex items-center justify-center gap-2 font-black text-sm text-white transition-all bg-indigo-600 hover:bg-indigo-700 shadow-md">
        {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <><CheckCircle2 className="w-5 h-5" /> Confirm & Send Invoice</>}
      </button>
    </form>
  );
};

const WorkerDashboard = () => {
  const { user, socket, refreshUser } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('Active');
  const [isAvailable, setIsAvailable] = useState(user?.isAvailable ?? true);

  const tabs = ['Pending', 'Active', 'Completed', 'Reviews'];

  const fetchJobs = useCallback(async () => {
    try {
      const res = await getMyJobs();
      // sort by newest
      setJobs(res.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    } catch {
      toast.error('Failed to load jobs.');
    }
  }, []);

  const fetchReviews = useCallback(async () => {
    try {
      const res = await axios.get(`/reviews/worker/${user?._id}`);
      setReviews(res.data);
    } catch (e) {
      console.error('Reviews fetch failed', e);
    }
  }, [user?._id]);

  const initData = useCallback(async () => {
    setLoading(true);
    await Promise.all([fetchJobs(), fetchReviews()]);
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchJobs, fetchReviews]);

  useEffect(() => { initData(); }, [initData]);

  useEffect(() => {
    if (!socket) return;
    const handleNew = (newBooking) => {
      toast('New job request! ✨', { icon: '✨', duration: 5000 });
      setJobs((prev) => [newBooking, ...prev]);
    };
    const handleUpdate = (updatedBooking) => {
      setJobs((prev) => prev.map((b) => (b._id === updatedBooking._id ? updatedBooking : b)));
    };
    const handleVerification = (isVerified) => {
      refreshUser();
      if (isVerified) {
        toast.success("Good news! Your account has been verified. You can now receive orders and go online.", { icon: '🎉', duration: 8000 });
      } else {
        toast.error("Your verification status was revoked by an administrator. You can no longer receive new orders.", { duration: 8000 });
      }
    };
    socket.on('newBooking', handleNew);
    socket.on('bookingUpdated', handleUpdate);
    socket.on('verificationUpdated', handleVerification);
    return () => {
      socket.off('newBooking', handleNew);
      socket.off('bookingUpdated', handleUpdate);
      socket.off('verificationUpdated', handleVerification);
    };
  }, [socket, refreshUser]);

  const toggleAvailability = async () => {
    try {
      const res = await updateAvailability({ isAvailable: !isAvailable });
      setIsAvailable(res.data.isAvailable);
      toast.success(res.data.isAvailable ? '🟢 Status: ONLINE' : '⚫ Status: OFFLINE');
    } catch {
      toast.error('Failed to change status');
    }
  };

  const filteredItems = tab === 'Reviews' ? reviews : jobs.filter((j) => {
    if (tab === 'Pending') return j.status === 'Pending';
    if (tab === 'Active') return ['Accepted', 'Worker On The Way', 'Work Started', 'Work Completed', 'Payment Pending'].includes(j.status);
    if (tab === 'Completed') return ['Finished', 'Cancelled'].includes(j.status);
    return true;
  });

  const changeStatus = async (jobId, newStatus, extra = {}) => {
    try {
      await updateBookingStatus(jobId, { status: newStatus, ...extra });
      toast.success(`Status updated: ${newStatus}`);
      fetchJobs();
    } catch {
      toast.error('Operation failed.');
    }
  };

  const finishedJobs = jobs.filter(j => j.status === 'Finished');
  const totalEarnings = finishedJobs.reduce((sum, j) => sum + (j.workerEarnings || 0), 0);
  const avgRating = reviews.length > 0
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : (user?.rating?.toFixed(1) || '5.0');

  const stats = [
    { label: 'Earnings', value: `₹${totalEarnings.toLocaleString('en-IN')}`, icon: IndianRupee, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
    { label: 'Rating', value: avgRating, icon: Star, color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-100' },
    { label: 'Active', value: jobs.filter(j => ['Accepted', 'Worker On The Way', 'Work Started'].includes(j.status)).length, icon: Zap, color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-100' },
    { label: 'Done', value: finishedJobs.length, icon: Briefcase, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-100' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 pb-20 px-4 md:px-6">
      <div className="max-w-6xl mx-auto animate-fade-in">

        {/* ── Verification Status Banner ── always visible ── */}
        {!user.isVerified ? (
          <div className="mb-8 p-5 rounded-[2rem] bg-indigo-600 shadow-xl shadow-indigo-200 border border-indigo-500 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl group-hover:scale-110 transition-transform duration-700" />
            <div className="flex flex-col md:flex-row items-center gap-5 relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/30 flex-shrink-0">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-lg font-black text-white uppercase tracking-tight">Account Not Verified</h3>
                <p className="text-indigo-100 font-semibold mt-0.5 text-sm leading-relaxed">
                  Your profile is pending admin approval. You cannot accept new jobs yet. Your history is still viewable.
                </p>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 text-white font-black text-[10px] uppercase tracking-widest flex-shrink-0">
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Pending Review
              </div>
            </div>
          </div>
        ) : (
          <div className="mb-8 p-5 rounded-[2rem] bg-emerald-500 shadow-xl shadow-emerald-200 border border-emerald-400 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl group-hover:scale-110 transition-transform duration-700" />
            <div className="flex flex-col md:flex-row items-center gap-5 relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-white/25 backdrop-blur-md flex items-center justify-center text-white border border-white/30 flex-shrink-0">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-lg font-black text-white uppercase tracking-tight">Account Verified ✓</h3>
                <p className="text-emerald-50 font-semibold mt-0.5 text-sm leading-relaxed">
                  Your professional profile is verified. You can go online, accept jobs, and serve customers.
                </p>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-white/15 backdrop-blur-sm rounded-xl border border-white/20 text-white font-black text-[10px] uppercase tracking-widest flex-shrink-0">
                <CheckCircle2 className="w-3.5 h-3.5" /> Active Pro
              </div>
            </div>
          </div>
        )}

        {/* ── Header ── */}
        <div className="relative overflow-hidden rounded-3xl bg-white border border-gray-200 shadow-sm p-8 md:p-10 mb-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
            <div className="flex flex-col md:flex-row items-center gap-5 text-center md:text-left">
              <div className="relative text-left">
                <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-white text-3xl font-black bg-indigo-600 shadow-lg shadow-indigo-600/30">
                  {user?.name?.[0] || 'P'}
                </div>
                {isAvailable && user?.isVerified && (
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-400 ring-4 ring-white animate-pulse" />
                )}
              </div>
              <div>
                <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase">Pro Dashboard</h1>
                <div className="flex items-center gap-3 mt-1 justify-center md:justify-start">
                  <span className="font-bold text-gray-500">Hello, {user?.name || 'Pro'}</span>
                  {!user?.isVerified && (
                    <span className="px-2 py-0.5 rounded-lg bg-yellow-50 text-yellow-600 border border-yellow-100 text-[10px] font-black uppercase">Unverified</span>
                  )}
                  {user?.isVerified && (
                    <>
                      <div className="w-px h-4 bg-gray-300" />
                      <span className="text-xs font-black uppercase tracking-widest text-indigo-600">{user?.skills?.[0] || 'Expert'}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-2xl bg-gray-50 border border-gray-100">
              {user.isVerified ? (
                <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-white shadow-sm border border-gray-100">
                  <span className={`w-2.5 h-2.5 rounded-full ${isAvailable ? 'bg-emerald-400 animate-pulse shadow-sm' : 'bg-gray-400'}`} />
                  <span className={`text-xs font-black uppercase tracking-widest ${isAvailable ? 'text-emerald-600' : 'text-gray-400'}`}>
                    {isAvailable ? 'Online' : 'Offline'}
                  </span>
                  <button
                    onClick={toggleAvailability}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all ${isAvailable ? 'bg-indigo-600' : 'bg-gray-300'}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isAvailable ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 shadow-inner border border-gray-200 opacity-60 pointer-events-none">
                  <ShieldCheck className="w-4 h-4 text-gray-500" />
                  <span className="text-xs font-black uppercase tracking-widest text-gray-500">Locked</span>
                </div>
              )}
              <button onClick={initData} className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-gray-200 text-gray-500 hover:text-indigo-600 hover:border-indigo-200 transition-all shadow-sm">
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* ── Stats ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          {stats.map((s, i) => (
            <div
              key={i}
              className="group p-5 rounded-3xl bg-white border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex items-center justify-between"
            >
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">{s.label}</p>
                <h3 className="text-3xl font-black text-gray-900 tracking-tighter leading-none">{s.value}</h3>
              </div>
              <div className={`w-14 h-14 rounded-2xl ${s.bg} ${s.border} border flex items-center justify-center transition-transform group-hover:scale-110 flex-shrink-0`}>
                <s.icon className={`w-6 h-6 ${s.color}`} />
              </div>
            </div>
          ))}
        </div>

        {/* ── Layout ── */}
        <div className="flex flex-col lg:flex-row gap-6 items-start">

          {/* Sidebar Tabs */}
          <div className="lg:w-64 w-full flex lg:flex-col gap-2 p-2 rounded-3xl bg-white border border-gray-200 shadow-sm">
            {tabs.map((t) => {
              const isActive = tab === t;
              const Icon = { Pending: Clock, Active: Zap, Completed: CheckCircle2, Reviews: MessageSquare }[t];
              const pendingCount = t === 'Pending' ? jobs.filter(j => j.status === 'Pending').length : 0;
              return (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`flex-1 lg:w-full flex items-center justify-between px-5 py-4 rounded-2xl font-bold text-sm transition-all ${isActive
                      ? 'bg-indigo-50 text-indigo-700 border border-indigo-100 shadow-sm'
                      : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900 border border-transparent'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5" />
                    {t}
                  </div>
                  {pendingCount > 0 && (
                    <span className="px-2 py-0.5 bg-red-100 text-red-600 text-[10px] uppercase font-black tracking-widest rounded-full">{pendingCount} New</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Content Area */}
          <div className="flex-1 w-full space-y-5">
            {loading ? (
              <div className="flex flex-col items-center py-24 bg-white border border-gray-200 rounded-3xl shadow-sm">
                <Loader2 className="w-10 h-10 animate-spin text-indigo-600 mb-4" />
                <p className="text-xs font-black uppercase tracking-widest text-indigo-400">Syncing dashboard...</p>
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="text-center py-20 bg-white border border-gray-200 border-dashed rounded-3xl shadow-sm">
                <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5 bg-gray-50 border border-gray-100">
                  {tab === 'Reviews' ? <MessageSquare className="w-8 h-8 text-gray-300" /> : <Briefcase className="w-8 h-8 text-gray-300" />}
                </div>
                <h4 className="text-lg font-black uppercase text-gray-600 tracking-tight">No {tab.toLowerCase()} found</h4>
                <p className="text-sm mt-2 text-gray-400 font-medium">Check back later or refresh.</p>
              </div>
            ) : tab === 'Reviews' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {reviews.map((rev) => (
                  <div key={rev._id} className="p-6 rounded-3xl bg-white border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-indigo-600 bg-indigo-50 border border-indigo-100">
                          {rev.userId?.name?.[0] || 'U'}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 capitalize">{rev.userId?.name || 'Customer'}</p>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{new Date(rev.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-black bg-yellow-50 text-yellow-700 border border-yellow-100">
                        <Star className="w-3.5 h-3.5 fill-yellow-500 text-yellow-500" />
                        {rev.rating}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 font-medium leading-relaxed">"{rev.comment || 'Great professional work!'}"</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-6">
                {filteredItems.map((job, idx) => (
                  <div key={job._id} className="animate-fade-in-up bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden" style={{ animationDelay: `${idx * 0.04}s` }}>
                    <div className="flex flex-col md:flex-row gap-6 p-6">

                      {/* Job Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-4">
                          <StatusBadge status={job.status} size="lg" />
                          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-gray-50 text-gray-500 border border-gray-100">
                            <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                            {new Date(job.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </div>
                          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-gray-50 text-gray-500 border border-gray-100">
                            <Clock className="w-3.5 h-3.5 text-indigo-500" />
                            {job.timeSlot}
                          </div>
                        </div>

                        <h3 className="text-2xl font-black text-gray-900 mb-6 uppercase tracking-tight">{job.serviceId?.serviceName}</h3>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                            <p className="text-[10px] font-black uppercase tracking-widest mb-1.5 flex items-center gap-1.5 text-gray-500">
                              <User className="w-3.5 h-3.5 text-indigo-400" /> Customer
                            </p>
                            <p className="font-bold text-gray-900 text-sm">{job.userId?.name}</p>
                            <a href={`tel:${job.userId?.phone}`} className="text-xs font-bold text-indigo-600 hover:underline mt-1 inline-block">{job.userId?.phone}</a>
                          </div>
                          <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                            <p className="text-[10px] font-black uppercase tracking-widest mb-1.5 flex items-center gap-1.5 text-gray-500">
                              <MapPin className="w-3.5 h-3.5 text-indigo-400" /> Location
                            </p>
                            <p className="font-medium text-gray-700 text-sm leading-snug">{job.location?.address || job.userId?.address}</p>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-4 md:min-w-[240px] p-5 rounded-2xl bg-gray-50 border border-gray-100">
                        <div className="mb-2 border-b border-gray-200 pb-4">
                          <span className="text-[10px] font-black uppercase tracking-widest block mb-1 text-gray-500">Service Value</span>
                          <div className="flex items-baseline gap-1 text-gray-900">
                            <span className="text-sm font-black text-indigo-600">₹</span>
                            <span className="text-4xl font-black tracking-tighter">{job.finalPrice || job.estimatedPrice}</span>
                          </div>
                        </div>

                        <div className="space-y-3">
                          {job.status === 'Pending' && (
                            <div className="flex flex-col gap-2">
                              <button
                                onClick={() => changeStatus(job._id, 'Accepted')}
                                className="w-full py-3.5 rounded-xl flex items-center justify-center gap-2 text-sm font-black text-white bg-indigo-600 hover:bg-indigo-700 shadow-md transition-all hover:-translate-y-0.5"
                              >
                                <CheckCircle2 className="w-5 h-5" /> Accept Job
                              </button>
                              <button
                                onClick={() => changeStatus(job._id, 'Cancelled')}
                                className="w-full py-3.5 rounded-xl flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 transition-colors"
                              >
                                <XCircle className="w-4 h-4" /> Reject
                              </button>
                            </div>
                          )}

                          {STATUS_FLOW[job.status] && (
                            <button
                              onClick={() => changeStatus(job._id, STATUS_FLOW[job.status])}
                              className="w-full py-4 rounded-xl flex items-center justify-center text-sm font-black text-white bg-indigo-600 hover:bg-indigo-700 shadow-md transition-all hover:-translate-y-0.5"
                            >
                              {STATUS_BTN_LABEL[job.status]}
                            </button>
                          )}

                          {job.status === 'Work Completed' && !job.finalPrice && (
                            <BillingForm job={job} onSubmit={(id, data) => changeStatus(id, data.status, data)} />
                          )}

                          {job.status === 'Payment Pending' && (
                            <button
                              onClick={() => changeStatus(job._id, 'Finished', { paymentMethod: 'Cash' })}
                              className="w-full py-4 rounded-xl flex items-center justify-center gap-2 text-sm font-black text-white bg-emerald-600 hover:bg-emerald-700 shadow-md transition-all"
                            >
                              <CheckCircle2 className="w-5 h-5" /> Mark Cash Paid & Finish
                            </button>
                          )}

                          {(job.status === 'Finished' || job.status === 'Cancelled') && (
                            <div className="flex items-center gap-3 p-3 rounded-xl bg-white border border-gray-200">
                              {job.status === 'Finished'
                                ? <ShieldCheck className="w-5 h-5 text-emerald-500" />
                                : <XCircle className="w-5 h-5 text-red-500" />}
                              <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Job {job.status}</p>
                            </div>
                          )}
                        </div>
                      </div>

                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkerDashboard;
