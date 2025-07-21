// frontend/src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

import PrivateRoute from './utils/PrivateRoute';
import MainLayout from './components/layout/MainLayout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ProtocolsPage from './pages/ProtocolsPage';
import OficiosPage from './pages/OficiosPage';
import ProcessosPage from './pages/ProcessosPage';
import SettingsPage from './pages/SettingsPage';
import ProtocolDetailPage from './pages/ProtocolDetailPage';
import NewProtocolPage from './pages/NewProtocolPage';
import ContactsPage from './pages/ContactsPage';
import NewClientPage from './pages/NewClientPage';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<Navigate to="/dashboard" />} />
          <Route
            path="/*"
            element={
              <PrivateRoute>
                <MainLayout>
                  <Routes>
                    <Route path="/dashboard" element={<DashboardPage />} />
                    
                    {/* Rotas de protocolos */}
                    <Route path="/protocolos" element={<ProtocolsPage />} />
                    <Route path="/protocolos/:protocolId" element={<ProtocolDetailPage />} />
                    <Route path="/novo-protocolo" element={<NewProtocolPage />} />
                    <Route path="/oficios" element={<OficiosPage />} />
                    <Route path="/processos" element={<ProcessosPage />} />
                    
                    {/* Rotas de contatos */}
                    <Route path="/contatos" element={<ContactsPage />} />
                    <Route path="/novo-contato" element={<NewClientPage />} />
                    
                    {/* Configurações */}
                    <Route path="/configuracoes" element={<SettingsPage />} />
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