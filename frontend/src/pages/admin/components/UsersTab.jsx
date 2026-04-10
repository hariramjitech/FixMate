import React, { useState, useEffect, useCallback } from 'react';
import { UserX, Trash2, Loader2 } from 'lucide-react';
import { getAdminUsers, deleteUser } from '../../../api';
import toast from 'react-hot-toast';

const UsersTab = React.memo(({ search, onOpenDetail }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await getAdminUsers();
      setUsers(res.data);
    } catch {
      toast.error('Failed to load users.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this user?')) return;
    try {
      await deleteUser(id);
      toast.success('User deleted.');
      setUsers(prev => prev.filter(u => u._id !== id));
    } catch {
      toast.error('Failed to delete user.');
    }
  };

  const q = search.toLowerCase();
  const filtered = users.filter(u => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));

  if (loading) return (
    <div className="flex flex-col items-center py-20">
      <Loader2 className="w-10 h-10 animate-spin text-indigo-600 mb-4" />
      <p className="text-xs font-black uppercase tracking-widest text-indigo-400">Loading Customers...</p>
    </div>
  );

  return (
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
        {filtered.map(u => (
          <tr key={u._id} className="hover:bg-gray-50 transition-colors">
            <td className="py-4 px-4 font-bold text-indigo-600 cursor-pointer hover:underline" onClick={() => onOpenDetail(u)}>
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
              <button onClick={() => handleDelete(u._id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                <Trash2 className="w-5 h-5" />
              </button>
            </td>
          </tr>
        ))}
        {filtered.length === 0 && (
          <tr><td colSpan={5} className="py-16 text-center text-gray-300">
            <UserX className="w-10 h-10 mx-auto mb-3 opacity-20" />
            <p className="font-bold">No customers found</p>
          </td></tr>
        )}
      </tbody>
    </table>
  );
});

export default UsersTab;
