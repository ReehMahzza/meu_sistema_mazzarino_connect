// frontend/src/pages/NewCasePage.jsx
import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import ClientSelector from '../components/forms/ClientSelector';
import Input from '../components/ui/Input';
import Textarea from '../components/ui/Textarea';
import Button from '../components/ui/Button';
import Select from '../components/ui/Select';
import MessageAlert from '../components/ui/MessageAlert';

function NewCasePage() {
    const { axiosInstance } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation(); // Hook para ler o estado da navegação

    // Lógica para pegar o tipo de caso pré-selecionado
    const defaultCaseType = location.state?.defaultCaseType || 'renegociacao_credito';

    const [selectedClient, setSelectedClient] = useState(null);
    const [showNewClientButton, setShowNewClientButton] = useState(false);
    const [caseData, setCaseData] = useState({
        title: '',
        description: '',
        case_type: defaultCaseType, // Define o valor padrão aqui
        contract_type: 'renegociacao_consignado',
        bank_name: '',
        bank_code: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const caseTypeOptions = [
        { value: 'renegociacao_credito', label: 'Protocolo (Renegociação)' },
        { value: 'resolucao_conflitos_telecom', label: 'Processo Admin (Telecom)' },
        { value: 'outros', label: 'Ofício' }
    ];
    const contractTypeOptions = [
        { value: 'renegociacao_consignado', label: 'Renegociação Consignado INSS' },
        { value: 'credito_pessoal', label: 'Crédito Pessoal' },
        // ... outras opções
    ];

    const handleClientSelection = (client) => {
        setSelectedClient(client);
        setShowNewClientButton(false);
    };

    const handleNoClientFound = () => {
        setShowNewClientButton(true);
        setSelectedClient(null);
    };

    const handleChange = (e) => {
        setCaseData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedClient) {
            setError("Por favor, selecione um cliente antes de criar o caso.");
            return;
        }
        setLoading(true);
        setError('');

        try {
            const payload = {
                ...caseData,
                client_id: selectedClient.id
            };
            const response = await axiosInstance.post('/api/cases/', payload);
            const newCaseId = response.data.id;
            alert('Caso criado com sucesso!');
            navigate(`/protocolos/${newCaseId}`);
        } catch (err) {
            setError("Falha ao criar o caso. Verifique os campos.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Criar Novo Caso</h2>
            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-lg space-y-8 max-w-4xl mx-auto">
                <div className="p-6 border rounded-lg">
                    <h3 className="text-xl font-semibold text-gray-700 mb-4">1. Selecione o Cliente</h3>
                    <ClientSelector 
                        onClientSelect={handleClientSelection} 
                        onNoResults={handleNoClientFound} 
                    />
                    {selectedClient && (
                        <div className="mt-4 p-4 bg-green-100 border border-green-200 rounded-md">
                            <p className="font-semibold text-green-800">Cliente Selecionado:</p>
                            <p className="text-green-700">{`${selectedClient.first_name || ''} ${selectedClient.last_name || ''} (${selectedClient.email})`.trim()}</p>
                        </div>
                    )}
                    {showNewClientButton && (
                        <div className="mt-4 text-center p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                            <p className="text-yellow-800 mb-3">Cliente não encontrado na base de dados.</p>
                            <Link to="/novo-contato">
                                <Button variant="secondary">+ Cadastrar Novo Cliente</Button>
                            </Link>
                        </div>
                    )}
                </div>

                {selectedClient && (
                    <div className="p-6 border rounded-lg animate-fade-in">
                        <h3 className="text-xl font-semibold text-gray-700 mb-4">2. Detalhes do Caso</h3>
                        <div className="space-y-4">
                            <Input label="Título do Caso" name="title" value={caseData.title} onChange={handleChange} required />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Select label="Tipo de Caso" name="case_type" value={caseData.case_type} onChange={handleChange} options={caseTypeOptions} required />
                                <Select label="Tipo de Contrato" name="contract_type" value={caseData.contract_type} onChange={handleChange} options={contractTypeOptions} required />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Input label="Nome do Banco" name="bank_name" value={caseData.bank_name} onChange={handleChange} />
                                <Input label="Código do Banco" name="bank_code" value={caseData.bank_code} onChange={handleChange} />
                            </div>
                            <Textarea label="Descrição" name="description" value={caseData.description} onChange={handleChange} />
                        </div>
                    </div>
                )}
                <div className="pt-4">
                    {error && <MessageAlert message={error} type="error" />}
                    <Button type="submit" disabled={!selectedClient || loading} variant="primary">
                        {loading ? 'Criando...' : 'Salvar e Criar Caso'}
                    </Button>
                </div>
            </form>
        </div>
    );
}

export default NewCasePage;