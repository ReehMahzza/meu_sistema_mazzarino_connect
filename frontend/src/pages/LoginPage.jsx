/*
        ================================================================================
        ARQUIVO: frontend/src/pages/LoginPage.jsx (REFATORADO)
        ================================================================================
        */
        import React, { useState, useContext } from 'react';
        import AuthContext from '../context/AuthContext';
        // ADICIONADO: Imports dos novos componentes de UI
        import Input from '../components/ui/Input';
        import Button from '../components/ui/Button';
        import MessageAlert from '../components/ui/MessageAlert';
        import { useNavigate } from 'react-router-dom';

        function LoginPage() {
            const { loginUser } = useContext(AuthContext);
            const [formData, setFormData] = useState({
                email: '',
                password: ''
            });
            const [loading, setLoading] = useState(false);
            const [error, setError] = useState('');
            const navigate = useNavigate();

            const handleInputChange = (e) => {
                const { name, value } = e.target;
                setFormData(prev => ({
                    ...prev,
                    [name]: value
                }));
            };

            const handleLogin = async (e) => {
                e.preventDefault();
                setLoading(true);
                setError('');

                try {
                    console.log('🔑 Tentando fazer login com:', formData);
                    // A função loginUser do AuthContext deve ser a única responsável
                    // por fazer a chamada de API e gerenciar o estado.
                    await loginUser(formData.email, formData.password);
                    console.log('✅ Login realizado com sucesso, navegando para o dashboard...');
                    navigate('/dashboard');
                } catch (error) {
                    // O erro agora será tratado pelo AuthContext, mas podemos
                    // exibir uma mensagem genérica aqui.
                    console.error('❌ Falha no login:', error);
                    if (error.response) {
                        const errorMsg = error.response.data?.detail ||
                                       error.response.data?.non_field_errors?.[0] ||
                                       'Credenciais inválidas';
                        setError(errorMsg);
                    } else {
                        setError('Erro de conexão com o servidor');
                    }
                } finally {
                    setLoading(false);
                }
            };

            return (
                <div className="min-h-screen flex items-center justify-center bg-gray-50">
                    <div className="max-w-md w-full space-y-8">
                        <div>
                            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                                Fazer Login
                            </h2>
                        </div>
                        
                        {error && <MessageAlert type="error" message={error} />}
                        
                        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
                            <div>
                                <label htmlFor="email" className="sr-only">Email</label>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className="relative block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                    placeholder="Seu email"
                                />
                            </div>
                            
                            <div>
                                <label htmlFor="password" className="sr-only">Senha</label>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    required
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    className="relative block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                    placeholder="Sua senha"
                                />
                            </div>

                            <div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                                >
                                    {loading ? 'Entrando...' : 'Entrar'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            );
        }

        export default LoginPage;
