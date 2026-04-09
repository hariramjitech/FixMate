import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
  Users, UserCheck, ShoppingBag, TrendingUp,
  Search, ShieldCheck, Trash2, UserX, ClipboardList,
  RefreshCw, XCircle, Plus, Edit2, Package, IndianRupee
} from 'lucide-react';
import toast from 'react-hot-toast';
import StatusBadge from '../../components/shared/StatusBadge';

const DetailModal = ({ title, data, onClose, type }) => {
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
          
          <div className="grid grid-cols-2 gap-4">
             <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-1">Phone</span>
                <span className="text-sm font-bold text-gray-900">{data.phone || '—'}</span>
             </div>
             <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-1">Email</span>
                <span className="text-sm font-bold text-gray-900 truncate block">{data.email || '—'}</span>
             </div>
          </div>

          <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 mt-4">
             <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-1">Address</span>
             <span className="text-sm font-semibold text-gray-800">{data.address || '—'}</span>
          </div>

          {type === 'Worker' && data.skills && (
            <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-100 mt-4">
               <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400 block mb-2">Skills & Experience</span>
               <div className="flex flex-wrap gap-2 mb-2">
                 {data.skills.map(s => <span key={s} className="px-2 py-1 bg-white border border-indigo-100 rounded-lg text-xs font-bold text-indigo-600 shadow-sm">{s}</span>)}
               </div>
               <span className="text-sm font-bold text-indigo-900">{data.experience} Years Experience</span>
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
        await axios.put(`/services/${service._id}`, { ...form, basePrice: Number(form.basePrice) });
        toast.success('Service updated!');
      } else {
        await axios.post('/services', { ...form, basePrice: Number(form.basePrice) });
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
  const [activeTab, setActiveTab] = useState('workers');
  const [search, setSearch] = useState('');
  const [serviceModal, setServiceModal] = useState(null); // null = closed, {} = new, {_id,...} = edit
  const [detailModal, setDetailModal] = useState(null); // { type: 'User'|'Worker', data: obj }

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [statsRes, workersRes, usersRes, bookingsRes, servicesRes] = await Promise.all([
        axios.get('/admin/stats'),
        axios.get('/admin/workers'),
        axios.get('/admin/users'),
        axios.get('/admin/bookings'),
        axios.get('/services'),
      ]);
      setStats(statsRes.data);
      setWorkers(workersRes.data);
      setUsers(usersRes.data);
      setBookings(bookingsRes.data);
      setServices(servicesRes.data);
    } catch {
      toast.error('Failed to load admin data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { 
    fetchData(); 
    const intervalId = setInterval(fetchData, 10000);
    return () => clearInterval(intervalId);
  }, [fetchData]);

  const toggleVerifyWorker = async (id) => {
    try {
      const res = await axios.put(`/admin/verify-worker/${id}`);
      toast.success(res.data.isVerified ? 'Worker verified!' : 'Worker unverified');
      fetchData();
    } catch {
      toast.error('Failed to update worker.');
    }
  };

  const handleDeleteWorker = async (id) => {
    if (!window.confirm('Delete this worker? This cannot be undone.')) return;
    try { await axios.delete(`/admin/workers/${id}`); toast.success('Worker deleted.'); fetchData(); }
    catch { toast.error('Failed to delete worker.'); }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Delete this user?')) return;
    try { await axios.delete(`/admin/users/${id}`); toast.success('User deleted.'); fetchData(); }
    catch { toast.error('Failed to delete user.'); }
  };

  const handleDeleteService = async (id) => {
    if (!window.confirm('Delete this service?')) return;
    try { await axios.delete(`/services/${id}`); toast.success('Service deleted.'); fetchData(); }
    catch { toast.error('Failed to delete service.'); }
  };

  const handleAssignWorker = async (bookingId, workerId) => {
    if (!workerId) return;
    try {
      await axios.put(`/admin/bookings/${bookingId}/assign`, { workerId });
      toast.success('Worker assigned successfully.');
      fetchData();
    } catch {
      toast.error('Failed to assign worker.');
    }
  };

  const statCards = [
    { label: 'Total Revenue', value: `₹${(stats?.totalRevenue || 0).toLocaleString('en-IN')}`, icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Customers', value: stats?.totalUsers || 0, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Workers', value: stats?.totalWorkers || 0, icon: UserCheck, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Bookings', value: stats?.totalBookings || 0, icon: ShoppingBag, color: 'text-orange-600', bg: 'bg-orange-50' },
  ];

  const tabs = [
    { id: 'workers', label: 'Workers', count: workers.length },
    { id: 'users', label: 'Customers', count: users.length },
    { id: 'bookings', label: 'Bookings', count: bookings.length },
    { id: 'services', label: 'Services', count: services.length },
  ];

  const q = search.toLowerCase();
  const filteredWorkers = workers.filter(w => w.name.toLowerCase().includes(q) || w.email.toLowerCase().includes(q));
  const filteredUsers = users.filter(u => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
  const filteredBookings = bookings.filter(b => b.serviceId?.serviceName?.toLowerCase().includes(q) || b.userId?.name?.toLowerCase().includes(q));
  const filteredServices = services.filter(s => s.serviceName.toLowerCase().includes(q) || s.category.toLowerCase().includes(q));

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 pt-28 pb-12 px-6">
      <div className="max-w-7xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tight text-gray-900">Admin Control Panel</h1>
          <p className="text-gray-500 font-medium mt-1">Manage your platform end-to-end</p>
        </div>
        <button onClick={fetchData} className="flex items-center justify-center gap-2 bg-indigo-600 text-white font-black px-6 py-3.5 rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/30 text-sm hover:-translate-y-0.5">
          <RefreshCw className="w-4 h-4" /> Refresh Data
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
            <div key={i} className="bg-white p-6 rounded-[2rem] border border-gray-200 shadow-sm hover:shadow-md transition-all flex flex-col gap-2">
              <div className={`${card.bg} ${card.color} border w-12 h-12 rounded-2xl flex items-center justify-center self-end shadow-sm mb-2`}>
                <card.icon className="w-6 h-6" />
              </div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{card.label}</p>
              <h3 className="text-4xl font-black text-gray-900 tracking-tighter">{card.value}</h3>
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
                    <td className="py-4 px-4 font-bold text-indigo-600 cursor-pointer hover:underline" onClick={() => setDetailModal({ type: 'Worker', data: w })}>
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
                    <td className="py-4 px-4 font-bold text-indigo-600 cursor-pointer hover:underline" onClick={() => setDetailModal({ type: 'Customer', data: u })}>
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
                          className="bg-gray-100 border-none rounded-lg text-xs py-1 px-2 text-gray-700 outline-none focus:ring-2 focus:ring-primary-500 max-w-[120px]"
                          onChange={(e) => handleAssignWorker(b._id, e.target.value)}
                          defaultValue=""
                        >
                          <option value="" disabled>Assign...</option>
                          {workers.filter(w => w.isVerified).map(w => (
                            <option key={w._id} value={w._id}>{w.name} ({w.skills.join(', ')})</option>
                          ))}
                        </select>
                      )}
                    </td>
                    <td className="py-4 px-4"><StatusBadge status={b.status} /></td>
                    <td className="py-4 px-4 text-right font-bold text-primary-600">₹{b.finalPrice || b.estimatedPrice}</td>
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
          onClose={() => setDetailModal(null)}
        />
      )}
      </div>
    </div>
  );
};

export default AdminDashboard;
