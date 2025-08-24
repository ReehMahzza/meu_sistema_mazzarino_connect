// frontend/src/components/cases/Timeline.jsx
import React from 'react';

// Ícone para Andamentos do Sistema
const SystemIcon = () => (
    <svg className="h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.414-1.414L11 10.586V6z" clipRule="evenodd" />
    </svg>
);

// Ícone para Comunicações Manuais
const CommunicationIcon = () => (
    <svg className="h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
        <path d="M2 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm1.707 2.293a1 1 0 00-1.414 1.414l5 5a1 1 0 001.414 0l5-5a1 1 0 00-1.414-1.414L10 10.586 3.707 7.293z" />
    </svg>
);

function Timeline({ events }) {
    if (!events || events.length === 0) {
        return (
            <div className="bg-white shadow-md rounded-lg p-6 text-center text-gray-500">
                Nenhum evento registrado para este caso.
            </div>
        );
    }

    return (
        <div className="bg-white shadow-md rounded-lg p-6">
            <div className="flow-root">
                <ul className="-mb-8">
                    {events.map((event, index) => (
                        <li key={`${event.type}-${event.timestamp}-${index}`}>
                            <div className="relative pb-8">
                                {index !== events.length - 1 ? (
                                    <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true"></span>
                                ) : null}
                                <div className="relative flex items-start space-x-3">
                                    <div>
                                        <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${event.type === 'Andamento' ? 'bg-blue-500' : 'bg-green-500'}`}>
                                            {event.type === 'Andamento' ? <SystemIcon /> : <CommunicationIcon />}
                                        </span>
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div>
                                            <div className="flex justify-between items-center">
                                                <p className="text-sm font-semibold text-gray-800">
                                                    {event.type === 'Andamento' ? event.event_specific_details.movement_type : event.event_specific_details.communication_type}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {new Date(event.timestamp).toLocaleString('pt-BR')}
                                                </p>
                                            </div>
                                            <p className="mt-0.5 text-sm text-gray-500">
                                                Por: {event.actor ? event.actor.email : 'Sistema'}
                                            </p>
                                        </div>
                                        <div className="mt-2 text-sm text-gray-700 bg-gray-50 p-3 rounded-md border">
                                            {event.type === 'Comunicação' && (
                                                <p className="font-semibold mb-2">Assunto: {event.event_specific_details.subject}</p>
                                            )}
                                            <div dangerouslySetInnerHTML={{ __html: event.content }} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

export default Timeline;