import { useState, useEffect } from 'react';
import { X, User, Phone, MapPin, Loader2, Save } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { updateProfile, updateWorkerProfile } from '../../api';
import toast from 'react-hot-toast';

const ProfileModal = ({ onClose }) => {
  const { user, refreshUser } = useAuth(); // getting refreshUser to sync context
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: user?.address || ''
  });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let res;
      if (user.role === 'worker') {
        res = await updateWorkerProfile(formData);
      } else {
        res = await updateProfile(formData);
      }
      
      // We need to use the newly added refreshUser function to sync state safely
      if (typeof refreshUser === 'function') {
         await refreshUser();
      } else {
         // Fallback if refreshUser isn't available for some reason
         window.location.reload();
      }
      
      toast.success('Profile updated successfully!');
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full pl-10 pr-4 py-3 rounded-xl text-sm font-bold bg-gray-50 border border-gray-200 focus:border-indigo-500 hover:bg-white transition-all outline-none text-gray-900";

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-white rounded-[2rem] shadow-2xl animate-scale-in border border-gray-100 overflow-hidden relative">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-gray-50/50">
          <h2 className="text-xl font-black text-gray-900">Edit Profile</h2>
          <button onClick={onClose} className="p-2 rounded-xl text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Full Name</label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-500" />
              <input type="text" name="name" value={formData.name} onChange={handleChange} className={inputClass} required />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Phone Number</label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-500" />
              <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className={inputClass} required />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Default Address</label>
            <div className="relative">
              <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-500" />
              <input type="text" name="address" value={formData.address} onChange={handleChange} className={inputClass} required />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full mt-4 py-3.5 rounded-xl font-black text-sm text-white bg-indigo-600 shadow-lg shadow-indigo-600/30 hover:-translate-y-0.5 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-4 h-4"/> Save Changes</>}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfileModal;
