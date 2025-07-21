/*
================================================================================
ARQUIVO: frontend/src/components/cases/ComunicacaoTab.jsx (NOVO ARQUIVO)
================================================================================
Este componente gerencia a criação e listagem de comunicações para um caso.
*/
import React, { useState, useEffect, useContext, useCallback } from 'react';
import AuthContext from '../../context/AuthContext';
import Timeline from './Timeline'; // Reutilizando o componente Timeline
import Button from '../ui/Button';
import Select from '../ui/Select';
import Input from '../ui/Input';
import Textarea from '../ui/Textarea';
import MessageAlert from '../ui/MessageAlert';

function ComunicacaoTab({ protocol }) {
    const { axiosInstance } = useContext(AuthContext);
    const [comunicacoes, setComunicacoes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [submitError, setSubmitError] = useState('');

    const [newComunicacao, setNewComunicacao] = useState({
        tipo_comunicacao: 'Nota Interna',
        destinatario: '',
        assunto: '',
        corpo: ''
    });

    // Função para buscar as comunicações
    const fetchComunicacoes = useCallback(async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get(`/api/cases/${protocol.id}/comunicacoes/`);
            setComunicacoes(response.data);
        } catch (err) {
            console.error("Erro ao buscar comunicações:", err);
            setError("Não foi possível carregar o histórico de comunicações.");
        } finally {
            setLoading(false);
        }
    }, [axiosInstance, protocol.id]);

    useEffect(() => {
        fetchComunicacoes();
    }, [fetchComunicacoes]);

    const handleChange = (e) => {
        setNewComunicacao({ ...newComunicacao, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitError('');
        try {
            await axiosInstance.post(`/api/cases/${protocol.id}/comunicacoes/`, newComunicacao);
            // Limpa o formulário e recarrega a lista
            setNewComunicacao({
                tipo_comunicacao: 'Nota Interna',
                destinatario: '',
                assunto: '',
                corpo: ''
            });
            fetchComunicacoes();
        } catch (err) {
            console.error("Erro ao criar comunicação:", err);
            setSubmitError("Falha ao registrar a comunicação. Verifique os campos.");
        }
    };

    // Transforma os dados de 'comunicacoes' para o formato que o componente 'Timeline' espera
    const timelineMovements = comunicacoes.map(com => ({
        id: `comm-${com.id}`, // Prefixo para evitar conflito de keys se um dia juntarmos
        movement_type: com.tipo_comunicacao,
        content: `Assunto: ${com.assunto}\n\n${com.corpo}` + (com.destinatario ? `\n\nDestinatário: ${com.destinatario}` : ''),
        actor: com.autor,
        timestamp: com.timestamp,
    }));

    const tipoOptions = [
        { value: 'Nota Interna', label: 'Nota Interna' },
        { value: 'Email para Cliente', label: 'Email para Cliente' },
        { value: 'Notificação para Banco', label: 'Notificação para Banco' }
    ];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Formulário de Criação */}
            <div className="lg:col-span-4">
                <div className="bg-white shadow-md rounded-lg p-6 sticky top-6">
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">Registrar Nova Comunicação</h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Select
                            label="Tipo de Comunicação"
                            name="tipo_comunicacao"
                            value={newComunicacao.tipo_comunicacao}
                            onChange={handleChange}
                            options={tipoOptions}
                            required
                        />
                        <Input
                            label="Destinatário (opcional)"
                            name="destinatario"
                            type="email"
                            placeholder="email@exemplo.com"
                            value={newComunicacao.destinatario}
                            onChange={handleChange}
                        />
                        <Input
                            label="Assunto"
                            name="assunto"
                            value={newComunicacao.assunto}
                            onChange={handleChange}
                            required
                        />
                        <Textarea
                            label="Corpo da Mensagem"
                            name="corpo"
                            value={newComunicacao.corpo}
                            onChange={handleChange}
                            rows={5}
                            required
                        />
                        {submitError && <MessageAlert message={submitError} type="error" />}
                        <Button type="submit" variant="primary">
                            Registrar
                        </Button>
                    </form>
                </div>
            </div>

            {/* Lista de Comunicações (Timeline) */}
            <div className="lg:col-span-8">
                {loading && <p>Carregando comunicações...</p>}
                {error && <MessageAlert message={error} type="error" />}
                {!loading && !error && (
                    <Timeline movements={timelineMovements} />
                )}
            </div>
        </div>
    );
}

export default ComunicacaoTab;