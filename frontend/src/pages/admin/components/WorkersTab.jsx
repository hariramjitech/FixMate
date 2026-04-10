import React, { useState, useEffect, useCallback } from 'react';
import { ShieldCheck, Search, Trash2, XCircle, UserX, Loader2 } from 'lucide-react';
import { getAdminWorkers, verifyWorker, deleteWorker } from '../../../api';
import toast from 'react-hot-toast';

const WorkersTab = React.memo(({ search, onOpenDetail }) => {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchWorkers = useCallback(async () => {
    try {
      const res = await getAdminWorkers();
      setWorkers(res.data);
    } catch {
      toast.error('Failed to load workers.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWorkers();
  }, [fetchWorkers]);

  const handleToggleVerify = async (id) => {
    try {
      const res = await verifyWorker(id);
      toast.success(res.data.isVerified ? 'Worker verified!' : 'Worker unverified');
      setWorkers(prev => prev.map(w => w._id === id ? { ...w, isVerified: res.data.isVerified } : w));
    } catch {
      toast.error('Failed to update worker.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this worker? This cannot be undone.')) return;
    try {
      await deleteWorker(id);
      toast.success('Worker deleted.');
      setWorkers(prev => prev.filter(w => w._id !== id));
    } catch {
      toast.error('Failed to delete worker.');
    }
  };

  const q = search.toLowerCase();
  const filtered = workers.filter(w => w.name.toLowerCase().includes(q) || w.email.toLowerCase().includes(q));

  if (loading) return (
    <div className="flex flex-col items-center py-20">
      <Loader2 className="w-10 h-10 animate-spin text-indigo-600 mb-4" />
      <p className="text-xs font-black uppercase tracking-widest text-indigo-400">Loading Workers...</p>
    </div>
  );

  return (
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
        {filtered.map(w => (
          <tr key={w._id} className="hover:bg-gray-50 transition-colors">
            <td className="py-4 px-4 font-bold text-indigo-600 cursor-pointer hover:underline" onClick={() => onOpenDetail(w)}>
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
                <button onClick={() => handleToggleVerify(w._id)}
                  className={`p-2 rounded-xl transition-all ${w.isVerified ? 'text-orange-400 hover:bg-orange-50' : 'text-green-500 hover:bg-green-50'}`}
                  title={w.isVerified ? 'Revoke Verification' : 'Approve Worker'}>
                  {w.isVerified ? <XCircle className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
                </button>
                <button onClick={() => handleDelete(w._id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </td>
          </tr>
        ))}
        {filtered.length === 0 && (
          <tr><td colSpan={6} className="py-16 text-center text-gray-300">
            <UserX className="w-10 h-10 mx-auto mb-3 opacity-20" />
            <p className="font-bold">No workers found</p>
          </td></tr>
        )}
      </tbody>
    </table>
  );
});

export default WorkersTab;
