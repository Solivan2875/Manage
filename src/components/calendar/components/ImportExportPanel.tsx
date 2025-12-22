import { useState, useRef } from 'react';
import {
    Download,
    Upload,
    Calendar,
    ExternalLink,
    FileText,
    Settings,
    CheckCircle,
    AlertCircle,
    X,
    Filter,
    CalendarDays
} from 'lucide-react';
import type { Event } from '../../../types/calendar';
import { useCalendarImportExport } from '../../../hooks/calendar/useCalendarImportExport';
import type { ImportResult, ExportOptions } from '../../../services/calendarImportExportService';

interface ImportExportPanelProps {
    events: Event[];
    onEventAdd?: (event: Event) => void;
    onEventUpdate?: (id: string, updates: Partial<Event>) => void;
    onEventDelete?: (id: string) => void;
}

export const ImportExportPanel = ({
    events,
    onEventAdd,
    onEventUpdate,
    onEventDelete
}: ImportExportPanelProps) => {
    const [activeTab, setActiveTab] = useState<'import' | 'export' | 'sync'>('import');
    const [importFile, setImportFile] = useState<File | null>(null);
    const [showExportOptions, setShowExportOptions] = useState(false);
    const [showSyncDialog, setShowSyncDialog] = useState(false);
    const [syncUrl, setSyncUrl] = useState('');
    const [syncProvider, setSyncProvider] = useState('');

    const fileInputRef = useRef<HTMLInputElement>(null);

    const {
        isImporting,
        isExporting,
        isSyncing,
        importResult,
        exportOptions,
        importFromFile,
        exportToICS,
        downloadICS,
        syncWithExternal,
        updateExportOptions,
        getSupportedProviders,
        formatFileSize,
        validateImportFile,
        clearImportResult
    } = useCalendarImportExport({
        events,
        onEventAdd,
        onEventUpdate,
        onEventDelete
    });

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const validation = validateImportFile(file);
            if (validation.valid) {
                setImportFile(file);
            } else {
                alert(`Arquivo inválido:\n${validation.errors.join('\n')}`);
            }
        }
    };

    const handleImport = () => {
        if (importFile) {
            importFromFile(importFile);
        }
    };

    const handleExport = () => {
        exportToICS();
    };

    const handleDownload = () => {
        const filename = `maxnote-calendar-${new Date().toISOString().split('T')[0]}.ics`;
        downloadICS(filename);
    };

    const handleSync = () => {
        if (syncUrl) {
            syncWithExternal(syncUrl);
        }
    };

    const supportedProviders = getSupportedProviders();

    return (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                    Importação/Exportação
                </h3>
                <button
                    onClick={clearImportResult}
                    className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                    title="Limpar resultados"
                >
                    <X className="w-4 h-4 text-gray-500" />
                </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 dark:border-gray-700 mb-4">
                <button
                    onClick={() => setActiveTab('import')}
                    className={`px-3 py-2 text-sm font-medium transition-colors ${activeTab === 'import'
                        ? 'text-teal-600 border-b-2 border-teal-600'
                        : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    Importar
                </button>
                <button
                    onClick={() => setActiveTab('export')}
                    className={`px-3 py-2 text-sm font-medium transition-colors ${activeTab === 'export'
                        ? 'text-teal-600 border-b-2 border-teal-600'
                        : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    Exportar
                </button>
                <button
                    onClick={() => setActiveTab('sync')}
                    className={`px-3 py-2 text-sm font-medium transition-colors ${activeTab === 'sync'
                        ? 'text-teal-600 border-b-2 border-teal-600'
                        : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    Sincronizar
                </button>
            </div>

            {/* Import Tab */}
            {activeTab === 'import' && (
                <div className="space-y-4">
                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                        <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h4 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Importar Calendário
                        </h4>
                        <p className="text-sm text-gray-500 mb-4">
                            Selecione um arquivo .ics para importar eventos para o seu calendário
                        </p>

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".ics"
                            onChange={handleFileSelect}
                            className="hidden"
                        />

                        <button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isImporting}
                            className="px-4 py-2 bg-teal-600 hover:bg-teal-700 disabled:bg-gray-400 text-white rounded-md transition-colors flex items-center gap-2 mx-auto"
                        >
                            <Upload className="w-4 h-4" />
                            {isImporting ? 'Importando...' : 'Selecionar Arquivo'}
                        </button>
                    </div>

                    {importFile && (
                        <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Arquivo selecionado
                                </span>
                                <span className="text-xs text-gray-500">
                                    {formatFileSize(importFile.size)}
                                </span>
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                {importFile.name}
                            </div>
                            <button
                                onClick={handleImport}
                                disabled={isImporting}
                                className="mt-3 w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-md transition-colors"
                            >
                                {isImporting ? 'Importando...' : 'Importar Eventos'}
                            </button>
                        </div>
                    )}

                    {importResult && (
                        <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <div className="flex items-center gap-2 mb-3">
                                {importResult.success ? (
                                    <CheckCircle className="w-5 h-5 text-green-500" />
                                ) : (
                                    <AlertCircle className="w-5 h-5 text-red-500" />
                                )}
                                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Resultado da Importação
                                </h4>
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="text-gray-500">Eventos importados:</span>
                                    <span className="font-medium text-gray-700 dark:text-gray-300 ml-1">
                                        {importResult.events.length}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-gray-500">Ignorados:</span>
                                    <span className="font-medium text-gray-700 dark:text-gray-300 ml-1">
                                        {importResult.skipped}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-gray-500">Duplicados:</span>
                                    <span className="font-medium text-gray-700 dark:text-gray-300 ml-1">
                                        {importResult.duplicates}
                                    </span>
                                </div>
                            </div>

                            {importResult.errors.length > 0 && (
                                <div className="mt-3">
                                    <h5 className="text-sm font-medium text-red-600 dark:text-red-400 mb-2">
                                        Erros
                                    </h5>
                                    <ul className="text-xs text-red-600 dark:text-red-400 space-y-1">
                                        {importResult.errors.map((error, index) => (
                                            <li key={index}>• {error}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {importResult.warnings.length > 0 && (
                                <div className="mt-3">
                                    <h5 className="text-sm font-medium text-yellow-600 dark:text-yellow-400 mb-2">
                                        Avisos
                                    </h5>
                                    <ul className="text-xs text-yellow-600 dark:text-yellow-400 space-y-1">
                                        {importResult.warnings.map((warning, index) => (
                                            <li key={index}>• {warning}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Export Tab */}
            {activeTab === 'export' && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between mb-4">
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Opções de Exportação
                        </h4>
                        <button
                            onClick={() => setShowExportOptions(!showExportOptions)}
                            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                        >
                            <Settings className="w-4 h-4 text-gray-500" />
                        </button>
                    </div>

                    {showExportOptions && (
                        <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg space-y-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Intervalo de Datas
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                    <input
                                        type="date"
                                        value={exportOptions.dateRange?.start ? exportOptions.dateRange.start.toISOString().split('T')[0] : ''}
                                        onChange={(e) => updateExportOptions({
                                            dateRange: {
                                                start: new Date(e.target.value),
                                                end: exportOptions.dateRange?.end || new Date()
                                            }
                                        })}
                                        className="p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-sm"
                                        placeholder="Data inicial"
                                    />
                                    <input
                                        type="date"
                                        value={exportOptions.dateRange?.end ? exportOptions.dateRange.end.toISOString().split('T')[0] : ''}
                                        onChange={(e) => updateExportOptions({
                                            dateRange: {
                                                start: exportOptions.dateRange?.start || new Date(),
                                                end: new Date(e.target.value)
                                            }
                                        })}
                                        className="p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-sm"
                                        placeholder="Data final"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Categorias
                                </label>
                                <select
                                    multiple
                                    value={exportOptions.categories || []}
                                    onChange={(e) => {
                                        const values = Array.from(e.target.selectedOptions, option => option.value);
                                        updateExportOptions({ categories: values });
                                    }}
                                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-sm"
                                >
                                    <option value="meeting">Reunião</option>
                                    <option value="task">Tarefa</option>
                                    <option value="reminder">Lembrete</option>
                                    <option value="event">Evento</option>
                                    <option value="personal">Pessoal</option>
                                    <option value="work">Trabalho</option>
                                </select>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={handleExport}
                            disabled={isExporting}
                            className="p-4 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex flex-col items-center gap-2"
                        >
                            <Download className="w-6 h-6 text-teal-600" />
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Exportar como ICS
                            </span>
                            {isExporting && (
                                <span className="text-xs text-gray-500">
                                    Exportando...
                                </span>
                            )}
                        </button>

                        <button
                            onClick={handleDownload}
                            disabled={isExporting}
                            className="p-4 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex flex-col items-center gap-2"
                        >
                            <CalendarDays className="w-6 h-6 text-blue-600" />
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Baixar Arquivo
                            </span>
                        </button>
                    </div>

                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <div className="flex items-start gap-2">
                            <Calendar className="w-4 h-4 text-blue-600 mt-0.5" />
                            <div className="text-sm text-blue-600 dark:text-blue-400">
                                <div className="font-medium mb-1">
                                    {events.length} eventos serão exportados
                                </div>
                                <div className="text-xs">
                                    Formato ICS compatível com Google Calendar, Outlook, Apple Calendar e outros
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Sync Tab */}
            {activeTab === 'sync' && (
                <div className="space-y-4">
                    <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                            Sincronizar com Calendário Externo
                        </h4>

                        <div className="space-y-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Provedor
                                </label>
                                <select
                                    value={syncProvider}
                                    onChange={(e) => setSyncProvider(e.target.value)}
                                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-sm"
                                >
                                    <option value="">Selecione um provedor</option>
                                    {supportedProviders.map(provider => (
                                        <option key={provider.name} value={provider.name}>
                                            {provider.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {syncProvider && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        URL do Calendário
                                    </label>
                                    <input
                                        type="url"
                                        value={syncUrl}
                                        onChange={(e) => setSyncUrl(e.target.value)}
                                        placeholder="https://calendar.google.com/calendar/dav/..."
                                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-sm"
                                    />
                                </div>
                            )}

                            {syncProvider && (
                                <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                                    <div className="flex items-start gap-2">
                                        <ExternalLink className="w-4 h-4 text-yellow-600 mt-0.5" />
                                        <div className="text-sm text-yellow-600 dark:text-yellow-400">
                                            <div className="font-medium mb-1">
                                                {supportedProviders.find(p => p.name === syncProvider)?.instructions}
                                            </div>
                                            <div className="text-xs">
                                                Você precisará autorizar o acesso ao seu calendário externo
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <button
                            onClick={() => setShowSyncDialog(true)}
                            disabled={!syncProvider || !syncUrl || isSyncing}
                            className="w-full px-4 py-2 bg-teal-600 hover:bg-teal-700 disabled:bg-gray-400 text-white rounded-md transition-colors flex items-center justify-center gap-2"
                        >
                            <ExternalLink className="w-4 h-4" />
                            {isSyncing ? 'Sincronizando...' : 'Configurar Sincronização'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};