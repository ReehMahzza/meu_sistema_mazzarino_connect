// frontend/src/components/cases/DocumentsTab.jsx
import React, { useState, useContext } from 'react';
import AuthContext from '../../context/AuthContext';
import Input from '../ui/Input';
import Textarea from '../ui/Textarea';
import Button from '../ui/Button';
import MessageAlert from '../ui/MessageAlert';

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
            onDocumentAdd(response.data); // Notifica a página pai sobre o novo documento
        } catch (err) {
            setError(err.response?.data?.error || "Falha no upload do documento.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Formulário de Upload */}
            <div className="bg-white shadow-md rounded-lg p-6">
                <h3 className="text-xl font-semibold text-gray-700 mb-4">Carregar Novo Documento</h3>
                <form onSubmit={handleDocumentUpload} className="space-y-4">
                    <Input label="Nome do Arquivo" name="file_name" value={newDocumentData.file_name} onChange={handleInputChange} required />
                    <Input label="Tipo do Arquivo" name="file_type" value={newDocumentData.file_type} onChange={handleInputChange} required />
                    <Textarea label="Descrição (opcional)" name="description" value={newDocumentData.description} onChange={handleInputChange} rows="3" />
                    {error && <MessageAlert message={error} type="error" />}
                    {success && <MessageAlert message={success} type="success" />}
                    <Button type="submit" disabled={loading} variant="primary">
                        {loading ? 'Carregando...' : 'Carregar Documento'}
                    </Button>
                </form>
            </div>

            {/* Lista de Documentos */}
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
                                        <td className="px-4 py-3 text-sm text-blue-600 hover:underline">
                                            <a href={doc.file_url} target="_blank" rel="noopener noreferrer">{doc.file_name}</a>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{doc.file_type}</td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{new Date(doc.upload_date).toLocaleDateString('pt-BR')}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p className="text-center text-gray-500 py-4">Nenhum documento encontrado.</p>
                    )}
                </div>
            </div>
        </div>
    );
}

export default DocumentsTab;