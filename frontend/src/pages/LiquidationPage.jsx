import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import MainLayout from '../components/MainLayout';

function LiquidationPage() {
    const { axiosInstance } = useContext(AuthContext);
    const navigate = useNavigate();

    const [cases, setCases] = useState([]);
    const [selectedCase, setSelectedCase] = useState(null);
    const [liquidationData, setLiquidationData] = useState({
        bank_payment_status: 'Aguardando Pagamento Banco',
        client_liquidation_date: '',
        commission_value: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const BANK_PAYMENT_CHOICES = [
        ['Aguardando Pagamento Banco', 'Aguardando Pagamento Banco'],
        ['Pago pelo Banco', 'Pago pelo Banco'],
        ['Reembolso Solicitado', 'Reembolso Solicitado'],
        ['Disputa', 'Disputa'],
    ];

    // Busca os casos do usuário ao carregar a página
    useEffect(() => {
        const fetchCases = async () => {
            try {
                const response = await axiosInstance.get('/api/cases/');
                setCases(response.data);
            } catch (err) {
                console.error("Erro ao buscar casos:", err.response?.data || err.message);
                setError("Não foi possível carregar a lista de casos.");
            } finally {
                setLoading(false); // Garante que o loading seja false
            }
        };
        fetchCases();
    }, [axiosInstance]);

    // Carrega detalhes do caso selecionado e preenche o formulário
    const handleCaseSelect = useCallback((caseId) => {
        const caseDetails = cases.find(c => c.id.toString() === caseId);
        if (caseDetails) {
            setSelectedCase(caseDetails);
            setLiquidationData({
                bank_payment_status: caseDetails.bank_payment_status,
                client_liquidation_date: caseDetails.client_liquidation_date || '',
                commission_value: caseDetails.commission_value || ''
            });
            setError('');
            setSuccess('');
        } else {
            setSelectedCase(null);
            setLiquidationData({
                bank_payment_status: 'Aguardando Pagamento Banco',
                client_liquidation_date: '',
                commission_value: ''
            });
        }
    }, [cases]);

    const handleChange = (e) => {
        setLiquidationData({ ...liquidationData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedCase) {
            setError("Por favor, selecione um caso.");
            return;
        }
        setError('');
        setSuccess('');
        setLoading(true);

        const dataToUpdate = Object.fromEntries(
            Object.entries(liquidationData).filter(([_, v]) => v !== '' && v !== null)
        );
        // Garante que o valor da comissão seja enviado como número
        if (dataToUpdate.commission_value) {
            dataToUpdate.commission_value = parseFloat(dataToUpdate.commission_value);
        }

        try {
            await axiosInstance.patch(`/api/cases/${selectedCase.id}/liquidate/`, dataToUpdate);
            setSuccess('Status da liquidação salvo com sucesso! O andamento foi registrado.');

            setTimeout(() => {
                navigate('/documents');
            }, 2500);

        } catch (err) {
            console.error("Erro ao salvar liquidação:", err.response?.data);
            setError(err.response?.data?.error || "Ocorreu um erro ao salvar os dados.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <MainLayout>
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Liquidação Financeira</h2>
            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-lg max-w-2xl mx-auto">
                <div className="mb-6">
                    <label htmlFor="case-select" className="block text-lg font-medium text-gray-800 mb-2">
                        Selecione o Caso
                    </label>
                    <select
                        id="case-select"
                        value={selectedCase ? selectedCase.id : ''} // Vincula ao ID do caso selecionado
                        onChange={(e) => handleCaseSelect(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        required
                    >
                        <option value="" disabled>-- Escolha um caso --</option>
                        {cases.length > 0 ? cases.map(c => (
                            <option key={c.id} value={c.id}>
                                {c.title} (Cliente: {c.client?.email || c.client_email || 'Não informado'})
                            </option>
                        )) : (
                            <option value="" disabled>Carregando casos ou nenhum caso encontrado.</option>
                        )}
                    </select>
                </div>

                {selectedCase && (
                    <div className="space-y-8 animate-fade-in">
                        <div className="p-6 border rounded-lg space-y-4">
                            <h3 className="text-xl font-semibold text-gray-700">Gestão da Liquidação</h3>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Status do Pagamento do Banco</label>
                                <select
                                    name="bank_payment_status"
                                    value={liquidationData.bank_payment_status}
                                    onChange={handleChange}
                                    className="w-full p-2 border rounded-md"
                                >
                                    {BANK_PAYMENT_CHOICES.map(choice => (
                                        <option key={choice[0]} value={choice[0]}>{choice[1]}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Valor da Comissão (R$)</label>
                                <input
                                    type="number"
                                    name="commission_value"
                                    step="0.01"
                                    placeholder="Ex: 1500.50"
                                    value={liquidationData.commission_value}
                                    onChange={handleChange}
                                    className="w-full p-2 border rounded-md"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Data de Liquidação ao Cliente</label>
                                <input
                                    type="date"
                                    name="client_liquidation_date"
                                    value={liquidationData.client_liquidation_date}
                                    onChange={handleChange}
                                    className="w-full p-2 border rounded-md"
                                />
                            </div>
                        </div>

                        <div className="pt-6">
                            {error && <p className="text-red-500 text-center mb-4 p-3 bg-red-100 rounded-md">{error}</p>}
                            {success && <p className="text-green-600 text-center mb-4 p-3 bg-green-100 rounded-md">{success}</p>}
                            <button
                                type="submit"
                                disabled={loading || success}
                                className="w-full py-3 px-4 bg-emerald-600 text-white font-bold rounded-lg shadow-md hover:bg-emerald-700 disabled:bg-emerald-400 disabled:cursor-not-allowed transition-all"
                            >
                                {loading ? 'Salvando...' : 'Salvar Status da Liquidação'}
                            </button>
                        </div>
                    </div>
                )}
            </form>
        </MainLayout>
    );
}

export default LiquidationPage;