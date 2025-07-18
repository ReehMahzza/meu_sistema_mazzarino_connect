/*
================================================================================
ARQUIVO: frontend/src/context/AuthContext.jsx (REESCRITA COMPLETA PARA ESTABILIDADE)
================================================================================
*/
import React, { createContext, useState, useEffect, useCallback, useRef } from 'react'; // ADICIONADO useRef
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AuthContext = createContext();

export default AuthContext;

export const AuthProvider = ({ children }) => {
    const [authTokens, setAuthTokens] = useState(null);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true); // Controla o carregamento inicial

    const navigate = useNavigate();
    const baseURL = 'http://127.0.0.1:8000';

    // Usamos useRef para a instância do axios para evitar problemas de dependência em useCallback
    const axiosInstanceRef = useRef(axios.create({
        baseURL,
        headers: { 'Content-Type': 'application/json' }
    }));

    // Função para decodificar e definir o usuário do token
    const decodeAndSetUser = useCallback((tokens) => {
        try {
            const decodedToken = jwtDecode(tokens.access);
            setUser({
                id: decodedToken.user_id,
                email: decodedToken.email,
                first_name: decodedToken.first_name || '',
                last_name: decodedToken.last_name || '',
            });
            return decodedToken;
        } catch (error) {
            console.error("Erro ao decodificar token JWT:", error);
            setUser(null);
            return null;
        }
    }, []);

    // Função para realizar o logout
    const logoutUser = useCallback(() => {
        setAuthTokens(null);
        setUser(null);
        localStorage.removeItem('authTokens');
        delete axiosInstanceRef.current.defaults.headers.common['Authorization']; // Usa o ref
        navigate('/login');
    }, [navigate]);

    // Função para renovar o token
    const updateToken = useCallback(async () => {
        const storedTokens = localStorage.getItem('authTokens');
        if (!storedTokens) {
            setLoading(false);
            return;
        }

        let parsedTokens;
        try {
            parsedTokens = JSON.parse(storedTokens);
        } catch (e) {
            console.error("updateToken: Erro ao fazer JSON.parse de storedTokens. Limpando tokens.", e);
            logoutUser();
            setLoading(false);
            return;
        }

        console.log("updateToken: Tokens lidos do localStorage:", parsedTokens); // Log para depuração

        const accessToken = parsedTokens.access;
        const refreshToken = parsedTokens.refresh;

        if (!accessToken || !refreshToken) {
            console.log("updateToken: Faltam access ou refresh token. Realizando logout.");
            logoutUser();
            setLoading(false);
            return;
        }

        let decodedAccess;
        try {
            decodedAccess = jwtDecode(accessToken);
        } catch (e) {
            console.error("updateToken: Erro ao decodificar access token. Realizando logout.", e);
            logoutUser();
            setLoading(false);
            return;
        }

        const isAccessTokenExpired = decodedAccess.exp * 1000 < Date.now();

        // Se o access token está expirado, tenta renovar
        if (isAccessTokenExpired) {
            try {
                let decodedRefresh;
                try {
                    decodedRefresh = jwtDecode(refreshToken);
                } catch (e) {
                    console.error("updateToken: Erro ao decodificar refresh token. Realizando logout.", e);
                    logoutUser();
                    setLoading(false);
                    return;
                }

                if (decodedRefresh.exp * 1000 < Date.now()) {
                    console.log("updateToken: Refresh token também expirado. Realizando logout.");
                    logoutUser();
                    setLoading(false);
                    return;
                }

                // Tenta renovar o token
                console.log("updateToken: Tentando renovar access token com refresh token:", refreshToken);
                const response = await axiosInstanceRef.current.post(`${baseURL}/api/token/refresh/`, {
                    refresh: refreshToken
                });

                if (response.status === 200) {
                    const data = response.data;
                    setAuthTokens(data);
                    decodeAndSetUser(data);
                    localStorage.setItem('authTokens', JSON.stringify(data));
                    axiosInstanceRef.current.defaults.headers.common['Authorization'] = `Bearer ${data.access}`;
                    console.log("updateToken: Token renovado com sucesso!");
                } else {
                    console.log("updateToken: Falha na resposta da renovação do token. Realizando logout.");
                    logoutUser();
                }
            } catch (refreshError) {
                console.error("updateToken: Erro ao tentar renovar token:", refreshError.response?.data || refreshError.message);
                logoutUser();
            } finally {
                setLoading(false);
            }
        } else {
            console.log("updateToken: Access token ainda válido. Não precisa renovar.");
            setLoading(false);
        }
    }, [axiosInstanceRef, decodeAndSetUser, logoutUser, baseURL]);

    // useEffect para carregar o token na montagem (executa APENAS UMA VEZ)
    useEffect(() => {
        const storedTokens = localStorage.getItem('authTokens');
        if (storedTokens) {
            try {
                const parsedTokens = JSON.parse(storedTokens);
                const decodedAccess = jwtDecode(parsedTokens.access);
                if (decodedAccess.exp * 1000 < Date.now()) {
                    console.log("useEffect: Token do localStorage expirado ao iniciar. Forçando renovação.");
                    updateToken(); // Chama updateToken
                } else {
                    setAuthTokens(parsedTokens);
                    decodeAndSetUser(parsedTokens);
                    axiosInstanceRef.current.defaults.headers.common['Authorization'] = `Bearer ${parsedTokens.access}`;
                    setLoading(false); // Conclui loading
                }
            } catch (error) {
                console.error("useEffect: Erro ao processar tokens do localStorage, limpando e deslogando:", error);
                logoutUser();
                setLoading(false);
            }
        } else {
            setLoading(false); // Se não há tokens, conclui loading imediatamente
        }

        // Limpeza: desativa o interval se você o adicionar mais tarde
        // return () => clearInterval(interval); 
    }, [updateToken, decodeAndSetUser, logoutUser]); // Dependências


    // Interceptor para adicionar o Authorization header (configurado apenas uma vez)
    useEffect(() => {
        // Adiciona o interceptor apenas uma vez quando o componente é montado
        // A lógica de renovação está em `updateToken` chamada pelo interceptor ou pelo useEffect
        const interceptor = axiosInstanceRef.current.interceptors.request.use(async config => {
            // Ignora requisições para a rota de token, para não entrar em loop infinito
            if (config.url === `${baseURL}/api/token/` || config.url === `${baseURL}/api/token/refresh/`) {
                return config;
            }

            const currentTokens = JSON.parse(localStorage.getItem('authTokens') || '{}');
            if (currentTokens.access) {
                const decodedAccess = jwtDecode(currentTokens.access);
                const isAccessTokenExpired = decodedAccess.exp * 1000 < Date.now();

                if (isAccessTokenExpired) {
                    // Se o token expirou, tenta renovar antes de prosseguir com a requisição
                    await updateToken(); // Tenta renovar (isso atualiza localStorage e estado)
                    const newTokens = JSON.parse(localStorage.getItem('authTokens') || '{}');
                    if (newTokens.access) {
                        config.headers.Authorization = `Bearer ${newTokens.access}`;
                    } else {
                        // Se não conseguiu renovar, redireciona para o login e interrompe a requisição
                        logoutUser();
                        return Promise.reject(new Error("Token expirado e não renovado."));
                    }
                } else {
                    config.headers.Authorization = `Bearer ${currentTokens.access}`;
                }
            }
            return config;
        }, error => {
            return Promise.reject(error);
        });

        // Função de limpeza para remover o interceptor quando o componente desmontar
        return () => {
            axiosInstanceRef.current.interceptors.request.eject(interceptor);
        };
    }, [updateToken, logoutUser, baseURL]); // Dependências do interceptor


    // Função para realizar o login (usa axiosInstanceRef.current, que já tem o interceptor)
    const loginUser = async (email, password) => {
        try {
            const response = await axiosInstanceRef.current.post('/api/token/', {
                email,
                password
            });
            if (response.status === 200) {
                const data = response.data;
                setAuthTokens(data);
                decodeAndSetUser(data); // Decodifica e define o usuário
                localStorage.setItem('authTokens', JSON.stringify(data));

                // Atualiza o header padrão do axiosInstanceRef.current para requests diretos
                axiosInstanceRef.current.defaults.headers.common['Authorization'] = `Bearer ${data.access}`;

                navigate('/dashboard');
                return { success: true };
            }
        } catch (error) {
            console.error("Erro no login:", error.response?.data || error.message);
            const errorMessage = error.response?.data?.detail || "Credenciais inválidas.";
            return { success: false, error: errorMessage };
        }
    };


    const contextData = {
        user,
        authTokens,
        loginUser,
        logoutUser,
        axiosInstance: axiosInstanceRef.current // Exporta o objeto current do ref
    };

    return (
        <AuthContext.Provider value={contextData}>
            {loading ? <div>Carregando autenticação...</div> : children}
        </AuthContext.Provider>
    );
};