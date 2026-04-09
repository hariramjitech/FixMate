import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  User, Mail, Lock, Phone, MapPin, Loader2, ArrowRight,
  Hammer, Briefcase, ChevronLeft, Check, Sparkles, UserPlus, ArrowLeft,
  ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const SKILL_OPTIONS = [
  'Cleaning', 'Plumbing', 'Electrician', 'Appliance Repair',
  'Painting', 'AC Repair', 'General Maintenance', 'Carpentry'
];

const ROLES = [
  { id: 'user', label: 'Customer', icon: '👤', desc: 'Book a service' },
  { id: 'worker', label: 'Service Worker', icon: '🔧', desc: 'Accept jobs' },
];

const Field = ({ label, icon: Icon, delay = 0, ...props }) => (
  <motion.div 
    initial={{ opacity: 0, x: -10 }} 
    animate={{ opacity: 1, x: 0 }} 
    transition={{ delay }}
    className="space-y-2"
  >
    <label className="block text-[11px] font-black text-gray-400 uppercase tracking-[0.15em] ml-1">{label}</label>
    <div className="relative group">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center pointer-events-none">
        {Icon && <Icon className="w-5 h-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />}
      </div>
      <input
        {...props}
        className={`w-full ${Icon ? 'pl-14' : 'pl-5'} pr-5 py-3.5 bg-gray-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white text-gray-900 placeholder-gray-400 rounded-2xl outline-none transition-all font-bold`}
      />
    </div>
  </motion.div>
);

const Register = () => {
  const [role, setRole] = useState('user');
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '', email: '', phone: '', password: '', address: '',
    experience: '', skills: [],
    location: null
  });

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const toggleSkill = (skill) => {
    setForm(f => ({
      ...f,
      skills: f.skills.includes(skill)
        ? f.skills.filter(s => s !== skill)
        : [...f.skills, skill]
    }));
  };

  const detectLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }

    toast.loading('Detecting location...', { id: 'loc' });
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm(f => ({
          ...f,
          location: { lat: pos.coords.latitude, lng: pos.coords.longitude }
        }));
        toast.success('Location detected!', { id: 'loc' });
      },
      () => {
        toast.error('Failed to detect location', { id: 'loc' });
      }
    );
  };

  const handleAction = async (e) => {
    if (e) e.preventDefault();
    
    // Validation for Step 1
    if (!form.name || !form.email || !form.phone || !form.password) {
      toast.error('Please fill in all account details');
      return;
    }

    // Name Validation: Letters and spaces only
    const nameRegex = /^[A-Za-z\s]+$/;
    if (!nameRegex.test(form.name)) {
      toast.error('Name should only contain letters and spaces');
      return;
    }

    // Phone Validation: Exactly 10 digits
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(form.phone)) {
      toast.error('Phone number must be exactly 10 digits');
      return;
    }

    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    if (role === 'user') {
      // Direct registration for users
      await performRegistration();
    } else {
      // Step to details for workers
      setStep(2);
    }
  };

  const performRegistration = async () => {
    setIsSubmitting(true);
    try {
      const payload = { ...form };
      if (role === 'worker') {
        payload.experience = Number(form.experience) || 0;
        if (form.location) {
          payload.location = { type: 'Point', coordinates: [form.location.lng, form.location.lat] };
        }
      }

      const userData = await register(payload, role);
      toast.success(`Welcome to FixMate, ${userData.name}!`);
      navigate(userData.role === 'worker' ? '/worker/dashboard' : '/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const slideVariants = {
    enter: (direction) => ({ x: direction > 0 ? 300 : -300, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (direction) => ({ x: direction < 0 ? 300 : -300, opacity: 0 }),
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#f9fafb]">
      {/* Background Orbs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-indigo-50 rounded-full blur-3xl opacity-60" />
        <div className="absolute bottom-20 -left-20 w-80 h-80 bg-blue-50 rounded-full blur-3xl opacity-60" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-2xl"
      >
        <Link to="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-indigo-600 transition-colors text-sm font-bold mb-8 group">
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Home
        </Link>

        <div className="flex flex-col lg:flex-row gap-8 items-stretch">
          {/* Progress / Branding */}
          <div className="lg:w-1/3 pt-4 flex flex-col justify-between">
            <div>
              <div className="inline-flex items-center gap-3 mb-6">
                <div className="p-3 rounded-2xl bg-indigo-600 shadow-xl shadow-indigo-200">
                  <Hammer className="w-6 h-6 text-white" />
                </div>
                <span className="text-3xl font-black text-gray-900 tracking-tight">FixMate</span>
              </div>
              <h1 className="text-3xl font-black text-gray-900 leading-tight">Create your account to get started.</h1>
            </div>

            <div className="mt-8 space-y-6">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black transition-all ${step === 1 ? 'bg-indigo-600 text-white shadow-lg' : 'bg-emerald-100 text-emerald-600'}`}>
                  {step > 1 ? <Check className="w-5 h-5" /> : '1'}
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-gray-400">Step 1</p>
                  <p className="font-bold text-gray-900 text-sm">Account Setup</p>
                </div>
              </div>
              {role === 'worker' && (
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black transition-all ${step === 2 ? 'bg-indigo-600 text-white shadow-lg' : 'bg-gray-100 text-gray-400'}`}>
                    2
                  </div>
                  <div>
                    <p className="text-xs font-black uppercase tracking-widest text-gray-400">Step 2</p>
                    <p className="font-bold text-gray-900 text-sm">Pro Details</p>
                  </div>
                </div>
              )}
            </div>
            
            <div className="mb-4 pt-4 border-t border-gray-100">
               <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
                 <Sparkles className="w-3 h-3 text-yellow-500" /> One account, both worlds
               </p>
               <p className="text-[11px] font-bold text-gray-500 mt-1">Register as a pro to unlock dashboard features while remaining a customer.</p>
            </div>
          </div>

          {/* Form Wizard */}
          <div className="flex-1 w-full bg-white rounded-[2.5rem] shadow-2xl shadow-gray-200/50 border border-gray-100 p-8 md:p-10 relative overflow-hidden">
            
            <AnimatePresence mode="wait" custom={step}>
              {step === 1 ? (
                <motion.div
                  key="step1"
                  custom={1}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                  className="space-y-6"
                >
                  <div className="flex p-1 bg-gray-50 rounded-2xl mb-2">
                    {ROLES.map((r) => (
                      <button
                        key={r.id}
                        onClick={() => { setRole(r.id); if (step > 1) setStep(1); }}
                        className={`relative flex-1 py-3 text-sm font-black transition-all duration-300 rounded-xl ${
                          role === r.id ? 'text-indigo-600' : 'text-gray-400 hover:text-gray-600'
                        }`}
                      >
                        {role === r.id && (
                          <motion.div
                            layoutId="activeTabReg"
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

                  <Field label="Full Name" icon={User} placeholder="John Doe" value={form.name} onChange={set('name')} />
                  <Field label="Email Address" icon={Mail} type="email" placeholder="john@example.com" value={form.email} onChange={set('email')} />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <Field label="Phone Number" icon={Phone} type="tel" placeholder="9876543210" value={form.phone} onChange={set('phone')} />
                    <Field label="Password" icon={Lock} type="password" placeholder="••••••••" value={form.password} onChange={set('password')} />
                  </div>

                  <button
                    onClick={handleAction}
                    disabled={isSubmitting}
                    className="w-full group bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-3 transition-all shadow-xl shadow-indigo-200 mt-2 active:scale-[0.98]"
                  >
                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                      <>
                        {role === 'user' ? 'Complete Account' : 'Continue to Details'}
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  key="step2"
                  custom={2}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                  className="space-y-6"
                >
                  <button onClick={() => setStep(1)} className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-indigo-500 hover:text-indigo-600 mb-2">
                    <ArrowLeft className="w-3.5 h-3.5" /> Back to Account
                  </button>

                  <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 flex gap-4 items-center">
                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-indigo-600 shadow-sm flex-shrink-0">
                        <ShieldCheck className="w-5 h-5" />
                    </div>
                    <p className="text-xs font-bold text-indigo-700 leading-relaxed">
                      Verification Required: We'll review your pro profile before you can receive orders.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <Field label="Experience (Years)" icon={Briefcase} type="number" placeholder="e.g. 5" value={form.experience} onChange={set('experience')} />
                    <div className="space-y-2">
                       <label className="block text-[11px] font-black text-gray-400 uppercase tracking-[0.15em] ml-1">Location</label>
                       <button
                         type="button"
                         onClick={detectLocation}
                         className={`w-full py-3.5 px-4 rounded-2xl border-2 border-dashed transition-all flex items-center justify-center gap-3 font-bold text-sm ${
                           form.location 
                             ? 'bg-emerald-50 border-emerald-200 text-emerald-600' 
                             : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100 hover:border-gray-300'
                         }`}
                       >
                         {form.location ? <Check className="w-4 h-4" /> : <MapPin className="w-4 h-4" />}
                         {form.location ? 'Location Ready' : 'Detect My Location'}
                       </button>
                    </div>
                  </div>
                  
                  <Field label="Business/Home Address" icon={MapPin} placeholder="Street, Area" value={form.address} onChange={set('address')} />

                  <div className="space-y-4">
                    <label className="block text-[11px] font-black text-gray-400 uppercase tracking-[0.15em] flex items-center gap-2">
                      Skills & Specialties <Sparkles className="w-3 h-3 text-yellow-500" />
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {SKILL_OPTIONS.map(s => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => toggleSkill(s)}
                          className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all ${
                            form.skills.includes(s)
                              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                              : 'bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-gray-900'
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={performRegistration}
                    disabled={isSubmitting}
                    className="w-full group bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-3 transition-all shadow-xl shadow-indigo-200 mt-4 active:scale-[0.98] disabled:opacity-70"
                  >
                    {isSubmitting ? (
                      <Loader2 className="animate-spin w-5 h-5" />
                    ) : (
                      <>
                        Finish Pro Setup
                        <Check className="w-5 h-5 group-hover:scale-110 transition-transform" />
                      </>
                    )}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="mt-8 pt-6 border-t border-gray-100 text-center">
              <p className="text-gray-500 font-bold text-sm">
                Already have an account?{' '}
                <Link to="/login" className="text-indigo-600 hover:text-indigo-700 transition-colors">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
