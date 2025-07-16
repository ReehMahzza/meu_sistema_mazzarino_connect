import React from 'react';

// Componente para um ícone de cadeado. Em um projeto real, usaríamos uma biblioteca como react-icons.
const LockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
);

// Componente para um ícone de usuário/email.
const UserIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
);


function LoginPage() {
  return (
    // Container principal que centraliza tudo na tela
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center font-sans p-4">
      
      {/* Logo ou Título do Sistema */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800">Portal Mazzarino Connect</h1>
        <p className="text-gray-500 mt-2">Acesso exclusivo para clientes</p>
      </div>

      {/* Card do Formulário de Login */}
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
        
        <h2 className="text-2xl font-bold text-center text-gray-700 mb-6">Login</h2>

        {/* Formulário */}
        <form className="space-y-6">
          
          {/* Campo de E-mail/Usuário */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-600 mb-1">
              E-mail ou Usuário
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
              />
            </div>
          </div>

          {/* Campo de Senha */}
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
                />
            </div>
          </div>

          {/* Botão de Entrar */}
          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-lg font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-transform transform hover:scale-105"
            >
              Entrar
            </button>
          </div>
        </form>

        {/* Link de "Esqueceu a senha?" */}
        <div className="text-center mt-6">
          <a href="#" className="text-sm font-medium text-blue-600 hover:text-blue-500 hover:underline">
            Esqueceu sua senha?
          </a>
        </div>
      </div>

      {/* Rodapé */}
      <footer className="text-center mt-10 text-gray-500 text-sm">
        <p>&copy; {new Date().getFullYear()} Mazzarino. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}

// O App principal agora renderiza a nossa página de login
export default function App() {
    return <LoginPage />
}
