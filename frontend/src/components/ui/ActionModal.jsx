/*
================================================================================
ARQUIVO: frontend/src/components/ui/ActionModal.jsx (NOVO ARQUIVO)
================================================================================
Este é um componente de modal reutilizável, projetado para capturar
input textual do utilizador antes de executar uma ação.
*/
import React, { useState, useEffect } from 'react';
import Button from './Button';
import Textarea from './Textarea';

function ActionModal({
    isOpen,
    onClose,
    onSubmit,
    title,
    label,
    submitButtonText = "Submeter",
    isLoading = false
}) {
    const [textValue, setTextValue] = useState('');

    // Limpa o texto quando o modal é fechado
    useEffect(() => {
        if (!isOpen) {
            setTextValue('');
        }
    }, [isOpen]);

    if (!isOpen) {
        return null;
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({ justification: textValue });
    };

    return (
        // Overlay de fundo
        <div
            className="fixed inset-0 bg-black bg-opacity-60 z-40 flex justify-center items-center p-4"
            onClick={onClose}
        >
            {/* Container do Modal */}
            <div
                className="bg-white rounded-lg shadow-2xl w-full max-w-lg animate-fade-in-up"
                onClick={e => e.stopPropagation()}
            >
                <form onSubmit={handleSubmit}>
                    {/* Cabeçalho do Modal */}
                    <div className="flex justify-between items-center p-4 border-b">
                        <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
                        <button
                            type="button"
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                        </button>
                    </div>

                    {/* Conteúdo do Formulário */}
                    <div className="p-6">
                        <Textarea
                            label={label}
                            value={textValue}
                            onChange={(e) => setTextValue(e.target.value)}
                            rows={5}
                            required
                            placeholder="Descreva o motivo ou a nota aqui..."
                        />
                    </div>

                    {/* Rodapé com Botões */}
                    <div className="flex justify-end items-center p-4 border-t bg-gray-50 rounded-b-lg gap-3">
                        <div className="w-36">
                             <Button type="button" onClick={onClose} variant="secondary">
                                Cancelar
                            </Button>
                        </div>
                       <div className="w-36">
                             <Button type="submit" disabled={isLoading} variant="primary">
                                {isLoading ? 'A processar...' : submitButtonText}
                            </Button>
                       </div>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default ActionModal;