// frontend/src/pages/ProtocolsPage.jsx
import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

function ProtocolsPage() {
    const [protocols, setProtocols] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { axiosInstance } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProtocols = async () => {
            try {
                setLoading(true);
                setError('');
                // A busca é feita no endpoint que lista os casos
                const response = await axiosInstance.get('/api/cases/');
                setProtocols(response.data);
            } catch (err) {
                console.error("Erro ao buscar protocolos:", err);
                setError("Falha ao carregar a lista de protocolos. Tente novamente mais tarde.");
            } finally {
                setLoading(false);
            }
        };

        fetchProtocols();
    }, [axiosInstance]);

    const handleRowClick = (protocolId) => {
        // Navega para a página de detalhes do protocolo clicado
        navigate(`/protocolos/${protocolId}`);
    };

    if (loading) {
        return <p className="text-center text-gray-500">Carregando protocolos...</p>;
    }

    if (error) {
        return <p className="text-center text-red-500 bg-red-100 p-4 rounded-md">{error}</p>;
    }

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Protocolos</h1>

            {protocols.length === 0 ? (
                <p className="text-center text-gray-500">Nenhum protocolo encontrado.</p>
            ) : (
                <div className="bg-white shadow-md rounded-lg overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Título</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {protocols.map((protocol) => (
                                <tr
                                    key={protocol.id}
                                    onClick={() => handleRowClick(protocol.id)}
                                    className="hover:bg-gray-100 cursor-pointer transition-colors duration-200"
                                >
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{protocol.id}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{protocol.title}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{protocol.client?.email || 'N/A'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                            {protocol.current_status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export default ProtocolsPage;