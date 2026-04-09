import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Mail, Lock, Loader2, ArrowRight, Hammer, ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const ROLES = [
  {
    id: 'user',
    label: 'Customer',
    icon: '👤',
    desc: 'Book a service',
    color: 'indigo'
  },
  {
    id: 'worker',
    label: 'Worker',
    icon: '🔧',
    desc: 'Provide service',
    color: 'orange'
  },
  {
    id: 'admin',
    label: 'Admin',
    icon: '🛡️',
    desc: 'Manage all',
    color: 'purple'
  },
];

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const selectedRole = ROLES.find(r => r.id === role);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const loginType = role === 'worker' ? 'worker' : 'user';
      const userData = await login(email, password, loginType);

      if (role === 'admin' && userData.role !== 'admin') {
        toast.error('Access denied. Admin privileges required.');
        return;
      }

      toast.success(`Welcome back, ${userData.name}!`);

      if (userData.role === 'admin') navigate('/admin/dashboard');
      else if (userData.role === 'worker') navigate('/worker/dashboard');
      else navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid credentials. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#f9fafb]">
      {/* Abstract Background Orbs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-indigo-50 rounded-full blur-3xl opacity-60" />
        <div className="absolute bottom-20 -left-20 w-80 h-80 bg-blue-50 rounded-full blur-3xl opacity-60" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-[440px]"
      >
        {/* Back link */}
        <Link to="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-indigo-600 transition-colors text-sm font-bold mb-8 group">
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Home
        </Link>

        {/* Logo Section */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="p-3 rounded-2xl bg-indigo-600 shadow-xl shadow-indigo-200">
              <Hammer className="w-6 h-6 text-white" />
            </div>
            <span className="text-3xl font-black text-gray-900 tracking-tight">FixMate</span>
          </div>
          <h1 className="text-2xl font-black text-gray-900">Sign in to your account</h1>
          <p className="text-gray-500 mt-2 font-medium">Welcome back! Please enter your details.</p>
        </div>

        <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-gray-200/50 border border-gray-100 p-8 md:p-10">
          {/* Role Tabs */}
          <div className="flex p-1 bg-gray-50 rounded-2xl mb-8">
            {ROLES.map((r) => (
              <button
                key={r.id}
                onClick={() => setRole(r.id)}
                className={`relative flex-1 py-3 text-sm font-black transition-all duration-300 rounded-xl ${
                  role === r.id ? 'text-indigo-600' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                {role === r.id && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-white shadow-sm border border-gray-100 rounded-xl"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className="relative z-10 flex items-center justify-center gap-2">
                  <span className="text-base">{r.icon}</span>
                  {r.label}
                </span>
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-[11px] font-black text-gray-400 uppercase tracking-[0.15em] mb-2.5 ml-1">
                Email Address
              </label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center">
                  <Mail className="w-5 h-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-14 pr-5 py-4 bg-gray-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white text-gray-900 placeholder-gray-400 rounded-2xl outline-none transition-all font-bold"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-black text-gray-400 uppercase tracking-[0.15em] mb-2.5 ml-1">
                Password
              </label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center">
                  <Lock className="w-5 h-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-14 pr-5 py-4 bg-gray-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white text-gray-900 placeholder-gray-400 rounded-2xl outline-none transition-all font-bold"
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                <span className="text-sm font-bold text-gray-500 group-hover:text-gray-700 transition-colors">Remember me</span>
              </label>
              <Link to="#" className="text-sm font-bold text-indigo-600 hover:text-indigo-700 transition-colors">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full group bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-3 transition-all shadow-xl shadow-indigo-200 mt-6 active:scale-[0.98] disabled:opacity-70"
            >
              {isSubmitting ? (
                <Loader2 className="animate-spin w-5 h-5" />
              ) : (
                <>
                  Sign In as {selectedRole.label}
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-gray-100 text-center">
            <p className="text-gray-500 font-bold text-sm">
              New to FixMate?{' '}
              <Link to="/register" className="text-indigo-600 hover:text-indigo-700 transition-colors">
                Create a professional account
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
