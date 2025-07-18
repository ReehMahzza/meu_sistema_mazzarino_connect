/*
================================================================================
ARQUIVO: frontend/src/pages/DocumentsPage.jsx (MODIFICADO)
================================================================================
Este arquivo agora inclui a busca e exibição da linha do tempo (andamentos)
e a lógica para registrar novos andamentos de upload e visualização.
*/
import React, { useContext, useState, useEffect, useCallback } from 'react';
import AuthContext from '../context/AuthContext';
import MainLayout from '../components/MainLayout';

// Ícones
const UploadIcon = () => <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>;
const CaseIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>;

function DocumentsPage() {
    const { axiosInstance } = useContext(AuthContext);
    const [cases, setCases] = useState([]);
    const [documents, setDocuments] = useState([]);
    // ADICIONADO: Estado para armazenar os andamentos
    const [movements, setMovements] = useState([]);
    const [selectedCase, setSelectedCase] = useState(null);
    const [showUploadForm, setShowUploadForm] = useState(false);
    const [newDocument, setNewDocument] = useState({ fileName: '', fileType: '', description: '' });
    const [loadingCases, setLoadingCases] = useState(true);
    // ADICIONADO: Estado de loading unificado para o conteúdo do caso
    const [loadingContent, setLoadingContent] = useState(false);

    // ADICIONADO: Função para registrar a visualização do caso
const logCaseView = useCallback(async (caseId) => {
    try {
        // MODIFICADO: Envia o ID do caso como parte do payload, não apenas na URL
        const payload = {
            case: caseId, // Envia o ID do caso como número
            movement_type: 'Visualização',
            content: 'Usuário visualizou os detalhes e andamentos do caso.'
        };
        console.log("Enviando andamento de visualização:", payload); // Para depuração
        await axiosInstance.post(`/api/cases/${caseId}/movements/`, payload); // Rota POST para movimentos

        // Após o log, busca novamente os andamentos para incluir a nova visualização
        const movesResponse = await axiosInstance.get(`/api/cases/${caseId}/movements/`);
        setMovements(movesResponse.data);

    } catch (error) {
        // Melhorado o log para mostrar detalhes do erro do backend
        console.error("Erro ao registrar andamento de visualização:", error.response?.data || error.message);
    }
}, [axiosInstance]);

    // MODIFICADO: Função para selecionar um caso e buscar todo o seu conteúdo
    const handleSelectCase = useCallback(async (caseObj) => {
        if (!caseObj) return;

        setSelectedCase(caseObj);
        setShowUploadForm(false);
        setLoadingContent(true);

        // Registra a visualização do caso
try { // ADICIONADO: try-catch para logCaseView
    await logCaseView(caseObj.id);
} catch (logError) {
    console.warn("Aviso: O andamento de visualização não pôde ser registrado.", logError);
}

try {
    // Busca documentos e andamentos em paralelo para mais eficiência
    const [docsResponse, movesResponse] = await Promise.all([
        axiosInstance.get(`/api/cases/${caseObj.id}/documents/`),
                axiosInstance.get(`/api/cases/${caseObj.id}/movements/`)
            ]);
            setDocuments(docsResponse.data);
            setMovements(movesResponse.data);
        } catch (error) {
            console.error("Erro ao buscar conteúdo do caso:", error);
            setDocuments([]);
            setMovements([]);
        } finally {
            setLoadingContent(false);
        }
    }, [axiosInstance, logCaseView]);

    // Busca os casos do usuário ao carregar a página
    useEffect(() => {
        const fetchCases = async () => {
            setLoadingCases(true);
            try {
                const response = await axiosInstance.get('/api/cases/');
                setCases(response.data);
                // Se houver casos, seleciona o primeiro por padrão
                if (response.data.length > 0) {
                    handleSelectCase(response.data[0]);
                }
            } catch (error) {
                console.error("Erro ao buscar casos:", error);
            } finally {
                setLoadingCases(false);
            }
        };
        fetchCases();
    }, [handleSelectCase]); // Adicionado handleSelectCase como dependência

    // frontend/src/pages/DocumentsPage.jsx

// ... (código acima)

// MODIFICADO: Função de upload para também criar o andamento
const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCase || !newDocument.fileName || !newDocument.fileType) {
        alert("Por favor, preencha o nome e o tipo do arquivo.");
        return;
    }
    try {
        // 1. Faz o upload do documento
        const docPayload = {
            case: selectedCase.id, // Envia o ID do caso para o documento
            file_name: newDocument.fileName,
            file_type: newDocument.fileType,
            description: newDocument.description,
        };
        console.log("Enviando upload de documento:", docPayload);
        const docResponse = await axiosInstance.post(`/api/cases/${selectedCase.id}/documents/`, docPayload); // Rota POST para documentos
        const createdDoc = docResponse.data;

        // 2. ADICIONADO: Cria o andamento associado ao upload
        const movementPayload = {
            case: selectedCase.id, // Envia o ID do caso para o andamento
            movement_type: 'Upload de Documento',
            content: `Realizado o upload do documento: ${createdDoc.file_name}`,
            associated_document_id: createdDoc.id // Associa o ID do documento recém-criado
        };
        console.log("Enviando andamento de upload:", movementPayload);
        await axiosInstance.post(`/api/cases/${selectedCase.id}/movements/`, movementPayload); // Rota POST para movimentos

        setNewDocument({ fileName: '', fileType: '', description: '' });
        setShowUploadForm(false);
        // Recarrega todo o conteúdo do caso para refletir as mudanças
        handleSelectCase(selectedCase);
    } catch (error) {
        console.error("Erro no processo de upload:", error.response?.data || error.message);
        alert("Falha no upload do documento.");
    }
};

    return (
        <MainLayout>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-gray-800">Gestão de Casos e Documentos</h2>
                {selectedCase && !showUploadForm && (
                       <button onClick={() => setShowUploadForm(true)} className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition">
                        <UploadIcon />
                        <span>Upload de Documento</span>
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Coluna de Casos */}
                <div className="lg:col-span-4">
                    <div className="bg-white p-4 rounded-lg shadow">
                        <h3 className="text-lg font-bold text-gray-700 mb-3 border-b pb-2">Meus Casos</h3>
                        {loadingCases ? <p className="p-3">Carregando casos...</p> : (
                            <div className="space-y-2">
                                {cases.length > 0 ? cases.map(c => (
                                    <div key={c.id} onClick={() => handleSelectCase(c)}
                                        className={`flex items-center p-3 rounded-lg cursor-pointer transition ${selectedCase?.id === c.id ? 'bg-blue-100 text-blue-800 shadow-sm' : 'hover:bg-gray-100'}`}>
                                        <CaseIcon />
                                        <span className="ml-3 font-semibold">{c.title}</span>
                                    </div>
                                )) : <p className="text-gray-500 p-3">Nenhum caso encontrado.</p>}
                            </div>
                        )}
                    </div>
                </div>

                {/* Coluna de Conteúdo (Documentos e Andamentos) */}
                <div className="lg:col-span-8">
                    {!selectedCase && !loadingCases ? (
                           <div className="bg-white p-6 rounded-lg shadow text-center text-gray-500">
                            <p>Selecione um caso à esquerda para ver os detalhes.</p>
                        </div>
                    ) : loadingContent ? <div className="text-center p-10">Carregando dados do caso...</div> : (
                        <div className="space-y-8">
                            {/* Formulário de Upload (se visível) */}
                            {showUploadForm && (
                                <div className="bg-white p-6 rounded-lg shadow transition-all duration-300">
                                    <h3 className="text-xl font-bold text-gray-700 mb-4">Upload para: <span className="text-blue-600">{selectedCase.title}</span></h3>
                                    <form onSubmit={handleUploadSubmit} className="space-y-4">
                                        <input type="text" placeholder="Nome do Arquivo (ex: contrato.pdf)" value={newDocument.fileName} onChange={e => setNewDocument({...newDocument, fileName: e.target.value})} className="w-full p-2 border rounded-md" required />
                                        <input type="text" placeholder="Tipo do Arquivo (ex: pdf, docx, jpg)" value={newDocument.fileType} onChange={e => setNewDocument({...newDocument, fileType: e.target.value})} className="w-full p-2 border rounded-md" required />
                                        <textarea placeholder="Descrição (opcional)" value={newDocument.description} onChange={e => setNewDocument({...newDocument, description: e.target.value})} className="w-full p-2 border rounded-md" rows="3" />
                                        <div className="flex justify-end space-x-3">
                                            <button type="button" onClick={() => setShowUploadForm(false)} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancelar</button>
                                            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Salvar Documento</button>
                                        </div>
                                    </form>
                                </div>
                            )}

                            {/* Tabela de Documentos */}
                            <div className="bg-white rounded-lg shadow overflow-hidden">
                                <h3 className="text-lg font-bold text-gray-700 p-4 border-b">Documentos do Caso</h3>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nome do Arquivo</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Enviado por</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {documents.length > 0 ? documents.map(doc => (
                                                <tr key={doc.id}>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600 hover:underline">
                                                        <a href={doc.file_url} target="_blank" rel="noopener noreferrer">{doc.file_name}</a>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{doc.file_type}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(doc.upload_date).toLocaleDateString()}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{doc.uploaded_by_name}</td>
                                                </tr>
                                            )) : (
                                                <tr><td colSpan="4" className="text-center py-10 text-gray-500">Nenhum documento encontrado para este caso.</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* ADICIONADO: Linha do Tempo de Andamentos */}
                            <div className="bg-white rounded-lg shadow">
                                <h3 className="text-lg font-bold text-gray-700 p-4 border-b">Linha do Tempo do Caso</h3>
                                <div className="p-6 space-y-8">
                                    {movements.length > 0 ? movements.map((move, index) => (
                                        <div key={move.id} className="relative pl-10">
                                            {/* Linha vertical (não para o último item) */}
                                            {index < movements.length - 1 && <div className="absolute left-4 top-5 h-full border-l-2 border-gray-200"></div>}
                                            {/* Ponto na linha do tempo */}
                                            <div className="absolute left-0 top-1.5 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">{movements.length - index}</div>

                                            <div className="flex justify-between items-center">
                                                <h4 className="font-bold text-gray-800 text-md">{move.movement_type}</h4>
                                                <p className="text-xs text-gray-500">{new Date(move.timestamp).toLocaleString('pt-BR')}</p>
                                            </div>
                                            <p className="text-sm text-gray-600">
                                                por: {move.actor_name && move.actor_email
                                                    ? `${move.actor_name} (${move.actor_email})`
                                                    : 'Usuário'}
                                            </p>

                                            {move.content && <p className="mt-2 text-sm bg-gray-50 p-3 rounded-md border">{move.content}</p>}

                                            {move.associated_document && (
                                                <div className="mt-2">
                                                    <a href={move.associated_document.file_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-sm text-blue-600 hover:underline">
                                                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg>
                                                        Documento Anexado: {move.associated_document.file_name}
                                                    </a>
                                                </div>
                                            )}
                                        </div>
                                    )) : <p className="text-center py-4 text-gray-500">Nenhum andamento registrado para este caso.</p>}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </MainLayout>
    );
}

export default DocumentsPage;