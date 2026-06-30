import axios from 'axios';

// Get API base URL from environment variable or fallback to local
const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to handle FormData
api.interceptors.request.use((config) => {
  if (config.data instanceof FormData) {
    // Let the browser set the Content-Type with the boundary automatically
    delete config.headers['Content-Type'];
  }
  return config;
});

// Add a response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Skip token refresh for auth endpoints to prevent loops
    const isAuthEndpoint = originalRequest.url?.includes('/auth/login') || 
                           originalRequest.url?.includes('/auth/register') ||
                           originalRequest.url?.includes('/auth/refresh');

    // If error is 401 and we haven't retried yet and it's not an auth endpoint
    if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      originalRequest._retry = true;

      try {
        // Attempt to refresh the token using the HttpOnly cookie
        await axios.post(`${baseURL}/auth/refresh`, {}, { withCredentials: true });
        
        // Retry original request since browser will automatically attach the new cookie
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed, clear user session
        if (typeof window !== 'undefined') {
          // Avoid infinite redirect loops if we are already on public pages
          const publicPaths = ['/login', '/register', '/'];
          if (!publicPaths.includes(window.location.pathname)) {
            window.location.href = '/login';
          }
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
<<<<<<< Updated upstream
=======

>>>>>>> Stashed changes
export default api;
