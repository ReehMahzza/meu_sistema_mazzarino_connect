/*
================================================================================
ARQUIVO: frontend/src/components/ui/Checkbox.jsx (NOVO ARQUIVO)
================================================================================
Componente genérico para checkboxes.
*/
import React from 'react';

const Checkbox = ({ label, name, id, checked, onChange, disabled = false }) => {
    return (
        <div className="flex items-center">
            <input
                type="checkbox"
                id={id || name}
                name={name}
                checked={checked}
                onChange={onChange}
                disabled={disabled}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor={id || name} className="ml-2 block text-sm text-gray-900">
                {label}
            </label>
        </div>
    );
};

export default Checkbox;
