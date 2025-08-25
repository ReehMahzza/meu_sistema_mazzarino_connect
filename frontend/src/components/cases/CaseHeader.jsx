// frontend/src/components/cases/CaseHeader.jsx
import React from 'react';
import { QRCodeSVG } from 'qrcode.react';

// Componente para exibir um item de dado no cabeçalho
const InfoItem = ({ label, value, className = '' }) => (
    <div className={className}>
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</h3>
        <p className="text-md text-gray-800 break-words">{value || '-'}</p>
    </div>
);

function CaseHeader({ protocol }) {
    if (!protocol) return null;

    const contractTypeMap = {
        'renegociacao_consignado': 'Renegociação Consignado INSS',
        'credito_pessoal': 'Crédito Pessoal',
        'financiamento_veicular': 'Financiamento Veicular',
        'financiamento_imovel': 'Financiamento Imóvel',
        'cartao_consignado': 'Cartão Consignado',
        'cartao_beneficio': 'Cartão Benefício',
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Não preenchido';
        const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
        return new Date(dateString + 'T00:00:00').toLocaleDateString('pt-BR', options);
    };

    return (
        <div className="bg-white shadow-lg rounded-lg p-6 mb-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Coluna da Esquerda: Identificação do Protocolo */}
                <div className="lg:col-span-1 flex gap-4">
                    <div className="flex-shrink-0">
                        <QRCodeSVG 
                            value={window.location.href} 
                            size={80} 
                            bgColor={"#ffffff"}
                            fgColor={"#000000"}
                            level={"L"}
                            includeMargin={false}
                        />
                    </div>
                    <div className="flex-grow">
                        <span className="px-3 py-1 text-sm font-semibold rounded-full bg-blue-100 text-blue-800">
                            {protocol.current_status}
                        </span>
                        <h1 className="text-2xl font-bold text-gray-800 mt-2">{protocol.title}</h1>
                        <p className="text-sm text-gray-500 mt-1">Protocolo: {protocol.protocol_id}</p>
                        <InfoItem label="Banco" value={protocol.bank_name} className="mt-2" />
                        <InfoItem label="Tipo de Contrato" value={contractTypeMap[protocol.contract_type]} className="mt-2" />
                    </div>
                </div>

                {/* Coluna da Direita: Resumo da Análise e Proposta */}
                <div className="lg:col-span-2 border-t lg:border-t-0 lg:border-l border-gray-200 lg:pl-6 pt-6 lg:pt-0">
                    <h3 className="text-lg font-semibold text-gray-700 mb-4">Resumo da Análise e Proposta</h3>
                    <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                        <InfoItem label="Resultado Análise IA" value={protocol.ia_analysis_result} />
                        <InfoItem label="Resultado Análise Humana" value={protocol.human_analysis_result} />
                        <InfoItem label="Data de Envio da Proposta" value={formatDate(protocol.proposal_sent_date)} />
                        <InfoItem label="Decisão do Cliente" value={protocol.client_decision} />
                        <div className="md:col-span-2">
                             <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Parecer Técnico</h3>
                             <p className="mt-1 text-md text-gray-800 whitespace-pre-wrap bg-gray-50 p-3 rounded-md border">
                                 {protocol.technical_report_content || '-'}
                             </p>
                        </div>
                    </dl>
                </div>
            </div>
        </div>
    );
}

export default CaseHeader;