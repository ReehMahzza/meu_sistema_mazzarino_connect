// frontend/src/pages/NewProtocolPage.jsx
import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import Input from '../components/ui/Input';
import Textarea from '../components/ui/Textarea';
import Button from '../components/ui/Button';
import Select from '../components/ui/Select';
import MessageAlert from '../components/ui/MessageAlert';

function NewProtocolPage() {
    const { axiosInstance } = useContext(AuthContext);
    const navigate = useNavigate();

    // Estados do formulário
    const [clientEmail, setClientEmail] = useState('');
    const [foundClient, setFoundClient] = useState(null);
    const [showNewClientForm, setShowNewClientForm] = useState(false);
    const [newClientData, setNewClientData] = useState({
        password: '',
        password2: '',
        cpf: '',
        telefone: ''
    });
    const [protocolData, setProtocolData] = useState({
        title: '',
        description: '',
        bank_name: '',
        bank_code: '',
        case_type: 'renegociacao_credito',
        contract_type: 'renegociacao_consignado'
    });

    // Estados de controle da UI
    const [loading, setLoading] = useState(false);
    const [searchMessage, setSearchMessage] = useState({ type: '', text: '' });
    const [submitError, setSubmitError] = useState('');

    // Opções para os campos de seleção
    const caseTypeOptions = [
        { value: 'renegociacao_credito', label: 'Protocolo (Renegociação)' },
        { value: 'resolucao_conflitos_telecom', label: 'Processo Admin (Telecom)' },
        { value: 'outros', label: 'Outros' }
    ];
    const contractTypeOptions = [
        { value: 'renegociacao_consignado', label: 'Renegociação Consignado INSS' },
        { value: 'credito_pessoal', label: 'Crédito Pessoal' },
        { value: 'financiamento_veicular', label: 'Financiamento Veicular' },
        { value: 'financiamento_imovel', label: 'Financiamento Imóvel' },
        { value: 'cartao_consignado', label: 'Cartão Consignado' },
        { value: 'cartao_beneficio', label: 'Cartão Benefício' }
    ];

    const handleSearchClient = async () => {
        if (!clientEmail) {
            setSearchMessage({ type: 'error', text: 'Por favor, insira um e-mail para buscar.' });
            return;
        }
        setLoading(true);
        setSearchMessage({ type: '', text: '' });
        setFoundClient(null);
        setShowNewClientForm(false);
        try {
            const response = await axiosInstance.get(`/api/users/?email=${clientEmail}`);
            if (response.data && response.data.length > 0) {
                setFoundClient(response.data[0]);
                setSearchMessage({ type: 'success', text: `Cliente encontrado: ${response.data[0].email}` });
            } else {
                setShowNewClientForm(true);
                setSearchMessage({ type: 'info', text: 'Cliente não encontrado. Preencha os dados abaixo para criá-lo.' });
            }
        } catch (err) {
            console.error("Erro ao buscar cliente:", err);
            setSearchMessage({ type: 'error', text: 'Ocorreu um erro ao buscar o cliente.' });
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e, formType) => {
        const { name, value } = e.target;
        if (formType === 'protocol') {
            setProtocolData(prev => ({ ...prev, [name]: value }));
        } else {
            setNewClientData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setSubmitError('');
        let clientId = foundClient ? foundClient.id : null;

        try {
            if (showNewClientForm && !foundClient) {
                if (newClientData.password !== newClientData.password2) {
                    throw new Error('As senhas para o novo cliente não coincidem.');
                }
                // Lembrete: o CPF se tornou obrigatório para a geração do ID
                if (!newClientData.cpf) {
                    throw new Error('O CPF é obrigatório para criar um novo cliente.');
                }
                const registerResponse = await axiosInstance.post('/api/register/', {
                    email: clientEmail,
                    ...newClientData
                });
                clientId = registerResponse.data.user.id;
            }

            if (!clientId) {
                throw new Error('Nenhum cliente selecionado ou criado. Faça a busca por e-mail primeiro.');
            }

            const casePayload = {
                ...protocolData,
                client_id: clientId // Usamos client_id para o backend identificar o cliente
            };
            const caseResponse = await axiosInstance.post('/api/cases/', casePayload);
            const newProtocolId = caseResponse.data.id;

            alert('Protocolo criado com sucesso!');
            navigate(`/protocolos/${newProtocolId}`);

        } catch (err) {
            console.error("Erro ao criar protocolo:", err);
            const errorMsg = err.response?.data ? JSON.stringify(err.response.data) : err.message;
            setSubmitError(`Falha ao criar o protocolo: ${errorMsg}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Criar Novo Protocolo</h2>
            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-lg space-y-8 max-w-4xl mx-auto">
                {/* Seção 1: Cliente */}
                <div className="p-6 border rounded-lg">
                    <h3 className="text-xl font-semibold text-gray-700 mb-4">1. Cliente</h3>
                    <div className="flex items-end gap-4">
                        <div className="flex-grow">
                            <Input label="E-mail do Cliente" name="clientEmail" type="email" value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} required />
                        </div>
                        <Button type="button" onClick={handleSearchClient} disabled={loading} variant="secondary">
                            {loading ? 'Buscando...' : 'Buscar Cliente'}
                        </Button>
                    </div>
                    {searchMessage.text && (
                        <div className="mt-4">
                            <MessageAlert message={searchMessage.text} type={searchMessage.type} />
                        </div>
                    )}
                    {showNewClientForm && (
                        <div className="mt-6 pt-6 border-t animate-fade-in">
                            <h4 className="font-semibold text-gray-600 mb-4">Dados para Novo Cliente</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Input label="CPF (obrigatório)" name="cpf" value={newClientData.cpf} onChange={(e) => handleChange(e, 'client')} required />
                                <Input label="Telefone (opcional)" name="telefone" type="tel" value={newClientData.telefone} onChange={(e) => handleChange(e, 'client')} />
                                <Input label="Senha" name="password" type="password" value={newClientData.password} onChange={(e) => handleChange(e, 'client')} required />
                                <Input label="Confirmar Senha" name="password2" type="password" value={newClientData.password2} onChange={(e) => handleChange(e, 'client')} required />
                            </div>
                        </div>
                    )}
                </div>

                {/* Seção 2: Detalhes do Protocolo */}
                <div className="p-6 border rounded-lg">
                    <h3 className="text-xl font-semibold text-gray-700 mb-4">2. Detalhes do Protocolo</h3>
                    <div className="space-y-4">
                        <Input label="Título do Protocolo" name="title" value={protocolData.title} onChange={(e) => handleChange(e, 'protocol')} required />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Select label="Tipo de Caso" name="case_type" value={protocolData.case_type} onChange={(e) => handleChange(e, 'protocol')} options={caseTypeOptions} required />
                            <Select label="Tipo de Contrato" name="contract_type" value={protocolData.contract_type} onChange={(e) => handleChange(e, 'protocol')} options={contractTypeOptions} required />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input label="Nome do Banco" name="bank_name" value={protocolData.bank_name} onChange={(e) => handleChange(e, 'protocol')} />
                            <Input label="Código do Banco" name="bank_code" value={protocolData.bank_code} onChange={(e) => handleChange(e, 'protocol')} />
                        </div>
                        <Textarea label="Descrição do Protocolo" name="description" value={protocolData.description} onChange={(e) => handleChange(e, 'protocol')} />
                    </div>
                </div>

                {/* Submissão */}
                <div className="pt-4">
                    {submitError && <MessageAlert message={submitError} type="error" />}
                    <Button type="submit" disabled={loading || (!foundClient && !showNewClientForm)} variant="primary">
                        {loading ? 'Criando Protocolo...' : 'Criar Protocolo'}
                    </Button>
                </div>
            </form>
        </div>
    );
}

export default NewProtocolPage;