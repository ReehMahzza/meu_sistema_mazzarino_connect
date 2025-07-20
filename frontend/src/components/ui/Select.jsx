/*
================================================================================
ARQUIVO: frontend/src/components/ui/Select.jsx (NOVO ARQUIVO)
================================================================================
Componente genérico para campos de seleção (<select>).
*/
import React from 'react';

const Select = ({ label, name, value, onChange, options, required = false, disabled = false, error = null }) => {
    return (
        <div>
            <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <select
                id={name}
                name={name}
                value={value}
                onChange={onChange}
                required={required}
                disabled={disabled}
                className={`w-full p-3 border rounded-md shadow-sm transition duration-150 ease-in-out
                            ${error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'}
                            ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
            >
                <option value="" disabled>-- Selecione uma opção --</option>
                {options.map(option => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
            {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
        </div>
    );
};

export default Select;
