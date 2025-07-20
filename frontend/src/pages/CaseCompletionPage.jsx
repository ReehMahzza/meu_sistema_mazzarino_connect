    /*
    ================================================================================
    ARQUIVO: frontend/src/pages/CaseCompletionPage.jsx (REFATORADO E CORRIGIDO)
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
    import Checkbox from '../components/ui/Checkbox';

    function CaseCompletionPage() {
        const { axiosInstance } = useContext(AuthContext);
        const navigate = useNavigate();

        const [cases, setCases] = useState([]);
        const [selectedCase, setSelectedCase] = useState(null);
        const [completionData, setCompletionData] = useState({
            completion_date: '',
            final_communication_sent: false,
            survey_sent: false,
        });
        const [loading, setLoading] = useState(false);
        const [error, setError] = useState('');
        const [success, setSuccess] = useState('');

        // Busca os casos do usuário ao carregar a página
        useEffect(() => {
            const fetchCases = async () => {
                try {
                    const response = await axiosInstance.get('/api/cases/');
                    setCases(response.data);
                } catch (err) {
                    console.error("Erro ao buscar casos para encerramento:", err.response?.data || err.message);
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
                setCompletionData({
                    completion_date: caseDetails.completion_date || '',
                    final_communication_sent: caseDetails.final_communication_sent || false,
                    survey_sent: caseDetails.survey_sent || false,
                });
                setError('');
                setSuccess('');
            } else {
                setSelectedCase(null);
                setCompletionData({
                    completion_date: '',
                    final_communication_sent: false,
                    survey_sent: false,
                });
            }
        }, [cases]);

        const handleChange = (e) => {
            const { name, value, type, checked } = e.target;
            setCompletionData({
                ...completionData,
                [name]: type === 'checkbox' ? checked : value,
            });
        };

        const handleSubmit = async (e) => {
            e.preventDefault();
            if (!selectedCase) {
                setError("Por favor, selecione um caso.");
                return;
            }
            setLoading(true);
            setError('');
            setSuccess('');

            try {
                const payload = {
                    completion_date: completionData.completion_date || null,
                    final_communication_sent: completionData.final_communication_sent,
                    survey_sent: completionData.survey_sent,
                };
                
                await axiosInstance.patch(`/api/cases/${selectedCase.id}/complete/`, payload);
                setSuccess('Status de encerramento salvo com sucesso! O andamento foi registrado.');
                
                setTimeout(() => {
                    navigate('/documents');
                }, 2500);

            } catch (err) {
                console.error("Erro ao salvar encerramento:", err.response?.data);
                setError(err.response?.data?.error || "Ocorreu um erro ao salvar os dados.");
            } finally {
                setLoading(false);
            }
        };

        return (
            <MainLayout>
                <h2 className="text-3xl font-bold text-gray-800 mb-6">Encerramento e Arquivamento de Casos</h2>
                
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
                                options={cases.map(c => ({ value: c.id, label: `${c.title} (Cliente: ${c.client_detail?.email || 'N/A'})` }))} /* <-- CORRIGIDO AQUI! */
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

                                {/* Seção Gestão do Encerramento */}
                                <div className="p-6 border rounded-lg space-y-4">
                                    <h3 className="text-xl font-bold text-gray-700 mb-4">Gestão do Encerramento</h3>
                                    <Input
                                        label="Data de Conclusão do Caso"
                                        type="date"
                                        name="completion_date"
                                        value={completionData.completion_date}
                                        onChange={handleChange}
                                    />
                                    <div className="flex items-center">
                                        <Checkbox
                                            id="final_communication_sent"
                                            name="final_communication_sent"
                                            label="Comunicação Final Enviada ao Cliente"
                                            checked={completionData.final_communication_sent}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className="flex items-center">
                                        <Checkbox
                                            id="survey_sent"
                                            name="survey_sent"
                                            label="Pesquisa de Satisfação Enviada"
                                            checked={completionData.survey_sent}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-end pt-6">
                                    <Button type="submit" disabled={loading || !!success} variant="primary">
                                        {loading ? 'Salvando...' : 'Finalizar e Arquivar Caso'}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </form>
                </div>
            </MainLayout>
        );
    }

    export default CaseCompletionPage;
    