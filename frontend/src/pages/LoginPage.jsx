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

        function LoginPage() {
            const { loginUser } = useContext(AuthContext);
            const [email, setEmail] = useState('');
            const [password, setPassword] = useState('');
            const [loading, setLoading] = useState(false);
            const [error, setError] = useState('');

            const handleLogin = async (e) => {
                e.preventDefault();
                setLoading(true);
                setError(''); // Limpa erros anteriores

                const result = await loginUser(email, password);
                if (result && result.success === false) {
                    setError(result.error || "Falha no login. Verifique suas credenciais.");
                }
                setLoading(false);
            };

            return (
                <div className="min-h-screen flex items-center justify-center bg-gray-100 font-sans">
                    <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md text-center">
                        <h2 className="text-3xl font-bold text-gray-800 mb-6">Portal Mazzarino Connect</h2>
                        <p className="text-gray-600 mb-6">Acesso exclusivo para funcionários</p>
                        
                        <form onSubmit={handleLogin} className="space-y-6">
                            <Input
                                label="E-mail ou Usuário"
                                type="email"
                                name="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="seu.email@exemplo.com"
                                required
                            />
                            <Input
                                label="Senha"
                                type="password"
                                name="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Sua senha"
                                required
                            />
                            
                            {error && <div className="mb-4"><MessageAlert message={error} type="error" /></div>}

                            <Button type="submit" disabled={loading} variant="primary">
                                {loading ? 'Entrando...' : 'Entrar'}
                            </Button>
                        </form>
                        <p className="mt-4 text-sm text-blue-600 hover:underline cursor-pointer">Esqueceu sua senha?</p>
                        <p className="mt-8 text-xs text-gray-500">© 2025 Mazzarino. Todos os direitos reservados.</p>
                    </div>
                </div>
            );
        }

        export default LoginPage;
        