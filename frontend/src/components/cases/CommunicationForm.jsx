// frontend/src/components/cases/CommunicationForm.jsx
import React, { useState, useContext } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import AuthContext from '../../context/AuthContext';
import Button from '../ui/Button';
import Input from '../ui/Input';
import MessageAlert from '../ui/MessageAlert';

const MenuBar = ({ editor }) => {
    if (!editor) return null;
    return (
        <div className="flex items-center gap-2 p-2 border-t border-x border-gray-300 rounded-t-md bg-gray-50">
            <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={editor.isActive('bold') ? 'bg-gray-300 p-1 rounded' : 'p-1 rounded hover:bg-gray-200'}><strong>B</strong></button>
            <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={editor.isActive('italic') ? 'bg-gray-300 p-1 rounded' : 'p-1 rounded hover:bg-gray-200'}><em>I</em></button>
            <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className={editor.isActive('bulletList') ? 'bg-gray-300 p-1 rounded' : 'p-1 rounded hover:bg-gray-200'}>Lista</button>
        </div>
    );
};

function CommunicationForm({ protocolId, onClose, onCommunicationSent }) {
    const [activeTab, setActiveTab] = useState('E-mail');
    const [formData, setFormData] = useState({ destinatario: '', cc: '', assunto: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { axiosInstance } = useContext(AuthContext);

    const editor = useEditor({
        extensions: [StarterKit],
        content: '',
        editorProps: { attributes: { class: 'prose max-w-none p-3 border border-gray-300 rounded-b-md min-h-[200px] focus:outline-none' } },
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!editor || editor.isEmpty) {
            setError("O corpo da mensagem não pode estar vazio.");
            return;
        }
        setLoading(true);
        setError('');
        try {
            const payload = {
                tipo_comunicacao: 'Email para Cliente',
                destinatario: formData.destinatario,
                assunto: formData.assunto,
                corpo: editor.getHTML(),
            };
            await axiosInstance.post(`/api/cases/${protocolId}/comunicacoes/`, payload);
            onCommunicationSent();
            onClose();
        } catch (err) {
            setError("Falha ao enviar a comunicação. Verifique os campos.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="border-b border-gray-200 mb-4">
                <nav className="-mb-px flex space-x-6">
                    <button type="button" onClick={() => setActiveTab('E-mail')} className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'E-mail' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>E-mail</button>
                    <button type="button" onClick={() => setActiveTab('WhatsApp')} className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'WhatsApp' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>WhatsApp</button>
                </nav>
            </div>

            {activeTab === 'E-mail' && (
                <div className="space-y-4 animate-fade-in">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input label="Destinatário" name="destinatario" type="email" value={formData.destinatario} onChange={handleChange} required />
                        <Input label="CC (opcional)" name="cc" type="email" value={formData.cc} onChange={handleChange} />
                    </div>
                    <Input label="Assunto" name="assunto" value={formData.assunto} onChange={handleChange} required />
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Corpo da Mensagem</label>
                        <MenuBar editor={editor} />
                        <EditorContent editor={editor} />
                    </div>
                    <div className="flex justify-between items-center pt-4">
                        <Button type="button" variant="secondary">Anexar Arquivo</Button>
                        <div className="w-48">
                            <Button type="submit" disabled={loading} variant="primary">{loading ? 'Enviando...' : 'Enviar E-mail'}</Button>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'WhatsApp' && (
                <div className="text-center text-gray-500 p-8 animate-fade-in">
                    <p>Funcionalidade de envio via WhatsApp em breve.</p>
                </div>
            )}
            {error && <div className="mt-4"><MessageAlert message={error} type="error" /></div>}
        </form>
    );
}

export default CommunicationForm;