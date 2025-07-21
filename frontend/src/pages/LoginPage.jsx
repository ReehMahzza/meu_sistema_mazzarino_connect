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
        // CORRIGIDO: Caminho do axiosInstance
        import axiosInstance from '../config/axiosConfig';

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
                    console.log('🔑 Tentando fazer login...');
                    
                    // TESTE 1: Com email direto
                    const loginData = {
                        email: formData.email,          // ← MUDANÇA: email em vez de username
                        password: formData.password,
                    };
                    
                    console.log('📤 TESTE 1 - Enviando com "email":', loginData);
                    
                    const response = await axiosInstance.post('/api/token/', loginData);
                    
                    const { access, refresh } = response.data;
                    
                    if (access && refresh) {
                        localStorage.setItem('access_token', access);
                        localStorage.setItem('refresh_token', refresh);
                        console.log('✅ Login realizado com sucesso!');
                        navigate('/dashboard');
                    } else {
                        throw new Error('Tokens não recebidos do servidor');
                    }

                } catch (error) {
                    console.error('❌ TESTE 1 FALHOU. Tentando TESTE 2...');
                    
                    // TESTE 2: Se falhar, tentar com username
                    try {
                        const loginData2 = {
                            username: formData.email,       // ← FALLBACK: username
                            password: formData.password,
                        };
                        
                        console.log('📤 TESTE 2 - Enviando com "username":', loginData2);
                        
                        const response2 = await axiosInstance.post('/api/token/', loginData2);
                        const { access, refresh } = response2.data;
                        
                        if (access && refresh) {
                            localStorage.setItem('access_token', access);
                            localStorage.setItem('refresh_token', refresh);
                            console.log('✅ TESTE 2 funcionou!');
                            navigate('/dashboard');
                            return;
                        }
                    } catch (error2) {
                        console.error('❌ TESTE 2 também falhou:', error2.response?.data);
                    }
                    
                    // Se ambos falharam, mostrar erro
                    console.error('❌ ERRO COMPLETO:', error);
                    if (error.response) {
                        console.error('📋 Status HTTP:', error.response.status);
                        console.error('📋 Dados do erro:', error.response.data);
                        
                        const errorMsg = error.response.data?.detail || 
                                       error.response.data?.email?.[0] ||        // ← NOVO: capturar erro de email
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
