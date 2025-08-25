// frontend/src/components/cases/Timeline.jsx

import React from 'react';

// Função auxiliar para mapear tipos de andamento a cores de "badge"
const getBadgeColor = (movementType) => {
    const type = movementType.toLowerCase();
    if (type.includes('aprovado') || type.includes('sucesso')) {
        return 'bg-green-100 text-green-800'; // Positivo
    }
    if (type.includes('reprovado') || type.includes('incorreto') || type.includes('arquivado')) {
        return 'bg-red-100 text-red-800'; // Negativo
    }
    if (type.includes('validação') || type.includes('análise')) {
        return 'bg-yellow-100 text-yellow-800'; // Atenção / Em progresso
    }
    if (type.includes('nota interna') || type.includes('requisição')) {
        return 'bg-gray-100 text-gray-800'; // Neutro
    }
    return 'bg-blue-100 text-blue-800'; // Informativo (padrão)
};

function Timeline({ movements }) {
    if (!movements || movements.length === 0) {
        return (
            <div className="bg-white shadow-md rounded-lg p-8 text-center">
                <h3 className="text-lg font-medium text-gray-900">Histórico de Andamentos</h3>
                <p className="mt-2 text-sm text-gray-500">Nenhum andamento registrado para este caso ainda.</p>
            </div>
        );
    }

    const formatTimestamp = (timestamp) => {
        if (!timestamp) return 'Data indisponível';
        return new Date(timestamp).toLocaleString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div>
            <h3 className="text-xl font-bold text-gray-800 mb-4">Histórico de Andamentos</h3>
            <div className="space-y-6">
                {movements.map((movement) => (
                    <div key={movement.id} className="bg-white shadow-md rounded-lg overflow-hidden">
                        <div className="grid grid-cols-1 md:grid-cols-4">
                            {/* Coluna da Esquerda (Metadados) */}
                            <div className="col-span-1 bg-gray-50 p-4 border-r border-gray-200">
                                <div className="space-y-3">
                                    <div>
                                        <p className="text-xs font-medium text-gray-500">Ator</p>
                                        <p className="text-sm font-semibold text-gray-800">
                                            {movement.actor ? `${movement.actor.first_name || ''} ${movement.actor.last_name || ''}`.trim() : 'Sistema'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-gray-500">Setor/Equipa</p>
                                        <p className="text-sm text-gray-600">{movement.actor?.setor_ou_equipe || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-gray-500">Data e Hora</p>
                                        <p className="text-sm text-gray-600">{formatTimestamp(movement.timestamp)}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Coluna da Direita (Conteúdo) */}
                            <div className="col-span-3 p-4">
                                <div className="flex flex-col h-full">
                                    <span className={`text-xs font-semibold mr-auto px-2.5 py-0.5 rounded-full ${getBadgeColor(movement.movement_type)}`}>
                                        {movement.movement_type}
                                    </span>
                                    
                                    <div className="mt-2 text-sm text-gray-700 flex-grow">
                                        <p>{movement.content}</p>
                                    </div>

                                    {(movement.from_sector || movement.to_sector) && (
                                        <div className="mt-4 pt-2 border-t border-gray-100 text-xs text-gray-500">
                                            <p>
                                                {movement.from_sector && <span>De: {movement.from_sector}</span>}
                                                {movement.from_sector && movement.to_sector && <span className="mx-1">→</span>}
                                                {movement.to_sector && <span>Para: {movement.to_sector}</span>}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Timeline;