import { useState, useCallback } from 'react';
import { Download, FileText, Table, FileSpreadsheet, Calendar, Filter, CheckCircle } from 'lucide-react';
import { useSettings } from '../../../context/SettingsContext';
import { SettingsCard } from '../shared/SettingsCard';
import { SettingsButton } from '../shared/SettingsButton';
import { SettingsSelect } from '../shared/SettingsSelect';
import { SettingsToggle } from '../shared/SettingsToggle';
import { ConfirmDialog } from '../shared/ConfirmDialog';
import { cn } from '../../../lib/utils';

interface ExportOptions {
    format: 'json' | 'csv' | 'pdf';
    includeNotes: boolean;
    includeTasks: boolean;
    includeEvents: boolean;
    includeJots: boolean;
    dateRange: 'all' | 'last30' | 'last90' | 'lastyear' | 'custom';
    startDate?: string;
    endDate?: string;
}

export const DataExport: React.FC = () => {
    const { settings, updateSettings } = useSettings();
    const [isExporting, setIsExporting] = useState(false);
    const [showSuccessDialog, setShowSuccessDialog] = useState(false);
    const [exportOptions, setExportOptions] = useState<ExportOptions>({
        format: settings.exportFormat || 'json',
        includeNotes: true,
        includeTasks: true,
        includeEvents: true,
        includeJots: true,
        dateRange: 'all'
    });

    const handleExport = useCallback(async () => {
        setIsExporting(true);
        try {
            // Simulate export process
            await new Promise(resolve => setTimeout(resolve, 3000));

            // Mock data for export
            const exportData = {
                notes: exportOptions.includeNotes ? [
                    { id: 1, title: 'Nota 1', content: 'Conteúdo da nota 1', createdAt: '2024-01-01T00:00:00Z' },
                    { id: 2, title: 'Nota 2', content: 'Conteúdo da nota 2', createdAt: '2024-01-02T00:00:00Z' }
                ] : [],
                tasks: exportOptions.includeTasks ? [
                    { id: 1, title: 'Tarefa 1', completed: false, dueDate: '2024-01-15T00:00:00Z' },
                    { id: 2, title: 'Tarefa 2', completed: true, dueDate: '2024-01-10T00:00:00Z' }
                ] : [],
                events: exportOptions.includeEvents ? [
                    { id: 1, title: 'Evento 1', startDate: '2024-01-20T00:00:00Z', endDate: '2024-01-20T23:59:59Z' }
                ] : [],
                jots: exportOptions.includeJots ? [
                    { id: 1, content: 'Jot 1', createdAt: '2024-01-05T00:00:00Z' }
                ] : [],
                exportedAt: new Date().toISOString(),
                exportFormat: exportOptions.format
            };

            // Export based on format
            if (exportOptions.format === 'json') {
                const dataStr = JSON.stringify(exportData, null, 2);
                const dataBlob = new Blob([dataStr], { type: 'application/json' });

                const url = URL.createObjectURL(dataBlob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `maxnote-export-${new Date().toISOString().split('T')[0]}.json`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
            } else if (exportOptions.format === 'csv') {
                // Simple CSV export for demonstration
                let csvContent = 'Type,ID,Title,Content,Created At,Due Date\n';

                exportData.notes.forEach(note => {
                    csvContent += `Note,${note.id},"${note.title}","${note.content}",${note.createdAt},\n`;
                });

                exportData.tasks.forEach(task => {
                    csvContent += `Task,${task.id},"${task.title}",,${task.dueDate},${task.completed}\n`;
                });

                exportData.events.forEach(event => {
                    csvContent += `Event,${event.id},"${event.title}",,${event.startDate},${event.endDate}\n`;
                });

                const dataBlob = new Blob([csvContent], { type: 'text/csv' });
                const url = URL.createObjectURL(dataBlob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `maxnote-export-${new Date().toISOString().split('T')[0]}.csv`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
            } else if (exportOptions.format === 'pdf') {
                // For PDF export, in a real implementation you would use a library like jsPDF
                // For now, we'll create a simple text representation
                let pdfContent = 'MaxNote Data Export\n';
                pdfContent += `Export Date: ${new Date().toLocaleString()}\n\n`;

                if (exportOptions.includeNotes) {
                    pdfContent += 'NOTES:\n';
                    exportData.notes.forEach(note => {
                        pdfContent += `- ${note.title}\n  ${note.content}\n  Created: ${new Date(note.createdAt).toLocaleString()}\n\n`;
                    });
                }

                if (exportOptions.includeTasks) {
                    pdfContent += 'TASKS:\n';
                    exportData.tasks.forEach(task => {
                        pdfContent += `- ${task.title}\n  Status: ${task.completed ? 'Completed' : 'Pending'}\n  Due: ${new Date(task.dueDate).toLocaleString()}\n\n`;
                    });
                }

                const dataBlob = new Blob([pdfContent], { type: 'text/plain' });
                const url = URL.createObjectURL(dataBlob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `maxnote-export-${new Date().toISOString().split('T')[0]}.txt`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
            }

            // Update settings with preferred format
            updateSettings({ exportFormat: exportOptions.format });
            setShowSuccessDialog(true);

        } catch (error) {
            console.error('Error exporting data:', error);
        } finally {
            setIsExporting(false);
        }
    }, [exportOptions, updateSettings]);

    const formatOptions = [
        { value: 'json', label: 'JSON', description: 'Formato estruturado ideal para desenvolvedores' },
        { value: 'csv', label: 'CSV', description: 'Formato de tabela compatível com Excel' },
        { value: 'pdf', label: 'PDF', description: 'Formato de documento para leitura fácil' }
    ];

    const dateRangeOptions = [
        { value: 'all', label: 'Todos os dados' },
        { value: 'last30', label: 'Últimos 30 dias' },
        { value: 'last90', label: 'Últimos 90 dias' },
        { value: 'lastyear', label: 'Último ano' },
        { value: 'custom', label: 'Personalizado' }
    ];

    return (
        <div className="space-y-6">
            {/* Export Format Selection */}
            <SettingsCard
                title="Formato de Exportação"
                description="Escolha o formato desejado para exportar seus dados"
            >
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {formatOptions.map((format) => (
                            <button
                                key={format.value}
                                onClick={() => setExportOptions(prev => ({ ...prev, format: format.value as any }))}
                                className={cn(
                                    "p-4 border-2 rounded-lg text-left transition-all",
                                    exportOptions.format === format.value
                                        ? "border-teal-500 bg-teal-50 dark:bg-teal-900/20"
                                        : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                                )}
                            >
                                <div className="flex items-center gap-3 mb-2">
                                    {format.value === 'json' && <FileText className="w-5 h-5 text-teal-600" />}
                                    {format.value === 'csv' && <Table className="w-5 h-5 text-teal-600" />}
                                    {format.value === 'pdf' && <FileSpreadsheet className="w-5 h-5 text-teal-600" />}
                                    <span className="font-medium text-gray-900 dark:text-white">
                                        {format.label}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {format.description}
                                </p>
                            </button>
                        ))}
                    </div>
                </div>
            </SettingsCard>

            {/* Data Selection */}
            <SettingsCard
                title="Seleção de Dados"
                description="Escolha quais tipos de dados incluir na exportação"
            >
                <div className="space-y-4">
                    <SettingsToggle
                        label="Notas"
                        description="Incluir todas as suas notas e seus conteúdos"
                        checked={exportOptions.includeNotes}
                        onChange={(checked) => setExportOptions(prev => ({ ...prev, includeNotes: checked }))}
                    />
                    <SettingsToggle
                        label="Tarefas"
                        description="Incluir todas as suas tarefas e status"
                        checked={exportOptions.includeTasks}
                        onChange={(checked) => setExportOptions(prev => ({ ...prev, includeTasks: checked }))}
                    />
                    <SettingsToggle
                        label="Eventos"
                        description="Incluir todos os seus eventos do calendário"
                        checked={exportOptions.includeEvents}
                        onChange={(checked) => setExportOptions(prev => ({ ...prev, includeEvents: checked }))}
                    />
                    <SettingsToggle
                        label="Jots"
                        description="Incluir todos os seus jots rápidos"
                        checked={exportOptions.includeJots}
                        onChange={(checked) => setExportOptions(prev => ({ ...prev, includeJots: checked }))}
                    />
                </div>
            </SettingsCard>

            {/* Date Range Selection */}
            <SettingsCard
                title="Intervalo de Datas"
                description="Selecione o período dos dados a serem exportados"
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Período
                        </label>
                        <select
                            value={exportOptions.dateRange}
                            onChange={(e) => setExportOptions(prev => ({ ...prev, dateRange: e.target.value as any }))}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                        >
                            {dateRangeOptions.map(option => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {exportOptions.dateRange === 'custom' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Data Inicial
                                </label>
                                <input
                                    type="date"
                                    value={exportOptions.startDate || ''}
                                    onChange={(e) => setExportOptions(prev => ({ ...prev, startDate: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Data Final
                                </label>
                                <input
                                    type="date"
                                    value={exportOptions.endDate || ''}
                                    onChange={(e) => setExportOptions(prev => ({ ...prev, endDate: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                                />
                            </div>
                        </div>
                    )}
                </div>
            </SettingsCard>

            {/* Export Action */}
            <SettingsCard
                title="Exportar Dados"
                description="Revise suas configurações e inicie a exportação"
            >
                <div className="space-y-4">
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <h4 className="font-medium text-gray-900 dark:text-white mb-2">Resumo da Exportação</h4>
                        <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                            <div>Formato: <span className="font-medium">{exportOptions.format.toUpperCase()}</span></div>
                            <div>Tipos de dados:
                                <span className="font-medium">
                                    {[
                                        exportOptions.includeNotes && 'Notas',
                                        exportOptions.includeTasks && 'Tarefas',
                                        exportOptions.includeEvents && 'Eventos',
                                        exportOptions.includeJots && 'Jots'
                                    ].filter(Boolean).join(', ')}
                                </span>
                            </div>
                            <div>Período: <span className="font-medium">
                                {dateRangeOptions.find(opt => opt.value === exportOptions.dateRange)?.label}
                            </span></div>
                        </div>
                    </div>

                    <SettingsButton
                        variant="primary"
                        onClick={handleExport}
                        disabled={isExporting || (!exportOptions.includeNotes && !exportOptions.includeTasks && !exportOptions.includeEvents && !exportOptions.includeJots)}
                        loading={isExporting}
                        className="w-full md:w-auto"
                    >
                        <Download className="w-4 h-4 mr-2" />
                        {isExporting ? 'Exportando...' : 'Exportar Dados'}
                    </SettingsButton>
                </div>
            </SettingsCard>

            {/* Success Dialog */}
            <ConfirmDialog
                isOpen={showSuccessDialog}
                onClose={() => setShowSuccessDialog(false)}
                onConfirm={() => setShowSuccessDialog(false)}
                title="Exportação Concluída"
                message="Seus dados foram exportados com sucesso. Verifique sua pasta de downloads."
                confirmText="OK"
                variant="success"
            />
        </div>
    );
};