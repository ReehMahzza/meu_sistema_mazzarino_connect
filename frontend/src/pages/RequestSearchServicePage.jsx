/*
================================================================================
ARQUIVO: frontend/src/pages/RequestSearchServicePage.jsx (NOVO ARQUIVO)
================================================================================
Página para solicitar o Serviço de Busca de Contrato.
*/
import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import MainLayout from '../components/MainLayout';

function RequestSearchServicePage() {
    const { axiosInstance } = useContext(AuthContext);
    const navigate = useNavigate();

    const [cases, setCases] = useState([]);
    const [selectedCaseId, setSelectedCaseId] = useState('');
    const [requestDetails, setRequestDetails] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Busca os casos do usuário logado para preencher o select
    useEffect(() => {
        const fetchCases = async () => {
            try {
                const response = await axiosInstance.get('/api/cases/');
                setCases(response.data);
            } catch (err) {
                console.error("Erro ao buscar casos para seleção:", err.response?.data || err.message);
                setError("Não foi possível carregar a lista de casos.");
            }
        };
        fetchCases();
    }, [axiosInstance]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedCaseId || !requestDetails) {
            setError("Por favor, selecione um caso e preencha os detalhes da solicitação.");
            return;
        }
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            await axiosInstance.post(`/api/cases/${selectedCaseId}/request-search-service/`, {
                request_details: requestDetails,
            });
            setSuccess('Solicitação de serviço enviada com sucesso! Você será redirecionado.');

            setTimeout(() => {
                navigate('/documents'); // Redireciona para a página de documentos
            }, 2000);

        } catch (err) {
            console.error("Erro ao enviar solicitação:", err.response?.data);
            let errorMessage = "Ocorreu um erro ao enviar a solicitação.";
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
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Solicitar Serviço de Busca de Contrato</h2>
            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-lg max-w-2xl mx-auto">
                <div className="space-y-6">
                    {/* Mensagens de erro/sucesso */}
                    {error && <p className="text-red-500 text-center mb-4 p-3 bg-red-100 rounded-md">{error}</p>}
                    {success && <p className="text-green-600 text-center mb-4 p-3 bg-green-100 rounded-md">{success}</p>}

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
                        >
                            <option value="" disabled>-- Escolha um caso --</option>
                            {cases.length > 0 ? cases.map(c => (
                                <option key={c.id} value={c.id}>
                                    {c.title} (ID: {c.id}) - Cliente: {c.client?.email || 'N/A'} {/* Exibe email do cliente */}
                                </option>
                            )) : (
                                <option value="" disabled>Carregando casos ou nenhum caso encontrado.</option>
                            )}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="request-details" className="block text-sm font-medium text-gray-700 mb-1">
                            Detalhes da Solicitação
                        </label>
                        <textarea
                            id="request-details"
                            rows="6"
                            value={requestDetails}
                            onChange={(e) => setRequestDetails(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Informe aqui todos os detalhes necessários para a busca do contrato, como nome completo, CPF, número do contrato, etc."
                            required
                        />
                    </div>
                </div>
                <div className="flex justify-end pt-6">
                    <button
                        type="submit"
                        disabled={loading || success}
                        className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg shadow-md hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-all"
                    >
                        {loading ? 'Enviando...' : 'Enviar Solicitação'}
                    </button>
                </div>
            </form>
        </MainLayout>
    );
}

export default RequestSearchServicePage;