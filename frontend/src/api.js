import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
});

// Attach token on every request
api.interceptors.request.use((config) => {
  const saved = localStorage.getItem('urban_user');
  if (saved) {
    try {
      const { token } = JSON.parse(saved);
      if (token) config.headers.Authorization = `Bearer ${token}`;
    } catch (e) {
      console.error('Error parsing saved user data', e);
    }
  }
  return config;
});

// Auto-logout on 401 Unauthorized + Global Error Logging
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const message = error.response?.data?.message || error.message;

    console.error(`API Error [${status}]: ${message}`);

    if (status === 401) {
      localStorage.removeItem('urban_user');
      // Only redirect if not already on login page to avoid loops
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ── Auth ──────────────────────────────────────────────────────────────────────
export const loginUser   = (data) => api.post('/auth/login', data);
export const loginWorker = (data) => api.post('/auth/worker/login', data);
export const registerUser   = (data) => api.post('/auth/register', data);
export const registerWorker = (data) => api.post('/auth/worker/register', data);
export const updateProfile = (data) => api.put('/auth/profile', data);

// ── Services ──────────────────────────────────────────────────────────────────
export const getServices     = ()       => api.get('/services');
export const addService      = (data)   => api.post('/services', data);
export const updateService   = (id, data) => api.put(`/services/${id}`, data);
export const deleteService   = (id)    => api.delete(`/services/${id}`);

// ── Workers ───────────────────────────────────────────────────────────────────
export const getNearbyWorkers     = (params) => api.get('/workers/nearby', { params });
export const getTopWorkers        = ()       => api.get('/workers/top-rated');
export const getWorkerProfile     = ()       => api.get('/workers/profile');
export const updateWorkerProfile  = (data)   => api.put('/workers/profile', data);
export const updateAvailability   = (data)   => api.put('/workers/availability', data);

// ── Bookings ──────────────────────────────────────────────────────────────────
export const createBooking      = (data) => api.post('/bookings', data);
export const getMyBookings      = ()     => api.get('/bookings/mybookings');
export const getMyJobs          = ()     => api.get('/bookings/myjobs');
export const getBookingById     = (id)   => api.get(`/bookings/${id}`);
export const updateBookingStatus = (id, data) => api.put(`/bookings/${id}/status`, data);

// ── Reviews ───────────────────────────────────────────────────────────────────
export const submitReview = (data) => api.post('/reviews', data);
export const getRecentReviews = () => api.get('/reviews');

// ── Admin ─────────────────────────────────────────────────────────────────────
export const getAdminStats   = ()   => api.get('/admin/stats');
export const getAdminUsers   = ()   => api.get('/admin/users');
export const getAdminWorkers = ()   => api.get('/admin/workers');
export const getAdminBookings = ()  => api.get('/admin/bookings');
export const verifyWorker    = (id) => api.put(`/admin/verify-worker/${id}`);
export const assignWorker    = (bookingId, workerId) => api.put(`/admin/bookings/${bookingId}/assign`, { workerId });
export const deleteWorker    = (id) => api.delete(`/admin/workers/${id}`);
export const deleteUser      = (id) => api.delete(`/admin/users/${id}`);
export const cancelBooking   = (id) => api.put(`/bookings/${id}/status`, { status: 'Cancelled' });

// Advanced Admin
export const getAdminAnalytics = ()   => api.get('/admin/analytics');
export const getAdminReviews   = ()   => api.get('/admin/reviews');
export const deleteAdminReview = (id) => api.delete(`/admin/reviews/${id}`);

export default api;
