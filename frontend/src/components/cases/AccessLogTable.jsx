// frontend/src/components/cases/AccessLogTable.jsx

import React from 'react';
import { format, formatDistanceToNow, isValid } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const roleColors = {
    'Membro': 'bg-blue-100 text-blue-800',
    'Cliente': 'bg-green-100 text-green-800',
    'Externo': 'bg-yellow-100 text-yellow-800',
    'default': 'bg-gray-100 text-gray-800',
};

// MODIFICADO: O componente agora recebe 'movements' em vez de 'protocolId'
function AccessLogTable({ movements = [] }) {
    
    // A lógica de busca de dados foi REMOVIDA.

    const accessLogs = movements
        .filter(m => m.movement_type === 'Visualização')
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    return (
        <div className="bg-white shadow-lg rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Histórico de Visualizações</h3>
            {accessLogs.length > 0 ? (
                <ul className="space-y-4">
                    {accessLogs.map(log => {
                        const date = new Date(log.timestamp);
                        const isValidDate = log.timestamp && isValid(date);

                        const userRole = log.actor?.role_display || 'N/A';
                        const badgeColor = roleColors[userRole] || roleColors.default;

                        return (
                            <li key={log.id} className="flex items-start space-x-3">
                                <div className="flex-shrink-0">
                                    <span className="flex items-center justify-center h-8 w-8 rounded-full bg-gray-200 text-sm font-semibold text-gray-600">
                                        {log.actor?.first_name ? log.actor.first_name.charAt(0).toUpperCase() : '?'}
                                    </span>
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm text-gray-700">
                                        <span className="font-bold">{log.actor ? `${log.actor.first_name || ''} ${log.actor.last_name || ''}`.trim() : 'Usuário desconhecido'}</span>
                                        <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badgeColor}`}>
                                            {userRole}
                                        </span>
                                        <span className="text-gray-500"> visualizou este processo.</span>
                                    </p>
                                    <p className="text-xs text-gray-500" title={isValidDate ? format(date, "dd/MM/yyyy 'às' HH:mm:ss", { locale: ptBR }) : 'Data inválida'}>
                                        {isValidDate ? formatDistanceToNow(date, { addSuffix: true, locale: ptBR }) : 'Data indisponível'}
                                    </p>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            ) : (
                <p className="text-sm text-gray-500">Nenhuma visualização registrada até o momento.</p>
            )}
        </div>
    );
}

export default AccessLogTable;