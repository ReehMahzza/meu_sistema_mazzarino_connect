// frontend/src/pages/ProtocolDetailPage.jsx
import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import CaseHeader from '../components/cases/CaseHeader';
import CaseTabs from '../components/cases/CaseTabs';
import Timeline from '../components/cases/Timeline';
import FinancialTab from '../components/cases/FinancialTab';
import ProtocolSummaryTab from '../components/cases/ProtocolSummaryTab';
import DocumentsTab from '../components/cases/DocumentsTab';
import ActionMenu from '../components/cases/ActionMenu';
import AccessLogTable from '../components/cases/AccessLogTable';

function ProtocolDetailPage() {
    const { protocolId } = useParams();
    const { axiosInstance } = useContext(AuthContext);
    const [protocol, setProtocol] = useState(null);
    const [timelineEvents, setTimelineEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('Andamentos');
    // ADICIONADO: Um "gatilho" para forçar a recarga dos dados
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    useEffect(() => {
        const fetchPageData = async () => {
            try {
                // Garante que o loading só apareça na carga inicial
                if (!protocol) setLoading(true);
                setError('');

                const [caseDetailsResponse, timelineResponse] = await Promise.all([
                    axiosInstance.get(`/api/cases/${protocolId}/`),
                    axiosInstance.get(`/api/cases/${protocolId}/timeline/`)
                ]);

                setProtocol(caseDetailsResponse.data);
                setTimelineEvents(timelineResponse.data);

            } catch (err) {
                setError("Falha ao carregar os detalhes do protocolo.");
            } finally {
                setLoading(false);
            }
        };
 
        fetchPageData();
    // MODIFICADO: O useEffect agora depende do refreshTrigger
    }, [protocolId, axiosInstance, refreshTrigger]); // eslint-disable-line react-hooks/exhaustive-deps

    // Função que será chamada pelos componentes filhos para pedir uma atualização
    const handleActionCompleted = () => {
        setRefreshTrigger(prev => prev + 1); // Mudar o valor do gatilho força o useEffect a rodar novamente
    };

    const handleAddDocument = (newDocument) => {
        setProtocol(prev => ({ ...prev, documents: [...(prev.documents || []), newDocument] }));
        handleActionCompleted();
    };

    const renderTabContent = () => {
        if (!protocol) return null;
        switch (activeTab) {
            case 'Andamentos':
                const filteredEvents = timelineEvents.filter(e => e.event_specific_details?.movement_type !== 'Visualização');
                return <Timeline events={filteredEvents} />;
            case 'Documentos':
                return <DocumentsTab protocol={protocol} onDocumentAdd={handleAddDocument} />;
            case 'Financeiro':
                return <FinancialTab protocol={protocol} />;
            case 'Resumo do Protocolo':
                return <ProtocolSummaryTab protocol={protocol} />;
            default:
                return null;
        }
    };

    if (loading) return <p className="text-center mt-8">Carregando...</p>;
    if (error) return <p className="text-center text-red-500 mt-8">{error}</p>;
    if (!protocol) return <p className="text-center mt-8">Protocolo não encontrado.</p>;

    return (
        <div className="space-y-6">
            <CaseHeader protocol={protocol} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ProtocolSummaryTab protocol={protocol} />
                <AccessLogTable protocolId={protocolId} />
            </div>
            <CaseTabs activeTab={activeTab} setActiveTab={setActiveTab} />
            <div className="mt-6">
                {renderTabContent()}
            </div>

            <ActionMenu protocol={protocol} onActionCompleted={handleActionCompleted} />
        </div>
    );
}

export default ProtocolDetailPage;