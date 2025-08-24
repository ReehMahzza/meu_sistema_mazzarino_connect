// frontend/src/components/cases/ComunicacaoTab.jsx
import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import AuthContext from '../../context/AuthContext';
import Timeline from './Timeline';
import Button from '../ui/Button';
import Select from '../ui/Select';
import Input from '../ui/Input';
import MessageAlert from '../ui/MessageAlert';

// Componente da Barra de Ferramentas para o Tiptap
const MenuBar = ({ editor }) => {
    if (!editor) {
        return null;
    }
    return (
        <div className="flex items-center gap-2 p-2 border-t border-x border-gray-300 rounded-t-md bg-gray-50">
            <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={editor.isActive('bold') ? 'bg-gray-300 p-1 rounded' : 'p-1 rounded hover:bg-gray-200'}><strong>B</strong></button>
            <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={editor.isActive('italic') ? 'bg-gray-300 p-1 rounded' : 'p-1 rounded hover:bg-gray-200'}><em>I</em></button>
            <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className={editor.isActive('bulletList') ? 'bg-gray-300 p-1 rounded' : 'p-1 rounded hover:bg-gray-200'}>Lista</button>
        </div>
    );
};

function ComunicacaoTab({ protocol }) {
    const { axiosInstance } = useContext(AuthContext);
    const [comunicacoes, setComunicacoes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [submitError, setSubmitError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [newComunicacao, setNewComunicacao] = useState({
        tipo_comunicacao: 'Nota Interna',
        destinatario: '',
        assunto: '',
    });

    const editor = useEditor({
        extensions: [StarterKit],
        content: '',
        editorProps: {
            attributes: {
                class: 'prose max-w-none p-3 border border-gray-300 rounded-b-md min-h-[150px] focus:outline-none',
            },
        },
    });

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
        if (!editor || editor.isEmpty) {
            setSubmitError("O corpo da mensagem não pode estar vazio.");
            return;
        }
        setSubmitError('');
        setIsSubmitting(true);
        try {
            const payload = {
                ...newComunicacao,
                corpo: editor.getHTML()
            };
            await axiosInstance.post(`/api/cases/${protocol.id}/comunicacoes/`, payload);

            // Limpa o formulário e recarrega a lista
            setNewComunicacao({ tipo_comunicacao: 'Nota Interna', destinatario: '', assunto: '' });
            editor.commands.clearContent();
            fetchComunicacoes();
        } catch (err) {
            console.error("Erro ao criar comunicação:", err);
            setSubmitError("Falha ao registrar a comunicação. Verifique os campos.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Transforma os dados de 'comunicacoes' para o formato que o componente 'Timeline' espera
    const timelineMovements = comunicacoes.map(com => ({
        id: `comm-${com.id}`,
        movement_type: com.tipo_comunicacao,
        content: `<strong>Assunto:</strong> ${com.assunto}<br/>` + (com.destinatario ? `<strong>Destinatário:</strong> ${com.destinatario}<br/><br/>` : '<br/>') + com.corpo,
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
            <div className="lg:col-span-5">
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
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Corpo da Mensagem</label>
                            <MenuBar editor={editor} />
                            <EditorContent editor={editor} />
                        </div>

                        {submitError && <MessageAlert message={submitError} type="error" />}
                        <Button type="submit" variant="primary" disabled={isSubmitting}>
                            {isSubmitting ? 'Registrando...' : 'Registrar'}
                        </Button>
                    </form>
                </div>
            </div>

            {/* Lista de Comunicações (Timeline) */}
            <div className="lg:col-span-7">
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