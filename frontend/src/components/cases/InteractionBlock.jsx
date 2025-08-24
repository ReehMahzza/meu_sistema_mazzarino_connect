// frontend/src/components/cases/InteractionBlock.jsx
import React, { useState, useContext } from 'react'; // <--- A CORREÇÃO ESTÁ AQUI
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import AuthContext from '../../context/AuthContext';
import Button from '../ui/Button';

// Componente da Barra de Ferramentas para o Tiptap
const MenuBar = ({ editor }) => {
    if (!editor) {
        return null;
    }

    return (
        <div className="flex items-center gap-2 p-2 border rounded-t-md bg-gray-50">
            <button
                onClick={() => editor.chain().focus().toggleBold().run()}
                className={editor.isActive('bold') ? 'bg-gray-300 p-1 rounded' : 'p-1 rounded hover:bg-gray-200'}
            >
                <strong>B</strong>
            </button>
            <button
                onClick={() => editor.chain().focus().toggleItalic().run()}
                className={editor.isActive('italic') ? 'bg-gray-300 p-1 rounded' : 'p-1 rounded hover:bg-gray-200'}
            >
                <em>I</em>
            </button>
            <button
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className={editor.isActive('bulletList') ? 'bg-gray-300 p-1 rounded' : 'p-1 rounded hover:bg-gray-200'}
            >
                Lista
            </button>
        </div>
    );
};

function InteractionBlock({ protocolId, onInteractionAdded }) {
    const { axiosInstance } = useContext(AuthContext);
    const [loading, setLoading] = useState(false);

    const editor = useEditor({
        extensions: [StarterKit],
        content: '',
        editorProps: {
            attributes: {
                class: 'prose max-w-none p-3 border rounded-b-md min-h-[150px] focus:outline-none',
            },
        },
    });

    const handleSubmit = async () => {
        const html = editor.getHTML();
        if (editor.isEmpty) {
            alert('O conteúdo não pode estar vazio.');
            return;
        }
        setLoading(true);
        try {
            const payload = {
                tipo_comunicacao: 'Nota Interna',
                assunto: 'Despacho Interno',
                corpo: html
            };
            await axiosInstance.post(`/api/cases/${protocolId}/comunicacoes/`, payload);
            editor.commands.clearContent();
            onInteractionAdded();
        } catch (error) {
            console.error("Erro ao enviar interação:", error);
            alert("Falha ao registrar a interação.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white shadow-md rounded-lg mt-6">
            <h3 className="text-lg font-semibold text-gray-800 p-4 border-b">Registrar Interação / Despacho</h3>
            <div className="p-4">
                <MenuBar editor={editor} />
                <EditorContent editor={editor} />
                <div className="mt-4 flex justify-end">
                    <div className="w-48">
                        <Button onClick={handleSubmit} disabled={loading} variant="primary">
                            {loading ? 'Enviando...' : 'Enviar'}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default InteractionBlock;