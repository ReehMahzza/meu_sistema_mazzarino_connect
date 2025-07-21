import axios from 'axios';

// Criar instância do axios com configurações padrão
const axiosInstance = axios.create({
  baseURL: 'http://localhost:8000', // URL do seu backend Django
  timeout: 10000, // 10 segundos
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token JWT automaticamente
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para tratar respostas e erros
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Se token expirou (401), redirecionar para login
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;