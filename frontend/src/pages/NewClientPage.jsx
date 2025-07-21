/*
================================================================================
ARQUIVO: frontend/src/pages/NewClientPage.jsx (NOVO ARQUIVO)
================================================================================
*/
import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import axiosInstance from '../config/axiosConfig';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import MessageAlert from '../components/ui/MessageAlert';

const NewClientPage = () => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    cpf: '',
    telefone: '',
    setor_ou_equipe: '',
    contact_type: 'CLIENTE',
    is_full_user: false,
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    
    try {
      const response = await axiosInstance.post('/api/contacts/create/', formData);
      
      setMessage(`Contato "${response.data.full_name}" criado com sucesso!`);
      
      // Redirecionar após 2 segundos
      setTimeout(() => {
        navigate('/contatos');
      }, 2000);
      
    } catch (error) {
      console.error('Erro ao criar contato:', error);
      setError(error.response?.data?.detail || 'Erro ao criar contato');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Novo Contato</h1>
        
        {message && <MessageAlert type="success" message={message} />}
        {error && <MessageAlert type="error" message={error} />}
        
        <div className="bg-white rounded-lg shadow p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* INFORMAÇÕES BÁSICAS */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Informações Básicas</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Nome"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleInputChange}
                  required
                />
                <Input
                  label="Sobrenome"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <Input
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
                <Input
                  label="CPF"
                  name="cpf"
                  value={formData.cpf}
                  onChange={handleInputChange}
                  placeholder="000.000.000-00"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <Input
                  label="Telefone"
                  name="telefone"
                  value={formData.telefone}
                  onChange={handleInputChange}
                  placeholder="(11) 99999-9999"
                />
                <Input
                  label="Setor/Equipe"
                  name="setor_ou_equipe"
                  value={formData.setor_ou_equipe}
                  onChange={handleInputChange}
                  placeholder="Ex: Financeiro, Jurídico..."
                />
              </div>
            </div>
            
            {/* CONFIGURAÇÕES DE ACESSO */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Configurações de Acesso</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Contato
                  </label>
                  <select
                    name="contact_type"
                    value={formData.contact_type}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="CLIENTE">Cliente</option>
                    <option value="FUNCIONARIO">Funcionário</option>
                    <option value="ADMIN">Administrador</option>
                  </select>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="is_full_user"
                    checked={formData.is_full_user}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-900">
                    Criar como usuário do sistema (pode fazer login)
                  </label>
                </div>
                
                {formData.is_full_user && (
                  <div className="mt-4">
                    <Input
                      label="Senha (opcional - se vazio, será criada uma senha temporária)"
                      name="password"
                      type="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Digite uma senha ou deixe vazio para gerar automaticamente"
                    />
                    {!formData.password && (
                      <p className="text-sm text-gray-500 mt-1">
                        💡 Se deixar vazio, a senha temporária será: temp[ID]2024
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            {/* BOTÕES */}
            <div className="flex gap-4 pt-6 border-t">
              <Button
                type="submit"
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {loading ? 'Salvando...' : 'Salvar Contato'}
              </Button>
              
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate('/contatos')}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NewClientPage;