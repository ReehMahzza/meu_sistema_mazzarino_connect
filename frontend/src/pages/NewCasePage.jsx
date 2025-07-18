/*
================================================================================
ARQUIVO: frontend/src/pages/NewCasePage.jsx (NOVO ARQUIVO)
================================================================================
Página para criar um novo cliente (usuário) e um caso associado.
*/
import React, { useState, useContext } from 'react';
import AuthContext from '../context/AuthContext';
import MainLayout from '../components/MainLayout';
import { useNavigate } from 'react-router-dom';

function NewCasePage() {
    const { axiosInstance, user } = useContext(AuthContext); // user do contexto para pegar id do funcionário
    const navigate = useNavigate();

    const [clientData, setClientData] = useState({
        email: '',
        password: '',
        password2: '',
        cpf: '',
        telefone: '',
        first_name: '', // Opcional, mas útil se quiser coletar
        last_name: '', // Opcional, mas útil se quiser coletar
    });
    const [caseData, setCaseData] = useState({
        title: '',
        description: '',
        case_type: 'analysis',  // ← VALOR VÁLIDO
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' }); // {type: 'success'/'error', text: '...'}
    const [error, setError] = useState(''); // Para mensagens de erro detalhadas

    const handleClientChange = (e) => {
        const { name, value } = e.target;
        setClientData({ ...clientData, [name]: value });
    };

    const handleCaseChange = (e) => {
        const { name, value } = e.target;
        setCaseData({ ...caseData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();  // ← LINHA MAIS IMPORTANTE!
        setLoading(true);
        
        try {
            console.log("=== INÍCIO DO PROCESSO ===");
            
            // 1. Validações
            if (!clientData.email || !clientData.password || !clientData.password2 || !caseData.title) {
                setMessage({ type: 'error', text: 'Por favor, preencha todos os campos obrigatórios (E-mail, Senha, Confirmação e Título do Caso).' });
                setLoading(false);
                return;
            }
            if (clientData.password !== clientData.password2) {
                setMessage({ type: 'error', text: 'As senhas não coincidem.' });
                setLoading(false);
                return;
            }

            // 2. Registrar cliente
            const clientPayload = {
                username: clientData.email,
                email: clientData.email,
                first_name: clientData.first_name || '',
                last_name: clientData.last_name || '',
                cpf: clientData.cpf || '',
                telefone: clientData.telefone || '',
                password: 'temporarypassword123',  // ← ADICIONAR SENHA OBRIGATÓRIA
                password2: 'temporarypassword123'   // ← ADICIONAR CONFIRMAÇÃO
            };

            console.log("=== REGISTRANDO CLIENTE ===");
            console.log("Dados do cliente:", clientPayload);
            
            const clientResponse = await axiosInstance.post('/api/register/', clientPayload);
            const clientUser = clientResponse.data.user;

            console.log("=== CLIENTE REGISTRADO ===");
            console.log("Resposta:", clientUser);

            // PAYLOAD PARA O CASO:
            const casePayload = {
                title: caseData.title,
                description: caseData.description || '',
                client: clientUser.id  // ID do cliente
            };

            console.log("=== ENVIANDO CASO PARA API ===");
            console.log("URL:", '/api/cases/');
            console.log("Payload:", casePayload);

            // REQUISIÇÃO PARA CRIAR CASO:
            const caseResponse = await axiosInstance.post('/api/cases/', casePayload);
            
            console.log("=== RESPOSTA DA API ===");
            console.log("Status:", caseResponse.status);
            console.log("Data:", caseResponse.data);

            // 4. Resetar e mostrar sucesso
            setClientData({ email: '', password: '', password2: '', cpf: '', telefone: '', first_name: '', last_name: '' });
            setCaseData({ title: '', description: '' });
            setMessage({ type: 'success', text: 'Cliente e caso criados com sucesso!' });
            setError('');

            setTimeout(() => {
                navigate(`/documents`);
            }, 2000);

        } catch (error) {
            console.error("=== ERRO COMPLETO ===");
            console.error("Error object:", error);
            console.error("Response:", error.response);
            console.error("Request:", error.request);
            
            if (error.response?.data) {
                const errorData = error.response.data;
                if (typeof errorData === 'object') {
                    const errorMessages = Object.entries(errorData)
                        .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
                        .join(' | ');
                    setError(`Erro: ${errorMessages}`);
                } else {
                    setError(`Erro: ${errorData}`);
                }
            } else {
                setError(`Erro: ${error.message}`);
            }
            setMessage('');
        } finally {
            setLoading(false);
        }
    };


    return (
        <MainLayout>
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Novo Cliente e Caso</h2>

            <div className="bg-white p-6 rounded-lg shadow">
                {message.text && (
                    <div className={`p-3 mb-4 rounded-md ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {message.text}
                    </div>
                )}
                
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Seção Dados do Cliente */}
                    <h3 className="text-xl font-bold text-gray-700 border-b pb-2 mb-4">Dados do Novo Cliente</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-600 mb-1">E-mail (obrigatório)</label>
                            <input type="email" id="email" name="email" value={clientData.email} onChange={handleClientChange}
                                   className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" required />
                        </div>
                        <div>
                            <label htmlFor="cpf" className="block text-sm font-medium text-gray-600 mb-1">CPF (opcional)</label>
                            <input type="text" id="cpf" name="cpf" value={clientData.cpf} onChange={handleClientChange}
                                   className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" />
                        </div>
                        <div>
                            <label htmlFor="telefone" className="block text-sm font-medium text-gray-600 mb-1">Telefone (opcional)</label>
                            <input type="text" id="telefone" name="telefone" value={clientData.telefone} onChange={handleClientChange}
                                   className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" />
                        </div>
                        {/* Campos first_name e last_name são opcionais para o modelo e para a API de registro */}
                        <div>
                            <label htmlFor="first_name" className="block text-sm font-medium text-gray-600 mb-1">Primeiro Nome (opcional)</label>
                            <input type="text" id="first_name" name="first_name" value={clientData.first_name} onChange={handleClientChange}
                                   className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" />
                        </div>
                        <div>
                            <label htmlFor="last_name" className="block text-sm font-medium text-gray-600 mb-1">Sobrenome (opcional)</label>
                            <input type="text" id="last_name" name="last_name" value={clientData.last_name} onChange={handleClientChange}
                                   className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" />
                        </div>
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-600 mb-1">Senha (obrigatória)</label>
                            <input type="password" id="password" name="password" value={clientData.password} onChange={handleClientChange}
                                   className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" required />
                        </div>
                        <div>
                            <label htmlFor="password2" className="block text-sm font-medium text-gray-600 mb-1">Confirmar Senha (obrigatória)</label>
                            <input type="password" id="password2" name="password2" value={clientData.password2} onChange={handleClientChange}
                                   className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" required />
                        </div>
                    </div>

                    {/* Seção Dados do Caso */}
                    <h3 className="text-xl font-bold text-gray-700 border-b pb-2 mb-4 mt-8">Dados do Caso Inicial</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="title" className="block text-sm font-medium text-gray-600 mb-1">Título do Caso (obrigatório)</label>
                            <input type="text" id="title" name="title" value={caseData.title} onChange={handleCaseChange}
                                   className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" required />
                        </div>
                        
                        {/* ← ADICIONAR ESTE CAMPO */}
                        <div>
                            <label htmlFor="case_type" className="block text-sm font-medium text-gray-600 mb-1">Tipo do Caso</label>
                            <select id="case_type" name="case_type" value={caseData.case_type} onChange={handleCaseChange}
                                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" required>
                                <option value="analysis">Análise</option>
                                <option value="negotiation">Negociação</option>
                                <option value="liquidation">Liquidação</option>
                            </select>
                        </div>
                        
                        <div className="md:col-span-2">
                            <label htmlFor="description" className="block text-sm font-medium text-gray-600 mb-1">Descrição do Caso (opcional)</label>
                            <textarea id="description" name="description" value={caseData.description} onChange={handleCaseChange}
                                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" rows="3" />
                        </div>
                    </div>

                    <div className="flex justify-end pt-4">
                        <button 
                            type="submit"  // ← MANTER TYPE=SUBMIT
                            disabled={loading}
                            className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg shadow hover:bg-blue-700 disabled:bg-blue-400"
                        >
                            {loading ? 'Salvando...' : 'Salvar Cliente e Criar Caso'}
                        </button>
                    </div>
                </form>
            </div>
        </MainLayout>
    );
}

export default NewCasePage;