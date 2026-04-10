import { useState, useEffect, useCallback } from 'react';
import {
  Search, RefreshCw, XCircle, Plus, Activity, Clock
} from 'lucide-react';
import toast from 'react-hot-toast';
import { 
  getAdminStats, getAdminBookings, 
  updateService, addService 
} from '../../api';

// Sub-components
import StatsCards from './components/StatsCards';
import AnalyticsTab from './components/AnalyticsTab';
import WorkersTab from './components/WorkersTab';
import UsersTab from './components/UsersTab';
import BookingsTab from './components/BookingsTab';
import ServicesTab from './components/ServicesTab';

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

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [activeTab, setActiveTab] = useState('analytics');
  const [search, setSearch] = useState('');
  const [serviceModal, setServiceModal] = useState(null);
  const [detailModal, setDetailModal] = useState(null);

  // Stats are the only thing we poll centrally
  const fetchStats = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    setRefreshing(true);
    try {
      const res = await getAdminStats();
      setStats(res.data);
      setLastUpdated(new Date());
    } catch {
      toast.error('Failed to load stats.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { 
    fetchStats(); 
    const intervalId = setInterval(() => fetchStats(true), 60000); // 1 minute stats sync
    return () => clearInterval(intervalId);
  }, [fetchStats]);

  const tabs = [
    { id: 'analytics', label: 'Analytics', icon: Activity },
    { id: 'bookings', label: 'Bookings' },
    { id: 'workers', label: 'Workers' },
    { id: 'users', label: 'Customers' },
    { id: 'services', label: 'Services' },
  ];

  const handleOpenDetail = (type, data) => {
    // We can fetch specific detail stats here if needed, or pass them if available
    setDetailModal({ type, data });
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 pb-12 px-6">
      <div className="max-w-7xl mx-auto animate-fade-in">
        
        {/* Header */}
        <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black uppercase tracking-tight text-gray-900">Admin Control Panel</h1>
            <div className="flex items-center gap-3 mt-1.5">
               <p className="text-gray-500 font-medium text-sm">Professional Platform Management</p>
               <span className="w-1 h-1 rounded-full bg-gray-300" />
               <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  <Clock className="w-3 h-3" />
                  Synced {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
               </div>
            </div>
          </div>
          <button 
            onClick={() => fetchStats()} 
            disabled={refreshing}
            className="flex items-center justify-center gap-2 bg-indigo-600 text-white font-black px-6 py-3.5 rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/30 text-sm hover:-translate-y-0.5 disabled:opacity-70"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} /> 
            {refreshing ? 'Syncing...' : 'Sync Dashboard'}
          </button>
        </div>

        {/* Stats Section */}
        <StatsCards stats={stats} loading={loading} />

        {/* Action Panel */}
        <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-gray-200 shadow-sm min-h-[500px]">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 border-b border-gray-100 pb-6">
            <div className="flex gap-2 flex-wrap p-1.5 bg-gray-50 border border-gray-100 rounded-2xl">
              {tabs.map(t => (
                <button 
                  key={t.id} 
                  onClick={() => { setActiveTab(t.id); setSearch(''); }}
                  className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${activeTab === t.id ? 'bg-white shadow-sm border border-gray-200 text-indigo-600' : 'text-gray-500 hover:text-gray-900'}`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div className="flex gap-3">
              {activeTab === 'services' && (
                <button onClick={() => setServiceModal({})} className="flex items-center gap-2 bg-indigo-600 text-white font-black px-5 py-2.5 rounded-xl hover:bg-indigo-700 transition-all text-sm shadow-md shadow-indigo-600/20">
                  <Plus className="w-4 h-4" /> Add Service
                </button>
              )}
              <div className="relative w-full md:w-64">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                  placeholder={`Search ${activeTab}...`}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-indigo-500 text-sm font-medium focus:bg-white transition-all" />
              </div>
            </div>
          </div>

          <div className="overflow-hidden">
            {activeTab === 'analytics' && <AnalyticsTab stats={stats} bookings={[]} /* Analytics will fetch its own if needed, or we can fetch a summary */ />}
            {activeTab === 'workers' && <WorkersTab search={search} onOpenDetail={(w) => handleOpenDetail('Worker', w)} />}
            {activeTab === 'users' && <UsersTab search={search} onOpenDetail={(u) => handleOpenDetail('Customer', u)} />}
            {activeTab === 'bookings' && <BookingsTab search={search} />}
            {activeTab === 'services' && <ServicesTab search={search} onEdit={(s) => setServiceModal(s)} />}
          </div>
        </div>

        {/* Modals */}
        {serviceModal && (
          <ServiceModal
            service={serviceModal}
            onClose={() => setServiceModal(null)}
            onSaved={() => { /* Tabs handle their own refresh or we can force remount */ }}
          />
        )}

        {detailModal && (
          <DetailModal
            title={`${detailModal.type} Details`}
            data={detailModal.data}
            type={detailModal.type}
            onClose={() => setDetailModal(null)}
          />
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
