// frontend/src/components/forms/ClientSelector.jsx
import React, { useState, useContext, useCallback } from 'react';
import AuthContext from '../../context/AuthContext';
import Input from '../ui/Input';

// MODIFICADO: Adicionado onNoResults
function ClientSelector({ onClientSelect, onNoResults }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [results, setResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const { axiosInstance } = useContext(AuthContext);

    const fetchClients = useCallback(async (search) => {
        if (search.length < 3) {
            setResults([]);
            if (onNoResults) onNoResults(); // Avisa o pai que não há resultados
            return;
        }
        setIsLoading(true);
        try {
            const response = await axiosInstance.get(`/api/clients/?search=${search}`);
            setResults(response.data);
            // MODIFICADO: Chama onNoResults se a resposta for vazia
            if (response.data.length === 0 && onNoResults) {
                onNoResults();
            }
        } catch (error) {
            console.error("Erro ao buscar clientes", error);
            setResults([]);
        } finally {
            setIsLoading(false);
        }
    }, [axiosInstance, onNoResults]);

    const handleSelectClient = (client) => {
        setSearchTerm(`${client.first_name || ''} ${client.last_name || ''} (${client.email})`.trim());
        onClientSelect(client);
        setResults([]);
    };

    return (
        <div className="relative">
            <Input
                label="Buscar Cliente por Nome, Sobrenome ou E-mail"
                value={searchTerm}
                onChange={(e) => {
                    setSearchTerm(e.target.value);
                    fetchClients(e.target.value);
                }}
                placeholder="Digite 3 ou mais caracteres para buscar..."
            />
            {isLoading && <p className="text-sm text-gray-500 mt-1">Buscando...</p>}
            {results.length > 0 && (
                <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-md mt-1 max-h-60 overflow-y-auto shadow-lg">
                    {results.map(client => (
                        <li
                            key={client.id}
                            onClick={() => handleSelectClient(client)}
                            className="px-4 py-2 hover:bg-blue-100 cursor-pointer"
                        >
                            <p className="font-semibold">{`${client.first_name || ''} ${client.last_name || ''}`.trim()}</p>
                            <p className="text-sm text-gray-600">{client.email}</p>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default ClientSelector;