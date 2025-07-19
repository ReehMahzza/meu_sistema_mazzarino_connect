/*
================================================================================
ARQUIVO: frontend/src/components/ui/Button.jsx (NOVO ARQUIVO)
================================================================================
Componente genérico para botões.
*/
import React from 'react';

const Button = ({ children, onClick, type = 'button', disabled = false, variant = 'primary' }) => {
    const baseStyles = "w-full py-3 px-4 font-bold rounded-lg shadow-md transition-all duration-300 disabled:cursor-not-allowed";

    const variants = {
        primary: "bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-400",
        secondary: "bg-gray-600 text-white hover:bg-gray-700 disabled:bg-gray-400",
        danger: "bg-red-600 text-white hover:bg-red-700 disabled:bg-red-400",
        success: "bg-green-600 text-white hover:bg-green-700 disabled:bg-green-400",
    };

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`${baseStyles} ${variants[variant]}`}
        >
            {children}
        </button>
    );
};

export default Button;
