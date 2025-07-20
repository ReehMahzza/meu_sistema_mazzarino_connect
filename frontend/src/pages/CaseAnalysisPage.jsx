        /*
        ================================================================================
        ARQUIVO: frontend/src/pages/CaseAnalysisPage.jsx (REFATORADO E CORRIGIDO)
        ================================================================================
        */
        import React, { useState, useEffect, useContext, useCallback } from 'react';
        import { useNavigate } from 'react-router-dom'; // <-- ADICIONADO AQUI!
        import AuthContext from '../context/AuthContext';
        import MainLayout from '../components/MainLayout';
        // ADICIONADO: Imports dos novos componentes de UI
        import Input from '../components/ui/Input';
        import Select from '../components/ui/Select';
        import Textarea from '../components/ui/Textarea';
        import Button from '../components/ui/Button';
        import MessageAlert from '../components/ui/MessageAlert';

        function CaseAnalysisPage() {
            const { axiosInstance } = useContext(AuthContext);
            const navigate = useNavigate(); // Hook useNavigate

            const [cases, setCases] = useState([]);
            const [selectedCaseId, setSelectedCaseId] = useState('');
            const [caseDetails, setCaseDetails] = useState(null);
            const [iaAnalysisResult, setIaAnalysisResult] = useState('Aguardando Análise');
            const [humanAnalysisResult, setHumanAnalysisResult] = useState('Aguardando Análise');
            const [technicalReportContent, setTechnicalReportContent] = useState('');

            const [loadingCases, setLoadingCases] = useState(true);
            const [loadingCaseDetails, setLoadingCaseDetails] = useState(false);
            const [submitting, setSubmitting] = useState(false);
            const [message, setMessage] = useState({ type: '', text: '' });
            const [success, setSuccess] = useState('');

            const IA_ANALYSIS_CHOICES = [
                { value: 'Aguardando Análise', label: 'Aguardando Análise' },
                { value: 'Potencialmente Abusivo', label: 'Potencialmente Abusivo' },
                { value: 'Não Abusivo', label: 'Não Abusivo' },
            ];
            const HUMAN_ANALYSIS_CHOICES = [
                { value: 'Aguardando Análise', label: 'Aguardando Análise' },
                { value: 'Viável', label: 'Viável' },
                { value: 'Não Viável', label: 'Não Viável' },
            ];

            // Busca os casos do usuário ao carregar a página
            useEffect(() => {
                const fetchCases = async () => {
                    setLoadingCases(true);
                    try {
                        const response = await axiosInstance.get('/api/cases/');
                        setCases(response.data);
                    } catch (err) {
                        console.error("Erro ao buscar casos para análise:", err.response?.data || err.message);
                        setMessage({ type: 'error', text: "Não foi possível carregar a lista de casos para análise." });
                    } finally {
                        setLoadingCases(false);
                    }
                };
                fetchCases();
            }, [axiosInstance]);

            // Busca detalhes do caso selecionado e preenche o formulário
            useEffect(() => {
                if (selectedCaseId) {
                    const fetchCaseDetails = async () => {
                        setLoadingCaseDetails(true);
                        try {
                            const response = await axiosInstance.get(`/api/cases/${selectedCaseId}/`);
                            setCaseDetails(response.data);
                            setIaAnalysisResult(response.data.ia_analysis_result || 'Aguardando Análise');
                            setHumanAnalysisResult(response.data.human_analysis_result || 'Aguardando Análise');
                            setTechnicalReportContent(response.data.technical_report_content || '');
                            setMessage({ type: '', text: '' });
                            setSuccess('');
                        } catch (err) {
                            console.error("Erro ao buscar detalhes do caso:", err.response?.data || err.message);
                            setMessage({ type: 'error', text: "Não foi possível carregar os detalhes do caso selecionado." });
                            setCaseDetails(null);
                        } finally {
                            setLoadingCaseDetails(false);
                        }
                    };
                    fetchCaseDetails();
                } else {
                    setCaseDetails(null);
                }
            }, [selectedCaseId, axiosInstance]);


            // Lógica de submissão para Análise da IA
            const handleIaSubmit = async (e) => {
                e.preventDefault();
                if (!selectedCaseId || !iaAnalysisResult) {
                    setMessage({ type: 'error', text: "Selecione um caso e um resultado para a Análise IA." });
                    return;
                }
                setSubmitting(true);
                setMessage({ type: '', text: '' });
                setSuccess('');

                try {
                    await axiosInstance.patch(`/api/cases/${selectedCaseId}/analyze/`, {
                        ia_analysis_result: iaAnalysisResult,
                    });
                    setSuccess('Resultado da Análise IA salvo com sucesso!');
                    const response = await axiosInstance.get(`/api/cases/${selectedCaseId}/`);
                    setCaseDetails(response.data);
                } catch (err) {
                    console.error("Erro ao salvar análise IA:", err.response?.data || err.message);
                    setMessage({ type: 'error', text: err.response?.data?.error || "Falha ao salvar resultado da Análise IA." });
                } finally {
                    setSubmitting(false);
                }
            };

            // Lógica de submissão para Parecer Técnico
            const handleHumanSubmit = async (e) => {
                e.preventDefault();
                if (!selectedCaseId || !humanAnalysisResult || !technicalReportContent) {
                    setMessage({ type: 'error', text: "Selecione um caso, um resultado e preencha o parecer técnico." });
                    return;
                }
                setSubmitting(true);
                setMessage({ type: '', text: '' });
                setSuccess('');

                try {
                    await axiosInstance.patch(`/api/cases/${selectedCaseId}/analyze/`, {
                        human_analysis_result: humanAnalysisResult,
                        technical_report_content: technicalReportContent,
                    });
                    setSuccess('Parecer Técnico salvo com sucesso!');
                    const response = await axiosInstance.get(`/api/cases/${selectedCaseId}/`);
                    setCaseDetails(response.data);
                } catch (err) {
                    console.error("Erro ao salvar parecer técnico:", err.response?.data || err.message);
                    setMessage({ type: 'error', text: err.response?.data?.error || "Falha ao salvar Parecer Técnico." });
                } finally {
                    setSubmitting(false);
                }
            };


            return (
                <MainLayout>
                    <h2 className="text-3xl font-bold text-gray-800 mb-6">Análise e Parecer Técnico</h2>
                    
                    <div className="bg-white p-8 rounded-lg shadow-lg max-w-4xl mx-auto">
                        {message.text && (<div className="mb-4"><MessageAlert message={message.text} type={message.type} /></div>)}
                        {success && (<div className="mb-4"><MessageAlert message={success} type="success" /></div>)}

                        <div className="space-y-6">
                            {/* Seleção de Caso */}
                            <div>
                                <label htmlFor="case-select" className="block text-sm font-medium text-gray-700 mb-1">
                                    Selecione o Caso
                                </label>
                                <Select
                                    id="case-select"
                                    name="selectedCaseId"
                                    value={selectedCaseId}
                                    onChange={(e) => setSelectedCaseId(e.target.value)}
                                    options={cases.map(c => ({ value: c.id, label: `${c.title} (ID: ${c.id}) - Status: ${c.current_status}` }))}
                                    required
                                    disabled={loadingCases}
                                />
                            </div>

                            {selectedCaseId && loadingCaseDetails ? (
                                <div className="text-center p-4">Carregando detalhes do caso...</div>
                            ) : selectedCaseId && caseDetails ? (
                                <>
                                    {/* Detalhes do Caso Selecionado */}
                                    <div className="border-t pt-6 mt-6">
                                        <h3 className="text-xl font-semibold text-gray-700 mb-4">Detalhes do Caso Selecionado: <span className="text-blue-600">{caseDetails.title}</span></h3>
                                        <p className="text-gray-600 text-sm">Descrição: {caseDetails.description || 'N/A'}</p>
                                        <p className="text-gray-600 text-sm">Status Atual: {caseDetails.current_status}</p>
                                        <p className="text-gray-600 text-sm">Criado por: {caseDetails.created_by?.email || 'N/A'} em {new Date(caseDetails.created_at).toLocaleDateString('pt-BR')}</p>
                                        <p className="text-gray-600 text-sm">Cliente: {caseDetails.client_detail?.email || 'N/A'}</p>
                                    </div>

                                    {/* Seção Análise Preliminar por IA */}
                                    <div className="border-t pt-6 mt-6">
                                        <h3 className="text-xl font-bold text-gray-700 mb-4">Resultado da Análise Preliminar por IA</h3>
                                        <form onSubmit={handleIaSubmit} className="space-y-4">
                                            <Select
                                                label="Resultado da IA"
                                                name="ia-result"
                                                value={iaAnalysisResult}
                                                onChange={(e) => setIaAnalysisResult(e.target.value)}
                                                options={IA_ANALYSIS_CHOICES}
                                                required
                                            />
                                            <div className="flex justify-end">
                                                <Button type="submit" disabled={submitting} variant="primary">
                                                    {submitting ? 'Salvando...' : 'Salvar Resultado da IA'}
                                                </Button>
                                            </div>
                                        </form>
                                    </div>

                                    {/* Seção Análise Aprofundada e Parecer Técnico */}
                                    <div className="border-t pt-6 mt-6">
                                        <h3 className="text-xl font-bold text-gray-700 mb-4">Análise Aprofundada e Parecer Técnico</h3>
                                        <form onSubmit={handleHumanSubmit} className="space-y-4">
                                            <Select
                                                label="Resultado Análise Humana"
                                                name="human-result"
                                                value={humanAnalysisResult}
                                                onChange={(e) => setHumanAnalysisResult(e.target.value)}
                                                options={HUMAN_ANALYSIS_CHOICES}
                                                required
                                            />
                                            <Textarea
                                                label="Conteúdo do Parecer Técnico"
                                                name="technicalReportContent"
                                                rows="8"
                                                value={technicalReportContent}
                                                onChange={(e) => setTechnicalReportContent(e.target.value)}
                                                placeholder="Detalhe aqui a análise aprofundada e o parecer técnico."
                                                required
                                            />
                                            <div className="flex justify-end">
                                                <Button type="submit" disabled={submitting} variant="success">
                                                    {submitting ? 'Salvando...' : 'Salvar Parecer Técnico'}
                                                </Button>
                                            </div>
                                        </form>
                                    </div>
                                </>
                            ) : (
                                <div className="bg-white p-6 rounded-lg shadow text-center text-gray-500">
                                    <p>Selecione um caso acima para iniciar a análise.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </MainLayout>
            );
        }

        export default CaseAnalysisPage;
        