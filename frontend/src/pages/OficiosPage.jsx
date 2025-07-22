// frontend/src/pages/OficiosPage.jsx
import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import Button from '../components/ui/Button';

function OficiosPage() {
    const [oficios, setOficios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { axiosInstance } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchOficios = async () => {
            try {
                setLoading(true);
                setError('');
                const response = await axiosInstance.get('/api/cases/?case_type=outros');
                setOficios(response.data);
            } catch (err) {
                setError("Falha ao carregar a lista de ofícios.");
            } finally {
                setLoading(false);
            }
        };
        fetchOficios();
    }, [axiosInstance]);

    const handleRowClick = (protocolId) => {
        navigate(`/protocolos/${protocolId}`);
    };

    if (loading) { return <p className="text-center text-gray-500">Carregando ofícios...</p>; }
    if (error) { return <p className="text-center text-red-500 bg-red-100 p-4 rounded-md">{error}</p>; }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Ofícios</h1>
                <Link to="/casos/novo" state={{ defaultCaseType: 'outros' }}>
                    <Button variant="primary">+ Novo Ofício</Button>
                </Link>
            </div>

            {oficios.length === 0 ? (
                 <div className="text-center p-8 bg-white rounded-lg shadow-md">
                    <p className="text-gray-500">Nenhum ofício encontrado.</p>
                </div>
            ) : (
                <div className="bg-white shadow-md rounded-lg overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID do Protocolo</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Título</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {oficios.map((protocol) => (
                                <tr key={protocol.id} onClick={() => handleRowClick(protocol.id)} className="hover:bg-gray-100 cursor-pointer">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{protocol.protocol_id || protocol.id}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{protocol.title}</td>
                                    {/* CORREÇÃO APLICADA ABAIXO */}
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{protocol.client?.email || 'N/A'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
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

export default OficiosPage;