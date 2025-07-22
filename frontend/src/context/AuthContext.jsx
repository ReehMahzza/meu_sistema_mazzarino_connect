// frontend/src/context/AuthContext.jsx
import React, { createContext, useState, useEffect, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
// Importa a instância única e configurada do Axios
import axiosInstance from '../config/axiosConfig';

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

    const logoutUser = useCallback(() => {
        setAuthTokens(null);
        setUser(null);
        localStorage.removeItem('authTokens');
        navigate('/login');
    }, [navigate]);

    const loginUser = async (email, password) => {
        const response = await axiosInstance.post('/api/token/', {
            email: email,
            password: password,
        });
        const tokens = response.data;
        if (tokens) {
            setAuthTokens(tokens);
            decodeAndSetUser(tokens);
            localStorage.setItem('authTokens', JSON.stringify(tokens));
        }
    };

    useEffect(() => {
        const storedTokens = localStorage.getItem('authTokens');
        if (storedTokens) {
            decodeAndSetUser(JSON.parse(storedTokens));
        }
        setLoading(false);

        const interceptor = axiosInstance.interceptors.response.use(
            (response) => response,
            (error) => {
                if (error.response?.status === 401 && error.config.url !== '/api/token/') {
                    logoutUser();
                }
                return Promise.reject(error);
            }
        );

        return () => {
            axiosInstance.interceptors.response.eject(interceptor);
        };
    }, [decodeAndSetUser, logoutUser]);

    const contextData = {
        user,
        authTokens,
        loginUser,
        logoutUser,
        axiosInstance, // <--- A LINHA QUE FALTAVA
    };

    return (
        <AuthContext.Provider value={contextData}>
            {loading ? <div>Carregando...</div> : children}
        </AuthContext.Provider>
    );
};