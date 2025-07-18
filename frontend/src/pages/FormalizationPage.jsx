/*
================================================================================
ARQUIVO: frontend/src/pages/FormalizationPage.jsx (CORRIGIDO: setSubmitting)
================================================================================
*/
import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import MainLayout from '../components/MainLayout';

function FormalizationPage() {
    const { axiosInstance } = useContext(AuthContext);
    const navigate = useNavigate();

    const [cases, setCases] = useState([]);
    const [selectedCase, setSelectedCase] = useState(null);
    const [formalizationData, setFormalizationData] = useState({
        final_agreement_sent_date: '',
        docusign_status: 'Não Enviado',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [submitting, setSubmitting] = useState(false); // <-- ADICIONADO AQUI!

    const DOCUSIGN_STATUS_CHOICES = [
        ['Não Enviado', 'Não Enviado'],
        ['Enviado', 'Enviado'],
        ['Assinado', 'Assinado'],
        ['Recusado', 'Recusado'],
    ];

    // Busca os casos do usuário ao carregar a página
    useEffect(() => {
        const fetchCases = async () => {
            try {
                const response = await axiosInstance.get('/api/cases/');
                setCases(response.data);
            } catch (err) {
                console.error("Erro ao buscar casos para formalização:", err.response?.data || err.message);
                setError("Não foi possível carregar a lista de casos.");
            } finally {
                setLoading(false); // Garante que o loading seja false
            }
        };
        fetchCases();
    }, [axiosInstance]);

    // Carrega detalhes do caso selecionado e preenche o formulário
    const handleCaseSelect = useCallback((caseId) => {
        const caseDetails = cases.find(c => c.id.toString() === caseId);
        if (caseDetails) {
            setSelectedCase(caseDetails);
            setFormalizationData({
                final_agreement_sent_date: caseDetails.final_agreement_sent_date || '',
                docusign_status: caseDetails.docusign_status || 'Não Enviado',
            });
            setError('');
            setSuccess('');
        } else {
            setSelectedCase(null);
            setFormalizationData({
                final_agreement_sent_date: '',
                docusign_status: 'Não Enviado',
            });
        }
    }, [cases]);

    const handleChange = (e) => {
        setFormalizationData({ ...formalizationData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedCase) {
            setError("Por favor, selecione um caso.");
            return;
        }
        setSubmitting(true);
        setError('');
        setSuccess('');

        try {
            const payload = {
                final_agreement_sent_date: formalizationData.final_agreement_sent_date || null,
                docusign_status: formalizationData.docusign_status,
            };

            await axiosInstance.patch(`/api/cases/${selectedCase.id}/formalize/`, payload);
            setSuccess('Status da formalização salvo com sucesso! O andamento foi registrado.');

            setTimeout(() => {
                navigate('/documents'); // Redireciona para a página de documentos
            }, 2500);

        } catch (err) {
            console.error("Erro ao salvar formalização:", err.response?.data || err.message);
            let errorMessage = "Ocorreu um erro ao salvar os dados da formalização.";
            if (err.response?.data) {
                errorMessage = err.response.data.error || Object.values(err.response.data).flat().join(' | ');
            }
            setError(errorMessage);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <MainLayout>
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Formalização do Acordo</h2>

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

                            {/* Seção Gestão da Formalização */}
                            <div className="p-6 border rounded-lg space-y-4">
                                <h3 className="text-xl font-semibold text-gray-700 mb-4">Gestão da Formalização</h3>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Data de Envio do Acordo Final</label>
                                    <input
                                        type="date"
                                        name="final_agreement_sent_date"
                                        value={formalizationData.final_agreement_sent_date}
                                        onChange={handleChange}
                                        className="w-full p-2 border rounded-md"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Status DocuSign</label>
                                    <select
                                        name="docusign_status"
                                        value={formalizationData.docusign_status}
                                        onChange={handleChange}
                                        className="w-full p-2 border rounded-md"
                                    >
                                        {DOCUSIGN_STATUS_CHOICES.map(choice => (
                                            <option key={choice[0]} value={choice[0]}>{choice[1]}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="flex justify-end pt-6">
                                <button type="submit" disabled={loading || success}
                                        className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg shadow hover:bg-blue-700 disabled:bg-blue-400">
                                    {loading ? 'Salvando...' : 'Salvar Status da Formalização'}
                                </button>
                            </div>
                        </div>
                    )}
                </form>
            </div>
        </MainLayout>
    );
}

export default FormalizationPage;