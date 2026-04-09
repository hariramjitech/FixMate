import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LogOut, LayoutDashboard, Shield, Hammer, ClipboardList, User, Zap } from 'lucide-react';
import { useState } from 'react';
import ProfileModal from './ProfileModal';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showProfile, setShowProfile] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const dashPath =
    user?.role === 'admin'
      ? '/admin/dashboard'
      : user?.role === 'worker'
      ? '/worker/dashboard'
      : '/dashboard';

  return (
    <nav className="fixed top-0 w-full z-[60] px-4 md:px-6 py-4 transition-all duration-300">
      <div
        className="max-w-7xl mx-auto flex justify-between items-center px-6 py-3.5 bg-white/80 backdrop-blur-xl border border-gray-200 rounded-2xl shadow-sm"
      >
        {/* Logo */}
        <Link to={user ? dashPath : "/"} className="flex items-center gap-3 group">
          <div className="p-2.5 rounded-xl bg-indigo-600 shadow-md transition-transform duration-500 group-hover:rotate-12">
            <Hammer className="text-white w-5 h-5" />
          </div>
          <span className="text-xl md:text-2xl font-black text-gray-900 tracking-tight">
            FixMate
          </span>
        </Link>

        <div className="flex items-center gap-2 md:gap-4">
          {!user ? (
            <>
              <Link
                to="/login"
                className="font-bold text-sm px-5 py-2.5 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="font-black text-sm px-6 py-2.5 rounded-xl text-white bg-indigo-600 shadow-md focus:ring-4 focus:ring-indigo-100 transition-all hover:bg-indigo-700 hover:shadow-lg hover:-translate-y-0.5"
              >
                Get Started
              </Link>
            </>
          ) : (
            <div className="flex items-center gap-3">
              {/* Dashboard link */}
              <Link
                to={dashPath}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-gray-600 bg-gray-50 border border-gray-100 hover:bg-white hover:shadow-sm transition-all"
                title="Dashboard"
              >
                <LayoutDashboard className="w-4 h-4 text-indigo-500" />
                <span className="hidden lg:inline">Dashboard</span>
              </Link>

              {user.role === 'user' && (
                <Link
                  to="/my-bookings"
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-gray-600 bg-gray-50 border border-gray-100 hover:bg-white hover:shadow-sm transition-all"
                  title="My Bookings"
                >
                  <ClipboardList className="w-4 h-4 text-emerald-500" />
                  <span className="hidden lg:inline">Bookings</span>
                </Link>
              )}

              {/* Divider */}
              <div className="w-px h-6 mx-1 hidden sm:block bg-gray-200" />

              {/* User badge */}
              <button 
                onClick={() => setShowProfile(true)}
                className="flex items-center gap-3 px-4 py-2 rounded-xl bg-white border border-gray-200 shadow-sm hover:border-indigo-200 hover:shadow-md transition-all text-left"
                title="Edit Profile"
              >
                <div className="w-8 h-8 rounded-[10px] bg-indigo-50 border border-indigo-100 flex items-center justify-center flex-shrink-0">
                  {user.role === 'admin' ? (
                    <Shield className="w-4 h-4 text-rose-500" />
                  ) : user.role === 'worker' ? (
                    <Zap className="w-4 h-4 text-amber-500" />
                  ) : (
                    <User className="w-4 h-4 text-indigo-500" />
                  )}
                </div>
                <div className="hidden sm:block">
                  <p className="text-[9px] font-black uppercase tracking-widest leading-none mb-0.5 text-gray-400">{user.role}</p>
                  <p className="font-bold text-sm leading-none text-gray-900 truncate max-w-[80px]">{user.name.split(' ')[0]}</p>
                </div>

                {/* Online indicator for workers */}
                {user.role === 'worker' && (
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-50 animate-pulse ml-1" />
                )}
              </button>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="p-2.5 rounded-xl transition-all text-gray-400 bg-white border border-gray-200 hover:border-red-200 hover:text-red-600 hover:bg-red-50 hover:shadow-sm"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>
      
      {showProfile && <ProfileModal onClose={() => setShowProfile(false)} />}
    </nav>
  );
};

export default Navbar;
