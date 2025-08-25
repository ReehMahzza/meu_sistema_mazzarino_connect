import React from 'react';

// 1. Definição das Fases do Workflow (Caminho Padrão)
const workflowPhases = [
    { id: 'ONBOARDING', name: 'Onboarding' },
    { id: 'VALIDACAO_DOCUMENTAL', name: 'Validação' },
    { id: 'EXTRACAO_DADOS', name: 'Extração' },
    { id: 'ANALISE_FINANCEIRA_PREL', name: 'Análise Preliminar' },
    { id: 'PRE_ANALISE_FINAL', name: 'Pré-Análise Final' },
    { id: 'FASE_COMERCIAL', name: 'Comercial' },
    { id: 'PROPOSTA_COMERCIAL', name: 'Proposta' },
    { id: 'AGUARDANDO_TAXAS', name: 'Taxas' },
    { id: 'ANALISE_TECNICA', name: 'Análise Técnica' },
    { id: 'VALIDACAO_E_CONVERSAO', name: 'Conversão' },
    { id: 'FINALIZADO', name: 'Finalizado' },
];

function ProgressBar({ currentStatus }) {
    const currentIndex = workflowPhases.findIndex(phase => phase.id === currentStatus);

    const isCompleted = (index) => {
        if (currentStatus === 'FINALIZADO') return true;
        return index < currentIndex;
    }
    const isCurrent = (index) => index === currentIndex;

    return (
        <div className="bg-white shadow-md rounded-lg p-4">
            <h3 className="text-md font-semibold text-gray-700 mb-4">Fases do Protocolo</h3>
            <div className="w-full overflow-x-auto pb-4">
                <div className="flex items-start min-w-max px-2">
                    {workflowPhases.map((phase, index) => {
                        const completed = isCompleted(index);
                        const current = isCurrent(index);

                        return (
                            <div key={phase.id} className="flex-1 flex items-start group">
                                <div className="flex flex-col items-center">
                                    <div
                                        className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300
                                            ${completed ? 'bg-blue-600' : 'bg-gray-300'}
                                            ${current ? 'w-8 h-8 bg-blue-600 ring-4 ring-blue-200 animate-pulse' : ''}`
                                        }
                                    >
                                        {completed && (
                                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                                            </svg>
                                        )}
                                    </div>
                                    <p className={`text-xs text-center mt-2 w-24 transition-all duration-300
                                        ${completed ? 'text-gray-700' : 'text-gray-500'}
                                        ${current ? 'font-bold text-blue-600' : ''}`
                                    }>
                                        {phase.name}
                                    </p>
                                </div>
                                {index < workflowPhases.length - 1 && (
                                    <div className={`flex-1 h-1 mt-3 transition-all duration-300
                                        ${completed ? 'bg-blue-600' : 'bg-gray-300'}`
                                    }>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

// ESTA É A LINHA CRUCIAL QUE PROVAVELMENTE ESTAVA EM FALTA
export default ProgressBar;