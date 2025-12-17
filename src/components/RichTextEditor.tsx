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

const EmbedPlaceholder = ({ type, embedCode, onEdit, onDelete }: EmbedPlaceholderProps) => {
    const isYouTube = type === 'youtube';
    const Icon = isYouTube ? Play : FileText;
    const title = isYouTube ? 'YouTube Video' : 'PDF Document';
    const colorClass = isYouTube ? 'embed-placeholder-youtube' : 'embed-placeholder-pdf';

    return (
        <div className={`embed-placeholder ${colorClass}`}>
            <div className="embed-placeholder-content">
                <div className="embed-placeholder-icon">
                    <Icon className="w-5 h-5" />
                </div>
                <div>
                    <div className="embed-placeholder-text">{title} Embed</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                        Click preview to view, or edit to modify
                    </div>
                </div>
            </div>
            <div className="embed-placeholder-actions">
                <button
                    className="embed-placeholder-button"
                    title="Switch to preview to view"
                    onClick={() => alert('Switch to preview mode to view the embed')}
                >
                    <Eye className="w-4 h-4" />
                </button>
                <button
                    className="embed-placeholder-button"
                    title="Edit embed"
                    onClick={onEdit}
                >
                    <Edit className="w-4 h-4" />
                </button>
                <button
                    className="embed-placeholder-button"
                    title="Delete embed"
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
    const [columnWidths, setColumnWidths] = useState<string[]>([]);
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
                alert('Invalid YouTube URL. Please check and try again.');
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
                alert('Invalid Google Drive URL. Please check and try again.');
            }
        }
    };

    const insertTable = () => {
        let htmlTable = '<table class="note-table">\n';

        // Create header row with column widths
        htmlTable += '  <thead>\n    <tr>\n';
        for (let i = 0; i < tableCols; i++) {
            const width = columnWidths[i] || '';
            const widthAttr = width ? ` style="width: ${width}"` : '';
            htmlTable += `      <th${widthAttr}>Header ${i + 1}</th>\n`;
        }
        htmlTable += '    </tr>\n  </thead>\n';

        // Create body rows with column widths
        htmlTable += '  <tbody>\n';
        for (let i = 0; i < tableRows; i++) {
            htmlTable += '    <tr>\n';
            for (let j = 0; j < tableCols; j++) {
                const width = columnWidths[j] || '';
                const widthAttr = width ? ` style="width: ${width}"` : '';
                htmlTable += `      <td${widthAttr}>Cell ${i + 1}-${j + 1}</td>\n`;
            }
            htmlTable += '    </tr>\n';
        }
        htmlTable += '  </tbody>\n</table>';

        insertMarkdown(htmlTable, '');
        setTableRows(3);
        setTableCols(3);
        setColumnWidths([]);
        setShowTableInput(false);
    };

    // Update column widths when number of columns changes
    const updateColumnWidths = (newCols: number) => {
        const newWidths = [...columnWidths];
        if (newCols > columnWidths.length) {
            // Add new columns with default width
            for (let i = columnWidths.length; i < newCols; i++) {
                newWidths.push('');
            }
        } else if (newCols < columnWidths.length) {
            // Remove excess columns
            newWidths.splice(newCols);
        }
        setColumnWidths(newWidths);
    };

    // Handle column width change
    const handleColumnWidthChange = (index: number, value: string) => {
        const newWidths = [...columnWidths];
        newWidths[index] = value;
        setColumnWidths(newWidths);
    };

    // Validate width value
    const isValidWidth = (value: string): boolean => {
        if (!value) return true; // Empty value is valid (auto width)

        // Check for valid CSS width formats
        const validPatterns = [
            /^\d+px$/, // e.g., 100px
            /^\d+%$/, // e.g., 20%
            /^\d+em$/, // e.g., 2em
            /^\d+rem$/, // e.g., 2rem
            /^\d+vw$/, // e.g., 50vw
            /^\d+vh$/, // e.g., 50vh
            /^auto$/, // auto
            /^inherit$/, // inherit
            /^initial$/, // initial
        ];

        return validPatterns.some(pattern => pattern.test(value));
    };

    const toolbarButtons = [
        {
            icon: Bold,
            tooltip: 'Bold',
            action: () => insertMarkdown('**', '**', 'bold text'),
        },
        {
            icon: Italic,
            tooltip: 'Italic',
            action: () => insertMarkdown('*', '*', 'italic text'),
        },
        {
            icon: Strikethrough,
            tooltip: 'Strikethrough',
            action: () => insertMarkdown('~~', '~~', 'strikethrough'),
        },
        {
            icon: Code,
            tooltip: 'Inline code',
            action: () => insertMarkdown('`', '`', 'code'),
        },
        'divider',
        {
            icon: Heading1,
            tooltip: 'Heading 1',
            action: () => insertMarkdown('# ', '', 'Heading 1'),
        },
        {
            icon: Heading2,
            tooltip: 'Heading 2',
            action: () => insertMarkdown('## ', '', 'Heading 2'),
        },
        {
            icon: Heading3,
            tooltip: 'Heading 3',
            action: () => insertMarkdown('### ', '', 'Heading 3'),
        },
        'divider',
        {
            icon: List,
            tooltip: 'Bullet list',
            action: () => insertMarkdown('- ', '', 'List item'),
        },
        {
            icon: ListOrdered,
            tooltip: 'Numbered list',
            action: () => insertMarkdown('1. ', '', 'List item'),
        },
        {
            icon: Quote,
            tooltip: 'Quote',
            action: () => insertMarkdown('> ', '', 'Quote'),
        },
        'divider',
        {
            icon: Link,
            tooltip: 'Insert link',
            action: () => setShowLinkInput(!showLinkInput),
        },
        {
            icon: Play,
            tooltip: 'Insert YouTube video',
            action: () => setShowYouTubeInput(!showYouTubeInput),
        },
        {
            icon: FileText,
            tooltip: 'Insert Google Drive PDF',
            action: () => setShowGoogleDriveInput(!showGoogleDriveInput),
        },
        {
            icon: Table,
            tooltip: 'Insert table',
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
                            placeholder="Link text"
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
                            Insert
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
                            Cancel
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
                            placeholder="YouTube URL (e.g., https://www.youtube.com/watch?v=...)"
                            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
                        />
                        <button
                            onClick={insertYouTubeVideo}
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm font-medium transition-colors"
                            type="button"
                        >
                            Insert
                        </button>
                        <button
                            onClick={() => {
                                setShowYouTubeInput(false);
                                setYoutubeUrl('');
                            }}
                            className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 text-sm transition-colors"
                            type="button"
                        >
                            Cancel
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
                            placeholder="Google Drive URL (e.g., https://drive.google.com/file/d/...)"
                            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
                        />
                        <button
                            onClick={insertGoogleDrivePdf}
                            className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-md text-sm font-medium transition-colors"
                            type="button"
                        >
                            Insert
                        </button>
                        <button
                            onClick={() => {
                                setShowGoogleDriveInput(false);
                                setGoogleDriveUrl('');
                            }}
                            className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 text-sm transition-colors"
                            type="button"
                        >
                            Cancel
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
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Rows</label>
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
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Columns</label>
                                <input
                                    type="number"
                                    min="1"
                                    max="10"
                                    value={tableCols}
                                    onChange={(e) => {
                                        const newCols = Math.max(1, Math.min(10, parseInt(e.target.value) || 1));
                                        setTableCols(newCols);
                                        updateColumnWidths(newCols);
                                    }}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
                                />
                            </div>
                        </div>

                        {/* Column Widths */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Column Widths (optional)</label>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
                                {Array.from({ length: tableCols }).map((_, index) => (
                                    <div key={index} className="flex flex-col">
                                        <label className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                                            Column {index + 1}
                                        </label>
                                        <input
                                            type="text"
                                            value={columnWidths[index] || ''}
                                            onChange={(e) => handleColumnWidthChange(index, e.target.value)}
                                            placeholder="e.g., 100px, 20%, auto"
                                            className={`px-2 py-1 border rounded text-xs bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-teal-500 ${columnWidths[index] && !isValidWidth(columnWidths[index])
                                                ? 'border-red-500'
                                                : 'border-gray-300 dark:border-gray-600'
                                                }`}
                                        />
                                        {columnWidths[index] && !isValidWidth(columnWidths[index]) && (
                                            <span className="text-xs text-red-500 mt-1">Invalid width</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                Valid formats: 100px, 20%, auto, inherit, etc.
                            </div>
                        </div>

                        <div className="flex gap-2 justify-end">
                            <button
                                onClick={() => {
                                    setShowTableInput(false);
                                    setTableRows(3);
                                    setTableCols(3);
                                    setColumnWidths([]);
                                }}
                                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 text-sm transition-colors"
                                type="button"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={insertTable}
                                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm font-medium transition-colors"
                                type="button"
                            >
                                Insert Table
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
                                const isLastPart = index === parts.length - 1;

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
                <span>Markdown supported</span>
                <span>{value.length} characters</span>
            </div>
        </div>
    );
};
