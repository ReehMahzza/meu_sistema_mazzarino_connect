// frontend/src/pages/ProtocolDetailPage.jsx
import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import CaseHeader from '../components/cases/CaseHeader';
import CaseTabs from '../components/cases/CaseTabs';
import Timeline from '../components/cases/Timeline';
import DocumentsTab from '../components/cases/DocumentsTab';
import FinancialTab from '../components/cases/FinancialTab';
import ProtocolSummaryTab from '../components/cases/ProtocolSummaryTab';
import ComunicacaoTab from '../components/cases/ComunicacaoTab'; // 1. IMPORTE O NOVO COMPONENTE

function ProtocolDetailPage() {
    const { protocolId } = useParams();
    const { axiosInstance } = useContext(AuthContext);

    const [protocol, setProtocol] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('Andamentos');

    useEffect(() => {
        const fetchProtocolDetails = async () => {
            try {
                setLoading(true);
                setError('');
                const response = await axiosInstance.get(`/api/cases/${protocolId}/`);
                setProtocol(response.data);
            } catch (err) {
                setError("Falha ao carregar os detalhes do protocolo.");
            } finally {
                setLoading(false);
            }
        };
        fetchProtocolDetails();
    }, [protocolId, axiosInstance]);

    const handleAddDocument = (newDocument) => {
        setProtocol(prevProtocol => {
            const existingDocuments = prevProtocol.documents || [];
            return {
                ...prevProtocol,
                documents: [...existingDocuments, newDocument]
            };
        });
    };

    const renderTabContent = () => {
        if (!protocol) return null;

        switch (activeTab) {
            case 'Andamentos':
                const filteredMovements = protocol.movements ? protocol.movements.filter(
                    (movement) => movement.movement_type !== 'Visualização'
                ) : [];
                return <Timeline movements={filteredMovements} />;
            case 'Documentos':
                return <DocumentsTab protocol={protocol} onDocumentAdd={handleAddDocument} />;
            case 'Financeiro':
                return <FinancialTab protocol={protocol} />;
            case 'Resumo do Protocolo':
                return <ProtocolSummaryTab protocol={protocol} />;

            // 2. ADICIONE O CASE PARA A ABA COMUNICAÇÃO
            case 'Comunicação':
                return <ComunicacaoTab protocol={protocol} />;

            default:
                return null;
        }
    };

    if (loading) {
        return <p className="text-center text-gray-500 mt-8">Carregando detalhes do protocolo...</p>;
    }
    if (error) {
        return <p className="text-center text-red-500 bg-red-100 p-4 rounded-md mt-8">{error}</p>;
    }
    if (!protocol) {
        return <p className="text-center text-gray-500 mt-8">Nenhum dado de protocolo para exibir.</p>;
    }

    return (
        <div>
            <CaseHeader protocol={protocol} />
            <CaseTabs activeTab={activeTab} setActiveTab={setActiveTab} />
            <div className="mt-6">
                {renderTabContent()}
            </div>
        </div>
    );
}

export default ProtocolDetailPage;