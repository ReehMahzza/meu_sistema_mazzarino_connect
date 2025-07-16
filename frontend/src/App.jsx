import React, { useState } from 'react';
import axios from 'axios'; // ADICIONADO: Importação do Axios

// Ícones (sem alterações)
const LockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
);
const UserIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
);


function LoginPage() {
  // --- ADICIONADO: Gerenciamento de estado ---
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  // -----------------------------------------

  // --- ADICIONADO: Lógica de submissão do formulário ---
  const handleLogin = async (e) => {
    e.preventDefault(); // Previne o recarregamento da página
    setError('');
    setSuccess('');

    // Validação básica no frontend
    if (!email || !password) {
      setError('Por favor, preencha todos os campos.');
      return;
    }

    setLoading(true);

    try {
      // Faz a requisição para a API de login do backend
      const response = await axios.post('http://127.0.0.1:8000/api/login/', {
        email: email,
        password: password,
      });

      // Se a requisição for bem-sucedida (status 200)
      console.log('Resposta do Backend:', response.data);
      setSuccess(`Login bem-sucedido! Bem-vindo, ${response.data.user.first_name}.`);
      // Aqui, no futuro, você salvaria o token de autenticação (JWT)

    } catch (err) {
      // Se a requisição falhar
      if (err.response) {
        // O servidor respondeu com um status de erro (4xx, 5xx)
        console.error('Erro de login:', err.response.data);
        setError(err.response.data.error || 'Ocorreu um erro ao tentar fazer login.');
      } else if (err.request) {
        // A requisição foi feita mas não houve resposta (ex: servidor offline)
        console.error('Erro de rede:', err.request);
        setError('Não foi possível conectar ao servidor. Verifique sua conexão.');
      } else {
        // Algum outro erro ocorreu
        console.error('Erro:', err.message);
        setError('Ocorreu um erro inesperado.');
      }
    } finally {
      setLoading(false); // Garante que o estado de loading seja desativado
    }
  };
  // ----------------------------------------------------

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center font-sans p-4">

      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800">Portal Mazzarino Connect</h1>
        <p className="text-gray-500 mt-2">Acesso exclusivo para clientes</p>
      </div>

      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">

        <h2 className="text-2xl font-bold text-center text-gray-700 mb-2">Login</h2>

        {/* --- ADICIONADO: Exibição de mensagens de erro ou sucesso --- */}
        <div className="text-center mb-4 h-6">
          {error && <p className="text-red-500 text-sm">{error}</p>}
          {success && <p className="text-green-600 text-sm">{success}</p>}
        </div>
        {/* ----------------------------------------------------------- */}

        {/* MODIFICADO: Adicionado o handler onSubmit */}
        <form className="space-y-6" onSubmit={handleLogin}>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-600 mb-1">
              E-mail
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <UserIcon />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                placeholder="seu.email@exemplo.com"
                value={email} // MODIFICADO: Conectado ao estado
                onChange={(e) => setEmail(e.target.value)} // MODIFICADO: Conectado ao estado
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-600 mb-1">
              Senha
            </label>
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LockIcon />
                </div>
                <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    placeholder="Sua senha"
                    value={password} // MODIFICADO: Conectado ao estado
                    onChange={(e) => setPassword(e.target.value)} // MODIFICADO: Conectado ao estado
                />
            </div>
          </div>

          <div>
            {/* MODIFICADO: Botão agora é desabilitado durante o loading */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-lg font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-transform transform hover:scale-105 disabled:bg-blue-400 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </div>
        </form>

        <div className="text-center mt-6">
          <a href="#" className="text-sm font-medium text-blue-600 hover:text-blue-500 hover:underline">
            Esqueceu sua senha?
          </a>
        </div>
      </div>

      <footer className="text-center mt-10 text-gray-500 text-sm">
        <p>&copy; {new Date().getFullYear()} Mazzarino. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}

export default function App() {
    return <LoginPage />
}