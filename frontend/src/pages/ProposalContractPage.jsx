    /*
    ================================================================================
    ARQUIVO: frontend/src/pages/ProposalContractPage.jsx (REFATORADO E CORRIGIDO)
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

    function ProposalContractPage() {
        const { axiosInstance } = useContext(AuthContext);
        const navigate = useNavigate();

        const [cases, setCases] = useState([]);
        const [selectedCase, setSelectedCase] = useState(null);
        const [proposalData, setProposalData] = useState({
            proposal_sent_date: '',
            client_decision: 'Aguardando Decisão',
            docusign_status: 'Não Enviado',
        });
        const [loading, setLoading] = useState(false);
        const [error, setError] = useState('');
        const [success, setSuccess] = useState('');

        const PROPOSAL_DECISION_CHOICES = [
            { value: 'Aguardando Decisão', label: 'Aguardando Decisão' },
            { value: 'Aceita', label: 'Aceita' },
            { value: 'Rejeita', label: 'Rejeita' },
        ];
        const DOCUSIGN_STATUS_CHOICES = [
            { value: 'Não Enviado', label: 'Não Enviado' },
            { value: 'Enviado', label: 'Enviado' },
            { value: 'Assinado', label: 'Assinado' },
            { value: 'Recusado', label: 'Recusado' },
        ];

        // Busca os casos do usuário ao carregar a página
        useEffect(() => {
            const fetchCases = async () => {
                try {
                    const response = await axiosInstance.get('/api/cases/');
                    setCases(response.data);
                } catch (err) {
                    console.error("Erro ao buscar casos para proposta:", err.response?.data || err.message);
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
                setProposalData({
                    proposal_sent_date: caseDetails.proposal_sent_date || '',
                    client_decision: caseDetails.client_decision || 'Aguardando Decisão',
                    docusign_status: caseDetails.docusign_status || 'Não Enviado',
                });
                setError('');
                setSuccess('');
            } else {
                setSelectedCase(null);
                setProposalData({
                    proposal_sent_date: '',
                    client_decision: 'Aguardando Decisão',
                    docusign_status: 'Não Enviado',
                });
            }
        }, [cases]);

        const handleChange = (e) => {
            setProposalData({ ...proposalData, [e.target.name]: e.target.value });
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
                    proposal_sent_date: proposalData.proposal_sent_date || null,
                    client_decision: proposalData.client_decision,
                    docusign_status: proposalData.docusign_status,
                };
                
                await axiosInstance.patch(`/api/cases/${selectedCase.id}/proposal-contract/`, payload);
                setSuccess('Proposta e status de contratação salvos com sucesso! O andamento foi registrado.');
                
                setTimeout(() => {
                    navigate('/documents');
                }, 2500);

            } catch (err) {
                console.error("Erro ao salvar proposta/contratação:", err.response?.data);
                setError(err.response?.data?.error || "Ocorreu um erro ao salvar os dados.");
            } finally {
                setLoading(false);
            }
        };

        return (
            <MainLayout>
                <h2 className="text-3xl font-bold text-gray-800 mb-6">Proposta de Renegociação e Contratação</h2>
                
                <div className="bg-white p-8 rounded-lg shadow-lg max-w-4xl mx-auto">
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
                                /* <-- CORRIGIDO AQUI! */
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
                                    <p className="text-sm text-gray-600">Status Atual: {selectedCase.current_status}</p>
                                    <p className="text-gray-600 text-sm">Cliente: {selectedCase.client_detail?.email || 'N/A'}</p>
                                </div>

                                {/* Seção Gestão da Proposta */}
                                <div className="p-6 border rounded-lg space-y-4">
                                    <h3 className="text-xl font-bold text-gray-700 mb-4">Gestão da Proposta</h3>
                                    <Input
                                        label="Data de Envio da Proposta"
                                        type="date"
                                        name="proposal_sent_date"
                                        value={proposalData.proposal_sent_date}
                                        onChange={handleChange}
                                    />
                                    <Select
                                        label="Decisão do Cliente"
                                        name="client_decision"
                                        value={proposalData.client_decision}
                                        onChange={handleChange}
                                        options={PROPOSAL_DECISION_CHOICES}
                                        required
                                    />
                                    <Select
                                        label="Status DocuSign"
                                        name="docusign_status"
                                        value={proposalData.docusign_status}
                                        onChange={handleChange}
                                        options={DOCUSIGN_STATUS_CHOICES}
                                        required
                                    />
                                </div>
                                <div className="flex justify-end pt-6">
                                    <Button type="submit" disabled={loading || !!success} variant="primary">
                                        {loading ? 'Salvando...' : 'Salvar Proposta/Decisão'}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </form>
                </div>
            </MainLayout>
        );
    }

    export default ProposalContractPage;
    