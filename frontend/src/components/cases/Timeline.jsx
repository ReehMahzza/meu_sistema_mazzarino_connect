// frontend/src/components/cases/Timeline.jsx
import React from 'react';

function Timeline({ movements }) {
    if (!movements || movements.length === 0) {
        return (
            <div className="bg-white shadow-md rounded-lg p-6 text-center text-gray-500">
                Nenhum andamento registrado para este caso.
            </div>
        );
    }

    return (
        <div className="bg-white shadow-md rounded-lg p-6">
            <div className="flow-root">
                <ul className="-mb-8">
                    {movements.map((movement, index) => (
                        <li key={movement.id}>
                            <div className="relative pb-8">
                                {index !== movements.length - 1 ? (
                                    <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true"></span>
                                ) : null}
                                <div className="relative flex items-start space-x-3">
                                    <div>
                                        <span className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center ring-8 ring-white">
                                            <svg className="h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.414-1.414L11 10.586V6z" clipRule="evenodd" />
                                            </svg>
                                        </span>
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div>
                                            <div className="flex justify-between items-center">
                                                <p className="text-sm font-semibold text-gray-800">
                                                    {movement.movement_type}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {new Date(movement.timestamp).toLocaleString('pt-BR')}
                                                </p>
                                            </div>
                                            <p className="mt-0.5 text-sm text-gray-500">
                                                Por: {movement.actor.email}
                                            </p>
                                        </div>
                                        {movement.content && (
                                            <div className="mt-2 text-sm text-gray-700 bg-gray-50 p-3 rounded-md border">
                                                <p>{movement.content}</p>
                                            </div>
                                        )}
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