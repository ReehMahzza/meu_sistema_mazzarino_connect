// frontend/src/components/cases/DocumentsTab.jsx
import React, { useState, useContext } from 'react';
import AuthContext from '../../context/AuthContext';

// MODIFICADO: A prop agora é onDocumentAdd em vez de refetch
function DocumentsTab({ protocol, onDocumentAdd }) {
    const { axiosInstance } = useContext(AuthContext);
    const [newDocumentData, setNewDocumentData] = useState({
        file_name: '',
        file_type: '',
        description: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleInputChange = (e) => {
        setNewDocumentData({ ...newDocumentData, [e.target.name]: e.target.value });
    };

    const handleDocumentUpload = async (e) => {
        e.preventDefault();
        if (!newDocumentData.file_name || !newDocumentData.file_type) {
            setError("Nome do arquivo e tipo são obrigatórios.");
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const payload = { ...newDocumentData, case: protocol.id };
            const response = await axiosInstance.post(`/api/cases/${protocol.id}/documents/`, payload);

            setSuccess('Documento carregado com sucesso!');
            setNewDocumentData({ file_name: '', file_type: '', description: '' });

            // MODIFICADO: Em vez de refetch(), chamamos a nova função com o documento criado
            onDocumentAdd(response.data); 

        } catch (err) {
            console.error("Erro no upload do documento:", err.response?.data);
            setError(err.response?.data?.error || "Falha no upload do documento.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Coluna do Formulário de Upload */}
            <div className="bg-white shadow-md rounded-lg p-6">
                <h3 className="text-xl font-semibold text-gray-700 mb-4">Carregar Novo Documento</h3>
                <form onSubmit={handleDocumentUpload} className="space-y-4">
                    <div>
                        <label htmlFor="file_name" className="block text-sm font-medium text-gray-700">Nome do Arquivo</label>
                        <input type="text" name="file_name" id="file_name" value={newDocumentData.file_name} onChange={handleInputChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"/>
                    </div>
                    <div>
                        <label htmlFor="file_type" className="block text-sm font-medium text-gray-700">Tipo do Arquivo</label>
                        <input type="text" name="file_type" id="file_type" value={newDocumentData.file_type} onChange={handleInputChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"/>
                    </div>
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700">Descrição (Opcional)</label>
                        <textarea name="description" id="description" value={newDocumentData.description} onChange={handleInputChange} rows="3" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"></textarea>
                    </div>
                    {error && <p className="text-sm text-red-600">{error}</p>}
                    {success && <p className="text-sm text-green-600">{success}</p>}
                    <button type="submit" disabled={loading} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400">
                        {loading ? 'Carregando...' : 'Carregar Documento'}
                    </button>
                </form>
            </div>

            {/* Coluna da Lista de Documentos */}
            <div className="bg-white shadow-md rounded-lg p-6">
                <h3 className="text-xl font-semibold text-gray-700 mb-4">Documentos do Caso</h3>
                <div className="overflow-x-auto">
                    {protocol.documents && protocol.documents.length > 0 ? (
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Nome do Arquivo</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {protocol.documents.map(doc => (
                                    <tr key={doc.id}>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-blue-600 hover:underline">
                                            <a href={doc.file_url} target="_blank" rel="noopener noreferrer">{doc.file_name}</a>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{doc.file_type}</td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{new Date(doc.upload_date).toLocaleDateString('pt-BR')}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p className="text-center text-gray-500 py-4">Nenhum documento encontrado para este caso.</p>
                    )}
                </div>
            </div>
        </div>
    );
}

export default DocumentsTab;