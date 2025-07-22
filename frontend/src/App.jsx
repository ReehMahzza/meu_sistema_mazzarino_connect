// frontend/src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

import PrivateRoute from './utils/PrivateRoute';
import MainLayout from './components/layout/MainLayout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ContactsPage from './pages/ContactsPage';
import NewClientPage from './pages/NewClientPage';
import ProtocolsPage from './pages/ProtocolsPage';
import ProtocolDetailPage from './pages/ProtocolDetailPage';
import OficiosPage from './pages/OficiosPage';
import ProcessosPage from './pages/ProcessosPage';
import SettingsPage from './pages/SettingsPage';
import NewCasePage from './pages/NewCasePage'; // Importa o arquivo renomeado

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<Navigate to="/dashboard" />} />
          <Route path="/*" element={
              <PrivateRoute>
                <MainLayout>
                  <Routes>
                    <Route path="dashboard" element={<DashboardPage />} />
                    <Route path="contatos" element={<ContactsPage />} />
                    <Route path="novo-contato" element={<NewClientPage />} />
                    <Route path="protocolos" element={<ProtocolsPage />} />
                    <Route path="protocolos/:protocolId" element={<ProtocolDetailPage />} />
                    <Route path="oficios" element={<OficiosPage />} />
                    <Route path="processos" element={<ProcessosPage />} />
                    <Route path="configuracoes" element={<SettingsPage />} />

                    {/* ROTA ATUALIZADA */}
                    <Route path="casos/novo" element={<NewCasePage />} />
                  </Routes>
                </MainLayout>
              </PrivateRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;