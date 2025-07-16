// frontend/src/pages/LoginPage.jsx
import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom'; // MODIFICADO: Adicionado useNavigate e Link
import AuthContext from '../context/AuthContext'; // ADICIONADO: Importação do AuthContext

// Ícones
const LockIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>);
const UserIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>);

function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Usa o contexto de autenticação
    const { loginUser } = useContext(AuthContext);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        if (!email || !password) {
            setError('Por favor, preencha todos os campos.');
            return;
        }
        setLoading(true);
        const result = await loginUser(email, password);
        if (result && !result.success) {
            setError(result.error);
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center font-sans p-4">
            <div className="text-center mb-8">
                <h1 className="text-4xl font-bold text-gray-800">Portal Mazzarino Connect</h1>
                <p className="text-gray-500 mt-2">Acesso exclusivo</p>
            </div>
            <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
                <h2 className="text-2xl font-bold text-center text-gray-700 mb-2">Login</h2>
                <div className="text-center mb-4 h-6">
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                </div>
                <form className="space-y-6" onSubmit={handleLogin}>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-600 mb-1">E-mail</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><UserIcon /></div>
                            <input id="email" name="email" type="email" required className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg" placeholder="seu.email@exemplo.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-600 mb-1">Senha</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><LockIcon /></div>
                            <input id="password" name="password" type="password" required className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg" placeholder="Sua senha" value={password} onChange={(e) => setPassword(e.target.value)} />
                        </div>
                    </div>
                    <div>
                        <button type="submit" disabled={loading} className="w-full flex justify-center py-3 px-4 rounded-lg font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400">
                            {loading ? 'Entrando...' : 'Entrar'}
                        </button>
                    </div>
                </form>
                <div className="text-center mt-6">
                    <Link to="#" className="text-sm font-medium text-blue-600 hover:text-blue-500">Esqueceu sua senha?</Link>
                </div>
            </div>
        </div>
    );
}

export default LoginPage;