// frontend/src/components/cases/FinancialTab.jsx
import React from 'react';

function FinancialTab({ protocol }) {

    // Função para formatar valor monetário
    const formatCurrency = (value) => {
        if (value === null || value === undefined || value === '') {
            return 'Não informado';
        }
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        }).format(value);
    };

    // Função para formatar data
    const formatDate = (dateString) => {
        if (!dateString) {
            return 'Não informado';
        }
        const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
        // Adiciona T00:00:00 para evitar problemas de fuso horário
        return new Date(dateString + 'T00:00:00').toLocaleDateString('pt-BR', options);
    };

    return (
        <div className="bg-white shadow-md rounded-lg p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">Resumo Financeiro</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Card para Valor da Comissão */}
                <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm font-medium text-gray-500">Valor da Comissão</p>
                    <p className="text-2xl font-bold text-green-600">{formatCurrency(protocol.commission_value)}</p>
                </div>

                {/* Card para Status do Pagamento do Banco */}
                <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm font-medium text-gray-500">Status Pagamento Banco</p>
                    <p className="text-lg font-semibold text-gray-800">{protocol.bank_payment_status || '-'}</p>
                </div>

                {/* Card para Data de Liquidação */}
                <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm font-medium text-gray-500">Data de Liquidação ao Cliente</p>
                    <p className="text-lg font-semibold text-gray-800">{formatDate(protocol.client_liquidation_date)}</p>
                </div>
            </div>
        </div>
    );
}

export default FinancialTab;