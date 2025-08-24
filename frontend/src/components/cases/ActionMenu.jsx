// frontend/src/components/cases/ActionMenu.jsx
import React, { useState } from 'react';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import CommunicationForm from './CommunicationForm';

function ActionMenu({ protocolId, onActionCompleted }) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <>
            <div className="bg-white shadow-md rounded-lg p-4 mt-6">
                <div className="flex items-center justify-center gap-4">
                    <div className="w-64">
                        <Button onClick={() => setIsModalOpen(true)} variant="primary">
                            Enviar Comunicação
                        </Button>
                    </div>
                    {/* Outros botões de ação podem ser adicionados aqui no futuro */}
                </div>
            </div>

            <Modal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)}
                title="Nova Comunicação"
            >
                <CommunicationForm 
                    protocolId={protocolId}
                    onClose={() => setIsModalOpen(false)}
                    onCommunicationSent={onActionCompleted}
                />
            </Modal>
        </>
    );
}

export default ActionMenu;