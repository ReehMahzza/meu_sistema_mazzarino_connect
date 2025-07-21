// frontend/src/components/cases/ProtocolSummaryTab.jsx
import React from 'react';

function ProtocolSummaryTab({ protocol }) {

    // Função para formatar data
    const formatDate = (dateString) => {
        if (!dateString) {
            return 'Não preenchido';
        }
        const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
        return new Date(dateString + 'T00:00:00').toLocaleDateString('pt-BR', options);
    };

    // Componente para exibir um item do resumo
    const SummaryItem = ({ label, value, isBlock = false }) => (
        <div className={isBlock ? "col-span-1 md:col-span-2" : ""}>
            <dt className="text-sm font-medium text-gray-500">{label}</dt>
            <dd className={`mt-1 text-md text-gray-900 ${isBlock ? 'whitespace-pre-wrap bg-gray-50 p-3 rounded-md border' : ''}`}>
                {value || '-'}
            </dd>
        </div>
    );

    return (
        <div className="bg-white shadow-md rounded-lg p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">Resumo da Análise e Proposta</h3>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8">
                <SummaryItem label="Resultado da Análise por IA" value={protocol.ia_analysis_result} />
                <SummaryItem label="Resultado da Análise Humana" value={protocol.human_analysis_result} />
                <SummaryItem label="Data de Envio da Proposta" value={formatDate(protocol.proposal_sent_date)} />
                <SummaryItem label="Decisão do Cliente sobre a Proposta" value={protocol.client_decision} />
                <SummaryItem label="Conteúdo do Parecer Técnico" value={protocol.technical_report_content} isBlock={true} />
            </dl>
        </div>
    );
}

export default ProtocolSummaryTab;