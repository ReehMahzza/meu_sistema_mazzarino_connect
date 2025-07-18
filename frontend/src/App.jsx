/*
================================================================================
ARQUIVO: frontend/src/App.jsx (MODIFICADO para Nova Rota de Cliente/Caso)
================================================================================
*/
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import DocumentsPage from './pages/DocumentsPage';
import NewCasePage from './pages/NewCasePage'; // ADICIONADO
import RequestSearchServicePage from './pages/RequestSearchServicePage'; // ADICIONADO


function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<Navigate to="/dashboard" />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/documents" element={<DocumentsPage />} />
            <Route path="/new-case" element={<NewCasePage />} />
            {/* ADICIONADA: Nova rota para solicitar serviço */}
            <Route path="/request-search-service" element={<RequestSearchServicePage />} />
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;