/*
================================================================================
ARQUIVO: frontend/src/pages/BankNegotiationPage.jsx (NOVO ARQUIVO)
================================================================================
Página para gerenciar a negociação com a instituição financeira.
*/
import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import MainLayout from '../components/MainLayout';

function BankNegotiationPage() {
    const { axiosInstance } = useContext(AuthContext);
    const navigate = useNavigate();

    const [cases, setCases] = useState([]);
    const [selectedCase, setSelectedCase] = useState(null); // Armazena o objeto do caso selecionado
    const [negotiationData, setNegotiationData] = useState({
        dossier_sent_date: '',
        bank_response_status: 'Aguardando Resposta',
        counterproposal_details: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const BANK_RESPONSE_CHOICES = [
        ['Aguardando Resposta', 'Aguardando Resposta'],
        ['Aceita', 'Aceita'],
        ['Negada', 'Negada'],
        ['Reuniao Solicitada', 'Reunião Solicitada'],
        ['Contraproposta', 'Contraproposta'],
    ];

    // Busca os casos do usuário ao carregar a página
    useEffect(() => {
        const fetchCases = async () => {
            try {
                const response = await axiosInstance.get('/api/cases/');
                setCases(response.data);
            } catch (err) {
                console.error("Erro ao buscar casos:", err.response?.data || err.message);
                setError("Não foi possível carregar a lista de casos.");
            }
        };
        fetchCases();
    }, [axiosInstance]);

    // Carrega detalhes do caso selecionado e preenche o formulário
    const handleCaseSelect = useCallback((caseId) => {
        const caseDetails = cases.find(c => c.id.toString() === caseId);
        if (caseDetails) {
            setSelectedCase(caseDetails);
            setNegotiationData({
                dossier_sent_date: caseDetails.dossier_sent_date || '',
                bank_response_status: caseDetails.bank_response_status,
                counterproposal_details: caseDetails.counterproposal_details || ''
            });
            setError('');
            setSuccess('');
        } else {
            setSelectedCase(null);
            setNegotiationData({
                dossier_sent_date: '',
                bank_response_status: 'Aguardando Resposta',
                counterproposal_details: ''
            });
        }
    }, [cases]);

    const handleChange = (e) => {
        setNegotiationData({ ...negotiationData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedCase) {
            setError("Por favor, selecione um caso.");
            return;
        }
        setError('');
        setSuccess('');
        setLoading(true);

        // Prepara os dados para enviar (apenas os campos que podem ser atualizados)
        const dataToUpdate = {
            dossier_sent_date: negotiationData.dossier_sent_date || null, // Envia null se vazio
            bank_response_status: negotiationData.bank_response_status,
            // counterproposal_details só é enviado se o status for Contraproposta
            counterproposal_details: negotiationData.bank_response_status === 'Contraproposta' ? negotiationData.counterproposal_details : null,
        };

        try {
            await axiosInstance.patch(`/api/cases/${selectedCase.id}/negotiate/`, dataToUpdate);
            setSuccess('Status da negociação salvo com sucesso! O andamento foi registrado.');

            setTimeout(() => {
                navigate('/documents'); // Redireciona para a página de documentos
            }, 2500);

        } catch (err) {
            console.error("Erro ao salvar negociação:", err.response?.data);
            let errorMessage = "Ocorreu um erro ao salvar os dados da negociação.";
            if (err.response?.data) {
                errorMessage = err.response.data.error || Object.values(err.response.data).flat().join(' | ');
            }
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <MainLayout>
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Negociação com Instituição Financeira</h2>

            <div className="bg-white p-8 rounded-lg shadow-lg max-w-2xl mx-auto">
                {/* Mensagens de erro/sucesso */}
                {error && <p className="text-red-500 text-center mb-4 p-3 bg-red-100 rounded-md">{error}</p>}
                {success && <p className="text-green-600 text-center mb-4 p-3 bg-green-100 rounded-md">{success}</p>}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Seleção de Caso */}
                    <div className="mb-6">
                        <label htmlFor="case-select" className="block text-lg font-medium text-gray-800 mb-2">
                            Selecione o Caso
                        </label>
                        <select
                            id="case-select"
                            value={selectedCase ? selectedCase.id : ''} // Vincula ao ID do caso selecionado
                            onChange={(e) => handleCaseSelect(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                            required
                        >
                            <option value="" disabled>-- Escolha um caso --</option>
                            {cases.length > 0 ? cases.map(c => (
                                <option key={c.id} value={c.id}>
                                    {c.title} (Cliente: {c.client?.email || 'N/A'})
                                </option>
                            )) : (
                                <option value="" disabled>Carregando casos ou nenhum caso encontrado.</option>
                            )}
                        </select>
                    </div>

                    {selectedCase && (
                        <div className="space-y-8 animate-fade-in">
                            {/* Detalhes do Caso Selecionado */}
                            <div className="p-6 border rounded-lg space-y-4">
                                <h3 className="text-xl font-semibold text-gray-700">Detalhes do Caso Selecionado: <span className="text-blue-600">{selectedCase.title}</span></h3>
                                <p className="text-gray-600 text-sm">Descrição: {selectedCase.description || 'N/A'}</p>
                                <p className="text-gray-600 text-sm">Status Atual: {selectedCase.current_status}</p>
                                <p className="text-gray-600 text-sm">Cliente: {selectedCase.client?.email || 'N/A'}</p>
                            </div>

                            {/* Seção Gestão da Negociação */}
                            <div className="p-6 border rounded-lg space-y-4">
                                <h3 className="text-xl font-semibold text-gray-700">Gestão da Negociação</h3>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Data de Envio do Dossiê ao Banco</label>
                                    <input
                                        type="date"
                                        name="dossier_sent_date"
                                        value={negotiationData.dossier_sent_date}
                                        onChange={handleChange}
                                        className="w-full p-2 border rounded-md"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Resposta do Banco</label>
                                    <select
                                        name="bank_response_status"
                                        value={negotiationData.bank_response_status}
                                        onChange={handleChange}
                                        className="w-full p-2 border rounded-md"
                                    >
                                        {BANK_RESPONSE_CHOICES.map(choice => (
                                            <option key={choice[0]} value={choice[0]}>{choice[1]}</option>
                                        ))}
                                    </select>
                                </div>

                                {negotiationData.bank_response_status === 'Contraproposta' && (
                                    <div className="animate-fade-in">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Detalhes da Contraproposta</label>
                                        <textarea
                                            name="counterproposal_details"
                                            rows="4"
                                            value={negotiationData.counterproposal_details}
                                            onChange={handleChange}
                                            className="w-full p-2 border rounded-md"
                                            placeholder="Descreva os detalhes da contraproposta recebida do banco..."
                                        />
                                    </div>
                                )}
                            </div>
                            <div className="flex justify-end">
                                <button type="submit" disabled={loading || success}
                                        className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg shadow hover:bg-blue-700 disabled:bg-blue-400">
                                    {loading ? 'Salvando...' : 'Salvar Status da Negociação'}
                                </button>
                            </div>
                        </div>
                    )}
                </form>
            </div>
        </MainLayout>
    );
}

export default BankNegotiationPage;