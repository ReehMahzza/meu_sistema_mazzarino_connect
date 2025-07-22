import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:8000', // URL do seu backend Django
  timeout: 10000, // 10 segundos
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar o token JWT automaticamente a cada requisição
axiosInstance.interceptors.request.use(
  (config) => {
    // CORREÇÃO: Ler o objeto 'authTokens' do localStorage
    const tokensString = localStorage.getItem('authTokens');
    if (tokensString) {
      const tokens = JSON.parse(tokensString);
      // Anexa o token de acesso ao header de autorização
      config.headers.Authorization = `Bearer ${tokens.access}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosInstance;