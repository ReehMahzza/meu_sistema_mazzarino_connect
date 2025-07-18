/*
================================================================================
ARQUIVO: frontend/src/context/AuthContext.jsx (VERSÃO ESTÁVEL FINAL PARA AUTH HEADER)
================================================================================
*/
import React, { createContext, useState, useEffect, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AuthContext = createContext();

export default AuthContext;

export const AuthProvider = ({ children }) => {
    const [authTokens, setAuthTokens] = useState(() => {
        const tokens = localStorage.getItem('authTokens');
        return tokens ? JSON.parse(tokens) : null;
    });
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const navigate = useNavigate();
    const baseURL = 'http://127.0.0.1:8000';

    // Função para decodificar token
    const decodeAndSetUser = useCallback((tokens) => {
        if (tokens && tokens.access) {
            try {
                const decodedToken = jwtDecode(tokens.access);
                setUser({
                    id: decodedToken.user_id,
                    email: decodedToken.email,
                    first_name: decodedToken.first_name || '',
                    last_name: decodedToken.last_name || '',
                });
            } catch (error) {
                console.error("Erro ao decodificar token:", error);
                setUser(null);
            }
        } else {
            setUser(null);
        }
    }, []);

    // Função de logout
    const logoutUser = useCallback(() => {
        setAuthTokens(null);
        setUser(null);
        localStorage.removeItem('authTokens');
        navigate('/login');
    }, [navigate]);

    // Instância do axios com interceptor
    const axiosInstance = axios.create({
        baseURL,
        headers: { 'Content-Type': 'application/json' }
    });

            
    // Interceptor para adicionar o token de autenticação nos headers
    axiosInstance.interceptors.request.use(
        (config) => {
            if (authTokens && authTokens.access) {
                config.headers.Authorization = `Bearer ${authTokens.access}`;
            }
            return config;
        },
        (error) => Promise.reject(error)
    );

    // Interceptor para respostas 401
    axiosInstance.interceptors.response.use(
        (response) => response,
        (error) => {
            if (error.response?.status === 401) {
                logoutUser();
            }
            return Promise.reject(error);
        }
    );

    // Função de login
    const loginUser = async (email, password) => {
        try {
            const response = await axios.post(`${baseURL}/api/token/`, {
                email,
                password
            });
            
            if (response.status === 200) {
                const data = response.data;
                setAuthTokens(data);
                decodeAndSetUser(data);
                localStorage.setItem('authTokens', JSON.stringify(data));
                navigate('/dashboard');
                return { success: true };
            }
        } catch (error) {
            console.error("Erro no login:", error);
            return { success: false, error: "Credenciais inválidas." };
        }
    };

    // Efeito para carregar dados iniciais
    useEffect(() => {
        if (authTokens) {
            decodeAndSetUser(authTokens);
        }
        setLoading(false);
    }, [authTokens, decodeAndSetUser]);

    const contextData = {
        user,
        authTokens,
        loginUser,
        logoutUser,
        axiosInstance
    };

    return (
        <AuthContext.Provider value={contextData}>
            {loading ? <div>Carregando...</div> : children}
        </AuthContext.Provider>
    );
};