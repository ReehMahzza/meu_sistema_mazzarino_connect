/*
================================================================================
ARQUIVO: frontend/src/pages/NewCasePage.jsx (REFATORADO)
================================================================================
*/
import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import MainLayout from '../components/MainLayout';
// ADICIONADO: Imports dos novos componentes de UI
import Input from '../components/ui/Input';
import Textarea from '../components/ui/Textarea';
import Button from '../components/ui/Button';
import MessageAlert from '../components/ui/MessageAlert';

function NewCasePage() {
    const { axiosInstance } = useContext(AuthContext);
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        password2: '',
        cpf: '',
        telefone: '',
        caseTitle: '',
        caseDescription: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (formData.password !== formData.password2) {
            setError('As senhas não coincidem.');
            setLoading(false);
            return;
        }

        try {
            // === DADOS PARA REGISTRO ===
            const registerPayload = {
                email: formData.email,
                password: formData.password,
                password2: formData.password2,
                cpf: formData.cpf || null, // Garante que seja null se vazio
                telefone: formData.telefone || null, // Garante que seja null se vazio
                // first_name e last_name não estão no formulário, mas podem ser adicionados se necessário
                // Ou o backend pode gerar um username a partir do email se não for fornecido
            };
            console.log("Dados de registro:", registerPayload);

            // 1. Registrar o novo cliente (usuário)
            const userResponse = await axiosInstance.post('/api/register/', registerPayload);
            const newClient = userResponse.data.user;
            console.log("Cliente registrado COMPLETO:", newClient);
            // O backend já retorna o ID do novo usuário, não precisa de busca adicional
            const newUserId = newClient.id;

            // === DADOS PARA CASO ===
            const casePayload = {
                title: formData.caseTitle,
                description: formData.caseDescription || null, // Garante que seja null se vazio
                client: newUserId, // O ID do cliente recém-criado
            };
            console.log("Dados do caso:", casePayload);

            // 2. Criar o caso associado a este novo cliente
            const caseCreateResponse = await axiosInstance.post('/api/cases/', casePayload);
            const newCase = caseCreateResponse.data;
            console.log("Caso criado:", newCase);

            alert('Cliente e caso criados com sucesso!'); // Manter alert por enquanto, será substituído por MessageAlert
            navigate('/documents');

        } catch (err) {
            console.error("Erro ao criar cliente/caso:", err.response?.data);
            const errorData = err.response?.data;
            let errorMessage = 'Ocorreu um erro. ';
            if (typeof errorData === 'object' && errorData !== null) {
                errorMessage += Object.entries(errorData)
                    .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
                    .join(' ');
            } else if (err.message) {
                errorMessage = err.message;
            }
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <MainLayout>
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Criar Novo Cliente e Caso</h2>
            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-lg space-y-8 max-w-4xl mx-auto">
                <div>
                    <h3 className="text-xl font-semibold text-gray-700 border-b pb-2 mb-4">Dados do Novo Cliente</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input label="E-mail do Cliente" name="email" type="email" value={formData.email} onChange={handleChange} required error={error.includes('email:') ? error : null} />
                        <Input label="CPF" name="cpf" value={formData.cpf} onChange={handleChange} error={error.includes('cpf:') ? error : null} />
                        <Input label="Senha" name="password" type="password" value={formData.password} onChange={handleChange} required error={error.includes('password:') ? error : null} />
                        <Input label="Confirmar Senha" name="password2" type="password" value={formData.password2} onChange={handleChange} required error={error.includes('password2:') ? error : null} />
                        <Input label="Telefone" name="telefone" type="tel" value={formData.telefone} onChange={handleChange} />
                    </div>
                </div>

                <div>
                    <h3 className="text-xl font-semibold text-gray-700 border-b pb-2 mb-4">Dados do Caso Inicial</h3>
                    <div className="space-y-4">
                        <Input label="Título do Caso" name="caseTitle" value={formData.caseTitle} onChange={handleChange} required error={error.includes('title:') ? error : null} />
                        <Textarea label="Descrição do Caso" name="caseDescription" value={formData.caseDescription} onChange={handleChange} />
                    </div>
                </div>

                <div className="pt-4">
                    {error && <div className="mb-4"><MessageAlert message={error} type="error" /></div>}
                    <Button type="submit" disabled={loading} variant="primary">
                        {loading ? 'Criando...' : 'Salvar Cliente e Criar Caso'}
                    </Button>
                </div>
            </form>
        </MainLayout>
    );
}

export default NewCasePage;
