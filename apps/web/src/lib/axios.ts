import axios from 'axios';
import Cookies from 'js-cookie';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
});

// Interceptor Request: Selipkan Token
api.interceptors.request.use((config) => {
  const token = Cookies.get('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 🔥 Interceptor Response: Algojo Penendang
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Tangkap SEMUA error 403 (Forbidden)
    if (error.response && error.response.status === 403) {
      
      // Ambil pesan error, amankan jika bentuknya array atau string
      const errorMessage = String(error.response.data?.message || '');
      
      // Gunakan includes() agar lebih fleksibel menangkap kata SUSPENDED
      if (errorMessage.includes('SUSPENDED')) {
        // 1. Bakar kredensialnya
        Cookies.remove('token');
        localStorage.removeItem('user');
        
        // 2. Tendang paksa secara brutal tanpa peduli Next.js routing
        if (typeof window !== 'undefined') {
          window.location.replace('/auth/login?error=suspended');
        }
      }
    }
    return Promise.reject(error);
  }
);