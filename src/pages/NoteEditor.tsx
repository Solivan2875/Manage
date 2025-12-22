import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Eye, Settings, Calendar, Tag, FileText, X, Check } from 'lucide-react';
import { RichTextEditor } from '../components/RichTextEditor';

interface Note {
    id: string;
    title: string;
    content: string;
    tags: string[];
    createdAt: Date;
    updatedAt: Date;
    isPinned: boolean;
}

export const NoteEditor = () => {
    const { id } = useParams<{ id?: string }>();
    const navigate = useNavigate();
    const [note, setNote] = useState<Note | null>(null);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [tags, setTags] = useState('');
    const [isPreviewMode, setIsPreviewMode] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [showLinkDialog, setShowLinkDialog] = useState(false);
    const [linkUrl, setLinkUrl] = useState('');
    const [linkText, setLinkText] = useState('');
    const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');
    const titleRef = useRef<HTMLInputElement>(null);
    const editorRef = useRef<HTMLDivElement>(null);
    const previewRef = useRef<HTMLDivElement>(null);

    // Mock data - in a real app, this would come from an API
    const mockNotes: Note[] = [
        {
            id: '1',
            title: 'Planejamento de Recursos do MaxNote',
            content: 'Planejando o futuro do MaxNote com integração avançada de IA, recursos colaborativos e sincronização multiplataforma...',
            tags: ['planning', 'roadmap', 'development'],
            createdAt: new Date('2025-12-15'),
            updatedAt: new Date('2025-12-16'),
            isPinned: true,
        },
        {
            id: '2',
            title: 'Notas da Reunião - Planejamento do 1º Trimestre',
            content: 'Discutidas metas trimestrais, expansão da equipe e novas iniciativas de produtos. Decisões importantes tomadas sobre alocação de orçamento...',
            tags: ['meetings', 'planning', 'business'],
            createdAt: new Date('2025-12-14'),
            updatedAt: new Date('2025-12-15'),
            isPinned: false,
        },
        {
            id: '3',
            title: 'Exemplo de Tabela Interativa',
            content: `<table class="note-table">
  <thead>
    <tr>
      <th>Cabeçalho 1</th>
      <th>Cabeçalho 2</th>
      <th>Cabeçalho 3</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Célula 1-1</td>
      <td>Célula 1-2</td>
      <td>Célula 1-3</td>
    </tr>
    <tr>
      <td>Célula 2-1</td>
      <td>Célula 2-2</td>
      <td>Célula 2-3</td>
    </tr>
    <tr>
      <td>Célula 3-1</td>
      <td>Célula 3-2</td>
      <td>Célula 3-3</td>
    </tr>
  </tbody>
</table>`,
            tags: ['tables', 'example', 'interactive'],
            createdAt: new Date('2025-12-16'),
            updatedAt: new Date('2025-12-16'),
            isPinned: false,
        },
        {
            id: '4',
            title: 'Nota de Exemplos de Incorporação',
            content: `# Exemplos de Incorporação

Esta nota contém exemplos de conteúdo incorporado:

## Vídeo do YouTube
Aqui está um exemplo de incorporação de vídeo do YouTube:

<iframe width="560" height="315" src="https://www.youtube.com/embed/dQw4w9WgXcQ" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen class="rounded-lg shadow-md"></iframe>

## Documento PDF
Aqui está um exemplo de incorporação de PDF do Google Drive:

<iframe src="https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/preview" width="100%" height="600" class="border border-gray-300 dark:border-gray-600 rounded-lg shadow-md"></iframe>

## Conteúdo Misto
Você pode misturar incorporações com texto regular e outros elementos markdown.

* Item de lista 1
* Item de lista 2

**Texto em negrito** e *texto em itálico* podem ser usados junto com incorporações.`,
            tags: ['embeds', 'examples', 'youtube', 'pdf'],
            createdAt: new Date('2025-12-16'),
            updatedAt: new Date('2025-12-16'),
            isPinned: false,
        },
    ];

    useEffect(() => {
        if (id && id !== 'new') {
            // Load existing note
            const existingNote = mockNotes.find(n => n.id === id);
            if (existingNote) {
                setNote(existingNote);
                setTitle(existingNote.title);
                setContent(existingNote.content);
                setTags(existingNote.tags.join(', '));
            }
        } else {
            // New note
            setNote(null);
            setTitle('');
            setContent('');
            setTags('');
        }

        // Focus on title field
        setTimeout(() => {
            titleRef.current?.focus();
        }, 100);
    }, [id]);

    useEffect(() => {
        if (saveStatus === 'unsaved') {
            const timer = setTimeout(() => {
                handleSave();
            }, 2000); // Auto-save after 2 seconds of inactivity

            return () => clearTimeout(timer);
        }
    }, [title, content, tags, saveStatus]);

    // Handle click outside editor to switch to preview mode
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;

            // Don't switch if clicking on dialogs or modals
            if (showLinkDialog) return;
            if (target.closest('[role="dialog"]')) return;

            // If clicking inside preview area, switch to edit mode
            if (previewRef.current && previewRef.current.contains(target)) {
                setIsPreviewMode(false);
                return;
            }

            // If clicking inside the editor area, check what was clicked
            if (editorRef.current && editorRef.current.contains(target)) {
                // Check if clicking on editor-related elements (stay in edit mode)
                const isEditorElement = target.tagName === 'TEXTAREA' ||
                    target.tagName === 'BUTTON' ||
                    target.tagName === 'INPUT' ||
                    target.closest('textarea') ||
                    target.closest('button') ||
                    target.closest('input') ||
                    target.closest('.editable-table-cell') ||
                    target.closest('.editable-table-controls') ||
                    target.closest('.embed-placeholder');

                if (isEditorElement) {
                    if (isPreviewMode) {
                        setIsPreviewMode(false);
                    }
                    return;
                }
            }

            // If clicking anywhere else and in edit mode, switch to preview
            if (!isPreviewMode) {
                setIsPreviewMode(true);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isPreviewMode, showLinkDialog]);

    const handleSave = () => {
        setSaveStatus('saving');

        // Simulate API call
        setTimeout(() => {
            const updatedNote: Note = {
                id: note?.id || Date.now().toString(),
                title: title.trim() || 'Nota Sem Título',
                content: content.trim(),
                tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag),
                createdAt: note?.createdAt || new Date(),
                updatedAt: new Date(),
                isPinned: note?.isPinned || false,
            };

            setNote(updatedNote);
            setSaveStatus('saved');
        }, 500);
    };

    const handleInsertLink = () => {
        if (linkUrl && linkText) {
            const markdownLink = `[${linkText}](${linkUrl})`;
            setContent(prev => prev + markdownLink);
            setLinkUrl('');
            setLinkText('');
            setShowLinkDialog(false);
            setSaveStatus('unsaved');
        }
    };

    const handleBack = () => {
        navigate('/notes');
    };

    const renderMarkdown = (markdown: string) => {
        // Simple markdown preview - in a real app, you'd use a proper markdown library
        // First, extract and preserve YouTube iframes
        const iframePlaceholders: string[] = [];
        let processedMarkdown = markdown.replace(/<iframe.*?src="https:\/\/www\.youtube\.com\/embed\/([^"]+)".*?<\/iframe>/gim, (_, videoId) => {
            const placeholder = `__YOUTUBE_IFRAME_${iframePlaceholders.length}__`;
            iframePlaceholders.push(`<div class="video-container my-4"><iframe
  width="900"
  height="520"
  src="https://www.youtube.com/embed/${videoId}"
  title="YouTube video player"
  frameborder="0"
  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
  allowfullscreen
  class="rounded-lg shadow-md">
</iframe></div>`);
            return placeholder;
        });

        // Extract and preserve Google Drive PDF iframes
        const pdfPlaceholders: string[] = [];
        processedMarkdown = processedMarkdown.replace(/<iframe.*?src="https:\/\/drive\.google\.com\/file\/d\/([^"]+)\/preview".*?<\/iframe>/gim, (_, fileId) => {
            const placeholder = `__GOOGLE_DRIVE_PDF_${pdfPlaceholders.length}__`;
            pdfPlaceholders.push(`<div class="pdf-container my-4"><iframe
  src="https://drive.google.com/file/d/${fileId}/preview"
  width="100%"
  height="600"
  class="border border-gray-300 dark:border-gray-600 rounded-lg shadow-md">
</iframe></div>`);
            return placeholder;
        });

        // Extract and preserve HTML tables
        const tablePlaceholders: string[] = [];
        processedMarkdown = processedMarkdown.replace(/<table[^>]*>[\s\S]*?<\/table>/gim, (match) => {
            const placeholder = `__HTML_TABLE_${tablePlaceholders.length}__`;
            tablePlaceholders.push(match);
            return placeholder;
        });

        // Process the rest of the markdown
        processedMarkdown = processedMarkdown
            .replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold mb-2">$1</h3>')
            .replace(/^## (.*$)/gim, '<h2 class="text-xl font-semibold mb-3">$1</h2>')
            .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mb-4">$1</h1>')
            .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
            .replace(/\*(.*)\*/gim, '<em>$1</em>')
            .replace(/`(.*)`/gim, '<code class="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-sm">$1</code>')
            .replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2" class="text-blue-600 hover:underline">$1</a>')
            .replace(/^\- (.*$)/gim, '<li class="ml-4">• $1</li>')
            .replace(/^\d+\. (.*$)/gim, '<li class="ml-4 list-decimal">$1</li>')
            .replace(/^> (.*$)/gim, '<blockquote class="border-l-4 border-gray-300 pl-4 italic">$1</blockquote>');

        // Split into paragraphs, but avoid wrapping HTML tags (like iframes) in paragraphs
        const blocks = processedMarkdown.split(/\n\n/);
        const processedBlocks = blocks.map(block => {
            // Skip if this is an HTML block (starts with <)
            if (block.trim().startsWith('<')) {
                return block;
            }
            // Skip if this is a placeholder for an iframe, PDF, or table
            if (block.includes('__YOUTUBE_IFRAME_') || block.includes('__HTML_TABLE_') || block.includes('__GOOGLE_DRIVE_PDF_')) {
                return block;
            }
            return `<p class="mb-4">${block}</p>`;
        }).join('\n');

        // Restore the iframes
        let result = processedBlocks;
        iframePlaceholders.forEach((iframe, index) => {
            result = result.replace(`__YOUTUBE_IFRAME_${index}__`, iframe);
        });

        // Restore the PDFs
        pdfPlaceholders.forEach((pdf, index) => {
            result = result.replace(`__GOOGLE_DRIVE_PDF_${index}__`, pdf);
        });

        // Restore the tables
        tablePlaceholders.forEach((table, index) => {
            result = result.replace(`__HTML_TABLE_${index}__`, table);
        });

        return result;
    };

    return (
        <div className="h-screen flex flex-col bg-white dark:bg-gray-900">
            {/* Header */}
            <header className="border-b border-gray-200 dark:border-gray-800 px-6 py-3 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={handleBack}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <input
                        ref={titleRef}
                        type="text"
                        value={title}
                        onChange={(e) => {
                            setTitle(e.target.value);
                            setSaveStatus('unsaved');
                        }}
                        className="text-xl font-semibold bg-transparent border-none outline-none flex-1 min-w-[200px]"
                        placeholder="Título da nota"
                    />
                </div>

                <div className="flex items-center gap-2">
                    {saveStatus === 'saved' && (
                        <span className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                            <Check className="w-3 h-3" />
                            Salvo
                        </span>
                    )}
                    {saveStatus === 'saving' && (
                        <span className="text-xs text-blue-600 dark:text-blue-400">Salvando...</span>
                    )}
                    {saveStatus === 'unsaved' && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">Não salvo</span>
                    )}

                    <div className="flex items-center border-l border-gray-200 dark:border-gray-700 pl-2 ml-2">
                        <button
                            onClick={() => setIsPreviewMode(!isPreviewMode)}
                            className={`p-2 rounded-md transition-colors ${isPreviewMode ? 'bg-teal-50 text-teal-700 dark:bg-teal-900/20 dark:text-teal-400' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                            title="Alternar visualização"
                        >
                            <Eye className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => setShowSettings(!showSettings)}
                            className={`p-2 rounded-md transition-colors ${showSettings ? 'bg-teal-50 text-teal-700 dark:bg-teal-900/20 dark:text-teal-400' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                            title="Configurações"
                        >
                            <Settings className="w-5 h-5" />
                        </button>
                        <button
                            onClick={handleSave}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
                            title="Salvar"
                        >
                            <Save className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </header>

            {/* Tags and Info Panel */}
            <div className="border-b border-gray-200 dark:border-gray-800 px-6 py-3 bg-gray-50 dark:bg-gray-800/50">
                <div className="flex items-center gap-4 flex-wrap">
                    <div className="flex items-center gap-2 flex-1 min-w-[300px]">
                        <Tag className="w-4 h-4 text-gray-500" />
                        <input
                            type="text"
                            value={tags}
                            onChange={(e) => {
                                setTags(e.target.value);
                                setSaveStatus('unsaved');
                            }}
                            placeholder="Adicionar tags (separadas por vírgula)"
                            className="flex-1 px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                        />
                    </div>
                    {showSettings && (
                        <>
                            <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-gray-500" />
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                    {note ? `Criado em ${note.createdAt.toLocaleDateString('pt-BR')}` : 'Nova nota'}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <FileText className="w-4 h-4 text-gray-500" />
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                    Markdown
                                </span>
                            </div>
                        </>
                    )}
                </div>
                {tags && (
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                        {tags.split(',').map(tag => tag.trim()).filter(tag => tag).map((tag, index) => (
                            <span
                                key={index}
                                className="inline-flex items-center gap-1 px-2 py-1 bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 text-xs rounded-full"
                            >
                                {tag}
                                <button
                                    onClick={() => {
                                        const tagList = tags.split(',').map(t => t.trim()).filter(t => t);
                                        tagList.splice(index, 1);
                                        setTags(tagList.join(', '));
                                        setSaveStatus('unsaved');
                                    }}
                                    className="hover:text-teal-900 dark:hover:text-teal-100"
                                >
                                    ×
                                </button>
                            </span>
                        ))}
                    </div>
                )}
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-hidden">
                {/* Editor or Preview */}
                <div className="h-full overflow-auto">
                    {isPreviewMode ? (
                        <div
                            ref={previewRef}
                            className="max-w-4xl mx-auto px-8 py-6 cursor-text"
                            onClick={() => setIsPreviewMode(false)}
                        >
                            <div
                                className="prose prose-sm dark:prose-invert max-w-none"
                                dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
                            />
                        </div>
                    ) : (
                        <div ref={editorRef} className="h-full rich-text-editor">
                            <RichTextEditor
                                value={content}
                                onChange={(value) => {
                                    setContent(value);
                                    setSaveStatus('unsaved');
                                }}
                                placeholder="Comece a escrever sua nota..."
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Link Dialog */}
            {showLinkDialog && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold">Inserir Link</h3>
                            <button
                                onClick={() => setShowLinkDialog(false)}
                                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Texto do link</label>
                                <input
                                    type="text"
                                    value={linkText}
                                    onChange={(e) => setLinkText(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                                    placeholder="Texto do link"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">URL</label>
                                <input
                                    type="text"
                                    value={linkUrl}
                                    onChange={(e) => setLinkUrl(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                                    placeholder="https://example.com"
                                />
                            </div>
                            <div className="flex justify-end gap-2">
                                <button
                                    onClick={() => setShowLinkDialog(false)}
                                    className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleInsertLink}
                                    className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-md transition-colors"
                                >
                                    Inserir
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};