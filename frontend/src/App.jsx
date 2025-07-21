// frontend/src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

import PrivateRoute from './utils/PrivateRoute';
import MainLayout from './components/layout/MainLayout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ProtocolsPage from './pages/ProtocolsPage';
import OficiosPage from './pages/OficiosPage.jsx';
import ProcessosPage from './pages/ProcessosPage';
import SettingsPage from './pages/SettingsPage';
import ProtocolDetailPage from './pages/ProtocolDetailPage';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Rota pública para Login */}
          <Route path="/login" element={<LoginPage />} />

          {/* Rotas privadas que usam o MainLayout */}
          <Route
            path="/*"
            element={
              <PrivateRoute>
                <MainLayout>
                  <Routes>
                    <Route path="/" element={<DashboardPage />} />
                    <Route path="/dashboard" element={<DashboardPage />} />
                    <Route path="/protocolos" element={<ProtocolsPage />} />
                    <Route path="/protocolos/:protocolId" element={<ProtocolDetailPage />} />
                    <Route path="/oficios" element={<OficiosPage />} />
                    <Route path="/processos" element={<ProcessosPage />} />
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