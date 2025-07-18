/*
================================================================================
ARQUIVO: frontend/src/pages/CaseAnalysisPage.jsx (CORRIGIDO: setSuccess e redirecionamento)
================================================================================
*/
import React, { useState, useEffect, useContext } from 'react';
import AuthContext from '../context/AuthContext';
import MainLayout from '../components/MainLayout';
import { useNavigate } from 'react-router-dom';

function CaseAnalysisPage() {
    const { axiosInstance } = useContext(AuthContext);
    const navigate = useNavigate();

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
    const [success, setSuccess] = useState(''); // <-- ADICIONADO: Estado para mensagem de sucesso

    const IA_ANALYSIS_CHOICES = [
        ['Aguardando Análise', 'Aguardando Análise'],
        ['Potencialmente Abusivo', 'Potencialmente Abusivo'],
        ['Não Abusivo', 'Não Abusivo'],
    ];
    const HUMAN_ANALYSIS_CHOICES = [
        ['Aguardando Análise', 'Aguardando Análise'],
        ['Viável', 'Viável'],
        ['Não Viável', 'Não Viável'],
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
                    setMessage({ type: '', text: '' }); // Limpa mensagens ao selecionar novo caso
                    setSuccess(''); // <-- ADICIONADO: Limpa sucesso também
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
            setCaseDetails(null); // Limpa detalhes se nenhum caso selecionado
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
        setSuccess(''); // <-- ADICIONADO: Limpa sucesso ao submeter

        try {
            await axiosInstance.patch(`/api/cases/${selectedCaseId}/analyze/`, {
                ia_analysis_result: iaAnalysisResult,
            });
            setSuccess('Resultado da Análise IA salvo com sucesso!'); // <-- CORRIGIDO
            // Redireciona e recarrega os detalhes do caso para ver o andamento
            setTimeout(() => {
                navigate('/documents'); // Redireciona para documentos
            }, 1500);
        } catch (err) {
            console.error("Erro ao salvar análise IA:", err.response?.data || err.message);
            setMessage({ type: 'error', text: "Falha ao salvar resultado da Análise IA." });
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
        setSuccess(''); // <-- ADICIONADO: Limpa sucesso ao submeter

        try {
            await axiosInstance.patch(`/api/cases/${selectedCaseId}/analyze/`, {
                human_analysis_result: humanAnalysisResult,
                technical_report_content: technicalReportContent,
            });
            setSuccess('Parecer Técnico salvo com sucesso!'); // <-- CORRIGIDO
            // Redireciona e recarrega os detalhes do caso para ver o andamento
            setTimeout(() => {
                navigate('/documents'); // Redireciona para documentos
            }, 1500);
        } catch (err) {
            console.error("Erro ao salvar parecer técnico:", err.response?.data || err.message);
            setMessage({ type: 'error', text: "Falha ao salvar Parecer Técnico." });
        } finally {
            setSubmitting(false);
        }
    };


    return (
        <MainLayout>
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Análise e Parecer Técnico</h2>

            <div className="bg-white p-8 rounded-lg shadow-lg max-w-4xl mx-auto">
                {/* Mensagens de erro/sucesso */}
                {message.text && (
                    <div className={`p-3 mb-4 rounded-md ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {message.text}
                    </div>
                )}
                {success && ( // <-- ADICIONADO: Exibe mensagem de sucesso
                    <div className="p-3 mb-4 rounded-md bg-green-100 text-green-700">
                        {success}
                    </div>
                )}
                <div className="space-y-6">
                    {/* Seleção de Caso */}
                    <div>
                        <label htmlFor="case-select" className="block text-sm font-medium text-gray-700 mb-1">
                            Selecione o Caso
                        </label>
                        <select
                            id="case-select"
                            value={selectedCaseId}
                            onChange={(e) => setSelectedCaseId(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                            required
                            disabled={loadingCases}
                        >
                            <option value="" disabled>
                                {loadingCases ? "Carregando casos..." : "-- Escolha um caso --"}
                            </option>
                            {cases.map(c => (
                                <option key={c.id} value={c.id}>
                                    {c.title} (ID: {c.id}) - Status: {c.current_status} - Cliente: {c.client?.email || 'N/A'} {/* Adicionado email do cliente */}
                                </option>
                            ))}
                        </select>
                    </div>

                    {selectedCaseId && loadingCaseDetails ? (
                        <div className="text-center p-4">Carregando detalhes do caso...</div>
                    ) : selectedCaseId && caseDetails ? (
                        <>
                            {/* Detalhes do Caso Selecionado */}
                            <div className="border-t pt-6 mt-6">
                                <h3 className="text-xl font-bold text-gray-700 mb-4">Detalhes do Caso Selecionado: <span className="text-blue-600">{caseDetails.title}</span></h3>
                                <p className="text-gray-600 text-sm">Descrição: {caseDetails.description || 'N/A'}</p>
                                <p className="text-gray-600 text-sm">Criado por: {caseDetails.created_by?.email || 'N/A'} em {new Date(caseDetails.created_at).toLocaleDateString('pt-BR')}</p>
                                <p className="text-gray-600 text-sm">Status Atual: {caseDetails.current_status}</p>
                                <p className="text-gray-600 text-sm">Cliente: {caseDetails.client?.email || 'N/A'}</p> {/* Exibir cliente */}
                            </div>

                            {/* Seção Análise Preliminar por IA */}
                            <div className="border-t pt-6 mt-6">
                                <h3 className="text-xl font-bold text-gray-700 mb-4">Resultado da Análise Preliminar por IA</h3>
                                <form onSubmit={handleIaSubmit} className="space-y-4">
                                    <div>
                                        <label htmlFor="ia-result" className="block text-sm font-medium text-gray-700 mb-1">Resultado da IA</label>
                                        <select
                                            id="ia-result"
                                            value={iaAnalysisResult}
                                            onChange={(e) => setIaAnalysisResult(e.target.value)}
                                            className="w-full p-2 border border-gray-300 rounded-md shadow-sm"
                                            required
                                        >
                                            {IA_ANALYSIS_CHOICES.map(choice => (
                                                <option key={choice[0]} value={choice[0]}>{choice[1]}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="flex justify-end">
                                        <button type="submit" disabled={submitting}
                                                className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg shadow hover:bg-blue-700 disabled:bg-blue-400">
                                            {submitting ? 'Salvando...' : 'Salvar Resultado da IA'}
                                        </button>
                                    </div>
                                </form>
                            </div>

                            {/* Seção Análise Aprofundada e Parecer Técnico */}
                            <div className="border-t pt-6 mt-6">
                                <h3 className="text-xl font-bold text-gray-700 mb-4">Análise Aprofundada e Parecer Técnico</h3>
                                <form onSubmit={handleHumanSubmit} className="space-y-4">
                                    <div>
                                        <label htmlFor="human-result" className="block text-sm font-medium text-gray-700 mb-1">Resultado Análise Humana</label>
                                        <select
                                            id="human-result"
                                            value={humanAnalysisResult}
                                            onChange={(e) => setHumanAnalysisResult(e.target.value)}
                                            className="w-full p-2 border border-gray-300 rounded-md shadow-sm"
                                            required
                                        >
                                            {HUMAN_ANALYSIS_CHOICES.map(choice => (
                                                <option key={choice[0]} value={choice[0]}>{choice[1]}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label htmlFor="technical-report" className="block text-sm font-medium text-gray-700 mb-1">Conteúdo do Parecer Técnico</label>
                                        <textarea
                                            id="technical-report"
                                            rows="8"
                                            value={technicalReportContent}
                                            onChange={(e) => setTechnicalReportContent(e.target.value)}
                                            className="w-full p-2 border border-gray-300 rounded-md shadow-sm"
                                            placeholder="Detalhe aqui a análise aprofundada e o parecer técnico."
                                            required
                                        />
                                    </div>
                                    <div className="flex justify-end">
                                        <button type="submit" disabled={submitting}
                                                className="px-6 py-2 bg-green-600 text-white font-bold rounded-lg shadow hover:bg-green-700 disabled:bg-green-400">
                                            {submitting ? 'Salvando...' : 'Salvar Parecer Técnico'}
                                        </button>
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