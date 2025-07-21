// frontend/src/utils/PrivateRoute.jsx
import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const PrivateRoute = ({ children }) => {
  const { user } = useContext(AuthContext);

  // Se não houver um usuário logado, redireciona para a página de login
  if (!user) {
    return <Navigate to="/login" />;
  }

  // Se houver um usuário, exibe a página solicitada
  return children;
};

export default PrivateRoute;