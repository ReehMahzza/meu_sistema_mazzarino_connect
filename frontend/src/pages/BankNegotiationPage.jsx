    /*
    ================================================================================
    ARQUIVO: frontend/src/pages/BankNegotiationPage.jsx (REFATORADO E CORRIGIDO)
    ================================================================================
    */
    import React, { useState, useEffect, useContext, useCallback } from 'react';
    import { useNavigate } from 'react-router-dom';
    import AuthContext from '../context/AuthContext';
    import MainLayout from '../components/MainLayout';
    // ADICIONADO: Imports dos novos componentes de UI
    import Input from '../components/ui/Input';
    import Select from '../components/ui/Select';
    import Textarea from '../components/ui/Textarea';
    import Button from '../components/ui/Button';
    import MessageAlert from '../components/ui/MessageAlert';

    function BankNegotiationPage() {
        const { axiosInstance } = useContext(AuthContext);
        const navigate = useNavigate();

        const [cases, setCases] = useState([]);
        const [selectedCase, setSelectedCase] = useState(null);
        const [negotiationData, setNegotiationData] = useState({
            dossier_sent_date: '',
            bank_response_status: 'Aguardando Resposta',
            counterproposal_details: ''
        });
        const [loading, setLoading] = useState(false);
        const [error, setError] = useState('');
        const [success, setSuccess] = useState('');

        const BANK_RESPONSE_CHOICES = [
            { value: 'Aguardando Resposta', label: 'Aguardando Resposta' },
            { value: 'Aceita', label: 'Aceita' },
            { value: 'Negada', label: 'Negada' },
            { value: 'Reuniao Solicitada', label: 'Reunião Solicitada' },
            { value: 'Contraproposta', label: 'Contraproposta' },
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
                    setLoading(false);
                }
            };
            fetchCases();
        }, [axiosInstance]);

        // Carrega detalhes do caso selecionado e preenche o formulário
        const handleCaseSelect = useCallback((caseId) => {
            const caseDetails = cases.find(c => c.id.toString() === caseId);
            if (caseDetails) {
                setSelectedCase(caseDetails);
                setNegotiationData({
                    dossier_sent_date: caseDetails.dossier_sent_date || '',
                    bank_response_status: caseDetails.bank_response_status,
                    counterproposal_details: caseDetails.counterproposal_details || ''
                });
                setError('');
                setSuccess('');
            } else {
                setSelectedCase(null);
                setNegotiationData({
                    dossier_sent_date: '',
                    bank_response_status: 'Aguardando Resposta',
                    counterproposal_details: ''
                });
            }
        }, [cases]);

        const handleChange = (e) => {
            setNegotiationData({ ...negotiationData, [e.target.name]: e.target.value });
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
                Object.entries(negotiationData).filter(([_, v]) => v !== '' && v !== null)
            );

            try {
                await axiosInstance.patch(`/api/cases/${selectedCase.id}/negotiate/`, dataToUpdate);
                setSuccess('Status da negociação salvo com sucesso! O andamento foi registrado.');
                
                setTimeout(() => {
                    navigate('/documents');
                }, 2500);

            } catch (err) {
                console.error("Erro ao salvar negociação:", err.response?.data);
                setError(err.response?.data?.error || "Ocorreu um erro ao salvar os dados.");
            } finally {
                setLoading(false);
            }
        };

        return (
            <MainLayout>
                <h2 className="text-3xl font-bold text-gray-800 mb-6">Negociação com Instituição Financeira</h2>
                
                <div className="bg-white p-8 rounded-lg shadow-lg max-w-2xl mx-auto">
                    {error && (<div className="mb-4"><MessageAlert message={error} type="error" /></div>)}
                    {success && (<div className="mb-4"><MessageAlert message={success} type="success" /></div>)}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Seleção de Caso */}
                        <div className="mb-6">
                            <label htmlFor="case-select" className="block text-lg font-medium text-gray-800 mb-2">
                                Selecione o Caso
                            </label>
                            <Select
                                id="case-select"
                                name="selectedCaseId"
                                value={selectedCase ? selectedCase.id : ''}
                                onChange={(e) => handleCaseSelect(e.target.value)}
                                // <-- CORRIGIDO AQUI!
                                                                options={cases.map(c => ({ value: c.id, label: `${c.title} (Cliente: ${c.client_detail?.email || 'N/A'})` }))}
                                required
                            />
                        </div>

                        {selectedCase && (
                            <div className="space-y-8 animate-fade-in">
                                {/* Detalhes do Caso Selecionado */}
                                <div className="p-6 border rounded-lg space-y-4">
                                    <h3 className="text-xl font-semibold text-gray-700 mb-4">Detalhes do Caso Selecionado: <span className="text-blue-600">{selectedCase.title}</span></h3>
                                    <p className="text-gray-600 text-sm">Descrição: {selectedCase.description || 'N/A'}</p>
                                    <p className="text-gray-600 text-sm">Status Atual: {selectedCase.current_status}</p>
                                    <p className="text-gray-600 text-sm">Cliente: {selectedCase.client_detail?.email || 'N/A'}</p>
                                </div>

                                {/* Seção Gestão da Negociação */}
                                <div className="p-6 border rounded-lg space-y-4">
                                    <h3 className="text-xl font-bold text-gray-700 mb-4">Gestão da Negociação</h3>
                                    <Input
                                        label="Data de Envio do Dossiê ao Banco"
                                        type="date"
                                        name="dossier_sent_date"
                                        value={negotiationData.dossier_sent_date}
                                        onChange={handleChange}
                                    />
                                    <Select
                                        label="Resposta do Banco"
                                        name="bank_response_status"
                                        value={negotiationData.bank_response_status}
                                        onChange={handleChange}
                                        options={BANK_RESPONSE_CHOICES}
                                        required
                                    />
                                    {negotiationData.bank_response_status === 'Contraproposta' && (
                                        <Textarea
                                            label="Detalhes da Contraproposta"
                                            name="counterproposal_details"
                                            rows="4"
                                            value={negotiationData.counterproposal_details}
                                            onChange={handleChange}
                                            placeholder="Descreva os detalhes da contraproposta recebida do banco..."
                                        />
                                    )}
                                </div>
                                <div className="flex justify-end pt-6">
                                    <Button type="submit" disabled={loading || !!success} variant="primary">
                                        {loading ? 'Salvando...' : 'Salvar Status da Negociação'}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </form>
                </div>
                </MainLayout>
            );
        }

        export default BankNegotiationPage;
    