// frontend/src/components/ui/Modal.jsx
import React from 'react';

function Modal({ isOpen, onClose, title, children }) {
    if (!isOpen) {
        return null;
    }

    return (
        // Overlay de fundo
        <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center"
            onClick={onClose} // Fecha o modal ao clicar no fundo
        >
            {/* Container do Modal */}
            <div 
                className="bg-white rounded-lg shadow-2xl w-full max-w-2xl m-4 animate-fade-in-up"
                onClick={e => e.stopPropagation()} // Previne que o clique dentro do modal o feche
            >
                {/* Cabeçalho do Modal */}
                <div className="flex justify-between items-center p-4 border-b">
                    <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
                    <button 
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                </div>

                {/* Conteúdo do Modal */}
                <div className="p-6">
                    {children}
                </div>
            </div>
        </div>
    );
}

export default Modal;