/*
================================================================================
ARQUIVO: frontend/src/pages/DocumentsPage.jsx (REFATORADO E CORRIGIDO - Erros 400)
================================================================================
*/
import React, { useState, useEffect, useContext, useCallback } from 'react';
import AuthContext from '../context/AuthContext';
import MainLayout from '../components/MainLayout';
// ADICIONADO: Imports dos novos componentes de UI
import Input from '../components/ui/Input';
import Textarea from '../components/ui/Textarea';
import Button from '../components/ui/Button';
import MessageAlert from '../components/ui/MessageAlert';
import Select from '../components/ui/Select';

function DocumentsPage() {
    const { axiosInstance, user } = useContext(AuthContext);
    const [cases, setCases] = useState([]);
    const [selectedCase, setSelectedCase] = useState(null);
    const [documents, setDocuments] = useState([]);
    const [movements, setMovements] = useState([]);
    const [newDocumentData, setNewDocumentData] = useState({
        file_name: '',
        file_type: '',
        description: '',
    });
    const [newMovementData, setNewMovementData] = useState({
        movement_type: '',
        content: '',
        is_internal: true,
        notes: '',
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Tipos de movimento para o select
    const MOVEMENT_TYPES = [
        { value: 'Visualização', label: 'Visualização' },
        { value: 'Despacho', label: 'Despacho' },
        { value: 'Encaminhamento', label: 'Encaminhamento' },
        { value: 'Upload de Documento', label: 'Upload de Documento' },
        { value: 'Solicitação de Serviço de Busca', label: 'Solicitação de Serviço de Busca' },
        { value: 'Análise IA', label: 'Análise IA' },
        { value: 'Emissão Parecer Técnico', label: 'Emissão Parecer Técnico' },
        { value: 'Proposta Enviada', label: 'Proposta Enviada' },
        { value: 'Proposta Aceita', label: 'Proposta Aceita' },
        { value: 'Proposta Rejeitada', label: 'Proposta Rejeitada' },
        { value: 'DocuSign Enviado', label: 'DocuSign Enviado' },
        { value: 'DocuSign Assinado', label: 'DocuSign Assinado' },
        { value: 'DocuSign Recusado', label: 'DocuSign Recusado' },
        { value: 'Dossiê Enviado', label: 'Dossiê Enviado' },
        { value: 'Resposta do Banco', label: 'Resposta do Banco' },
        { value: 'Contraproposta Recebida', label: 'Contraproposta Recebida' },
        { value: 'Pagamento Banco Recebido', label: 'Pagamento Banco Recebido' },
        { value: 'Comissão Calculada', label: 'Comissão Calculada' },
        { value: 'Liquidação Cliente', label: 'Liquidação Cliente' },
        { value: 'Caso Encerrado', label: 'Caso Encerrado' },
        { value: 'Comunicação Final', label: 'Comunicação Final' },
        { value: 'Pesquisa Satisfação Enviada', label: 'Pesquisa Satisfação Enviada' },
    ];

    // Busca todos os casos do usuário logado
    useEffect(() => {
        const fetchCases = async () => {
            setLoading(true);
            try {
                const response = await axiosInstance.get('/api/cases/');
                setCases(response.data);
            } catch (err) {
                console.error("Erro ao buscar casos:", err);
                setError("Não foi possível carregar a lista de casos.");
            } finally {
                setLoading(false);
            }
        };
        fetchCases();
    }, [axiosInstance]);

    // Carrega documentos e andamentos do caso selecionado
    useEffect(() => {
        const fetchCaseData = async () => {
            if (selectedCase) {
                try {
                    const [docsResponse, movementsResponse] = await Promise.all([
                        axiosInstance.get(`/api/cases/${selectedCase.id}/documents/`),
                        axiosInstance.get(`/api/cases/${selectedCase.id}/movements/`)
                    ]);
                    setDocuments(docsResponse.data);
                    setMovements(movementsResponse.data);

                    // Envia andamento de visualização (apenas se o caso foi realmente selecionado)
                    if (selectedCase.id && user?.id) {
                        const visualizacaoPayload = {
                            case: selectedCase.id, 
                            movement_type: 'Visualização',
                            content: 'Usuário visualizou os detalhes e andamentos do caso.',
                            is_internal: true, // Certifique-se que este campo é aceito pelo serializer
                        };
                        console.log("Enviando andamento de visualização:", visualizacaoPayload);
                        try {
                            await axiosInstance.post(`/api/cases/${selectedCase.id}/movements/`, visualizacaoPayload);
                        } catch (visualError) {
                            console.warn("Não foi possível registrar a visualização:", visualError.response?.data);
                        }
                    }
                } catch (err) {
                    console.error("Erro ao carregar dados do caso:", err.response?.data || err.message);
                    setError(err.response?.data?.error || "Não foi possível carregar os documentos e andamentos deste caso.");
                }
            }
        };
        fetchCaseData();
    }, [selectedCase, axiosInstance, user]);

    const handleCaseSelect = (caseItem) => {
        setSelectedCase(caseItem);
        setDocuments([]);
        setMovements([]);
        setError('');
        setSuccess('');
    };

    const handleNewDocumentChange = (e) => {
        setNewDocumentData({ ...newDocumentData, [e.target.name]: e.target.value });
    };

    const handleNewMovementChange = (e) => {
        const { name, value, type, checked } = e.target;
        setNewMovementData({
            ...newMovementData,
            [name]: type === 'checkbox' ? checked : value,
        });
    };

    const handleDocumentUpload = async (e) => {
        e.preventDefault();
        if (!selectedCase) {
            setError("Selecione um caso para fazer upload de um documento.");
            return;
        }
        if (!newDocumentData.file_name || !newDocumentData.file_type) {
            setError("Nome do arquivo e tipo são obrigatórios.");
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const payload = {
                file_name: newDocumentData.file_name,
                file_type: newDocumentData.file_type,
                description: newDocumentData.description || null, // Garante null se vazio
                case: selectedCase.id, // Envia o ID do caso no payload
            };
            const response = await axiosInstance.post(`/api/cases/${selectedCase.id}/documents/`, payload);
            setDocuments([...documents, response.data]);
            setNewDocumentData({ file_name: '', file_type: '', description: '' });
            setSuccess('Documento carregado com sucesso!');

            const movementsResponse = await axiosInstance.get(`/api/cases/${selectedCase.id}/movements/`);
            setMovements(movementsResponse.data);

        } catch (err) {
            console.error("Erro no processo de upload:", err.response?.data);
            setError(err.response?.data?.error || "Falha no upload do documento.");
        } finally {
            setLoading(false);
        }
    };

    const handleMovementSubmit = async (e) => {
        e.preventDefault();
        if (!selectedCase) {
            setError("Selecione um caso para adicionar um andamento.");
            return;
        }
        if (!newMovementData.movement_type || !newMovementData.content) {
            setError("Tipo de movimento e conteúdo são obrigatórios.");
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const payload = {
                movement_type: newMovementData.movement_type,
                content: newMovementData.content,
                is_internal: newMovementData.is_internal, // Certifique-se que este campo é aceito pelo serializer
                notes: newMovementData.notes || null, // Garante null se vazio
                case: selectedCase.id, // Envia o ID do caso no payload
                // REMOVIDO: actor: user.id, // O backend já define o actor automaticamente
            };
            const response = await axiosInstance.post(`/api/cases/${selectedCase.id}/movements/`, payload);
            setMovements([response.data, ...movements]);
            setNewMovementData({ movement_type: '', content: '', is_internal: true, notes: '' });
            setSuccess('Andamento registrado com sucesso!');

            const caseResponse = await axiosInstance.get(`/api/cases/${selectedCase.id}/`);
            setSelectedCase(caseResponse.data);

        } catch (err) {
            console.error("Erro ao registrar andamento:", err.response?.data);
            setError(err.response?.data?.error || "Falha ao registrar o andamento.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <MainLayout>
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Gestão de Casos e Documentos</h2>
            {error && <div className="mb-4"><MessageAlert message={error} type="error" /></div>}
            {success && <div className="mb-4"><MessageAlert message={success} type="success" /></div>}

            <div className="flex flex-col md:flex-row gap-6">
                {/* Coluna Esquerda: Meus Casos */}
                <div className="md:w-1/3 bg-white p-6 rounded-lg shadow-lg">
                    <h3 className="text-xl font-semibold text-gray-700 mb-4 border-b pb-2">Meus Casos</h3>
                    {loading ? (
                        <p>Carregando casos...</p>
                    ) : cases.length > 0 ? (
                        <ul className="space-y-3">
                            {cases.map(c => (
                                <li key={c.id}>
                                    <button
                                        onClick={() => handleCaseSelect(c)}
                                        className={`w-full text-left p-3 rounded-lg transition-all duration-200
                                            ${selectedCase && selectedCase.id === c.id ? 'bg-blue-100 text-blue-800 font-semibold shadow' : 'bg-gray-50 hover:bg-gray-100 text-gray-700'}`}
                                    >
                                        <span className="font-medium">{c.title}</span> <br />
                                        <span className="text-sm text-gray-500">Status: {c.current_status}</span>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-gray-500">Nenhum caso encontrado.</p>
                    )}
                </div>

                {/* Coluna Direita: Detalhes do Caso, Upload, Linha do Tempo */}
                <div className="md:w-2/3 bg-white p-6 rounded-lg shadow-lg">
                    {selectedCase ? (
                        <>
                            <h3 className="text-xl font-semibold text-gray-700 mb-4 border-b pb-2">Detalhes do Caso: <span className="text-blue-600">{selectedCase.title}</span></h3>
                            <p className="text-gray-600 mb-4">Descrição: {selectedCase.description || 'N/A'}</p>
                            <p className="text-gray-600 mb-4">Status Atual: {selectedCase.current_status}</p>
                            <p className="text-gray-600 mb-4">Cliente: {selectedCase.client_detail?.email || 'N/A'}</p>

                            {/* Seção de Upload de Documentos */}
                            <div className="mt-8 border-t pt-6">
                                <h3 className="text-xl font-semibold text-gray-700 mb-4">Upload de Documento para: <span className="text-blue-600">{selectedCase.title}</span></h3>
                                <form onSubmit={handleDocumentUpload} className="space-y-4">
                                    <Input
                                        label="Nome do Arquivo"
                                        name="file_name"
                                        value={newDocumentData.file_name}
                                        onChange={handleNewDocumentChange}
                                        required
                                    />
                                    <Input
                                        label="Tipo do Arquivo"
                                        name="file_type"
                                        value={newDocumentData.file_type}
                                        onChange={handleNewDocumentChange}
                                        required
                                    />
                                    <Textarea
                                        label="Descrição (opcional)"
                                        name="description"
                                        value={newDocumentData.description}
                                        onChange={handleNewDocumentChange}
                                        rows="3"
                                    />
                                    <Button type="submit" disabled={loading} variant="primary">
                                        {loading ? 'Carregando...' : 'Carregar Documento'}
                                    </Button>
                                </form>
                            </div>

                            {/* Lista de Documentos do Caso */}
                            <div className="mt-8 border-t pt-6">
                                <h3 className="text-xl font-semibold text-gray-700 mb-4">Documentos do Caso</h3>
                                {documents.length > 0 ? (
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                                            <thead>
                                                <tr>
                                                    <th className="py-2 px-4 border-b text-left text-sm font-medium text-gray-600">NOME DO ARQUIVO</th>
                                                    <th className="py-2 px-4 border-b text-left text-sm font-medium text-gray-600">TIPO</th>
                                                    <th className="py-2 px-4 border-b text-left text-sm font-medium text-gray-600">DATA</th>
                                                    <th className="py-2 px-4 border-b text-left text-sm font-medium text-gray-600">ENVIADO POR</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {documents.map(doc => (
                                                    <tr key={doc.id}>
                                                        <td className="py-2 px-4 border-b text-sm text-blue-600 hover:underline"><a href={doc.file_url} target="_blank" rel="noopener noreferrer">{doc.file_name}</a></td>
                                                        <td className="py-2 px-4 border-b text-sm text-gray-800">{doc.file_type}</td>
                                                        <td className="py-2 px-4 border-b text-sm text-gray-800">{new Date(doc.upload_date).toLocaleDateString('pt-BR')}</td>
                                                        <td className="py-2 px-4 border-b text-sm text-gray-800">{doc.uploaded_by?.email || 'N/A'}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <p className="text-gray-500">Nenhum documento encontrado para este caso.</p>
                                )}
                            </div>

                            {/* Seção de Adicionar Andamento */}
                            <div className="mt-8 border-t pt-6">
                                <h3 className="text-xl font-semibold text-gray-700 mb-4">Adicionar Novo Andamento</h3>
                                <form onSubmit={handleMovementSubmit} className="space-y-4">
                                    <Select
                                        label="Tipo de Movimento"
                                        name="movement_type"
                                        value={newMovementData.movement_type}
                                        onChange={handleNewMovementChange}
                                        options={MOVEMENT_TYPES}
                                        required
                                    />
                                    <Textarea
                                        label="Conteúdo do Andamento"
                                        name="content"
                                        value={newMovementData.content}
                                        onChange={handleNewMovementChange}
                                        rows="3"
                                        required
                                    />
                                    <Button type="submit" disabled={loading} variant="secondary">
                                        {loading ? 'Registrando...' : 'Registrar Andamento'}
                                    </Button>
                                </form>
                            </div>

                            {/* Linha do Tempo do Caso */}
                            <div className="mt-8 border-t pt-6">
                                <h3 className="text-xl font-semibold text-gray-700 mb-4">Linha do Tempo do Caso</h3>
                                {movements.length > 0 ? (
                                    <ol className="relative border-l border-gray-200 dark:border-gray-700 ml-4">
                                        {movements.map(mov => (
                                            <li key={mov.id} className="mb-6 ml-6">
                                                <span className="absolute flex items-center justify-center w-6 h-6 bg-blue-100 rounded-full -left-3 ring-8 ring-white dark:ring-gray-900 dark:bg-blue-900">
                                                    {/* Ícone baseado no tipo de movimento */}
                                                    {mov.movement_type === 'Criação' && <svg className="w-2.5 h-2.5 text-blue-800 dark:text-blue-300" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l3 3a1 1 0 001.414-1.414L11 9.586V6z"></path></svg>}
                                                    {mov.movement_type === 'Upload de Documento' && <svg className="w-2.5 h-2.5 text-green-800 dark:text-green-300" fill="currentColor" viewBox="0 0 20 20"><path d="M9 2a1 1 0 00-1 1v2H5a2 2 0 00-2 2v8a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-3V3a1 1 0 00-1-1H9zm0 2h2v2H9V4zm0 4h2v2H9V8zm0 4h2v2H9v-2z"></path></svg>}
                                                    {mov.movement_type === 'Visualização' && <svg className="w-2.5 h-2.5 text-gray-800 dark:text-gray-300" fill="currentColor" viewBox="0 0 20 20"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z"></path><path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"></path></svg>}
                                                    {mov.movement_type === 'Despacho' && <svg className="w-2.5 h-2.5 text-purple-800 dark:text-purple-300" fill="currentColor" viewBox="0 0 20 20"><path d="M7 3a1 1 0 00-1 1v12a1 1 0 001 1h6a1 1 0 001-1V4a1 1 0 00-1-1H7zm0 2h6v8H7V5zm0 10h6v2H7v-2z"></path></svg>}
                                                    {mov.movement_type === 'Encaminhamento' && <svg className="w-2.5 h-2.5 text-yellow-800 dark:text-yellow-300" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 000 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z"></path></svg>}
                                                    {/* Ícones de Fase 3 */}
                                                    {mov.movement_type === 'Análise IA' && <svg className="w-2.5 h-2.5 text-indigo-800 dark:text-indigo-300" fill="currentColor" viewBox="0 0 20 20"><path d="M5 3a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V5a2 2 0 00-2-2H5zm0 2h10v2H5V5zm0 4h10v2H5V9zm0 4h10v2H5v-2z"></path></svg>}
                                                    {mov.movement_type === 'Emissão Parecer Técnico' && <svg className="w-2.5 h-2.5 text-purple-800 dark:text-purple-300" fill="currentColor" viewBox="0 0 20 20"><path d="M9 2a1 1 0 00-1 1v2H5a2 2 0 00-2 2v8a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-3V3a1 1 0 00-1-1H9zm0 2h2v2H9V4zm0 4h2v2H9V8zm0 4h2v2H9v-2z"></path></svg>}
                                                    {/* Ícones de Fase 4 */}
                                                    {mov.movement_type.startsWith('Proposta') && <svg className="w-2.5 h-2.5 text-orange-800 dark:text-orange-300" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l3 3a1 1 0 001.414-1.414L11 9.586V6z"></path></svg>}
                                                    {mov.movement_type.startsWith('DocuSign') && <svg className="w-2.5 h-2.5 text-blue-800 dark:text-blue-300" fill="currentColor" viewBox="0 0 20 20"><path d="M9 2a1 1 0 00-1 1v2H5a2 2 0 00-2 2v8a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-3V3a1 1 0 00-1-1H9zm0 2h2v2H9V4zm0 4h2v2H9V8zm0 4h2v2H9v-2z"></path></svg>}
                                                    {/* Ícones de Fase 5 */}
                                                    {mov.movement_type === 'Dossiê Enviado' && <svg className="w-2.5 h-2.5 text-teal-800 dark:text-teal-300" fill="currentColor" viewBox="0 0 20 20"><path d="M9 2a1 1 0 00-1 1v2H5a2 2 0 00-2 2v8a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-3V3a1 1 0 00-1-1H9zm0 2h2v2H9V4zm0 4h2v2H9V8zm0 4h2v2H9v-2z"></path></svg>}
                                                    {mov.movement_type === 'Resposta do Banco' && <svg className="w-2.5 h-2.5 text-cyan-800 dark:text-cyan-300" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l3 3a1 1 0 001.414-1.414L11 9.586V6z"></path></svg>}
                                                    {mov.movement_type === 'Contraproposta Recebida' && <svg className="w-2.5 h-2.5 text-lime-800 dark:text-lime-300" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 000 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z"></path></svg>}
                                                    {/* Ícones de Fase 6 */}
                                                    {mov.movement_type === 'Termo de Acordo Enviado' && <svg className="w-2.5 h-2.5 text-fuchsia-800 dark:text-fuchsia-300" fill="currentColor" viewBox="0 0 20 20"><path d="M9 2a1 1 0 00-1 1v2H5a2 2 0 00-2 2v8a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-3V3a1 1 0 00-1-1H9zm0 2h2v2H9V4zm0 4h2v2H9V8zm0 4h2v2H9v-2z"></path></svg>}
                                                    {mov.movement_type === 'Acordo Assinado' && <svg className="w-2.5 h-2.5 text-emerald-800 dark:text-emerald-300" fill="currentColor" viewBox="0 0 20 20"><path d="M9 2a1 1 0 00-1 1v2H5a2 2 0 00-2 2v8a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-3V3a1 1 0 00-1-1H9zm0 2h2v2H9V4zm0 4h2v2H9V8zm0 4h2v2H9v-2z"></path></svg>}
                                                    {mov.movement_type === 'Acordo Recusado' && <svg className="w-2.5 h-2.5 text-rose-800 dark:text-rose-300" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"></path></svg>}
                                                    {/* Ícones de Fase 7 */}
                                                    {mov.movement_type === 'Pagamento Banco Recebido' && <svg className="w-2.5 h-2.5 text-yellow-800 dark:text-yellow-300" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a8 8 0 100 16 8 8 0 000-16zM9 12a1 1 0 102 0V8a1 1 0 00-2 0v4zm1-8a1 1 0 100 2 1 1 0 000-2z"></path></svg>}
                                                    {mov.movement_type === 'Comissão Calculada' && <svg className="w-2.5 h-2.5 text-indigo-800 dark:text-indigo-300" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a8 8 0 100 16 8 8 0 000-16zM9 12a1 1 0 102 0V8a1 1 0 00-2 0v4zm1-8a1 1 0 100 2 1 1 0 000-2z"></path></svg>}
                                                    {mov.movement_type === 'Liquidação Cliente' && <svg className="w-2.5 h-2.5 text-green-800 dark:text-green-300" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a8 8 0 100 16 8 8 0 000-16zM9 12a1 1 0 102 0V8a1 1 0 00-2 0v4zm1-8a1 1 0 100 2 1 1 0 000-2z"></path></svg>}
                                                </span>
                                                <div className="flex items-center space-x-3">
                                                    <h4 className="text-sm font-semibold text-gray-900">{mov.movement_type}</h4>
                                                    <time className="block text-xs font-normal leading-none text-gray-400">
                                                        {new Date(mov.timestamp).toLocaleDateString('pt-BR')} às {new Date(mov.timestamp).toLocaleTimeString('pt-BR')}
                                                    </time>
                                                </div>
                                                <p className="text-base font-normal text-gray-500">{mov.content}</p>
                                                {mov.associated_document && (
                                                    <p className="text-sm text-gray-500 mt-1">
                                                        Documento: <a href={mov.associated_document.file_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{mov.associated_document.file_name}</a>
                                                    </p>
                                                )}
                                                {mov.request_details && (
                                                    <p className="text-sm text-gray-500 mt-1">
                                                        Detalhes da Solicitação: {mov.request_details}
                                                    </p>
                                                )}
                                            </li>
                                        ))}
                                    </ol>
                                ) : (
                                    <p className="text-gray-500">Nenhum andamento registrado para este caso.</p>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="bg-white p-6 rounded-lg shadow text-center text-gray-500">
                            <p>Selecione um caso à esquerda para ver os detalhes.</p>
                        </div>
                    )}
                </div>
            </div>
        </MainLayout>
    );
}

export default DocumentsPage;