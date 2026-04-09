import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/shared/Navbar';
import { Loader2 } from 'lucide-react';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Dashboard Pages
import LandingPage from './pages/LandingPage';
import UserDashboard from './pages/user/UserDashboard';
import MyBookings from './pages/user/MyBookings';
import WorkerDashboard from './pages/worker/WorkerDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ background: '#0a0a14' }}>
      <div className="relative">
        <div className="w-16 h-16 rounded-full border-4 animate-spin" style={{ borderColor: 'rgba(139,92,246,0.2)', borderTopColor: '#7c3aed' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full animate-pulse" style={{ background: 'radial-gradient(circle, #7c3aed, #4f46e5)', boxShadow: '0 0 20px rgba(124,58,237,0.5)' }} />
      </div>
      <p className="text-xs font-black uppercase tracking-widest animate-pulse" style={{ color: 'rgba(255,255,255,0.3)' }}>Initializing FixMate...</p>
    </div>
  );

  if (!user) return <Navigate to="/login" />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/" />;

  return children;
};

const HomeRoute = () => {
  const { user } = useAuth();
  
  if (!user) return <LandingPage />;
  
  const dashPath = user.role === 'admin' ? '/admin/dashboard' : user.role === 'worker' ? '/worker/dashboard' : '/dashboard';
  return <Navigate to={dashPath} />;
};

import { useLocation } from 'react-router-dom';

// Navbar shown only on non-auth pages
const AppLayout = ({ children }) => {
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  return (
    <div className="min-h-screen">
      {!isAuthPage && <Navbar />}
      {children}
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppLayout>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={
              <HomeRoute />
            } />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* User Routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute allowedRoles={['user']}>
                <UserDashboard />
              </ProtectedRoute>
            } />
            <Route path="/my-bookings" element={
              <ProtectedRoute allowedRoles={['user']}>
                <MyBookings />
              </ProtectedRoute>
            } />

            {/* Worker Routes */}
            <Route path="/worker/dashboard" element={
              <ProtectedRoute allowedRoles={['worker']}>
                <WorkerDashboard />
              </ProtectedRoute>
            } />

            {/* Admin Routes */}
            <Route path="/admin/dashboard" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } />

            {/* Catch-All */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: '#ffffff',
                color: '#111827',
                border: '1px solid #f3f4f6',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                borderRadius: '1rem',
                fontSize: '0.875rem',
                fontWeight: '600',
              },
              success: {
                iconTheme: { primary: '#4f46e5', secondary: '#ffffff' },
              },
              error: {
                iconTheme: { primary: '#ef4444', secondary: '#ffffff' },
              },
            }}
          />
        </AppLayout>
      </Router>
    </AuthProvider>
  );
}

export default App;
