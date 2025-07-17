// frontend/src/context/AuthContext.jsx (NOVO ARQUIVO)
import React, { createContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode'; // Importação correta para jwt-decode
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AuthContext = createContext();

export default AuthContext;

export const AuthProvider = ({ children }) => {
    // Tenta pegar os tokens do localStorage, se não houver, inicia como nulo.
    const [authTokens, setAuthTokens] = useState(() => localStorage.getItem('authTokens') ? JSON.parse(localStorage.getItem('authTokens')) : null);
    // Decodifica o token para pegar as informações do usuário.
    const [user, setUser] = useState(() => localStorage.getItem('authTokens') ? jwtDecode(localStorage.getItem('authTokens')) : null);
    const [loading, setLoading] = useState(true);

    const navigate = useNavigate();
    const baseURL = 'http://127.0.0.1:8000';

    const loginUser = async (email, password) => {
        try {
            const response = await axios.post(`${baseURL}/api/token/`, {
                email,
                password
            });
            if (response.status === 200) {
                const data = response.data;
                setAuthTokens(data);
                const decodedUser = jwtDecode(data.access);
                setUser(decodedUser);
                localStorage.setItem('authTokens', JSON.stringify(data));
                navigate('/dashboard'); // Redireciona após o login
                return { success: true };
            }
        } catch (error) {
            console.error("Erro no login:", error);
            const errorMessage = error.response?.data?.detail || "Credenciais inválidas.";
            return { success: false, error: errorMessage };
        }
    };

    const logoutUser = () => {
        setAuthTokens(null);
        setUser(null);
        localStorage.removeItem('authTokens');
        navigate('/login');
    };

    // Cria uma instância do axios para ser usada com interceptor
    const axiosInstance = axios.create({
        baseURL,
        headers: {
        'Content-Type': 'application/json', // ADICIONADO: Garante Content-Type JSON
        Authorization: `Bearer ${authTokens?.access}`
    }
});

    axiosInstance.interceptors.request.use(async req => {
        // Lógica para renovar o token se estiver expirado pode ser adicionada aqui no futuro.
        // Por enquanto, apenas garante que o token mais recente está no header.
        const currentTokens = JSON.parse(localStorage.getItem('authTokens'));
        if (currentTokens) {
            req.headers.Authorization = `Bearer ${currentTokens.access}`;
        }
        return req;
    });


    const contextData = {
        user,
        authTokens,
        loginUser,
        logoutUser,
        axiosInstance // Fornece a instância do axios para os componentes
    };

    useEffect(() => {
        // Este useEffect garante que o estado de loading seja falso após a verificação inicial dos tokens.
        if (loading) {
            setLoading(false);
        }
    }, [authTokens, loading]);

    return (
        <AuthContext.Provider value={contextData}>
            {loading ? null : children}
        </AuthContext.Provider>
    );
};