/*
================================================================================
ARQUIVO: frontend/src/components/ui/MessageAlert.jsx (NOVO ARQUIVO)
================================================================================
Componente genérico para exibir mensagens de sucesso ou erro.
*/
import React from 'react';

const MessageAlert = ({ message, type = 'error' }) => {
    if (!message) return null;

    const variants = {
        error: "bg-red-100 border-red-400 text-red-700",
        success: "bg-green-100 border-green-400 text-green-700",
    };

    return (
        <div className={`border px-4 py-3 rounded-md relative ${variants[type]}`} role="alert">
            <span className="block sm:inline">{message}</span>
        </div>
    );
};

export default MessageAlert;
