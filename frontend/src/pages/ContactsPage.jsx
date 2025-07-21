/*
================================================================================
ARQUIVO: frontend/src/pages/ContactsPage.jsx (NOVO ARQUIVO)
================================================================================
*/
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../config/axiosConfig';
import Button from '../components/ui/Button';

const ContactsPage = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState(''); // '', 'CLIENTE', 'FUNCIONARIO', 'ADMIN'
  const navigate = useNavigate();

  const loadContacts = async () => {
    try {
      setLoading(true);
      
      // DEBUG: Verificar se o token existe
      const token = localStorage.getItem('access_token');
      console.log('Token encontrado:', token ? 'SIM' : 'NÃO');
      console.log('Token:', token?.substring(0, 50) + '...');
      
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (filterType) params.type = filterType;
      
      console.log('Fazendo requisição para /api/contacts/ com params:', params);
      
      const response = await axiosInstance.get('/api/contacts/', { params });
      console.log('Resposta recebida:', response.data);
      setContacts(response.data);
    } catch (error) {
      console.error('Erro ao carregar contatos:', error);
      console.error('Status do erro:', error.response?.status);
      console.error('Dados do erro:', error.response?.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContacts();
  }, [searchTerm, filterType]);

  const getRoleLabel = (role) => {
    const roleMap = {
      'CLIENTE': 'Cliente',
      'FUNCIONARIO': 'Funcionário', 
      'ADMIN': 'Administrador'
    };
    return roleMap[role] || role;
  };

  const getStatusBadge = (contact) => {
    if (contact.is_system_user) {
      return <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">Usuário do Sistema</span>;
    }
    return <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">Apenas Contato</span>;
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Contatos</h1>
        <Button
          onClick={() => navigate('/novo-contato')}
          className="bg-blue-600 hover:bg-blue-700"
        >
          + Novo Contato
        </Button>
      </div>
      
      {/* FILTROS E PESQUISA */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pesquisar
            </label>
            <input
              type="text"
              placeholder="Nome, email ou CPF..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filtrar por Tipo
            </label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos</option>
              <option value="CLIENTE">Clientes</option>
              <option value="FUNCIONARIO">Funcionários</option>
              <option value="ADMIN">Administradores</option>
            </select>
          </div>
          
          <div className="flex items-end">
            <Button
              onClick={loadContacts}
              variant="secondary"
              className="w-full"
            >
              🔄 Atualizar
            </Button>
          </div>
        </div>
      </div>
      
      {/* TABELA DE CONTATOS */}
      <div className="bg-white rounded-lg shadow">
        {loading ? (
          <div className="p-6 text-center">
            <p className="text-gray-600">Carregando contatos...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nome
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Telefone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {contacts.map((contact) => (
                  <tr key={contact.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {contact.full_name}
                        </div>
                        {contact.cpf && (
                          <div className="text-sm text-gray-500">
                            CPF: {contact.cpf}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {contact.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {getRoleLabel(contact.role)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(contact)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {contact.telefone || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button className="text-indigo-600 hover:text-indigo-900 mr-4">
                        Editar
                      </button>
                      <button className="text-red-600 hover:text-red-900">
                        Excluir
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {contacts.length === 0 && !loading && (
              <div className="p-6 text-center text-gray-500">
                Nenhum contato encontrado.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ContactsPage;