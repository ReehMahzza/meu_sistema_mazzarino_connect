// frontend/src/App.jsx (MODIFICADO PARA SER O ROTEADOR)
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';

function App() {
  return (
    <Router>
      <AuthProvider> {/* Envolve as rotas com o provedor de autenticação */}
        <Routes>
          {/* Rota pública de login */}
          <Route path="/login" element={<LoginPage />} />

          {/* Rota raiz redireciona para o dashboard se logado, ou para o login se não */}
          {/* MODIFICADO: A rota "/" agora redireciona para "/dashboard" */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} /> {/* ADICIONADO `replace` */}

          {/* Rotas protegidas */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            {/* Outras rotas protegidas podem ser adicionadas aqui no futuro */}
            {/* <Route path="/processos" element={<ProcessosPage />} /> */}
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;