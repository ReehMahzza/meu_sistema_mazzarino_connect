        /*
        ================================================================================
        ARQUIVO: frontend/src/pages/LiquidationPage.jsx (REFATORADO)
        ================================================================================
        */
        import React, { useState, useEffect, useContext, useCallback } from 'react';
        import { useNavigate } from 'react-router-dom';
        import AuthContext from '../context/AuthContext';
        import MainLayout from '../components/MainLayout';
        // ADICIONADO: Imports dos novos componentes de UI
        import Input from '../components/ui/Input';
        import Select from '../components/ui/Select';
        import Button from '../components/ui/Button';
        import MessageAlert from '../components/ui/MessageAlert';

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
                { value: 'Aguardando Pagamento Banco', label: 'Aguardando Pagamento Banco' },
                { value: 'Pago pelo Banco', label: 'Pago pelo Banco' },
                { value: 'Reembolso Solicitado', label: 'Reembolso Solicitado' },
                { value: 'Disputa', label: 'Disputa' },
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
                            <Select
                                id="case-select"
                                name="selectedCaseId"
                                value={selectedCase ? selectedCase.id : ''}
                                onChange={(e) => handleCaseSelect(e.target.value)}
                                options={cases.map(c => ({ value: c.id, label: `${c.title} (Cliente: ${c.client_detail?.email || 'N/A'})` }))} // <-- CORRIGIDO AQUI!
                                required
                            />
                        </div>

                        {selectedCase && (
                            <div className="space-y-8 animate-fade-in">
                                <div className="p-6 border rounded-lg space-y-4">
                                    <h3 className="text-xl font-semibold text-gray-700">Gestão da Liquidação</h3>
                                    
                                    <Select
                                        label="Status do Pagamento do Banco"
                                        name="bank_payment_status"
                                        value={liquidationData.bank_payment_status}
                                        onChange={handleChange}
                                        options={BANK_PAYMENT_CHOICES}
                                        required
                                    />

                                    <Input
                                        label="Valor da Comissão (R$)"
                                        type="number"
                                        name="commission_value"
                                        step="0.01"
                                        placeholder="Ex: 1500.50"
                                        value={liquidationData.commission_value}
                                        onChange={handleChange}
                                    />

                                    <Input
                                        label="Data de Liquidação ao Cliente"
                                        type="date"
                                        name="client_liquidation_date"
                                        value={liquidationData.client_liquidation_date}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="pt-6">
                                    {error && <div className="mb-4"><MessageAlert message={error} type="error" /></div>}
                                    {success && <div className="mb-4"><MessageAlert message={success} type="success" /></div>}
                                    <Button
                                        type="submit"
                                        disabled={loading || !!success}
                                        variant="primary"
                                    >
                                        {loading ? 'Salvando...' : 'Salvar Status da Liquidação'}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </form>
                </MainLayout>
            );
        }

        export default LiquidationPage;
        