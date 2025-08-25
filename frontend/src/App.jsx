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
import NewCasePage from './pages/NewCasePage';

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
                    <Route path="protocolos" element={<ProtocolsPage />} />
                    <Route path="protocolos/:protocolId" element={<ProtocolDetailPage />} />
                    <Route path="configuracoes" element={<SettingsPage />} />

                    {/* Rotas para Admin e Funcionários */}
                    <Route path="contatos" element={<PrivateRoute allowedRoles={['ADMIN', 'FUNCIONARIO']}><ContactsPage /></PrivateRoute>} />
                    <Route path="novo-contato" element={<PrivateRoute allowedRoles={['ADMIN', 'FUNCIONARIO']}><NewClientPage /></PrivateRoute>} />
                    <Route path="casos/novo" element={<PrivateRoute allowedRoles={['ADMIN', 'FUNCIONARIO']}><NewCasePage /></PrivateRoute>} />
                    <Route path="oficios" element={<PrivateRoute allowedRoles={['ADMIN', 'FUNCIONARIO']}><OficiosPage /></PrivateRoute>} />
                    <Route path="processos" element={<PrivateRoute allowedRoles={['ADMIN', 'FUNCIONARIO']}><ProcessosPage /></PrivateRoute>} />
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
