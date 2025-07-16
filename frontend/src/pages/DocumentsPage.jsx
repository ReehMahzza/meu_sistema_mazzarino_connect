/*
================================================================================
ARQUIVO: frontend/src/pages/DocumentsPage.jsx (NOVO ARQUIVO)
================================================================================
*/
import React, { useContext, useState, useEffect } from 'react';
import AuthContext from '../context/AuthContext';
import MainLayout from '../components/MainLayout'; // Importa o MainLayout

// Ícones
const UploadIcon = () => <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>;
const CaseIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>;

function DocumentsPage() {
    const { axiosInstance } = useContext(AuthContext);
    const [cases, setCases] = useState([]);
    const [documents, setDocuments] = useState([]);
    const [selectedCase, setSelectedCase] = useState(null);
    const [showUploadForm, setShowUploadForm] = useState(false);
    const [newDocument, setNewDocument] = useState({ fileName: '', fileType: '', description: '' });
    const [loadingCases, setLoadingCases] = useState(true);
    const [loadingDocuments, setLoadingDocuments] = useState(false);

    // Busca os casos do usuário ao carregar a página
    useEffect(() => {
        const fetchCases = async () => {
            setLoadingCases(true);
            try {
                const response = await axiosInstance.get('/api/cases/');
                setCases(response.data);
                if (response.data.length > 0) {
                    // Seleciona o primeiro caso por padrão
                    handleSelectCase(response.data[0]);
                }
            } catch (error) {
                console.error("Erro ao buscar casos:", error);
            } finally {
                setLoadingCases(false);
            }
        };
        fetchCases();
    }, [axiosInstance]); // Dependência axiosInstance

    // Função para selecionar um caso e buscar seus documentos
    const handleSelectCase = async (caseObj) => {
        setSelectedCase(caseObj);
        setShowUploadForm(false); // Esconde o formulário ao trocar de caso
        setLoadingDocuments(true);
        try {
            const response = await axiosInstance.get(`/api/cases/${caseObj.id}/documents/`);
            setDocuments(response.data);
        } catch (error) {
            console.error("Erro ao buscar documentos:", error);
            setDocuments([]);
        } finally {
            setLoadingDocuments(false);
        }
    };

    // Função para submeter o formulário de upload
    const handleUploadSubmit = async (e) => {
        e.preventDefault();
        if (!selectedCase || !newDocument.fileName || !newDocument.fileType) {
            alert("Por favor, preencha o nome e o tipo do arquivo.");
            return;
        }
        try {
            await axiosInstance.post(`/api/cases/${selectedCase.id}/documents/`, {
                case: selectedCase.id,
                file_name: newDocument.fileName,
                file_type: newDocument.fileType,
                description: newDocument.description,
            });
            setNewDocument({ fileName: '', fileType: '', description: '' });
            setShowUploadForm(false);
            handleSelectCase(selectedCase); // Recarrega os documentos do caso atual
        } catch (error) {
            console.error("Erro no upload:", error);
            alert("Falha no upload do documento.");
        }
    };

    return (
        <MainLayout> {/* Agora usa o MainLayout */}
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-gray-800">Gestão de Documentos</h2>
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
                        {loadingCases ? <p>Carregando casos...</p> : (
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

                {/* Coluna de Documentos e Upload */}
                <div className="lg:col-span-8">
                    {!selectedCase && !loadingCases ? (
                           <div className="bg-white p-6 rounded-lg shadow text-center text-gray-500">
                            <p>Selecione um caso à esquerda para ver os documentos.</p>
                        </div>
                    ) : (
                        <>
                            {showUploadForm && (
                                <div className="bg-white p-6 rounded-lg shadow mb-6 transition-all duration-300">
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

                            <div className="bg-white rounded-lg shadow overflow-hidden">
                                <h3 className="text-lg font-bold text-gray-700 p-4 border-b">Documentos do Caso</h3>
                                {loadingDocuments ? <p className="p-4">Carregando documentos...</p> : (
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
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </MainLayout>
    );
}

export default DocumentsPage;