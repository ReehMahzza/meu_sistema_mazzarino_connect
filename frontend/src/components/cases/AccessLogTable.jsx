/*
================================================================================
ARQUIVO: frontend/src/components/cases/AccessLogTable.jsx (NOVO ARQUIVO)
================================================================================
Componente para a "Tabela de Transparência", que lista os acessos de visualização.
*/
import React, { useState, useEffect, useContext } from 'react';
import AuthContext from '../../context/AuthContext';

function AccessLogTable({ protocolId }) {
    const [accessLog, setAccessLog] = useState([]);
    const [loading, setLoading] = useState(true);
    const { axiosInstance } = useContext(AuthContext);

    useEffect(() => {
        const fetchAccessLog = async () => {
            if (!protocolId) return;
            try {
                setLoading(true);
                // Busca apenas os andamentos do tipo 'Visualização'
                const response = await axiosInstance.get(`/api/cases/${protocolId}/movements/?movement_type=Visualização`);
                setAccessLog(response.data);
            } catch (error) {
                console.error("Erro ao buscar log de acesso:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchAccessLog();
    }, [protocolId, axiosInstance]);

    return (
        <div className="bg-white shadow-md rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800 p-4 border-b">Transparência - Quem já visualizou</h3>
            {loading ? (
                <p className="p-4 text-gray-500">Carregando...</p>
            ) : (
                <div className="overflow-x-auto max-h-48">
                    <table className="min-w-full">
                        <thead className="bg-gray-50 sticky top-0">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Usuário</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data da Visualização</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {accessLog.length > 0 ? accessLog.map(log => (
                                <tr key={log.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{log.actor.email}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(log.timestamp).toLocaleString('pt-BR')}</td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="2" className="px-6 py-4 text-center text-gray-500">Nenhuma visualização registrada.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export default AccessLogTable;