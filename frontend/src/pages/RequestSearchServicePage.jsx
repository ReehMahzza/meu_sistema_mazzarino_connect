/*
================================================================================
ARQUIVO: frontend/src/pages/RequestSearchServicePage.jsx (REFATORADO)
================================================================================
*/
import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import MainLayout from '../components/MainLayout';
// ADICIONADO: Imports dos novos componentes de UI
import Select from '../components/ui/Select';
import Textarea from '../components/ui/Textarea';
import Button from '../components/ui/Button';
import MessageAlert from '../components/ui/MessageAlert';

function RequestSearchServicePage() {
    const { axiosInstance } = useContext(AuthContext);
    const navigate = useNavigate();

    const [cases, setCases] = useState([]);
    const [selectedCaseId, setSelectedCaseId] = useState('');
    const [requestDetails, setRequestDetails] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

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
                navigate('/documents');
            }, 2000);

        } catch (err) {
            console.error("Erro ao enviar solicitação:", err.response?.data);
            setError(err.response?.data?.error || "Ocorreu um erro ao enviar a solicitação.");
        } finally {
            setLoading(false);
        }
    };

    // Mapeia os casos para o formato esperado pelo componente Select
    const caseOptions = cases.map(c => ({
        value: c.id,
        label: `${c.title} (Cliente: ${c.client_detail?.email || 'N/A'})` // <-- CORRIGIDO AQUI!
    }));

    return (
        <MainLayout>
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Solicitar Serviço de Busca de Contrato</h2>
            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-lg max-w-2xl mx-auto">
                <div className="space-y-6">
                    <Select
                        label="Selecione o Caso"
                        name="case"
                        value={selectedCaseId}
                        onChange={(e) => setSelectedCaseId(e.target.value)}
                        options={caseOptions}
                        required
                        error={error.includes('case:') ? error : null}
                    />
                    <Textarea
                        label="Detalhes da Solicitação"
                        name="requestDetails"
                        value={requestDetails}
                        onChange={(e) => setRequestDetails(e.target.value)}
                        placeholder="Informe aqui todos os detalhes necessários para a busca do contrato..."
                        required
                        error={error.includes('request_details:') ? error : null}
                    />
                </div>
                <div className="pt-6">
                    {error && <div className="mb-4"><MessageAlert message={error} type="error" /></div>}
                    {success && <div className="mb-4"><MessageAlert message={success} type="success" /></div>}
                    <Button
                        type="submit"
                        disabled={loading || !!success}
                        variant="primary"
                    >
                        {loading ? 'Enviando...' : 'Enviar Solicitação'}
                    </Button>
                </div>
            </form>
        </MainLayout>
    );
}

export default RequestSearchServicePage;