/*
================================================================================
ARQUIVO: frontend/src/pages/ProposalContractPage.jsx (NOVO ARQUIVO)
================================================================================
Página para gerenciar a proposta de renegociação e contratação.
*/
import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import MainLayout from '../components/MainLayout';

function ProposalContractPage() {
    const { axiosInstance } = useContext(AuthContext);
    const navigate = useNavigate();

    const [cases, setCases] = useState([]);
    const [selectedCaseId, setSelectedCaseId] = useState('');
    const [caseDetails, setCaseDetails] = useState(null);

    const [proposalSentDate, setProposalSentDate] = useState('');
    const [clientDecision, setClientDecision] = useState('Aguardando Decisão');
    const [docusignStatus, setDocusignStatus] = useState('Não Enviado');

    const [loadingCases, setLoadingCases] = useState(true);
    const [loadingCaseDetails, setLoadingCaseDetails] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [success, setSuccess] = useState('');

    const PROPOSAL_DECISION_CHOICES = [
        ['Aguardando Decisão', 'Aguardando Decisão'],
        ['Aceita', 'Aceita'],
        ['Rejeita', 'Rejeita'],
    ];
    const DOCUSIGN_STATUS_CHOICES = [
        ['Não Enviado', 'Não Enviado'],
        ['Enviado', 'Enviado'],
        ['Assinado', 'Assinado'],
        ['Recusado', 'Recusado'],
    ];

    // Busca os casos do usuário ao carregar a página
    useEffect(() => {
        const fetchCases = async () => {
            setLoadingCases(true);
            try {
                const response = await axiosInstance.get('/api/cases/');
                setCases(response.data);
            } catch (err) {
                console.error("Erro ao buscar casos para proposta:", err.response?.data || err.message);
                setMessage({ type: 'error', text: "Não foi possível carregar a lista de casos." });
            } finally {
                setLoadingCases(false);
            }
        };
        fetchCases();
    }, [axiosInstance]);

    // Busca detalhes do caso selecionado e preenche o formulário
    useEffect(() => {
        if (selectedCaseId) {
            const fetchCaseDetails = async () => {
                setLoadingCaseDetails(true);
                try {
                    const response = await axiosInstance.get(`/api/cases/${selectedCaseId}/`);
                    setCaseDetails(response.data);
                    setProposalSentDate(response.data.proposal_sent_date || '');
                    setClientDecision(response.data.client_decision || 'Aguardando Decisão');
                    setDocusignStatus(response.data.docusign_status || 'Não Enviado');
                    setMessage({ type: '', text: '' });
                    setSuccess('');
                } catch (err) {
                    console.error("Erro ao buscar detalhes do caso para proposta:", err.response?.data || err.message);
                    setMessage({ type: 'error', text: "Não foi possível carregar os detalhes do caso selecionado." });
                    setCaseDetails(null);
                } finally {
                    setLoadingCaseDetails(false);
                }
            };
            fetchCaseDetails();
        } else {
            setCaseDetails(null);
        }
    }, [selectedCaseId, axiosInstance]);

    // Lógica de submissão do formulário
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedCaseId) {
            setMessage({ type: 'error', text: "Por favor, selecione um caso." });
            return;
        }
        setSubmitting(true);
        setMessage({ type: '', text: '' });
        setSuccess('');

        try {
            const payload = {
                proposal_sent_date: proposalSentDate || null, // Envia null se vazio
                client_decision: clientDecision,
                docusign_status: docusignStatus,
            };

            await axiosInstance.patch(`/api/cases/${selectedCaseId}/proposal-contract/`, payload);
            setSuccess('Proposta e status de contratação salvos com sucesso!');

            setTimeout(() => {
                navigate('/documents'); // Redireciona para a página de documentos
            }, 2000);

        } catch (err) {
            console.error("Erro ao salvar proposta/contratação:", err.response?.data || err.message);
            let errorMessage = "Ocorreu um erro ao salvar a proposta/contratação.";
            if (err.response?.data) {
                errorMessage = err.response.data.error || Object.values(err.response.data).flat().join(' | ');
            }
            setMessage({ type: 'error', text: errorMessage });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <MainLayout>
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Proposta de Renegociação e Contratação</h2>

            <div className="bg-white p-8 rounded-lg shadow-lg max-w-4xl mx-auto">
                {message.text && (
                    <div className={`p-3 mb-4 rounded-md ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {message.text}
                    </div>
                )}
                {success && (
                    <div className="p-3 mb-4 rounded-md bg-green-100 text-green-700">
                        {success}
                    </div>
                )}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Seleção de Caso */}
                    <div>
                        <label htmlFor="case-select" className="block text-sm font-medium text-gray-700 mb-1">
                            Selecione o Caso
                        </label>
                        <select
                            id="case-select"
                            value={selectedCaseId}
                            onChange={(e) => setSelectedCaseId(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                            required
                            disabled={loadingCases}
                        >
                            <option value="" disabled>
                                {loadingCases ? "Carregando casos..." : "-- Escolha um caso --"}
                            </option>
                            {cases.map(c => (
                                <option key={c.id} value={c.id}>
                                    {c.title} (ID: {c.id}) - Status: {c.current_status} - Cliente: {c.client?.email || 'N/A'}
                                </option>
                            ))}
                        </select>
                    </div>

                    {selectedCaseId && loadingCaseDetails ? (
                        <div className="text-center p-4">Carregando detalhes do caso...</div>
                    ) : selectedCaseId && caseDetails ? (
                        <>
                            {/* Detalhes do Caso Selecionado */}
                            <div className="border-t pt-6 mt-6">
                                <h3 className="text-xl font-bold text-gray-700 mb-4">Detalhes do Caso Selecionado: <span className="text-blue-600">{caseDetails.title}</span></h3>
                                <p className="text-gray-600 text-sm">Descrição: {caseDetails.description || 'N/A'}</p>
                                <p className="text-gray-600 text-sm">Criado por: {caseDetails.created_by?.email || 'N/A'} em {new Date(caseDetails.created_at).toLocaleDateString('pt-BR')}</p>
                                <p className="text-gray-600 text-sm">Status Atual: {caseDetails.current_status}</p>
                                <p className="text-gray-600 text-sm">Cliente: {caseDetails.client?.email || 'N/A'}</p>
                            </div>

                            {/* Seção Gestão da Proposta */}
                            <div className="border-t pt-6 mt-6">
                                <h3 className="text-xl font-bold text-gray-700 mb-4">Gestão da Proposta</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label htmlFor="proposal-date" className="block text-sm font-medium text-gray-700 mb-1">Data de Envio da Proposta</label>
                                        <input type="date" id="proposal-date" name="proposal-date" value={proposalSentDate} onChange={(e) => setProposalSentDate(e.target.value)}
                                               className="w-full p-2 border border-gray-300 rounded-md shadow-sm" />
                                    </div>
                                    <div>
                                        <label htmlFor="client-decision" className="block text-sm font-medium text-gray-700 mb-1">Decisão do Cliente</label>
                                        <select id="client-decision" value={clientDecision} onChange={(e) => setClientDecision(e.target.value)}
                                                className="w-full p-2 border border-gray-300 rounded-md shadow-sm" required>
                                            {PROPOSAL_DECISION_CHOICES.map(choice => (
                                                <option key={choice[0]} value={choice[0]}>{choice[1]}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label htmlFor="docusign-status" className="block text-sm font-medium text-gray-700 mb-1">Status DocuSign</label>
                                        <select id="docusign-status" value={docusignStatus} onChange={(e) => setDocusignStatus(e.target.value)}
                                                className="w-full p-2 border border-gray-300 rounded-md shadow-sm" required>
                                            {DOCUSIGN_STATUS_CHOICES.map(choice => (
                                                <option key={choice[0]} value={choice[0]}>{choice[1]}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-end pt-6">
                                <button type="submit" disabled={submitting}
                                        className="px-6 py-2 bg-green-600 text-white font-bold rounded-lg shadow hover:bg-green-700 disabled:bg-green-400">
                                    {submitting ? 'Salvando...' : 'Salvar Proposta/Decisão'}
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="bg-white p-6 rounded-lg shadow text-center text-gray-500">
                            <p>Selecione um caso acima para gerenciar a proposta.</p>
                        </div>
                    )}
                </form>
            </div>
        </MainLayout>
    );
}

export default ProposalContractPage;