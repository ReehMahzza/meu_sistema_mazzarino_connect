/*

        ================================================================================

        ARQUIVO: frontend/src/pages/CaseCompletionPage.jsx (NOVO ARQUIVO)

        ================================================================================

        */

        import React, { useState, useEffect, useContext, useCallback } from 'react';

        import { useNavigate } from 'react-router-dom';

        import AuthContext from '../context/AuthContext';

        import MainLayout from '../components/MainLayout';



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

                    console.error("Erro ao salvar encerramento:", err.response?.data || err.message);

                    let errorMessage = "Ocorreu um erro ao salvar os dados de encerramento.";

                    if (err.response?.data) {

                        errorMessage = err.response.data.error || Object.values(err.response.data).flat().join(' | ');

                    }

                    setError(errorMessage);

                } finally {

                    setLoading(false);

                }

            };



            return (

                <MainLayout>

                    <h2 className="text-3xl font-bold text-gray-800 mb-6">Encerramento e Arquivamento de Casos</h2>

                    

                    <div className="bg-white p-8 rounded-lg shadow-lg max-w-2xl mx-auto">

                        {/* Mensagens de erro/sucesso */}

                        {error && <p className="text-red-500 text-center mb-4 p-3 bg-red-100 rounded-md">{error}</p>}

                        {success && <p className="text-green-600 text-center mb-4 p-3 bg-green-100 rounded-md">{success}</p>}



                        <form onSubmit={handleSubmit} className="space-y-6">

                            {/* Seleção de Caso */}

                            <div className="mb-6">

                                <label htmlFor="case-select" className="block text-lg font-medium text-gray-800 mb-2">

                                    Selecione o Caso

                                </label>

                                <select

                                    id="case-select"

                                    value={selectedCase ? selectedCase.id : ''}

                                    onChange={(e) => handleCaseSelect(e.target.value)}

                                    className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"

                                    required

                                >

                                    <option value="" disabled>-- Escolha um caso --</option>

                                    {cases.length > 0 ? cases.map(c => (

                                        <option key={c.id} value={c.id}>

                                            {c.title} (Cliente: {c.client?.email || 'N/A'})

                                        </option>

                                    )) : (

                                        <option value="" disabled>Carregando casos ou nenhum caso encontrado.</option>

                                    )}

                                </select>

                            </div>



                            {selectedCase && (

                                <div className="space-y-8 animate-fade-in">

                                    {/* Detalhes do Caso Selecionado */}

                                    <div className="p-6 border rounded-lg space-y-4">

                                        <h3 className="text-xl font-semibold text-gray-700">Detalhes do Caso Selecionado: <span className="text-blue-600">{selectedCase.title}</span></h3>

                                        <p className="text-gray-600 text-sm">Descrição: {selectedCase.description || 'N/A'}</p>

                                        <p className="text-gray-600 text-sm">Status Atual: {selectedCase.current_status}</p>

                                        <p className="text-gray-600 text-sm">Cliente: {selectedCase.client?.email || 'N/A'}</p>

                                    </div>



                                    {/* Seção Gestão do Encerramento */}

                                    <div className="p-6 border rounded-lg space-y-4">

                                        <h3 className="text-xl font-bold text-gray-700 mb-4">Gestão do Encerramento</h3>

                                        

                                        <div>

                                            <label className="block text-sm font-medium text-gray-700 mb-1">Data de Conclusão do Caso</label>

                                            <input

                                                type="date"

                                                name="completion_date"

                                                value={completionData.completion_date}

                                                onChange={handleChange}

                                                className="w-full p-2 border rounded-md"

                                            />

                                        </div>



                                        <div className="flex items-center">

                                            <input

                                                type="checkbox"

                                                id="final_communication_sent"

                                                name="final_communication_sent"

                                                checked={completionData.final_communication_sent}

                                                onChange={handleChange}

                                                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"

                                            />

                                            <label htmlFor="final_communication_sent" className="ml-2 block text-sm text-gray-900">

                                                Comunicação Final Enviada ao Cliente

                                            </label>

                                        </div>



                                        <div className="flex items-center">

                                            <input

                                                type="checkbox"

                                                id="survey_sent"

                                                name="survey_sent"

                                                checked={completionData.survey_sent}

                                                onChange={handleChange}

                                                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"

                                            />

                                            <label htmlFor="survey_sent" className="ml-2 block text-sm text-gray-900">

                                                Pesquisa de Satisfação Enviada

                                            </label>

                                        </div>

                                    </div>

                                    <div className="flex justify-end pt-6">

                                        <button type="submit" disabled={loading || success}

                                                className="px-6 py-2 bg-red-600 text-white font-bold rounded-lg shadow hover:bg-red-700 disabled:bg-red-400">

                                            {loading ? 'Salvando...' : 'Finalizar e Arquivar Caso'}

                                        </button>

                                    </div>

                                </div>

                            )}

                        </form>

                    </div>

                </MainLayout>

            );

        }



        export default CaseCompletionPage;

