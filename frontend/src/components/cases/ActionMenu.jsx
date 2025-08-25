// frontend/src/components/cases/ActionMenu.jsx

import React, { useState, useContext } from 'react';
import AuthContext from '../../context/AuthContext';
import Modal from '../ui/Modal'; // Modal de Comunicação
import CommunicationForm from './CommunicationForm';
import MessageAlert from '../ui/MessageAlert';
import ActionModal from '../ui/ActionModal';
import {
    ArrowRightCircleIcon,
    CheckCircleIcon,
    XCircleIcon,
    PencilSquareIcon,
    ArrowUpTrayIcon,
    ChatBubbleLeftRightIcon,
    ArchiveBoxXMarkIcon
} from '@heroicons/react/24/outline';

// Mapeamento de IDs de ação para ícones e descrições
const actionDetails = {
    send_to_validation: { icon: ArrowRightCircleIcon, description: "Inicia o processo de análise dos documentos." },
    approve_documents: { icon: CheckCircleIcon, description: "Confirma que os documentos estão corretos." },
    reprove_documents: { icon: XCircleIcon, description: "Indica pendências e gera um ofício." },
    add_internal_note: { icon: PencilSquareIcon, description: "Adiciona uma observação ao histórico." },
    upload_document: { icon: ArrowUpTrayIcon, description: "Anexa um novo ficheiro a este caso." },
    external_communication: { icon: ChatBubbleLeftRightIcon, description: "Envia um e-mail ou notificação externa." },
    archive_case: { icon: ArchiveBoxXMarkIcon, description: "Move este caso para o arquivo." },
    force_manual_transition: { icon: ArrowRightCircleIcon, description: "Altera o estado do processo manualmente." },
    create_internal_request: { icon: PencilSquareIcon, description: "Cria uma solicitação para outra equipa." },
    reclassify_case: { icon: PencilSquareIcon, description: "Altera o tipo ou dados do protocolo." },
};

function ActionMenu({ protocol, onActionCompleted }) {
    const [isCommunicationModalOpen, setCommunicationModalOpen] = useState(false);
    const [isActionModalOpen, setActionModalOpen] = useState(false);
    const [currentAction, setCurrentAction] = useState(null);
    const [loadingAction, setLoadingAction] = useState(null);
    const [error, setError] = useState('');
    const { axiosInstance } = useContext(AuthContext);

    const handleActionClick = async (action) => {
        setError('');
        if (action.id === 'external_communication') {
            setCommunicationModalOpen(true);
            return;
        }
        if (action.requires_justification) {
            setCurrentAction(action);
            setActionModalOpen(true);
        } else {
            setLoadingAction(action.id);
            try {
                await axiosInstance.post(`/api/cases/${protocol.id}/action/`, { action_id: action.id });
                onActionCompleted();
            } catch (err) {
                setError(`Falha ao executar a ação: ${err.response?.data?.error || 'Erro de servidor'}`);
            } finally {
                setLoadingAction(null);
            }
        }
    };

    const handleModalSubmit = async ({ justification }) => {
        if (!currentAction) return;
        setLoadingAction(currentAction.id);
        setError('');
        try {
            await axiosInstance.post(`/api/cases/${protocol.id}/action/`, {
                action_id: currentAction.id,
                justification: justification
            });
            setActionModalOpen(false);
            setCurrentAction(null);
            onActionCompleted();
        } catch (err) {
            setError(`Falha ao submeter a ação: ${err.response?.data?.error || 'Erro de servidor'}`);
        } finally {
            setLoadingAction(null);
        }
    };

    const availableActions = protocol?.available_actions || [];
    const workflowActions = availableActions.filter(a => ['send_to_validation', 'approve_documents', 'reprove_documents', 'send_to_financial_analysis', 'send_to_final_pre_analysis'].includes(a.id));
    const toolActions = availableActions.filter(a => !workflowActions.map(wa => wa.id).includes(a.id));

    if (availableActions.length === 0) return null;

    return (
        <>
            <div className="bg-white shadow-md rounded-lg p-6 mt-8">
                <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex-grow w-full md:w-2/3">
                        <h3 className="text-lg font-semibold text-gray-800 mb-3">Próximos Passos do Workflow</h3>
                        <div className="space-y-3">
                            {workflowActions.length > 0 ? workflowActions.map(action => {
                                const Icon = actionDetails[action.id]?.icon || PencilSquareIcon;
                                return (
                                    <button
                                        key={action.id}
                                        onClick={() => handleActionClick(action)}
                                        disabled={!!loadingAction}
                                        className="w-full flex items-center text-left p-3 border rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <Icon className={`w-8 h-8 mr-4 ${action.style === 'danger' ? 'text-red-500' : 'text-blue-500'}`} />
                                        <div>
                                            <p className="font-semibold text-gray-900">{action.label}</p>
                                            <p className="text-sm text-gray-500">{actionDetails[action.id]?.description}</p>
                                        </div>
                                        {loadingAction === action.id && <div className="ml-auto w-5 h-5 border-t-2 border-blue-500 rounded-full animate-spin"></div>}
                                    </button>
                                );
                            }) : (
                                <p className="text-sm text-gray-500 text-center py-4">Nenhuma ação de workflow disponível.</p>
                            )}
                        </div>
                    </div>

                    <div className="w-full md:w-1/3 md:border-l md:pl-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-3">Ferramentas do Protocolo</h3>
                        <div className="space-y-2">
                            {toolActions.length > 0 ? toolActions.map(action => {
                                const Icon = actionDetails[action.id]?.icon || PencilSquareIcon;
                                return (
                                    <button
                                        key={action.id}
                                        onClick={() => handleActionClick(action)}
                                        disabled={!!loadingAction}
                                        className="w-full flex items-center text-left p-2 rounded-md hover:bg-gray-100 transition-colors disabled:opacity-50"
                                    >
                                        <Icon className="w-5 h-5 mr-3 text-gray-600" />
                                        <span className="text-sm font-medium text-gray-700">{action.label}</span>
                                    </button>
                                );
                            }) : (
                                <p className="text-sm text-gray-500">Nenhuma ferramenta disponível.</p>
                            )}
                        </div>
                    </div>
                </div>
                {error && <div className="mt-4"><MessageAlert message={error} type="error" /></div>}
            </div>

            <Modal isOpen={isCommunicationModalOpen} onClose={() => setCommunicationModalOpen(false)} title="Nova Comunicação">
                <CommunicationForm protocolId={protocol.id} onClose={() => setCommunicationModalOpen(false)} onCommunicationSent={onActionCompleted} />
            </Modal>
            <ActionModal
                isOpen={isActionModalOpen}
                onClose={() => setActionModalOpen(false)}
                onSubmit={handleModalSubmit}
                title={currentAction?.label || "Confirmar Ação"}
                label="Por favor, forneça uma justificação para esta ação:"
                submitButtonText="Confirmar e Submeter"
                isLoading={!!loadingAction}
            />
        </>
    );
}

export default ActionMenu;