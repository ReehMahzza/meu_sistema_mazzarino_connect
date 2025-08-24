// frontend/src/components/cases/ActionMenu.jsx
import React, { useState, useContext } from 'react';
import AuthContext from '../../context/AuthContext';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import CommunicationForm from './CommunicationForm';
import MessageAlert from '../ui/MessageAlert';

function ActionMenu({ protocol, onActionCompleted }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loadingAction, setLoadingAction] = useState(null); // Controla o loading de botões específicos
    const [error, setError] = useState('');
    const { axiosInstance } = useContext(AuthContext);

    // Função genérica para lidar com chamadas de API para as ações
    const handleAction = async (actionName, endpoint) => {
        setLoadingAction(actionName);
        setError('');
        try {
            await axiosInstance.post(`/api/cases/${protocol.id}/${endpoint}/`);
            onActionCompleted(); // Recarrega os dados da página pai
        } catch (err) {
            console.error(`Erro ao executar a ação ${actionName}:`, err);
            setError(`Falha ao executar a ação: ${err.response?.data?.message || 'Erro de servidor'}`);
        } finally {
            setLoadingAction(null);
        }
    };

    const renderWorkflowActions = () => {
        switch (protocol.current_status) {
            case 'AGUARDANDO_DOCUMENTOS':
                return (
                    <>
                        <Button
                            onClick={() => handleAction('approve', 'aprovar-documentos')}
                            disabled={!!loadingAction}
                            variant="success"
                        >
                            {loadingAction === 'approve' ? 'Processando...' : 'Aprovar Documentos'}
                        </Button>
                        <Button
                            onClick={() => handleAction('reject', 'reprovar-documentos')}
                            disabled={!!loadingAction}
                            variant="danger"
                        >
                            {loadingAction === 'reject' ? 'Processando...' : 'Documentos Incorretos'}
                        </Button>
                    </>
                );
            case 'PENDENTE_SOLICITAÇÃO_CONTRATOS':
            case 'PENDENTE_SOLICITACAO_CONTRATOS': // Adicionado para aceitar sem acento
                return (
                    <Button
                        onClick={() => handleAction('oficio', 'criar-oficio')}
                        disabled={!!loadingAction}
                        variant="secondary"
                    >
                        {loadingAction === 'oficio' ? 'Processando...' : 'Criar Ofício'}
                    </Button>
                );
            default:
                // Para outros status, não renderiza botões de workflow
                return <p className="text-sm text-gray-500 text-center col-span-full">Nenhuma ação de workflow disponível para o status atual.</p>;
        }
    };

    return (
        <>
            <div className="bg-white shadow-md rounded-lg p-6 mt-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                    {/* Seção de Comunicação Padrão */}
                    <div className="md:col-span-1">
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">Interação Manual</h3>
                        <Button onClick={() => setIsModalOpen(true)} variant="primary">
                            Enviar Comunicação
                        </Button>
                    </div>

                    {/* Seção de Ações do Workflow */}
                    <div className="md:col-span-2 p-4 border rounded-lg bg-gray-50">
                        <h3 className="text-lg font-semibold text-gray-800 mb-3 text-center">
                            Ações do Workflow
                        </h3>
                        <div className="flex items-center justify-center gap-4">
                            {renderWorkflowActions()}
                        </div>
                        {error && <div className="mt-4"><MessageAlert message={error} type="error" /></div>}
                    </div>
                </div>
            </div>

            <Modal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)}
                title="Nova Comunicação"
            >
                <CommunicationForm 
                    protocolId={protocol.id}
                    onClose={() => setIsModalOpen(false)}
                    onCommunicationSent={onActionCompleted}
                />
            </Modal>
        </>
    );
}

export default ActionMenu;