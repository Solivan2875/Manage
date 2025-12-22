import { useState, useEffect, useCallback } from 'react';
import {
    Bold,
    Italic,
    Strikethrough,
    Link,
    Heading1,
    Heading2,
    Heading3,
    List,
    ListOrdered,
    Table,
    Code,
    Quote,
    Play,
    FileText,
    Edit,
    Trash2,
    Eye
} from 'lucide-react';
import { extractYouTubeId, generateYouTubeEmbed, extractGoogleDriveId, generateGoogleDriveEmbed } from '../lib/utils';
import { EditableTable } from './EditableTable';

// Component for embed placeholders in edit mode
interface EmbedPlaceholderProps {
    type: 'youtube' | 'pdf';
    embedCode: string;
    onEdit: () => void;
    onDelete: () => void;
}

const EmbedPlaceholder = ({ type, onEdit, onDelete }: EmbedPlaceholderProps) => {
    const isYouTube = type === 'youtube';
    const Icon = isYouTube ? Play : FileText;
    const title = isYouTube ? 'Vídeo do YouTube' : 'Documento PDF';
    const colorClass = isYouTube ? 'embed-placeholder-youtube' : 'embed-placeholder-pdf';

    return (
        <div className={`embed-placeholder ${colorClass}`}>
            <div className="embed-placeholder-content">
                <div className="embed-placeholder-icon">
                    <Icon className="w-5 h-5" />
                </div>
                <div>
                    <div className="embed-placeholder-text">{title} Embutido</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                        Clique na visualização para ver, ou edite para modificar
                    </div>
                </div>
            </div>
            <div className="embed-placeholder-actions">
                <button
                    className="embed-placeholder-button"
                    title="Mudar para visualização para ver"
                    onClick={() => alert('Mude para o modo de visualização para ver o conteúdo incorporado')}
                >
                    <Eye className="w-4 h-4" />
                </button>
                <button
                    className="embed-placeholder-button"
                    title="Editar incorporação"
                    onClick={onEdit}
                >
                    <Edit className="w-4 h-4" />
                </button>
                <button
                    className="embed-placeholder-button"
                    title="Excluir incorporação"
                    onClick={onDelete}
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};

interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

export const RichTextEditor = ({ value, onChange, placeholder }: RichTextEditorProps) => {
    const [showLinkInput, setShowLinkInput] = useState(false);
    const [linkUrl, setLinkUrl] = useState('');
    const [linkText, setLinkText] = useState('');
    const [showYouTubeInput, setShowYouTubeInput] = useState(false);
    const [youtubeUrl, setYoutubeUrl] = useState('');
    const [showTableInput, setShowTableInput] = useState(false);
    const [tableRows, setTableRows] = useState(3);
    const [tableCols, setTableCols] = useState(3);

    const [showGoogleDriveInput, setShowGoogleDriveInput] = useState(false);
    const [googleDriveUrl, setGoogleDriveUrl] = useState('');

    // Function to auto-resize textarea based on content
    const autoResizeTextarea = useCallback((textarea: HTMLTextAreaElement) => {
        if (!textarea) return;

        // Reset height to auto to get the correct scrollHeight
        textarea.style.height = 'auto';

        // Set height based on scrollHeight with a minimum height
        const minHeight = 100;
        const newHeight = Math.max(minHeight, textarea.scrollHeight);
        textarea.style.height = `${newHeight}px`;
    }, []);

    // Auto-resize all textareas when value changes
    useEffect(() => {
        const textareas = document.querySelectorAll('textarea');
        textareas.forEach((textarea) => {
            autoResizeTextarea(textarea as HTMLTextAreaElement);
        });
    }, [value, autoResizeTextarea]);

    // Function to parse content and separate tables, YouTube embeds, and PDF embeds from text
    const parseContent = (content: string) => {
        const tableRegex = /<table[^>]*>[\s\S]*?<\/table>/gim;
        const youtubeRegex = /<iframe.*?src="https:\/\/www\.youtube\.com\/embed\/([^"]+)".*?<\/iframe>/gim;
        const pdfRegex = /<iframe.*?src="https:\/\/drive\.google\.com\/file\/d\/([^"]+)\/preview".*?<\/iframe>/gim;

        const tables = content.match(tableRegex) || [];
        const youtubeEmbeds = content.match(youtubeRegex) || [];
        const pdfEmbeds = content.match(pdfRegex) || [];

        // Create a combined regex for all embeds and tables
        const combinedRegex = new RegExp(
            `(${tableRegex.source})|(${youtubeRegex.source})|(${pdfRegex.source})`,
            'gim'
        );

        const parts = content.split(combinedRegex);

        return { parts, tables, youtubeEmbeds, pdfEmbeds };
    };

    // Function to detect if a part is an embed and return its type
    const detectEmbedType = (part: string): 'youtube' | 'pdf' | 'table' | null => {
        if (part.match(/<iframe.*?src="https:\/\/www\.youtube\.com\/embed\/([^"]+)".*?<\/iframe>/gim)) {
            return 'youtube';
        }
        if (part.match(/<iframe.*?src="https:\/\/drive\.google\.com\/file\/d\/([^"]+)\/preview".*?<\/iframe>/gim)) {
            return 'pdf';
        }
        if (part.match(/<table[^>]*>[\s\S]*?<\/table>/gim)) {
            return 'table';
        }
        return null;
    };

    // Function to handle embed deletion
    const handleEmbedDelete = (embedToDelete: string) => {
        const newContent = value.replace(embedToDelete, '');
        onChange(newContent);
    };

    // Function to handle embed editing
    const handleEmbedEdit = (embedToEdit: string, type: 'youtube' | 'pdf') => {
        if (type === 'youtube') {
            const match = embedToEdit.match(/src="https:\/\/www\.youtube\.com\/embed\/([^"]+)"/);
            if (match && match[1]) {
                setYoutubeUrl(`https://www.youtube.com/watch?v=${match[1]}`);
                setShowYouTubeInput(true);
                // Remove the old embed
                const newContent = value.replace(embedToEdit, '');
                onChange(newContent);
            }
        } else if (type === 'pdf') {
            const match = embedToEdit.match(/src="https:\/\/drive\.google\.com\/file\/d\/([^"]+)\/preview"/);
            if (match && match[1]) {
                setGoogleDriveUrl(`https://drive.google.com/file/d/${match[1]}/view`);
                setShowGoogleDriveInput(true);
                // Remove the old embed
                const newContent = value.replace(embedToEdit, '');
                onChange(newContent);
            }
        }
    };

    // Function to update table HTML in the content
    const updateTableInContent = (oldTableHtml: string, newTableHtml: string) => {
        const newContent = value.replace(oldTableHtml, newTableHtml);
        onChange(newContent);
    };

    const insertMarkdown = (before: string, after: string = '', placeholder: string = '') => {
        // Find the first textarea in our editor
        const textareas = document.querySelectorAll('textarea');
        if (textareas.length === 0) return;

        const textarea = textareas[0] as HTMLTextAreaElement;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = textarea.value.substring(start, end);
        const textToInsert = selectedText || placeholder;

        // Update the textarea value
        const newTextareaValue = textarea.value.substring(0, start) + before + textToInsert + after + textarea.value.substring(end);

        // Update the full content by replacing the first text part
        const { parts, tables, youtubeEmbeds, pdfEmbeds } = parseContent(value);
        let newContent = newTextareaValue;

        // Add back any tables, youtube embeds, and pdf embeds that were after the first text part
        for (let i = 1; i < parts.length; i++) {
            newContent += parts[i];

            // Add back tables, youtube embeds, and pdf embeds in order
            const tableIndex = i - 1;
            const youtubeIndex = i - 1;
            const pdfIndex = i - 1;

            if (tableIndex < tables.length) {
                newContent += tables[tableIndex];
            }
            if (youtubeIndex < youtubeEmbeds.length) {
                newContent += youtubeEmbeds[youtubeIndex];
            }
            if (pdfIndex < pdfEmbeds.length) {
                newContent += pdfEmbeds[pdfIndex];
            }
        }

        onChange(newContent);

        // Restore focus and selection
        setTimeout(() => {
            textarea.focus();
            const newCursorPos = start + before.length + textToInsert.length;
            textarea.setSelectionRange(newCursorPos, newCursorPos);
        }, 0);
    };

    const insertLink = () => {
        if (linkUrl && linkText) {
            insertMarkdown(`[${linkText}](${linkUrl})`, '');
            setLinkUrl('');
            setLinkText('');
            setShowLinkInput(false);
        }
    };

    const insertYouTubeVideo = () => {
        if (youtubeUrl) {
            const videoId = extractYouTubeId(youtubeUrl);
            if (videoId) {
                const embedCode = generateYouTubeEmbed(videoId);
                insertMarkdown(embedCode, '');
                setYoutubeUrl('');
                setShowYouTubeInput(false);
            } else {
                alert('URL do YouTube inválida. Verifique e tente novamente.');
            }
        }
    };

    const insertGoogleDrivePdf = () => {
        if (googleDriveUrl) {
            const fileId = extractGoogleDriveId(googleDriveUrl);
            if (fileId) {
                const embedCode = generateGoogleDriveEmbed(fileId);
                insertMarkdown(embedCode, '');
                setGoogleDriveUrl('');
                setShowGoogleDriveInput(false);
            } else {
                alert('URL do Google Drive inválida. Verifique e tente novamente.');
            }
        }
    };

    const insertTable = () => {
        let htmlTable = '<table class="note-table">\n';

        // Create header row
        htmlTable += '  <thead>\n    <tr>\n';
        for (let i = 0; i < tableCols; i++) {
            htmlTable += `      <th>Cabeçalho ${i + 1}</th>\n`;
        }
        htmlTable += '    </tr>\n  </thead>\n';

        // Create body rows
        htmlTable += '  <tbody>\n';
        for (let i = 0; i < tableRows; i++) {
            htmlTable += '    <tr>\n';
            for (let j = 0; j < tableCols; j++) {
                htmlTable += `      <td>Célula ${i + 1}-${j + 1}</td>\n`;
            }
            htmlTable += '    </tr>\n';
        }
        htmlTable += '  </tbody>\n</table>';

        insertMarkdown(htmlTable, '');
        setTableRows(3);
        setTableCols(3);
        setShowTableInput(false);
    };



    const toolbarButtons = [
        {
            icon: Bold,
            tooltip: 'Negrito',
            action: () => insertMarkdown('**', '**', 'texto em negrito'),
        },
        {
            icon: Italic,
            tooltip: 'Itálico',
            action: () => insertMarkdown('*', '*', 'texto em itálico'),
        },
        {
            icon: Strikethrough,
            tooltip: 'Tachado',
            action: () => insertMarkdown('~~', '~~', 'strikethrough'),
        },
        {
            icon: Code,
            tooltip: 'Código em linha',
            action: () => insertMarkdown('`', '`', 'código'),
        },
        'divider',
        {
            icon: Heading1,
            tooltip: 'Cabeçalho 1',
            action: () => insertMarkdown('# ', '', 'Cabeçalho 1'),
        },
        {
            icon: Heading2,
            tooltip: 'Cabeçalho 2',
            action: () => insertMarkdown('## ', '', 'Cabeçalho 2'),
        },
        {
            icon: Heading3,
            tooltip: 'Cabeçalho 3',
            action: () => insertMarkdown('### ', '', 'Cabeçalho 3'),
        },
        'divider',
        {
            icon: List,
            tooltip: 'Lista com marcadores',
            action: () => insertMarkdown('- ', '', 'Item da lista'),
        },
        {
            icon: ListOrdered,
            tooltip: 'Lista numerada',
            action: () => insertMarkdown('1. ', '', 'Item da lista'),
        },
        {
            icon: Quote,
            tooltip: 'Citação',
            action: () => insertMarkdown('> ', '', 'Citação'),
        },
        'divider',
        {
            icon: Link,
            tooltip: 'Inserir link',
            action: () => setShowLinkInput(!showLinkInput),
        },
        {
            icon: Play,
            tooltip: 'Inserir vídeo do YouTube',
            action: () => setShowYouTubeInput(!showYouTubeInput),
        },
        {
            icon: FileText,
            tooltip: 'Inserir PDF do Google Drive',
            action: () => setShowGoogleDriveInput(!showGoogleDriveInput),
        },
        {
            icon: Table,
            tooltip: 'Inserir tabela',
            action: () => setShowTableInput(!showTableInput),
        },
    ];

    return (
        <div className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden bg-white dark:bg-gray-800">
            {/* Toolbar */}
            <div className="flex items-center gap-1 p-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex-wrap">
                {toolbarButtons.map((button, index) => {
                    if (button === 'divider') {
                        return <div key={index} className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />;
                    }

                    const Icon = (button as any).icon;
                    return (
                        <button
                            key={index}
                            onClick={(button as any).action}
                            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md transition-colors group relative"
                            title={(button as any).tooltip}
                            type="button"
                        >
                            <Icon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                                {(button as any).tooltip}
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* Link Input Modal */}
            {showLinkInput && (
                <div className="p-3 border-b border-gray-200 dark:border-gray-700 bg-blue-50 dark:bg-blue-900/20">
                    <div className="flex gap-2 items-center">
                        <input
                            type="text"
                            value={linkText}
                            onChange={(e) => setLinkText(e.target.value)}
                            placeholder="Texto do link"
                            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
                        />
                        <input
                            type="text"
                            value={linkUrl}
                            onChange={(e) => setLinkUrl(e.target.value)}
                            placeholder="URL"
                            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
                        />
                        <button
                            onClick={insertLink}
                            className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-md text-sm font-medium transition-colors"
                            type="button"
                        >
                            Inserir
                        </button>
                        <button
                            onClick={() => {
                                setShowLinkInput(false);
                                setLinkUrl('');
                                setLinkText('');
                            }}
                            className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 text-sm transition-colors"
                            type="button"
                        >
                            Cancelar
                        </button>
                    </div>
                </div>
            )}

            {/* YouTube Input Modal */}
            {showYouTubeInput && (
                <div className="p-3 border-b border-gray-200 dark:border-gray-700 bg-red-50 dark:bg-red-900/20">
                    <div className="flex gap-2 items-center">
                        <input
                            type="text"
                            value={youtubeUrl}
                            onChange={(e) => setYoutubeUrl(e.target.value)}
                            placeholder="URL do YouTube (ex: https://www.youtube.com/watch?v=...)"
                            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
                        />
                        <button
                            onClick={insertYouTubeVideo}
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm font-medium transition-colors"
                            type="button"
                        >
                            Inserir
                        </button>
                        <button
                            onClick={() => {
                                setShowYouTubeInput(false);
                                setYoutubeUrl('');
                            }}
                            className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 text-sm transition-colors"
                            type="button"
                        >
                            Cancelar
                        </button>
                    </div>
                </div>
            )}

            {/* Google Drive Input Modal */}
            {showGoogleDriveInput && (
                <div className="p-3 border-b border-gray-200 dark:border-gray-700 bg-orange-50 dark:bg-orange-900/20">
                    <div className="flex gap-2 items-center">
                        <input
                            type="text"
                            value={googleDriveUrl}
                            onChange={(e) => setGoogleDriveUrl(e.target.value)}
                            placeholder="URL do Google Drive (ex: https://drive.google.com/file/d/...)"
                            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
                        />
                        <button
                            onClick={insertGoogleDrivePdf}
                            className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-md text-sm font-medium transition-colors"
                            type="button"
                        >
                            Inserir
                        </button>
                        <button
                            onClick={() => {
                                setShowGoogleDriveInput(false);
                                setGoogleDriveUrl('');
                            }}
                            className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 text-sm transition-colors"
                            type="button"
                        >
                            Cancelar
                        </button>
                    </div>
                </div>
            )}

            {/* Table Input Modal */}
            {showTableInput && (
                <div className="p-3 border-b border-gray-200 dark:border-gray-700 bg-green-50 dark:bg-green-900/20">
                    <div className="space-y-3">
                        <div className="flex gap-4 items-center">
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Linhas</label>
                                <input
                                    type="number"
                                    min="1"
                                    max="20"
                                    value={tableRows}
                                    onChange={(e) => setTableRows(Math.max(1, Math.min(20, parseInt(e.target.value) || 1)))}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
                                />
                            </div>
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Colunas</label>
                                <input
                                    type="number"
                                    min="1"
                                    max="10"
                                    value={tableCols}
                                    onChange={(e) => {
                                        const newCols = Math.max(1, Math.min(10, parseInt(e.target.value) || 1));
                                        setTableCols(newCols);
                                    }}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
                                />
                            </div>
                        </div>



                        <div className="flex gap-2 justify-end">
                            <button
                                onClick={() => {
                                    setShowTableInput(false);
                                    setTableRows(3);
                                    setTableCols(3);
                                }}
                                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 text-sm transition-colors"
                                type="button"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={insertTable}
                                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm font-medium transition-colors"
                                type="button"
                            >
                                Inserir Tabela
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Editor */}
            <div className="w-full min-h-[300px] p-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 resize-none focus:outline-none font-mono text-sm">
                {(() => {
                    const { parts, tables, youtubeEmbeds, pdfEmbeds } = parseContent(value);
                    let tableIndex = 0;
                    let youtubeIndex = 0;
                    let pdfIndex = 0;

                    return (
                        <div>
                            {parts.map((part, index) => {
                                // Check if this part is an embed
                                const embedType = detectEmbedType(part);

                                if (embedType === 'youtube' && youtubeIndex < youtubeEmbeds.length) {
                                    const embedCode = youtubeEmbeds[youtubeIndex++];
                                    return (
                                        <EmbedPlaceholder
                                            key={`youtube-${index}`}
                                            type="youtube"
                                            embedCode={embedCode}
                                            onEdit={() => handleEmbedEdit(embedCode, 'youtube')}
                                            onDelete={() => handleEmbedDelete(embedCode)}
                                        />
                                    );
                                }

                                if (embedType === 'pdf' && pdfIndex < pdfEmbeds.length) {
                                    const embedCode = pdfEmbeds[pdfIndex++];
                                    return (
                                        <EmbedPlaceholder
                                            key={`pdf-${index}`}
                                            type="pdf"
                                            embedCode={embedCode}
                                            onEdit={() => handleEmbedEdit(embedCode, 'pdf')}
                                            onDelete={() => handleEmbedDelete(embedCode)}
                                        />
                                    );
                                }

                                if (embedType === 'table' && tableIndex < tables.length) {
                                    const tableHtml = tables[tableIndex++];
                                    return (
                                        <div key={`table-${index}`}>
                                            <EditableTable
                                                html={tableHtml}
                                                onChange={(newHtml) => updateTableInContent(tableHtml, newHtml)}
                                            />
                                        </div>
                                    );
                                }

                                // Handle text parts
                                let textContent = part;

                                return (
                                    <div key={`text-${index}`}>
                                        <textarea
                                            ref={(el) => {
                                                if (el) {
                                                    autoResizeTextarea(el);
                                                }
                                            }}
                                            value={textContent}
                                            onChange={(e) => {
                                                const newValue = e.target.value;

                                                // Auto-resize textarea
                                                autoResizeTextarea(e.target);

                                                // Reconstruct the full content with the updated text part
                                                let newContent = '';
                                                let tempTableIndex = 0;
                                                let tempYoutubeIndex = 0;
                                                let tempPdfIndex = 0;

                                                for (let i = 0; i < parts.length; i++) {
                                                    if (i === index) {
                                                        newContent += newValue;
                                                    } else {
                                                        newContent += parts[i];
                                                    }

                                                    // Add back tables, youtube embeds, and pdf embeds in order
                                                    const currentPartType = detectEmbedType(parts[i]);

                                                    if (currentPartType === 'table' && tempTableIndex < tables.length) {
                                                        newContent += tables[tempTableIndex++];
                                                    } else if (currentPartType === 'youtube' && tempYoutubeIndex < youtubeEmbeds.length) {
                                                        newContent += youtubeEmbeds[tempYoutubeIndex++];
                                                    } else if (currentPartType === 'pdf' && tempPdfIndex < pdfEmbeds.length) {
                                                        newContent += pdfEmbeds[tempPdfIndex++];
                                                    }

                                                    // If this is a text part, add the next embed if it exists
                                                    if (!currentPartType && i < parts.length - 1) {
                                                        const nextPartType = detectEmbedType(parts[i + 1]);
                                                        if (nextPartType === 'table' && tempTableIndex < tables.length) {
                                                            newContent += tables[tempTableIndex++];
                                                        } else if (nextPartType === 'youtube' && tempYoutubeIndex < youtubeEmbeds.length) {
                                                            newContent += youtubeEmbeds[tempYoutubeIndex++];
                                                        } else if (nextPartType === 'pdf' && tempPdfIndex < pdfEmbeds.length) {
                                                            newContent += pdfEmbeds[tempPdfIndex++];
                                                        }
                                                    }
                                                }

                                                onChange(newContent);
                                            }}
                                            placeholder={index === 0 ? placeholder : ''}
                                            className="w-full bg-transparent border-none outline-none resize-none font-mono text-sm overflow-hidden"
                                            style={{
                                                fontFamily: 'ui-monospace, SFMono-Regular, SF Mono, Menlo, Consolas, Liberation Mono, monospace',
                                                minHeight: index === 0 ? '100px' : 'auto'
                                            }}
                                        />
                                    </div>
                                );
                            })}
                        </div>
                    );
                })()}
            </div>

            {/* Footer with character count */}
            <div className="flex items-center justify-between px-4 py-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-xs text-gray-500 dark:text-gray-400">
                <span>Markdown suportado</span>
                <span>{value.length} caracteres</span>
            </div>
        </div>
    );
};
