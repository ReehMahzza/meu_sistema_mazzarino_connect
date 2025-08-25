import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
// REMOVIDO: MainLayout não deve ser importado aqui para evitar duplicação.
import CaseHeader from '../components/cases/CaseHeader';
import Timeline from '../components/cases/Timeline';
import AccessLogTable from '../components/cases/AccessLogTable';
import CaseTabs from '../components/cases/CaseTabs';
import FinancialTab from '../components/cases/FinancialTab';
import ActionMenu from '../components/cases/ActionMenu';
import ComunicacaoTab from '../components/cases/ComunicacaoTab';
import ProgressBar from '../components/cases/ProgressBar';
import DocumentChecklist from '../components/cases/DocumentChecklist';

function ProtocolDetailPage() {
    const { protocolId } = useParams();
    const { axiosInstance } = useContext(AuthContext);

    const [protocol, setProtocol] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('Andamentos');

    const fetchPageData = useCallback(async () => {
        try {
            setError('');
            const response = await axiosInstance.get(`/api/cases/${protocolId}/`);
            setProtocol(response.data);
        } catch (err) {
            console.error("Erro ao buscar detalhes do protocolo:", err);
            setError("Falha ao carregar os detalhes do protocolo.");
        } finally {
            setLoading(false);
        }
    }, [protocolId, axiosInstance]);

    useEffect(() => {
        setLoading(true);
        fetchPageData();
    }, [fetchPageData]);

    // CORRIGIDO: useEffect para registrar a visualização.
    // Agora ele depende de 'protocol' para garantir que só execute após os dados carregarem.
    useEffect(() => {
        // Só executa se os dados do protocolo já foram carregados
        if (protocol) {
            const logAccess = async () => {
                try {
                    // A chamada à API continua a mesma
                    await axiosInstance.post(`/api/cases/${protocolId}/movements/`, {
                        movement_type: "Visualização",
                        content: "Usuário acessou a página de detalhes do protocolo."
                    });
                    // Opcional: recarregar os dados para exibir a nova visualização imediatamente
                    // fetchPageData(); 
                } catch (error) {
                    console.error("Não foi possível registrar o acesso:", error);
                }
            };
            
            // O timer para evitar registros múltiplos em reloads rápidos continua sendo uma boa prática.
            const timer = setTimeout(() => logAccess(), 1000); // Aumentei para 1s para segurança
            return () => clearTimeout(timer);
        }
    }, [protocol, protocolId, axiosInstance]); // Adicionado 'protocol' como dependência

    const renderTabContent = () => {
        if (!protocol) return null;

        switch (activeTab) {
            case 'Andamentos':
                const filteredMovements = protocol.movements.filter(
                    (movement) => movement.movement_type !== 'Visualização'
                );
                return <Timeline movements={filteredMovements} />;
            case 'Financeiro':
                return <FinancialTab protocol={protocol} />;
            case 'Comunicação':
                return <ComunicacaoTab protocol={protocol} />;
            default:
                return <div className="mt-6 bg-white p-6 shadow-md rounded-lg">Conteúdo para esta aba em breve...</div>;
        }
    };

    const renderContent = () => {
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
            <div className="space-y-8">
                <CaseHeader protocol={protocol} />
                <ProgressBar currentStatus={protocol.current_status} />

                {/* ADICIONADO: Renderização Condicional do Checklist */}
                {protocol.current_status === 'VALIDACAO_DOCUMENTAL' && (
                    <DocumentChecklist protocol={protocol} />
                )}

                {/* ALTERADO: Passa movements ao invés de protocolId */}
                <AccessLogTable movements={protocol.movements} />
                <CaseTabs activeTab={activeTab} setActiveTab={setActiveTab} />
                <div className="mt-6">
                    {renderTabContent()}
                </div>
                <ActionMenu protocol={protocol} onActionCompleted={fetchPageData} />
            </div>
        );
    };

    // CORRIGIDO: Retornando apenas o conteúdo, sem o MainLayout duplicado.
    // Usamos um fragmento <>...</> que não adiciona nós extras ao DOM.
    return (
        <>
            {renderContent()}
        </>
    );
}

export default ProtocolDetailPage;