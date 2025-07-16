// frontend/src/components/ProtectedRoute.jsx (NOVO ARQUIVO)
import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const ProtectedRoute = () => {
    let { user } = useContext(AuthContext);
    // Se não houver usuário, redireciona para a página de login.
    // 'replace' evita que a rota protegida seja adicionada ao histórico do navegador.
    return user ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;