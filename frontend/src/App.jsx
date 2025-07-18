/*
================================================================================
ARQUIVO: frontend/src/App.jsx (MODIFICADO para Nova Rota de Formalização do Acordo)
================================================================================
*/
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import DocumentsPage from './pages/DocumentsPage';
import NewCasePage from './pages/NewCasePage';
import RequestSearchServicePage from './pages/RequestSearchServicePage';
import CaseAnalysisPage from './pages/CaseAnalysisPage';
import ProposalContractPage from './pages/ProposalContractPage';
import BankNegotiationPage from './pages/BankNegotiationPage';
import FormalizationPage from './pages/FormalizationPage'; // ADICIONADO

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
            <Route path="/request-search-service" element={<RequestSearchServicePage />} />
            <Route path="/case-analysis" element={<CaseAnalysisPage />} />
            <Route path="/proposal-contract" element={<ProposalContractPage />} />
            <Route path="/bank-negotiation" element={<BankNegotiationPage />} />
            {/* ADICIONADA: Nova rota para formalização do acordo */}
            <Route path="/formalization" element={<FormalizationPage />} /> {/* <-- NOVA ROTA AQUI */}
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;