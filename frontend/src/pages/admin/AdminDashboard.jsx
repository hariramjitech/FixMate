import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
  Users, UserCheck, ShoppingBag, TrendingUp,
  Search, ShieldCheck, Trash2, UserX, ClipboardList,
  RefreshCw, XCircle, Plus, Edit2, Package, IndianRupee,
  PieChart, Activity, Download, DollarSign, Wrench, CreditCard, Banknote,
  CheckCircle2, Clock
} from 'lucide-react';
import toast from 'react-hot-toast';
import StatusBadge from '../../components/shared/StatusBadge';
import { 
  getAdminStats, getAdminWorkers, getAdminUsers, getAdminBookings, 
  getServices, verifyWorker, deleteWorker, deleteUser, deleteService, 
  assignWorker, addService, updateService 
} from '../../api';

const DetailModal = ({ title, data, onClose, type, stats }) => {
  if (!data) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md animate-scale-in border border-gray-100 overflow-hidden relative">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-gray-50/50">
          <h2 className="text-xl font-black text-gray-900 tracking-tight">{title}</h2>
          <button onClick={onClose} className="p-2 rounded-xl text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-all"><XCircle className="w-5 h-5" /></button>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 font-black text-3xl flex items-center justify-center shadow-sm">
              {data.name[0]?.toUpperCase()}
            </div>
            <div>
              <p className="text-xl font-black text-gray-900">{data.name}</p>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">{type}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 flex-1">
             <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-1">Phone</span>
                <span className="text-sm font-bold text-gray-900">{data.phone || '—'}</span>
             </div>
             <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-1">Email</span>
                <span className="text-sm font-bold text-gray-900 truncate block text-ellipsis" title={data.email}>{data.email || '—'}</span>
             </div>
          </div>

          {stats && (
             <div className="grid grid-cols-2 gap-4 mt-2">
               <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100">
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 block mb-1">Total Orders</span>
                  <span className="text-2xl font-black text-emerald-900">{stats.totalOrders}</span>
               </div>
               <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-100">
                  <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 block mb-1">{type === 'Worker' ? 'Total Earnings' : 'Total Spent'}</span>
                  <span className="text-2xl font-black text-indigo-900 tracking-tighter">₹{stats.totalRevenue.toLocaleString()}</span>
               </div>
             </div>
          )}

          <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 mt-2">
             <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-1">Address</span>
             <span className="text-sm font-semibold text-gray-800">{data.address || '—'}</span>
          </div>

          {type === 'Worker' && data.skills && (
            <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 mt-2">
               <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 block mb-2">Skills & Experience</span>
               <div className="flex flex-wrap gap-2 mb-2">
                 {data.skills.map(s => <span key={s} className="px-2 py-1 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-600 shadow-sm">{s}</span>)}
               </div>
               <span className="text-sm font-bold text-gray-900">{data.experience} Years Experience</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* ── Service Management Modal ─────────────────────────────────── */
const ServiceModal = ({ service, onClose, onSaved }) => {
  const isEdit = Boolean(service?._id);
  const [form, setForm] = useState({
    serviceName: service?.serviceName || '',
    category: service?.category || 'Cleaning',
    basePrice: service?.basePrice || '',
    description: service?.description || '',
    image: service?.image || '',
  });
  const [saving, setSaving] = useState(false);

  const CATEGORIES = ['Cleaning', 'Plumbing', 'Electrician', 'Appliance Repair', 'Painting', 'AC Repair', 'General Maintenance'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (isEdit) {
        await updateService(service._id, { ...form, basePrice: Number(form.basePrice) });
        toast.success('Service updated!');
      } else {
        await addService({ ...form, basePrice: Number(form.basePrice) });
        toast.success('Service added!');
      }
      onSaved();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save service.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 animate-slide-up">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-black">{isEdit ? 'Edit Service' : 'Add Service'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-all"><XCircle className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 block">Service Name</label>
            <input type="text" value={form.serviceName} onChange={e => setForm(f => ({ ...f, serviceName: e.target.value }))}
              className="w-full px-4 py-3 border-2 border-gray-100 rounded-2xl focus:border-primary-500 outline-none" required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 block">Category</label>
              <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                className="w-full px-4 py-3 border-2 border-gray-100 rounded-2xl focus:border-primary-500 outline-none bg-white">
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 block">Base Price (₹)</label>
              <input type="number" min="0" value={form.basePrice} onChange={e => setForm(f => ({ ...f, basePrice: e.target.value }))}
                className="w-full px-4 py-3 border-2 border-gray-100 rounded-2xl focus:border-primary-500 outline-none" required />
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 block">Description</label>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3}
              className="w-full px-4 py-3 border-2 border-gray-100 rounded-2xl focus:border-primary-500 outline-none resize-none" required />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 block">Image URL (optional)</label>
            <input type="url" value={form.image} onChange={e => setForm(f => ({ ...f, image: e.target.value }))}
              className="w-full px-4 py-3 border-2 border-gray-100 rounded-2xl focus:border-primary-500 outline-none" placeholder="https://..." />
          </div>
          <button type="submit" disabled={saving}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3.5 rounded-2xl transition-all active:scale-95 disabled:opacity-60">
            {saving ? 'Saving...' : isEdit ? 'Update Service' : 'Add Service'}
          </button>
        </form>
      </div>
    </div>
  );
};

/* ── Main Dashboard ─────────────────────────────────────────────── */
const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [workers, setWorkers] = useState([]);
  const [users, setUsers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [activeTab, setActiveTab] = useState('analytics');
  const [search, setSearch] = useState('');
  const [serviceModal, setServiceModal] = useState(null); // null = closed, {} = new, {_id,...} = edit
  const [detailModal, setDetailModal] = useState(null); // { type: 'User'|'Worker', data: obj }

  const fetchData = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    setRefreshing(true);
    try {
      const [statsRes, workersRes, usersRes, bookingsRes, servicesRes] = await Promise.all([
        getAdminStats(),
        getAdminWorkers(),
        getAdminUsers(),
        getAdminBookings(),
        getServices(),
      ]);
      setStats(statsRes.data);
      setWorkers(workersRes.data);
      setUsers(usersRes.data);
      setBookings(bookingsRes.data);
      setServices(servicesRes.data);
      setLastUpdated(new Date());
    } catch {
      toast.error('Failed to load admin data.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { 
    fetchData(); 
    const intervalId = setInterval(() => fetchData(true), 30000);
    return () => clearInterval(intervalId);
  }, [fetchData]);

  const toggleVerifyWorker = async (id) => {
    try {
      const res = await verifyWorker(id);
      toast.success(res.data.isVerified ? 'Worker verified!' : 'Worker unverified');
      fetchData(true); // Silent refresh
    } catch {
      toast.error('Failed to update worker.');
    }
  };

  const handleDeleteWorker = async (id) => {
    if (!window.confirm('Delete this worker? This cannot be undone.')) return;
    try { await deleteWorker(id); toast.success('Worker deleted.'); fetchData(true); }
    catch { toast.error('Failed to delete worker.'); }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Delete this user?')) return;
    try { await deleteUser(id); toast.success('User deleted.'); fetchData(true); }
    catch { toast.error('Failed to delete user.'); }
  };

  const handleDeleteService = async (id) => {
    if (!window.confirm('Delete this service?')) return;
    try { await deleteService(id); toast.success('Service deleted.'); fetchData(true); }
    catch { toast.error('Failed to delete service.'); }
  };

  const handleAssignWorker = async (bookingId, workerId) => {
    if (!workerId) return;
    try {
      await assignWorker(bookingId, workerId);
      toast.success('Worker assigned successfully.');
      fetchData(true);
    } catch {
      toast.error('Failed to assign worker.');
    }
  };

  const statCards = [
    { label: 'Platform Profit (Fees)', value: `₹${(stats?.platformProfit || 0).toLocaleString('en-IN')}`, icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Total Materials', value: `₹${(stats?.materialsTotal || 0).toLocaleString('en-IN')}`, icon: Package, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Platform Payouts', value: `₹${(stats?.totalPlatformEarnings || 0).toLocaleString('en-IN')}`, icon: IndianRupee, color: 'text-orange-600', bg: 'bg-orange-50' },
    { label: 'Total Bookings', value: stats?.totalBookings || 0, icon: ClipboardList, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  ];

  const tabs = [
    { id: 'analytics', label: 'Analytics', icon: Activity },
    { id: 'bookings', label: 'Bookings', count: bookings.length },
    { id: 'workers', label: 'Workers', count: workers.length },
    { id: 'users', label: 'Customers', count: users.length },
    { id: 'services', label: 'Services', count: services.length },
  ];

  const q = search.toLowerCase();
  const filteredWorkers = workers.filter(w => w.name.toLowerCase().includes(q) || w.email.toLowerCase().includes(q));
  const filteredUsers = users.filter(u => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
  const filteredBookings = bookings.filter(b => b.serviceId?.serviceName?.toLowerCase().includes(q) || b.userId?.name?.toLowerCase().includes(q));
  const filteredServices = services.filter(s => s.serviceName.toLowerCase().includes(q) || s.category.toLowerCase().includes(q));

  const openWorkerDetail = (w) => {
    const workerBookings = bookings.filter(b => b.workerId?._id === w._id && b.status === 'Finished');
    const totalOrders = workerBookings.length;
    const totalRevenue = workerBookings.reduce((sum, b) => sum + (b.workerEarnings || 0), 0);
    setDetailModal({ type: 'Worker', data: w, stats: { totalOrders, totalRevenue } });
  };

  const openCustomerDetail = (u) => {
    const customerBookings = bookings.filter(b => b.userId?._id === u._id);
    const totalOrders = customerBookings.length;
    const totalRevenue = customerBookings.reduce((sum, b) => sum + (b.finalPrice || 0), 0);
    setDetailModal({ type: 'Customer', data: u, stats: { totalOrders, totalRevenue } });
  };

  /* ── Analytics View Component ─────────────────────────────────── */
  const AnalyticsView = () => {
    const finished = bookings.filter(b => b.status === 'Finished');
    
    return (
      <div className="space-y-8 animate-fade-in">
        {/* Treasury Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="p-6 rounded-[2rem] bg-indigo-900 text-white shadow-xl relative overflow-hidden group">
             <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl group-hover:scale-150 transition-transform duration-700" />
             <div className="relative z-10">
                <p className="text-[10px] font-black uppercase tracking-widest text-indigo-300 mb-2">Total Treasury Flow</p>
                <h3 className="text-4xl font-black tracking-tighter mb-4">₹{(stats?.totalRevenue || 0).toLocaleString()}</h3>
                <div className="space-y-2">
                   <div className="flex justify-between text-xs font-bold py-2 border-t border-indigo-800">
                      <span className="text-indigo-300">Net Platform Profit (Fees)</span>
                      <span className="text-emerald-400">₹{(stats?.platformProfit || 0).toLocaleString()}</span>
                   </div>
                   <div className="flex justify-between text-xs font-bold py-2 border-t border-indigo-800 text-indigo-100">
                      <span className="text-indigo-300">Total Materials Value</span>
                      <span>₹{(stats?.materialsTotal || 0).toLocaleString()}</span>
                   </div>
                   <div className="flex justify-between text-xs font-bold py-2 border-t border-indigo-800 text-indigo-100">
                      <span className="text-indigo-300">Net Worker Payouts</span>
                      <span className="text-orange-300">₹{(stats?.totalPlatformEarnings || 0).toLocaleString()}</span>
                   </div>
                </div>
             </div>
          </div>

          <div className="lg:col-span-2 grid grid-cols-2 gap-4">
             {stats?.paymentMethodStats?.map(m => (
               <div key={m._id} className="p-6 rounded-[2rem] bg-white border border-gray-100 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${m._id === 'Cash' || !m._id ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}>
                       {m._id === 'Cash' || !m._id ? <Banknote className="w-5 h-5" /> : <CreditCard className="w-5 h-5" />}
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">{m._id || 'Cash'} Sales</p>
                    <h4 className="text-2xl font-black text-gray-900">₹{(m.total || 0).toLocaleString()}</h4>
                  </div>
                  <p className="text-[10px] font-bold text-gray-400 mt-4 uppercase">{m.count} Finished Orders</p>
               </div>
             ))}
             {!stats?.paymentMethodStats?.length && (
               <div className="col-span-2 p-12 text-center bg-gray-50 rounded-[2rem] border border-dashed border-gray-200 text-gray-400 font-bold text-sm">
                  No transaction pattern data available yet
               </div>
             )}
          </div>
        </div>

        {/* Transaction Detail Log */}
        <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
           <div className="px-6 py-5 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
              <h3 className="text-sm font-black uppercase tracking-widest text-gray-900 flex items-center gap-2">
                 <Activity className="w-4 h-4 text-indigo-600" /> Treasury Split Journal
              </h3>
              <span className="text-[10px] font-bold bg-white px-3 py-1 rounded-full text-gray-500 uppercase border border-gray-100 shadow-sm">{finished.length} Completed Records</span>
           </div>
           <div className="overflow-x-auto">
             <table className="w-full text-left text-xs">
                <thead>
                   <tr className="bg-gray-50 text-gray-400 font-black uppercase tracking-widest border-b border-gray-100">
                      <th className="py-4 px-6">ID / Method</th>
                      <th className="py-4 px-6">Service Detail</th>
                      <th className="py-4 px-6 text-center">Labor (₹)</th>
                      <th className="py-4 px-6 text-center">Parts (₹)</th>
                      <th className="py-4 px-6 text-center text-orange-400">Fee (5%)</th>
                      <th className="py-4 px-6 text-indigo-600 bg-indigo-50/50 text-center">Admin Net</th>
                      <th className="py-4 px-6 text-emerald-600 text-center">Worker Net</th>
                      <th className="py-4 px-6 text-right">Total (₹)</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                   {finished.map(b => (
                      <tr key={b._id} className="hover:bg-gray-50/50 transition-colors">
                         <td className="py-4 px-6">
                            <div className="flex flex-col gap-1">
                               <span className="font-mono text-gray-400">#{b._id.slice(-6).toUpperCase()}</span>
                               <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full w-fit ${b.paymentMethod === 'Cash' || !b.paymentMethod ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
                                  {b.paymentMethod || 'Cash'}
                               </span>
                            </div>
                         </td>
                         <td className="py-4 px-6">
                            <div className="flex flex-col">
                               <span className="font-bold text-gray-900 truncate max-w-[120px]">{b.serviceId?.serviceName}</span>
                               <span className="text-[10px] text-gray-400">to {b.userId?.name}</span>
                            </div>
                         </td>
                         <td className="py-4 px-6 font-bold text-gray-600 text-center">{b.laborCost || 0}</td>
                         <td className="py-4 px-6 font-bold text-gray-600 text-center">{b.partsCost || 0}</td>
                         <td className="py-4 px-6 font-bold text-orange-400 text-center">{b.platformFee || 0}</td>
                         <td className="py-4 px-6 font-black text-indigo-600 bg-indigo-50/30 text-center">
                            {( (b.platformFee || 0) + (b.partsCost || 0) ).toLocaleString()}
                         </td>
                         <td className="py-4 px-6 font-black text-emerald-600 text-center">
                            {(b.workerEarnings || 0).toLocaleString()}
                         </td>
                         <td className="py-4 px-6 text-right font-black text-gray-900 text-sm">
                            {(b.finalPrice || 0).toLocaleString()}
                         </td>
                      </tr>
                   ))}
                   {finished.length === 0 && (
                     <tr><td colSpan={8} className="py-12 text-center text-gray-400 font-bold uppercase tracking-widest">No completed transactions to analyze</td></tr>
                   )}
                </tbody>
             </table>
           </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 pb-12 px-6">
      <div className="max-w-7xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tight text-gray-900">Admin Control Panel</h1>
          <div className="flex items-center gap-3 mt-1.5">
             <p className="text-gray-500 font-medium text-sm">Manage your platform end-to-end</p>
             <span className="w-1 h-1 rounded-full bg-gray-300" />
             <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                <Clock className="w-3 h-3" />
                Updated {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
             </div>
          </div>
        </div>
        <button 
          onClick={() => fetchData()} 
          disabled={refreshing}
          className="flex items-center justify-center gap-2 bg-indigo-600 text-white font-black px-6 py-3.5 rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/30 text-sm hover:-translate-y-0.5 disabled:opacity-70 disabled:translate-y-0"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} /> 
          {refreshing ? 'Refreshing...' : 'Refresh Data'}
        </button>
      </div>

      {/* Stat Cards */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {[1,2,3,4].map(i => <div key={i} className="h-32 bg-gray-100 rounded-3xl animate-pulse" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {statCards.map((card, i) => (
            <div key={i} className="bg-white p-6 rounded-[2rem] border border-gray-200 shadow-sm hover:shadow-md transition-all flex flex-col gap-2 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gray-50 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500" />
              <div className="relative z-10">
                <div className={`${card.bg} ${card.color} border w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm mb-4`}>
                  <card.icon className="w-6 h-6" />
                </div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{card.label}</p>
                <h3 className="text-4xl font-black text-gray-900 tracking-tighter">{card.value}</h3>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Main Panel */}
      <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-gray-200 shadow-sm">
        {/* Toolbar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 border-b border-gray-100 pb-6">
          {/* Tabs */}
          <div className="flex gap-2 flex-wrap p-1.5 bg-gray-50 border border-gray-100 rounded-2xl max-w-full overflow-x-auto no-scrollbar">
            {tabs.map(t => (
              <button key={t.id} onClick={() => { setActiveTab(t.id); setSearch(''); }}
                className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === t.id ? 'bg-white shadow-sm border border-gray-200 text-indigo-600' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100 border border-transparent'}`}>
                {t.label}
                <span className={`text-[10px] px-2 py-0.5 rounded-md font-black ${activeTab === t.id ? 'bg-indigo-50 text-indigo-600' : 'bg-gray-200 text-gray-500'}`}>
                  {t.count}
                </span>
              </button>
            ))}
          </div>

          <div className="flex gap-3">
            {/* Add service button */}
            {activeTab === 'services' && (
              <button onClick={() => setServiceModal({})}
                className="flex items-center gap-2 bg-indigo-600 text-white font-black px-5 py-2.5 rounded-xl hover:bg-indigo-700 transition-all text-sm shadow-md shadow-indigo-600/20 whitespace-nowrap">
                <Plus className="w-4 h-4" /> Add Service
              </button>
            )}
            {/* Search */}
            <div className="relative w-full md:w-64">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                placeholder={`Search ${activeTab}...`}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-indigo-500 text-sm font-medium transition-all text-gray-900 focus:bg-white" />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          {/* ─── Analytics ─── */}
          {activeTab === 'analytics' && <AnalyticsView />}

          {/* ─── Workers ─── */}
          {activeTab === 'workers' && (
            <table className="w-full text-left">
              <thead>
                <tr className="text-gray-400 text-xs font-bold uppercase tracking-widest border-b border-gray-100">
                  <th className="pb-4 px-4">Name</th>
                  <th className="pb-4 px-4">Contact</th>
                  <th className="pb-4 px-4">Skills</th>
                  <th className="pb-4 px-4">Exp</th>
                  <th className="pb-4 px-4">Status</th>
                  <th className="pb-4 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredWorkers.map(w => (
                  <tr key={w._id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-4 font-bold text-indigo-600 cursor-pointer hover:underline" onClick={() => openWorkerDetail(w)}>
                      {w.name}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex flex-col text-xs">
                        <span className="font-semibold text-gray-700">{w.email}</span>
                        <span className="text-gray-400">{w.phone}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex flex-wrap gap-1">
                        {w.skills?.map(s => (
                          <span key={s} className="bg-gray-100 px-2 py-0.5 rounded-md text-[10px] font-bold text-gray-500">{s}</span>
                        ))}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-sm font-semibold text-gray-600">{w.experience} yr{w.experience !== 1 ? 's' : ''}</td>
                    <td className="py-4 px-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${w.isVerified ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
                        {w.isVerified ? '✓ Verified' : '⏳ Pending'}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => toggleVerifyWorker(w._id)}
                          className={`p-2 rounded-xl transition-all ${w.isVerified ? 'text-orange-400 hover:bg-orange-50' : 'text-green-500 hover:bg-green-50'}`}
                          title={w.isVerified ? 'Revoke Verification' : 'Approve Worker'}>
                          {w.isVerified ? <XCircle className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
                        </button>
                        <button onClick={() => handleDeleteWorker(w._id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!loading && filteredWorkers.length === 0 && (
                  <tr><td colSpan={6} className="py-16 text-center text-gray-300">
                    <UserX className="w-10 h-10 mx-auto mb-3 opacity-20" />
                    <p className="font-bold">No workers found</p>
                  </td></tr>
                )}
              </tbody>
            </table>
          )}

          {/* ─── Customers ─── */}
          {activeTab === 'users' && (
            <table className="w-full text-left">
              <thead>
                <tr className="text-gray-400 text-xs font-bold uppercase tracking-widest border-b border-gray-100">
                  <th className="pb-4 px-4">Name</th>
                  <th className="pb-4 px-4">Contact</th>
                  <th className="pb-4 px-4">Address</th>
                  <th className="pb-4 px-4">Status</th>
                  <th className="pb-4 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredUsers.map(u => (
                  <tr key={u._id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-4 font-bold text-indigo-600 cursor-pointer hover:underline" onClick={() => openCustomerDetail(u)}>
                      {u.name}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex flex-col text-xs">
                        <span className="font-semibold text-gray-700">{u.email}</span>
                        <span className="text-gray-400">{u.phone}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-500 max-w-[200px] truncate">{u.address}</td>
                    <td className="py-4 px-4">
                      <span className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-[10px] font-bold uppercase">Active</span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <button onClick={() => handleDeleteUser(u._id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
                {!loading && filteredUsers.length === 0 && (
                  <tr><td colSpan={5} className="py-16 text-center text-gray-300">
                    <UserX className="w-10 h-10 mx-auto mb-3 opacity-20" />
                    <p className="font-bold">No customers found</p>
                  </td></tr>
                )}
              </tbody>
            </table>
          )}

          {/* ─── Bookings ─── */}
          {activeTab === 'bookings' && (
            <table className="w-full text-left">
              <thead>
                <tr className="text-gray-400 text-xs font-bold uppercase tracking-widest border-b border-gray-100">
                  <th className="pb-4 px-4">ID</th>
                  <th className="pb-4 px-4">Service</th>
                  <th className="pb-4 px-4">Customer</th>
                  <th className="pb-4 px-4">Worker</th>
                  <th className="pb-4 px-4">Pay Method</th>
                  <th className="pb-4 px-4">Status</th>
                  <th className="pb-4 px-4 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredBookings.map(b => (
                  <tr key={b._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 px-4 text-xs font-mono text-gray-400">#{b._id.slice(-6).toUpperCase()}</td>
                    <td className="py-4 px-4 font-bold text-gray-900 text-sm">{b.serviceId?.serviceName || '—'}</td>
                    <td className="py-4 px-4 text-sm text-gray-600">{b.userId?.name || '—'}</td>
                    <td className="py-4 px-4 text-sm text-gray-600">
                      {b.workerId?.name ? (
                        b.workerId.name
                      ) : (
                        <select
                          key={workers.map(w => `${w._id}:${w.isVerified}`).join(',')}
                          className="bg-gray-50 border border-gray-200 rounded-xl text-xs py-1.5 px-3 text-gray-700 outline-none focus:ring-2 focus:ring-indigo-300 max-w-[180px] shadow-sm cursor-pointer"
                          onChange={(e) => handleAssignWorker(b._id, e.target.value)}
                          defaultValue=""
                          title="Only verified workers shown"
                        >
                          <option value="" disabled>Assign...</option>
                          {workers.filter(w => w.isVerified).length === 0 ? (
                            <option disabled>No verified workers yet</option>
                          ) : (
                            workers.filter(w => w.isVerified).map(w => (
                              <option key={w._id} value={w._id}>{w.name} ({w.skills?.slice(0,2).join(', ')})</option>
                            ))
                          )}
                        </select>
                      )}
                    </td>
                    <td className="py-4 px-4">
                       <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-lg ${b.paymentMethod === 'Online' ? 'bg-blue-50 text-blue-600 border border-blue-100' : 'bg-gray-50 text-gray-500 border border-gray-100'}`}>
                          {b.paymentMethod || 'Cash'}
                       </span>
                    </td>
                    <td className="py-4 px-4"><StatusBadge status={b.status} /></td>
                    <td className="py-4 px-4 text-right font-bold text-primary-600 text-sm">₹{(b.finalPrice || b.estimatedPrice).toLocaleString()}</td>
                  </tr>
                ))}
                {!loading && filteredBookings.length === 0 && (
                  <tr><td colSpan={6} className="py-16 text-center text-gray-300">
                    <ClipboardList className="w-10 h-10 mx-auto mb-3 opacity-20" />
                    <p className="font-bold">No bookings found</p>
                  </td></tr>
                )}
              </tbody>
            </table>
          )}

          {/* ─── Services ─── */}
          {activeTab === 'services' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredServices.map(s => (
                <div key={s._id} className="border border-gray-100 rounded-2xl p-5 hover:shadow-md transition-all group">
                  {s.image && (
                    <img src={s.image} alt={s.serviceName}
                      className="w-full h-32 object-cover rounded-xl mb-4 group-hover:scale-[1.02] transition-transform" />
                  )}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-black text-gray-900 text-sm leading-snug">{s.serviceName}</h3>
                    <span className="text-[10px] font-bold bg-primary-50 text-primary-600 px-2 py-0.5 rounded-full whitespace-nowrap">{s.category}</span>
                  </div>
                  <p className="text-xs text-gray-500 mb-3 line-clamp-2">{s.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-black text-gray-900">₹{s.basePrice}</span>
                    <div className="flex gap-2">
                      <button onClick={() => setServiceModal(s)} className="p-2 text-primary-500 hover:bg-primary-50 rounded-xl transition-all">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDeleteService(s._id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {!loading && filteredServices.length === 0 && (
                <div className="col-span-3 py-16 text-center text-gray-300">
                  <Package className="w-10 h-10 mx-auto mb-3 opacity-20" />
                  <p className="font-bold">No services found</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Service Modal */}
      {serviceModal !== null && (
        <ServiceModal
          service={serviceModal}
          onClose={() => setServiceModal(null)}
          onSaved={fetchData}
        />
      )}

      {detailModal !== null && (
        <DetailModal
          title={`${detailModal.type} Details`}
          data={detailModal.data}
          type={detailModal.type}
          stats={detailModal.stats}
          onClose={() => setDetailModal(null)}
        />
      )}
      </div>
    </div>
  );
};

export default AdminDashboard;
