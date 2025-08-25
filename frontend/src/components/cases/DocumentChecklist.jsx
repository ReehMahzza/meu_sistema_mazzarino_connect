// frontend/src/components/cases/DocumentChecklist.jsx

import React, { useState, useEffect, useContext, useCallback } from 'react';
import AuthContext from '../../context/AuthContext';

// Componente para uma linha do checklist
const ChecklistItem = ({ item, onUpdate }) => {
    const [checkData, setCheckData] = useState(item.validation || {});
    const [isUpdating, setIsUpdating] = useState(false);

    const handleCheckboxChange = async (e) => {
        const { name, checked } = e.target;
        const updatedData = { ...checkData, [name]: checked };
        setCheckData(updatedData);
        setIsUpdating(true);
        await onUpdate(item.documentId, updatedData, item.validation?.id);
        setIsUpdating(false);
    };

    return (
        <tr className={item.isPresent ? 'bg-white' : 'bg-gray-50 hover:bg-red-50'}>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {item.requiredName}
                {!item.isMandatory && <span className="text-xs text-gray-500 ml-1">(Opcional)</span>}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm">
                {item.isPresent ? (
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Presente</span>
                ) : (
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">Faltando</span>
                )}
            </td>
            <td className="px-6 py-4 space-x-4 text-center">
                {item.isPresent && ['visibilidade_ok', 'legibilidade_ok', 'frente_e_verso_ok', 'documento_correto_ok'].map(checkName => (
                    <input
                        key={checkName}
                        type="checkbox"
                        name={checkName}
                        checked={!!checkData[checkName]}
                        onChange={handleCheckboxChange}
                        disabled={isUpdating}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 disabled:opacity-50"
                    />
                ))}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {item.isPresent && item.validation ? (
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        item.validation.status === 'APROVADO' ? 'bg-green-100 text-green-800' :
                        item.validation.status === 'REPROVADO' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                    }`}>
                        {item.validation.status || 'PENDENTE'}
                    </span>
                ) : (item.isPresent ? 'PENDENTE' : '-')}
            </td>
        </tr>
    );
};


function DocumentChecklist({ protocol }) {
    const [checklistItems, setChecklistItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const { axiosInstance } = useContext(AuthContext);

    const generateChecklist = useCallback((requiredDocs, uploadedDocs, validationChecks) => {
        const uploadedDocsMap = new Map(uploadedDocs.map(doc => [doc.file_name.toLowerCase(), doc]));
        const validationChecksMap = new Map(validationChecks.map(check => [check.document, check]));

        const items = requiredDocs.map(reqDoc => {
            const uploaded = uploadedDocsMap.get(reqDoc.document_name.toLowerCase());
            const validation = uploaded ? validationChecksMap.get(uploaded.id) : null;
            return {
                requiredName: reqDoc.document_name,
                isMandatory: reqDoc.is_mandatory,
                isPresent: !!uploaded,
                documentId: uploaded ? uploaded.id : null,
                validation: validation || null,
            };
        });
        setChecklistItems(items);
    }, []);

    const fetchChecklistData = useCallback(async () => {
        setLoading(true);
        try {
            const [checklistRes, validationsRes] = await Promise.all([
                axiosInstance.get(`/api/cases/${protocol.id}/checklist/`),
                axiosInstance.get(`/api/cases/${protocol.id}/document-validations/`)
            ]);
            generateChecklist(
                checklistRes.data.required_documents,
                protocol.documents,
                validationsRes.data
            );
        } catch (error) {
            console.error("Erro ao carregar dados do checklist:", error);
        } finally {
            setLoading(false);
        }
    }, [axiosInstance, protocol.id, protocol.documents, generateChecklist]);

    useEffect(() => {
        if (protocol.id) {
            fetchChecklistData();
        }
    }, [fetchChecklistData, protocol.id]);

    const handleUpdateCheck = async (documentId, updatedData, checkId) => {
        try {
            if (checkId) {
                await axiosInstance.patch(`/api/document-validations/${checkId}/`, updatedData);
            } else {
                const payload = { ...updatedData, document: documentId };
                await axiosInstance.post(`/api/cases/${protocol.id}/document-validations/`, payload);
            }
            fetchChecklistData(); // Recarrega os dados para garantir consistência
        } catch (error) {
            console.error("Erro ao atualizar o checklist:", error);
        }
    };

    if (loading) {
        return <div className="bg-white shadow-md rounded-lg p-6 text-center text-gray-500">Carregando checklist...</div>;
    }

    return (
        <div className="bg-white shadow-md rounded-lg">
            <h3 className="text-xl font-semibold text-gray-800 p-4 border-b">Checklist de Validação Documental</h3>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Documento</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Visível / Legível / Completo / Correto</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Validação</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {checklistItems.map(item => (
                            <ChecklistItem key={item.requiredName} item={item} onUpdate={handleUpdateCheck} />
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default DocumentChecklist;