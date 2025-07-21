// frontend/src/components/cases/CaseHeader.jsx
import React from 'react';

function CaseHeader({ protocol }) {
    if (!protocol) {
        return null; // Não renderiza nada se não houver dados
    }

    // Mapeamento de valores para exibição amigável
    const contractTypeMap = {
        'renegociacao_consignado': 'Renegociação Consignado INSS',
        'credito_pessoal': 'Crédito Pessoal',
        'financiamento_veicular': 'Financiamento Veicular',
        'financiamento_imovel': 'Financiamento Imóvel',
        'cartao_consignado': 'Cartão Consignado',
        'cartao_beneficio': 'Cartão Benefício',
    };

    return (
        <div className="bg-white shadow-lg rounded-lg p-6 mb-6">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">{protocol.title}</h1>
                    <p className="text-sm text-gray-500 mt-1">Protocolo ID: {protocol.id}</p>
                </div>
                <span className="px-3 py-1 text-sm font-semibold rounded-full bg-blue-100 text-blue-800">
                    {protocol.current_status}
                </span>
            </div>
            <div className="border-t border-gray-200 mt-4 pt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <h3 className="text-xs font-semibold text-gray-500 uppercase">Cliente</h3>
                    <p className="text-md text-gray-800">{protocol.client.email}</p>
                </div>
                <div>
                    <h3 className="text-xs font-semibold text-gray-500 uppercase">Tipo de Contrato</h3>
                    <p className="text-md text-gray-800">{contractTypeMap[protocol.contract_type] || protocol.contract_type}</p>
                </div>
                <div>
                    <h3 className="text-xs font-semibold text-gray-500 uppercase">Instituição Financeira</h3>
                    <p className="text-md text-gray-800">{protocol.bank_name || 'Não informado'}</p>
                </div>
            </div>
        </div>
    );
}

export default CaseHeader;