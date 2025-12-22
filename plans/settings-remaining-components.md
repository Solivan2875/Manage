# MaxNote Settings - Remaining Components

## Data Management Components

### DataTab Component

```typescript
// src/components/settings/tabs/DataTab.tsx
import { useState } from 'react';
import { DataExport } from '../data/DataExport';
import { StorageManagement } from '../data/StorageManagement';
import { AccountDeletion } from '../data/AccountDeletion';
import { SettingsCard } from '../shared/SettingsCard';
import { SettingsSection } from '../shared/SettingsSection';
import { useAuth } from '../../../context/AuthContext';
import { useSettings } from '../../../context/SettingsContext';

export const DataTab: React.FC = () => {
  const { user } = useAuth();
  const { settings, updateSettings } = useSettings();
  const [activeSection, setActiveSection] = useState('export');

  const sections = [
    { id: 'export', label: 'Exportar Dados', component: DataExport },
    { id: 'storage', label: 'Gerenciamento de Armazenamento', component: StorageManagement },
    { id: 'deletion', label: 'Exclusão de Conta', component: AccountDeletion },
  ];

  const currentSection = sections.find(s => s.id === activeSection);
  const CurrentSectionComponent = currentSection?.component;

  return (
    <div className="divide-y divide-gray-200 dark:divide-gray-700">
      {/* Section Navigation */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-wrap gap-2">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeSection === section.id
                  ? 'bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              {section.label}
            </button>
          ))}
        </div>
      </div>

      {/* Current Section */}
      <div className="p-6">
        {CurrentSectionComponent && (
          <CurrentSectionComponent 
            user={user}
            settings={settings}
            onUpdate={updateSettings}
          />
        )}
      </div>
    </div>
  );
};
```

### DataExport Component

```typescript
// src/components/settings/data/DataExport.tsx
import { useState } from 'react';
import { Download, FileJson, FileText, FileSpreadsheet, Loader2, Check, AlertCircle } from 'lucide-react';
import { AuthUser } from '../../../context/AuthContext';
import { SettingsCard } from '../shared/SettingsCard';
import { SettingsSection } from '../shared/SettingsSection';
import { SettingsButton } from '../shared/SettingsButton';
import { SettingsSelect } from '../shared/SettingsSelect';
import { ConfirmDialog } from '../shared/ConfirmDialog';
import { notesService, tasksService, eventsService, jotsService } from '../../../services/supabaseService';

interface DataExportProps {
  user: AuthUser | null;
  settings: any;
  onUpdate: (updates: any) => Promise<void>;
}

export const DataExport: React.FC<DataExportProps> = ({
  user,
  settings,
  onUpdate
}) => {
  const [exportFormat, setExportFormat] = useState(settings.exportFormat || 'json');
  const [selectedData, setSelectedData] = useState({
    notes: true,
    tasks: true,
    events: true,
    jots: true,
  });
  const [isExporting, setIsExporting] = useState(false);
  const [exportStatus, setExportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const formatOptions = [
    { value: 'json', label: 'JSON', icon: FileJson },
    { value: 'csv', label: 'CSV', icon: FileSpreadsheet },
    { value: 'pdf', label: 'PDF', icon: FileText },
  ];

  const handleExport = async () => {
    if (!user) return;

    setIsExporting(true);
    setExportStatus('idle');

    try {
      // Fetch all user data
      const [notesResult, tasksResult, eventsResult, jotsResult] = await Promise.all([
        selectedData.notes ? notesService.getAll() : { data: null, error: null },
        selectedData.tasks ? tasksService.getAll() : { data: null, error: null },
        selectedData.events ? eventsService.getAll() : { data: null, error: null },
        selectedData.jots ? jotsService.getAll() : { data: null, error: null },
      ]);

      const exportData = {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
        exportDate: new Date().toISOString(),
        data: {
          notes: notesResult.data || [],
          tasks: tasksResult.data || [],
          events: eventsResult.data || [],
          jots: jotsResult.data || [],
        },
      };

      if (exportFormat === 'json') {
        // Download as JSON
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `maxnote-export-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
      } else if (exportFormat === 'csv') {
        // Convert to CSV and download
        const csvData = convertToCSV(exportData);
        const blob = new Blob([csvData], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `maxnote-export-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
      } else if (exportFormat === 'pdf') {
        // Generate PDF (would need a PDF library like jsPDF)
        await generatePDF(exportData);
      }

      setExportStatus('success');
      await onUpdate({ exportFormat });
      
      // Reset status after 3 seconds
      setTimeout(() => setExportStatus('idle'), 3000);
    } catch (error) {
      console.error('Export error:', error);
      setExportStatus('error');
      setTimeout(() => setExportStatus('idle'), 3000);
    } finally {
      setIsExporting(false);
    }
  };

  const convertToCSV = (data: any): string => {
    // Convert nested data to CSV format
    const rows = [];
    
    // Add headers
    rows.push(['Type', 'ID', 'Title', 'Content', 'Created', 'Updated']);
    
    // Add notes
    if (data.data.notes) {
      data.data.notes.forEach((note: any) => {
        rows.push([
          'Note',
          note.id,
          note.title,
          note.content.replace(/\n/g, ' '),
          note.created_at,
          note.updated_at
        ]);
      });
    }
    
    // Add tasks
    if (data.data.tasks) {
      data.data.tasks.forEach((task: any) => {
        rows.push([
          'Task',
          task.id,
          task.title,
          task.description.replace(/\n/g, ' '),
          task.created_at,
          task.updated_at
        ]);
      });
    }
    
    // Add events
    if (data.data.events) {
      data.data.events.forEach((event: any) => {
        rows.push([
          'Event',
          event.id,
          event.title,
          event.description.replace(/\n/g, ' '),
          event.start_date,
          event.end_date
        ]);
      });
    }
    
    // Add jots
    if (data.data.jots) {
      data.data.jots.forEach((jot: any) => {
        rows.push([
          'Jot',
          jot.id,
          jot.content.slice(0, 50),
          jot.content.replace(/\n/g, ' '),
          jot.created_at,
          jot.updated_at
        ]);
      });
    }
    
    return rows.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
  };

  const generatePDF = async (data: any): Promise<void> => {
    // This would require a PDF library like jsPDF
    // For now, we'll create a simple text representation
    const content = `
MaxNote Data Export
==================

Export Date: ${new Date().toLocaleDateString()}
User: ${user?.name} (${user?.email})

Notes (${data.data.notes?.length || 0}):
${data.data.notes?.map((note: any) => `- ${note.title}`).join('\n') || 'None'}

Tasks (${data.data.tasks?.length || 0}):
${data.data.tasks?.map((task: any) => `- ${task.title}`).join('\n') || 'None'}

Events (${data.data.events?.length || 0}):
${data.data.events?.map((event: any) => `- ${event.title}`).join('\n') || 'None'}

Jots (${data.data.jots?.length || 0}):
${data.data.jots?.map((jot: any) => `- ${jot.content.slice(0, 50)}...`).join('\n') || 'None'}
    `;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `maxnote-export-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getDataCount = () => {
    return Object.values(selectedData).filter(Boolean).length;
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          Exportar Dados
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Exporte seus dados do MaxNote em diferentes formatos
        </p>
      </div>

      <div className="space-y-6">
        {/* Export Format Selection */}
        <SettingsCard>
          <SettingsSection
            title="Formato de Exportação"
            description="Escolha o formato para exportar seus dados"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {formatOptions.map((format) => {
                const Icon = format.icon;
                return (
                  <button
                    key={format.value}
                    onClick={() => setExportFormat(format.value)}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      exportFormat === format.value
                        ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <Icon className={`w-8 h-8 mx-auto mb-2 ${
                      exportFormat === format.value
                        ? 'text-teal-600 dark:text-teal-400'
                        : 'text-gray-600 dark:text-gray-400'
                    }`} />
                    <div className={`text-sm font-medium ${
                      exportFormat === format.value
                        ? 'text-teal-600 dark:text-teal-400'
                        : 'text-gray-700 dark:text-gray-300'
                    }`}>
                      {format.label}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {exportFormat === 'json' && 'Formato estruturado que preserva todos os dados e metadados.'}
                {exportFormat === 'csv' && 'Formato de tabela compatível com planilhas e análise de dados.'}
                {exportFormat === 'pdf' && 'Formato de documento fácil de ler e compartilhar.'}
              </p>
            </div>
          </SettingsSection>
        </SettingsCard>

        {/* Data Selection */}
        <SettingsCard>
          <SettingsSection
            title="Selecionar Dados"
            description="Escolha quais tipos de dados incluir na exportação"
          >
            <div className="space-y-3">
              {[
                { key: 'notes', label: 'Notas', description: 'Todas as suas notas e seus conteúdos' },
                { key: 'tasks', label: 'Tarefas', description: 'Suas tarefas e status' },
                { key: 'events', label: 'Eventos', description: 'Eventos do calendário' },
                { key: 'jots', label: 'Rascunhos', description: 'Seus rascunhos rápidos' },
              ].map((item) => (
                <label key={item.key} className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedData[item.key as keyof typeof selectedData]}
                    onChange={(e) => setSelectedData(prev => ({
                      ...prev,
                      [item.key]: e.target.checked
                    }))}
                    className="mt-1 rounded border-gray-300 dark:border-gray-600 text-teal-600 focus:ring-teal-500"
                  />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {item.label}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {item.description}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </SettingsSection>
        </SettingsCard>

        {/* Export Actions */}
        <SettingsCard>
          <SettingsSection
            title="Exportar"
            description="Inicie o processo de exportação"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {getDataCount()} tipo(s) de dados selecionados
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Formato: {exportFormat.toUpperCase()}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {exportStatus === 'success' && (
                    <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                      <Check className="w-4 h-4" />
                      <span className="text-sm">Exportado</span>
                    </div>
                  )}

                  {exportStatus === 'error' && (
                    <div className="flex items-center gap-1 text-red-600 dark:text-red-400">
                      <AlertCircle className="w-4 h-4" />
                      <span className="text-sm">Erro</span>
                    </div>
                  )}

                  <SettingsButton
                    onClick={() => setShowConfirmDialog(true)}
                    disabled={getDataCount() === 0 || isExporting}
                    loading={isExporting}
                  >
                    {isExporting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Download className="w-4 h-4" />
                    )}
                    Exportar
                  </SettingsButton>
                </div>
              </div>

              <div className="text-xs text-gray-500 dark:text-gray-400">
                A exportação pode levar alguns minutos dependendo da quantidade de dados.
              </div>
            </div>
          </SettingsSection>
        </SettingsCard>
      </div>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        open={showConfirmDialog}
        title="Confirmar Exportação"
        description={`Tem certeza que deseja exportar ${getDataCount()} tipo(s) de dados no formato ${exportFormat.toUpperCase()}?`}
        confirmText="Exportar"
        cancelText="Cancelar"
        onConfirm={() => {
          setShowConfirmDialog(false);
          handleExport();
        }}
        onCancel={() => setShowConfirmDialog(false)}
      />
    </div>
  );
};
```

### StorageManagement Component

```typescript
// src/components/settings/data/StorageManagement.tsx
import { useState, useEffect } from 'react';
import { HardDrive, Trash2, RefreshCw, FileText, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';
import { AuthUser } from '../../../context/AuthContext';
import { SettingsCard } from '../shared/SettingsCard';
import { SettingsSection } from '../shared/SettingsSection';
import { SettingsButton } from '../shared/SettingsButton';
import { ConfirmDialog } from '../shared/ConfirmDialog';
import { cn } from '../../../lib/utils';

interface StorageInfo {
  total: number;
  used: number;
  available: number;
  breakdown: {
    notes: number;
    tasks: number;
    events: number;
    jots: number;
    attachments: number;
  };
}

interface StorageManagementProps {
  user: AuthUser | null;
  settings: any;
  onUpdate: (updates: any) => Promise<void>;
}

export const StorageManagement: React.FC<StorageManagementProps> = ({
  user,
  settings,
  onUpdate
}) => {
  const [storageInfo, setStorageInfo] = useState<StorageInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [clearingType, setClearingType] = useState<'all' | 'attachments' | null>(null);
  const [isClearing, setIsClearing] = useState(false);

  // Mock storage data - replace with actual API call
  useEffect(() => {
    const fetchStorageInfo = async () => {
      setLoading(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const mockData: StorageInfo = {
          total: 1024 * 1024 * 1024, // 1GB
          used: 512 * 1024 * 1024,  // 512MB
          available: 512 * 1024 * 1024, // 512MB
          breakdown: {
            notes: 200 * 1024 * 1024,    // 200MB
            tasks: 50 * 1024 * 1024,     // 50MB
            events: 30 * 1024 * 1024,    // 30MB
            jots: 20 * 1024 * 1024,     // 20MB
            attachments: 212 * 1024 * 1024, // 212MB
          },
        };
        
        setStorageInfo(mockData);
      } catch (error) {
        console.error('Error fetching storage info:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStorageInfo();
  }, []);

  const refreshStorageInfo = async () => {
    setRefreshing(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update with new data
      if (storageInfo) {
        setStorageInfo({
          ...storageInfo,
          used: Math.min(storageInfo.used + Math.random() * 10 * 1024 * 1024, storageInfo.total),
          available: Math.max(storageInfo.available - Math.random() * 10 * 1024 * 1024, 0),
        });
      }
    } catch (error) {
      console.error('Error refreshing storage info:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getUsagePercentage = (): number => {
    if (!storageInfo) return 0;
    return (storageInfo.used / storageInfo.total) * 100;
  };

  const getUsageColor = (percentage: number): string => {
    if (percentage < 70) return 'text-green-600 dark:text-green-400';
    if (percentage < 90) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const handleClearData = async (type: 'all' | 'attachments') => {
    if (!user) return;

    setIsClearing(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update storage info
      if (storageInfo) {
        if (type === 'attachments') {
          setStorageInfo({
            ...storageInfo,
            used: storageInfo.used - storageInfo.breakdown.attachments,
            breakdown: {
              ...storageInfo.breakdown,
              attachments: 0,
            },
          });
        } else {
          setStorageInfo({
            total: storageInfo.total,
            used: 0,
            available: storageInfo.total,
            breakdown: {
              notes: 0,
              tasks: 0,
              events: 0,
              jots: 0,
              attachments: 0,
            },
          });
        }
      }
    } catch (error) {
      console.error('Error clearing data:', error);
    } finally {
      setIsClearing(false);
      setShowClearDialog(false);
      setClearingType(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
          <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  if (!storageInfo) {
    return (
      <div className="text-center py-8">
        <AlertTriangle className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
        <p className="text-gray-500 dark:text-gray-400">
          Não foi possível carregar informações de armazenamento
        </p>
      </div>
    );
  }

  const usagePercentage = getUsagePercentage();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Gerenciamento de Armazenamento
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Monitore e gerencie seu espaço de armazenamento
          </p>
        </div>

        <SettingsButton
          variant="secondary"
          onClick={refreshStorageInfo}
          loading={refreshing}
          disabled={refreshing}
        >
          <RefreshCw className={cn("w-4 h-4", refreshing && "animate-spin")} />
          Atualizar
        </SettingsButton>
      </div>

      <div className="space-y-6">
        {/* Storage Overview */}
        <SettingsCard>
          <SettingsSection
            title="Visão Geral"
            description="Status atual do seu armazenamento"
          >
            <div className="space-y-4">
              {/* Storage Bar */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {formatBytes(storageInfo.used)} de {formatBytes(storageInfo.total)}
                  </span>
                  <span className={cn("text-sm font-medium", getUsageColor(usagePercentage))}>
                    {usagePercentage.toFixed(1)}%
                  </span>
                </div>
                
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className={cn(
                      "h-2 rounded-full transition-all duration-300",
                      usagePercentage < 70 ? "bg-green-600" :
                      usagePercentage < 90 ? "bg-yellow-600" : "bg-red-600"
                    )}
                    style={{ width: `${usagePercentage}%` }}
                  ></div>
                </div>
              </div>

              {/* Storage Details */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="text-sm font-medium">Disponível</span>
                  </div>
                  <div className="text-lg font-semibold text-gray-900 dark:text-white mt-1">
                    {formatBytes(storageInfo.available)}
                  </div>
                </div>

                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                    <HardDrive className="w-4 h-4" />
                    <span className="text-sm font-medium">Total</span>
                  </div>
                  <div className="text-lg font-semibold text-gray-900 dark:text-white mt-1">
                    {formatBytes(storageInfo.total)}
                  </div>
                </div>
              </div>
            </div>
          </SettingsSection>
        </SettingsCard>

        {/* Storage Breakdown */}
        <SettingsCard>
          <SettingsSection
            title="Uso por Categoria"
            description="Detalhamento do espaço utilizado por tipo de conteúdo"
          >
            <div className="space-y-3">
              {[
                { key: 'notes', label: 'Notas', icon: FileText, bytes: storageInfo.breakdown.notes },
                { key: 'tasks', label: 'Tarefas', icon: CheckCircle2, bytes: storageInfo.breakdown.tasks },
                { key: 'events', label: 'Eventos', icon: FileText, bytes: storageInfo.breakdown.events },
                { key: 'jots', label: 'Rascunhos', icon: FileText, bytes: storageInfo.breakdown.jots },
                { key: 'attachments', label: 'Anexos', icon: HardDrive, bytes: storageInfo.breakdown.attachments },
              ].map((item) => {
                const percentage = (item.bytes / storageInfo.used) * 100;
                return (
                  <div key={item.key} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <item.icon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {item.label}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {formatBytes(item.bytes)}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {percentage.toFixed(1)}%
                        </div>
                      </div>
                    </div>
                    
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                      <div
                        className="bg-teal-600 h-1.5 rounded-full"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </SettingsSection>
        </SettingsCard>

        {/* Storage Actions */}
        <SettingsCard>
          <SettingsSection
            title="Ações de Limpeza"
            description="Libere espaço removendo dados desnecessários"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    Limpar Anexos
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Remova todos os anexos e arquivos enviados
                  </p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">
                    {formatBytes(storageInfo.breakdown.attachments)} serão liberados
                  </p>
                </div>
                
                <SettingsButton
                  variant="secondary"
                  onClick={() => {
                    setClearingType('attachments');
                    setShowClearDialog(true);
                  }}
                  disabled={isClearing || storageInfo.breakdown.attachments === 0}
                >
                  <Trash2 className="w-4 h-4" />
                  Limpar
                </SettingsButton>
              </div>

              <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                <div>
                  <h4 className="font-medium text-red-600 dark:text-red-400">
                    Limpar Todos os Dados
                  </h4>
                  <p className="text-sm text-red-500 dark:text-red-400">
                    Remova permanentemente todos os seus dados
                  </p>
                  <p className="text-sm font-medium text-red-600 dark:text-red-400 mt-1">
                    {formatBytes(storageInfo.used)} serão liberados
                  </p>
                </div>
                
                <SettingsButton
                  variant="danger"
                  onClick={() => {
                    setClearingType('all');
                    setShowClearDialog(true);
                  }}
                  disabled={isClearing}
                >
                  <Trash2 className="w-4 h-4" />
                  Limpar Tudo
                </SettingsButton>
              </div>
            </div>
          </SettingsSection>
        </SettingsCard>
      </div>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        open={showConfirmDialog}
        title={clearingType === 'all' ? 'Limpar Todos os Dados' : 'Limpar Anexos'}
        description={
          clearingType === 'all'
            ? `Tem certeza que deseja remover permanentemente todos os seus dados? Esta ação não pode ser desfeita e liberará ${formatBytes(storageInfo?.used || 0)}.`
            : `Tem certeza que deseja remover todos os anexos? Esta ação não pode ser desfeita e liberará ${formatBytes(storageInfo?.breakdown.attachments || 0)}.`
        }
        confirmText="Limpar"
        cancelText="Cancelar"
        onConfirm={() => handleClearData(clearingType!)}
        onCancel={() => {
          setShowClearDialog(false);
          setClearingType(null);
        }}
        variant="danger"
      />
    </div>
  );
};
```

### AccountDeletion Component

```typescript
// src/components/settings/data/AccountDeletion.tsx
import { useState } from 'react';
import { AlertTriangle, Trash2, Eye, EyeOff, Loader2, Check, X } from 'lucide-react';
import { AuthUser } from '../../../context/AuthContext';
import { SettingsCard } from '../shared/SettingsCard';
import { SettingsSection } from '../shared/SettingsSection';
import { SettingsButton } from '../shared/SettingsButton';
import { SettingsInput } from '../shared/SettingsInput';
import { ConfirmDialog } from '../shared/ConfirmDialog';
import { useAuth } from '../../../context/AuthContext';

interface AccountDeletionProps {
  user: AuthUser | null;
  settings: any;
  onUpdate: (updates: any) => Promise<void>;
}

export const AccountDeletion: React.FC<AccountDeletionProps> = ({
  user,
  settings,
  onUpdate
}) => {
  const { logout } = useAuth();
  const [confirmationText, setConfirmationText] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [deleteStep, setDeleteStep] = useState<'confirmation' | 'password' | 'processing'>('confirmation');

  const requiredText = 'DELETAR MINHA CONTA';

  const handleDeleteAccount = async () => {
    if (!user) return;

    setIsDeleting(true);
    setDeleteStep('processing');

    try {
      // Simulate API call for account deletion
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Log out user after successful deletion
      await logout();
      
      // Redirect to login page or show success message
      window.location.href = '/login';
    } catch (error) {
      console.error('Error deleting account:', error);
      setIsDeleting(false);
      setDeleteStep('confirmation');
    }
  };

  const canDelete = confirmationText === requiredText && password.length >= 6;

  const resetForm = () => {
    setConfirmationText('');
    setPassword('');
    setShowPassword(false);
    setDeleteStep('confirmation');
    setShowConfirmDialog(false);
    setIsDeleting(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          Exclusão de Conta
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Exclua permanentemente sua conta e todos os dados associados
        </p>
      </div>

      <div className="space-y-6">
        {/* Warning Section */}
        <SettingsCard className="border-red-200 dark:border-red-800">
          <SettingsSection
            title="⚠️ Aviso Importante"
            description="Leia atentamente antes de prosseguir"
          >
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-gray-700 dark:text-gray-300">
                  <p className="font-medium mb-2">A exclusão da conta é permanente e irreversível:</p>
                  <ul className="space-y-1 ml-4 list-disc">
                    <li>Todos os seus dados serão permanentemente removidos</li>
                    <li>Notas, tarefas, eventos e rascunhos serão excluídos</li>
                    <li>Anexos e arquivos serão removidos</li>
                    <li>Seu email não poderá ser reutilizado para criar nova conta</li>
                  </ul>
                </div>
              </div>

              <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                <p className="text-sm text-red-700 dark:text-red-300">
                  <strong>Recomendação:</strong> Antes de excluir sua conta, considere exportar seus dados usando a opção "Exportar Dados" disponível nesta seção.
                </p>
              </div>
            </div>
          </SettingsSection>
        </SettingsCard>

        {/* Data Summary */}
        <SettingsCard>
          <SettingsSection
            title="Resumo dos Dados"
            description="O que será excluído"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { label: 'Notas', count: '127', icon: '📝' },
                { label: 'Tarefas', count: '45', icon: '✅' },
                { label: 'Eventos', count: '23', icon: '📅' },
                { label: 'Rascunhos', count: '89', icon: '📄' },
              ].map((item, index) => (
                <div key={index} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">{item.icon}</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {item.label}
                    </span>
                  </div>
                  <div className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                    {item.count}
                  </div>
                </div>
              ))}
            </div>
          </SettingsSection>
        </SettingsCard>

        {/* Deletion Process */}
        <SettingsCard>
          <SettingsSection
            title="Processo de Exclusão"
            description="Confirme sua identidade para prosseguir"
          >
            <div className="space-y-6">
              {/* Step 1: Confirmation Text */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Digite "{requiredText}" para confirmar
                </label>
                <SettingsInput
                  value={confirmationText}
                  onChange={setConfirmationText}
                  placeholder={requiredText}
                  error={confirmationText && confirmationText !== requiredText ? 'Texto não corresponde ao requerido' : undefined}
                />
              </div>

              {/* Step 2: Password Confirmation */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Confirme sua senha
                </label>
                <div className="relative">
                  <SettingsInput
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={setPassword}
                    placeholder="Sua senha"
                    error={password && password.length < 6 ? 'Senha deve ter pelo menos 6 caracteres' : undefined}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Delete Button */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <SettingsButton
                  variant="danger"
                  onClick={() => setShowConfirmDialog(true)}
                  disabled={!canDelete || isDeleting}
                  className="w-full"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Excluindo conta...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      Excluir Minha Conta Permanentemente
                    </>
                  )}
                </SettingsButton>
              </div>
            </div>
          </SettingsSection>
        </SettingsCard>
      </div>

      {/* Final Confirmation Dialog */}
      <ConfirmDialog
        open={showConfirmDialog}
        title="Confirmar Exclusão de Conta"
        description={
          <div className="space-y-2">
            <p>Tem certeza que deseja excluir permanentemente sua conta?</p>
            <p className="font-semibold text-red-600 dark:text-red-400">
              Esta ação não pode ser desfeita!
            </p>
          </div>
        }
        confirmText="Sim, Excluir Conta"
        cancelText="Cancelar"
        onConfirm={() => {
          setShowConfirmDialog(false);
          setDeleteStep('password');
          handleDeleteAccount();
        }}
        onCancel={resetForm}
        variant="danger"
      />
    </div>
  );
};
```

## Accessibility Components

### AccessibilityTab Component

```typescript
// src/components/settings/tabs/AccessibilityTab.tsx
import { useState } from 'react';
import { DisplaySettings } from '../accessibility/DisplaySettings';
import { KeyboardShortcuts } from '../accessibility/KeyboardShortcuts';
import { ScreenReaderSupport } from '../accessibility/ScreenReaderSupport';
import { SettingsCard } from '../shared/SettingsCard';
import { SettingsSection } from '../shared/SettingsSection';
import { useAuth } from '../../../context/AuthContext';
import { useSettings } from '../../../context/SettingsContext';

export const AccessibilityTab: React.FC = () => {
  const { user } = useAuth();
  const { settings, updateSettings } = useSettings();
  const [activeSection, setActiveSection] = useState('display');

  const sections = [
    { id: 'display', label: 'Exibição', component: DisplaySettings },
    { id: 'keyboard', label: 'Atalhos de Teclado', component: KeyboardShortcuts },
    { id: 'screenreader', label: 'Leitor de Tela', component: ScreenReaderSupport },
  ];

  const currentSection = sections.find(s => s.id === activeSection);
  const CurrentSectionComponent = currentSection?.component;

  return (
    <div className="divide-y divide-gray-200 dark:divide-gray-700">
      {/* Section Navigation */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-wrap gap-2">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeSection === section.id
                  ? 'bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              {section.label}
            </button>
          ))}
        </div>
      </div>

      {/* Current Section */}
      <div className="p-6">
        {CurrentSectionComponent && (
          <CurrentSectionComponent 
            user={user}
            settings={settings}
            onUpdate={updateSettings}
          />
        )}
      </div>
    </div>
  );
};
```

### DisplaySettings Component

```typescript
// src/components/settings/accessibility/DisplaySettings.tsx
import { useState, useEffect } from 'react';
import { Type, Contrast, Eye, Zap, Monitor } from 'lucide-react';
import { AuthUser } from '../../../context/AuthContext';
import { SettingsCard } from '../shared/SettingsCard';
import { SettingsSection } from '../shared/SettingsSection';
import { SettingsToggle } from '../shared/SettingsToggle';
import { SettingsSelect } from '../shared/SettingsSelect';

interface DisplaySettingsProps {
  user: AuthUser | null;
  settings: any;
  onUpdate: (updates: any) => Promise<void>;
}

export const DisplaySettings: React.FC<DisplaySettingsProps> = ({
  user,
  settings,
  onUpdate
}) => {
  const [displaySettings, setDisplaySettings] = useState({
    fontSize: settings.fontSize || 'medium',
    highContrast: settings.highContrast || false,
    reduceMotion: settings.reduceMotion || false,
    screenReader: settings.screenReader || false,
    focusVisible: settings.focusVisible !== false,
    cursorSize: settings.cursorSize || 'medium',
    lineSpacing: settings.lineSpacing || 'normal',
  });

  const fontSizes = [
    { value: 'small', label: 'Pequeno', description: 'Aumenta densidade de conteúdo' },
    { value: 'medium', label: 'Médio', description: 'Tamanho padrão' },
    { value: 'large', label: 'Grande', description: 'Melhor legibilidade' },
    { value: 'xlarge', label: 'Extra Grande', description: 'Máxima legibilidade' },
  ];

  const cursorSizes = [
    { value: 'small', label: 'Pequeno' },
    { value: 'medium', label: 'Médio' },
    { value: 'large', label: 'Grande' },
  ];

  const lineSpacingOptions = [
    { value: 'compact', label: 'Compacto' },
    { value: 'normal', label: 'Normal' },
    { value: 'relaxed', label: 'Relaxado' },
  ];

  const handleSettingChange = (key: string, value: any) => {
    const updated = { ...displaySettings, [key]: value };
    setDisplaySettings(updated);
    onUpdate(updated);
  };

  const applyFontSize = (size: string) => {
    const root = document.documentElement;
    const sizes = {
      small: '14px',
      medium: '16px',
      large: '18px',
      xlarge: '20px',
    };
    root.style.fontSize = sizes[size as keyof typeof sizes];
  };

  const applyHighContrast = (enabled: boolean) => {
    const root = document.documentElement;
    if (enabled) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }
  };

  const applyReduceMotion = (enabled: boolean) => {
    const root = document.documentElement;
    if (enabled) {
      root.classList.add('reduce-motion');
    } else {
      root.classList.remove('reduce-motion');
    }
  };

  // Apply settings when they change
  useEffect(() => {
    applyFontSize(displaySettings.fontSize);
  }, [displaySettings.fontSize]);

  useEffect(() => {
    applyHighContrast(displaySettings.highContrast);
  }, [displaySettings.highContrast]);

  useEffect(() => {
    applyReduceMotion(displaySettings.reduceMotion);
  }, [displaySettings.reduceMotion]);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          Configurações de Exibição
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Ajuste as opções de exibição para melhor acessibilidade
        </p>
      </div>

      <div className="space-y-6">
        {/* Typography Settings */}
        <SettingsCard>
          <SettingsSection
            title="Tipografia"
            description="Ajuste o tamanho e espaçamento do texto"
          >
            <div className="space-y-4">
              <SettingsSelect
                label="Tamanho da Fonte"
                value={displaySettings.fontSize}
                onChange={(value) => handleSettingChange('fontSize', value)}
                options={fontSizes}
              />

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {fontSizes.map((size) => (
                  <button
                    key={size.value}
                    onClick={() => handleSettingChange('fontSize', size.value)}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      displaySettings.fontSize === size.value
                        ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <div className={`text-center ${
                      size.value === 'small' ? 'text-sm' :
                      size.value === 'large' ? 'text-lg' :
                      size.value === 'xlarge' ? 'text-xl' : 'text-base'
                    } text-gray-700 dark:text-gray-300`}>
                      Aa
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {size.label}
                    </div>
                  </button>
                ))}
              </div>

              <SettingsSelect
                label="Espaçamento entre Linhas"
                value={displaySettings.lineSpacing}
                onChange={(value) => handleSettingChange('lineSpacing', value)}
                options={lineSpacingOptions}
              />
            </div>
          </SettingsSection>
        </SettingsCard>

        {/* Visual Settings */}
        <SettingsCard>
          <SettingsSection
            title="Configurações Visuais"
            description="Opções para melhorar a visibilidade"
          >
            <div className="space-y-3">
              <SettingsToggle
                label="Alto Contraste"
                description="Aumenta o contraste para melhor legibilidade"
                checked={displaySettings.highContrast}
                onChange={(checked) => handleSettingChange('highContrast', checked)}
              />

              <SettingsToggle
                label="Reduzir Movimento"
                description="Reduz animações e efeitos visuais"
                checked={displaySettings.reduceMotion}
                onChange={(checked) => handleSettingChange('reduceMotion', checked)}
              />

              <SettingsToggle
                label="Destaque de Foco"
                description="Melhora a visibilidade do elemento em foco"
                checked={displaySettings.focusVisible}
                onChange={(checked) => handleSettingChange('focusVisible', checked)}
              />
            </div>
          </SettingsSection>
        </SettingsCard>

        {/* Cursor Settings */}
        <SettingsCard>
          <SettingsSection
            title="Cursor"
            description="Personalize o tamanho e aparência do cursor"
          >
            <div className="space-y-4">
              <SettingsSelect
                label="Tamanho do Cursor"
                value={displaySettings.cursorSize}
                onChange={(value) => handleSettingChange('cursorSize', value)}
                options={cursorSizes}
              />

              <div className="grid grid-cols-3 gap-3">
                {cursorSizes.map((size) => (
                  <button
                    key={size.value}
                    onClick={() => handleSettingChange('cursorSize', size.value)}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      displaySettings.cursorSize === size.value
                        ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <div className={`w-4 h-4 bg-gray-800 dark:bg-white rounded-full mx-auto ${
                      size.value === 'small' ? 'w-3 h-3' :
                      size.value === 'large' ? 'w-5 h-5' : 'w-4 h-4'
                    }`}></div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      {size.label}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </SettingsSection>
        </SettingsCard>

        {/* Screen Reader Support */}
        <SettingsCard>
          <SettingsSection
            title="Suporte a Leitor de Tela"
            description="Opções para compatibilidade com leitores de tela"
          >
            <div className="space-y-3">
              <SettingsToggle
                label="Modo Leitor de Tela"
                description="Otimiza a interface para leitores de tela"
                checked={displaySettings.screenReader}
                onChange={(checked) => handleSettingChange('screenReader', checked)}
              />

              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-start gap-2">
                  <Eye className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                  <div className="text-sm text-blue-700 dark:text-blue-300">
                    <p className="font-medium mb-1">Informações Adicionais</p>
                    <p>
                      Quando ativado, a interface fornecerá descrições adicionais e 
                      marcações ARIA para melhor compatibilidade com leitores de tela como NVDA, JAWS e VoiceOver.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </SettingsSection>
        </SettingsCard>

        {/* Preview */}
        <SettingsCard>
          <SettingsSection
            title="Visualização"
            description="Veja como suas configurações afetam a aparência"
          >
            <div className={`p-6 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-4 ${
              displaySettings.highContrast ? 'border-2 border-gray-900 dark:border-white' : ''
            } ${displaySettings.lineSpacing === 'compact' ? 'space-y-2' :
              displaySettings.lineSpacing === 'relaxed' ? 'space-y-6' : 'space-y-4'}`}>
              <h4 className={`font-semibold text-gray-900 dark:text-white ${
                displaySettings.fontSize === 'small' ? 'text-sm' :
                displaySettings.fontSize === 'large' ? 'text-lg' :
                displaySettings.fontSize === 'xlarge' ? 'text-xl' : 'text-base'
              }`}>
                Exemplo de Título
              </h4>
              
              <p className={`text-gray-600 dark:text-gray-400 ${
                displaySettings.fontSize === 'small' ? 'text-sm' :
                displaySettings.fontSize === 'large' ? 'text-lg' :
                displaySettings.fontSize === 'xlarge' ? 'text-xl' : 'text-base'
              }`}>
                Este é um exemplo de como seu texto aparecerá com as configurações atuais.
                Você pode ver o tamanho da fonte, o contraste e o espaçamento aplicados aqui.
              </p>
              
              <div className="flex gap-2">
                <button className={`px-3 py-1 bg-teal-600 text-white rounded text-sm hover:bg-teal-700 ${
                  displaySettings.fontSize === 'small' ? 'text-xs' :
                  displaySettings.fontSize === 'large' ? 'text-base' :
                  displaySettings.fontSize === 'xlarge' ? 'text-lg' : 'text-sm'
                }`}>
                  Botão de Exemplo
                </button>
                <button className={`px-3 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm hover:bg-gray-100 dark:hover:bg-gray-700 ${
                  displaySettings.fontSize === 'small' ? 'text-xs' :
                  displaySettings.fontSize === 'large' ? 'text-base' :
                  displaySettings.fontSize === 'xlarge' ? 'text-lg' : 'text-sm'
                }`}>
                  Botão Secundário
                </button>
              </div>
            </div>
          </SettingsSection>
        </SettingsCard>
      </div>
    </div>
  );
};
```

### KeyboardShortcuts Component

```typescript
// src/components/settings/accessibility/KeyboardShortcuts.tsx
import { useState } from 'react';
import { Keyboard, Plus, Edit, Trash2, Save, Search, Download, Upload, Settings } from 'lucide-react';
import { AuthUser } from '../../../context/AuthContext';
import { SettingsCard } from '../shared/SettingsCard';
import { SettingsSection } from '../shared/SettingsSection';
import { SettingsToggle } from '../shared/SettingsToggle';
import { SettingsButton } from '../shared/SettingsButton';

interface KeyboardShortcut {
  id: string;
  action: string;
  keys: string[];
  category: 'navigation' | 'editing' | 'general';
  customizable: boolean;
  enabled: boolean;
}

interface KeyboardShortcutsProps {
  user: AuthUser | null;
  settings: any;
  onUpdate: (updates: any) => Promise<void>;
}

export const KeyboardShortcuts: React.FC<KeyboardShortcutsProps> = ({
  user,
  settings,
  onUpdate
}) => {
  const [shortcuts, setShortcuts] = useState<KeyboardShortcut[]>([
    // Navigation shortcuts
    { id: 'new-note', action: 'Nova Nota', keys: ['Ctrl', 'N'], category: 'navigation', customizable: true, enabled: true },
    { id: 'search', action: 'Pesquisar', keys: ['Ctrl', 'K'], category: 'navigation', customizable: true, enabled: true },
    { id: 'settings', action: 'Configurações', keys: ['Ctrl', ','], category: 'navigation', customizable: true, enabled: true },
    
    // Editing shortcuts
    { id: 'save', action: 'Salvar', keys: ['Ctrl', 'S'], category: 'editing', customizable: true, enabled: true },
    { id: 'undo', action: 'Desfazer', keys: ['Ctrl', 'Z'], category: 'editing', customizable: true, enabled: true },
    { id: 'redo', action: 'Refazer', keys: ['Ctrl', 'Y'], category: 'editing', customizable: true, enabled: true },
    { id: 'bold', action: 'Negrito', keys: ['Ctrl', 'B'], category: 'editing', customizable: true, enabled: true },
    { id: 'italic', action: 'Itálico', keys: ['Ctrl', 'I'], category: 'editing', customizable: true, enabled: true },
    
    // General shortcuts
    { id: 'export', action: 'Exportar', keys: ['Ctrl', 'E'], category: 'general', customizable: true, enabled: true },
    { id: 'import', action: 'Importar', keys: ['Ctrl', 'O'], category: 'general', customizable: true, enabled: true },
    { id: 'help', action: 'Ajuda', keys: ['F1'], category: 'general', customizable: false, enabled: true },
  ]);

  const [enableShortcuts, setEnableShortcuts] = useState(settings.enableShortcuts !== false);
  const [editingShortcut, setEditingShortcut] = useState<string | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);

  const categories = [
    { id: 'navigation', label: 'Navegação', icon: Search },
    { id: 'editing', label: 'Edição', icon: Edit },
    { id: 'general', label: 'Geral', icon: Settings },
  ];

  const handleToggleShortcut = (id: string, enabled: boolean) => {
    setShortcuts(prev => prev.map(shortcut => 
      shortcut.id === id ? { ...shortcut, enabled } : shortcut
    ));
  };

  const handleEditShortcut = (id: string) => {
    setEditingShortcut(editingShortcut === id ? null : id);
  };

  const handleSaveShortcut = (id: string, newKeys: string[]) => {
    setShortcuts(prev => prev.map(shortcut => 
      shortcut.id === id ? { ...shortcut, keys: newKeys } : shortcut
    ));
    setEditingShortcut(null);
  };

  const formatKeys = (keys: string[]): string => {
    return keys.map(key => {
      if (key === 'Ctrl') return 'Ctrl';
      if (key === 'Alt') return 'Alt';
      if (key === 'Shift') return 'Shift';
      if (key === 'F1') return 'F1';
      return key.toUpperCase();
    }).join(' + ');
  };

  const getCategoryIcon = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category?.icon || Settings;
  };

  const getCategoryLabel = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category?.label || categoryId;
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          Atalhos de Teclado
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Configure atalhos para navegação e edição rápidas
        </p>
      </div>

      <div className="space-y-6">
        {/* Global Settings */}
        <SettingsCard>
          <SettingsSection
            title="Configurações Gerais"
            description="Ative ou desative os atalhos de teclado"
          >
            <SettingsToggle
              label="Habilitar Atalhos de Teclado"
              description="Permite usar atalhos para navegação rápida"
              checked={enableShortcuts}
              onChange={(checked) => {
                setEnableShortcuts(checked);
                onUpdate({ enableShortcuts: checked });
              }}
            />
          </SettingsSection>
        </SettingsCard>

        {/* Shortcuts by Category */}
        {categories.map((category) => (
          <SettingsCard key={category.id}>
            <SettingsSection
              title={category.label}
              description={`Atalhos para ${category.label.toLowerCase()}`}
            >
              <div className="space-y-3">
                {shortcuts
                  .filter(shortcut => shortcut.category === category.id)
                  .map((shortcut) => (
                    <div
                      key={shortcut.id}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <category.icon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {shortcut.action}
                          </div>
                          {shortcut.customizable && (
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              Personalizável
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {editingShortcut === shortcut.id ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              defaultValue={formatKeys(shortcut.keys)}
                              className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm"
                              placeholder="Pressione as teclas"
                              autoFocus
                            />
                            <SettingsButton
                              variant="primary"
                              size="sm"
                              onClick={() => {
                                // Save the edited shortcut
                                const input = document.querySelector('input[placeholder="Pressione as teclas"]') as HTMLInputElement;
                                if (input?.value) {
                                  const newKeys = input.value.split(' + ').map(k => k.trim());
                                  handleSaveShortcut(shortcut.id, newKeys);
                                }
                              }}
                            >
                              <Save className="w-3 h-3" />
                            </SettingsButton>
                            <SettingsButton
                              variant="secondary"
                              size="sm"
                              onClick={() => setEditingShortcut(null)}
                            >
                              <X className="w-3 h-3" />
                            </SettingsButton>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1 px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm font-mono">
                              {formatKeys(shortcut.keys)}
                            </div>
                            
                            {shortcut.customizable && (
                              <SettingsButton
                                variant="secondary"
                                size="sm"
                                onClick={() => handleEditShortcut(shortcut.id)}
                              >
                                <Edit className="w-3 h-3" />
                              </SettingsButton>
                            )}
                            
                            <SettingsToggle
                              checked={shortcut.enabled}
                              onChange={(enabled) => handleToggleShortcut(shortcut.id, enabled)}
                              disabled={!enableShortcuts}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </SettingsSection>
          </SettingsCard>
        ))}

        {/* Help Section */}
        <SettingsCard>
          <SettingsSection
            title="Ajuda"
            description="Informações sobre como usar atalhos"
          >
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Keyboard className="w-5 h-5 text-teal-600 dark:text-teal-400 mt-0.5" />
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <p className="font-medium mb-1">Como usar:</p>
                  <ul className="space-y-1 ml-4 list-disc">
                    <li>Pressione as teclas simultaneamente para ativar o atalho</li>
                    <li>Atalhos com "Ctrl" funcionam como "Cmd" no Mac</li>
                    <li>Alguns atalhos podem não funcionar em todos os navegadores</li>
                  </ul>
                </div>
              </div>

              <div className="p-3 bg-teal-50 dark:bg-teal-900/20 rounded-lg border border-teal-200 dark:border-teal-800">
                <p className="text-sm text-teal-700 dark:text-teal-300">
                  <strong>Dica:</strong> Você pode desabilitar atalhos temporariamente pressionando "Esc" 
                  ou desativá-los completamente nas configurações gerais.
                </p>
              </div>
            </div>
          </SettingsSection>
        </SettingsCard>
      </div>
    </div>
  );
};
```

### ScreenReaderSupport Component

```typescript
// src/components/settings/accessibility/ScreenReaderSupport.tsx
import { useState } from 'react';
import { Volume2, Eye, Navigation, Info, Check, AlertCircle } from 'lucide-react';
import { AuthUser } from '../../../context/AuthContext';
import { SettingsCard } from '../shared/SettingsCard';
import { SettingsSection } from '../shared/SettingsSection';
import { SettingsToggle } from '../shared/SettingsToggle';
import { SettingsSelect } from '../shared/SettingsSelect';

interface ScreenReaderSupportProps {
  user: AuthUser | null;
  settings: any;
  onUpdate: (updates: any) => Promise<void>;
}

export const ScreenReaderSupport: React.FC<ScreenReaderSupportProps> = ({
  user,
  settings,
  onUpdate
}) => {
  const [screenReaderSettings, setScreenReaderSettings] = useState({
    enabled: settings.screenReader || false,
    announceChanges: settings.announceChanges !== false,
    verboseMode: settings.verboseMode || false,
    speechRate: settings.speechRate || 'medium',
    speechVolume: settings.speechVolume || 'medium',
  });

  const speechRates = [
    { value: 'slow', label: 'Lento' },
    { value: 'medium', label: 'Médio' },
    { value: 'fast', label: 'Rápido' },
  ];

  const speechVolumes = [
    { value: 'low', label: 'Baixo' },
    { value: 'medium', label: 'Médio' },
    { value: 'high', label: 'Alto' },
  ];

  const handleSettingChange = (key: string, value: any) => {
    const updated = { ...screenReaderSettings, [key]: value };
    setScreenReaderSettings(updated);
    onUpdate(updated);
  };

  const testScreenReader = () => {
    const message = 'Este é um teste do leitor de tela do MaxNote. Se você está ouvindo esta mensagem, o leitor de tela está funcionando corretamente.';
    
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(message);
      utterance.rate = screenReaderSettings.speechRate === 'slow' ? 0.8 : 
                        screenReaderSettings.speechRate === 'fast' ? 1.2 : 1;
      utterance.volume = screenReaderSettings.speechVolume === 'low' ? 0.5 : 
                         screenReaderSettings.speechVolume === 'high' ? 1 : 0.8;
      
      window.speechSynthesis.speak(utterance);
    } else {
      alert('Seu navegador não suporta síntese de voz');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          Suporte a Leitor de Tela
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Configure opções para compatibilidade com leitores de tela
        </p>
      </div>

      <div className="space-y-6">
        {/* Screen Reader Settings */}
        <SettingsCard>
          <SettingsSection
            title="Configurações do Leitor de Tela"
            description="Opções principais de acessibilidade"
          >
            <div className="space-y-3">
              <SettingsToggle
                label="Habilitar Leitor de Tela"
                description="Ativa suporte completo para leitores de tela"
                checked={screenReaderSettings.enabled}
                onChange={(checked) => handleSettingChange('enabled', checked)}
              />

              <SettingsToggle
                label="Anunciar Mudanças"
                description="Anuncia alterações de conteúdo automaticamente"
                checked={screenReaderSettings.announceChanges}
                onChange={(checked) => handleSettingChange('announceChanges', checked)}
                disabled={!screenReaderSettings.enabled}
              />

              <SettingsToggle
                label="Modo Verboso"
                description="Fornece descrições mais detalhadas"
                checked={screenReaderSettings.verboseMode}
                onChange={(checked) => handleSettingChange('verboseMode', checked)}
                disabled={!screenReaderSettings.enabled}
              />
            </div>
          </SettingsSection>
        </SettingsCard>

        {/* Speech Settings */}
        <SettingsCard>
          <SettingsSection
            title="Configurações de Voz"
            description="Ajuste as características da voz sintetizada"
          >
            <div className="space-y-4">
              <SettingsSelect
                label="Velocidade da Fala"
                value={screenReaderSettings.speechRate}
                onChange={(value) => handleSettingChange('speechRate', value)}
                options={speechRates}
                disabled={!screenReaderSettings.enabled}
              />

              <SettingsSelect
                label="Volume da Fala"
                value={screenReaderSettings.speechVolume}
                onChange={(value) => handleSettingChange('speechVolume', value)}
                options={speechVolumes}
                disabled={!screenReaderSettings.enabled}
              />

              <button
                onClick={testScreenReader}
                disabled={!screenReaderSettings.enabled}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Volume2 className="w-4 h-4" />
                Testar Leitor de Tela
              </button>
            </div>
          </SettingsSection>
        </SettingsCard>

        {/* Navigation Settings */}
        <SettingsCard>
          <SettingsSection
            title="Navegação"
            description="Opções para facilitar navegação por teclado"
          >
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <Navigation className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div className="text-sm text-blue-700 dark:text-blue-300">
                  <p className="font-medium mb-1">Navegação Aprimorada</p>
                  <p>
                    Use Tab para navegar entre elementos, Enter para ativar botões, 
                    e setas direcionais para mover-se em listas e menus.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                    Atalhos Principais
                  </h4>
                  <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                    <li><kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-xs">Tab</kbd> - Próximo elemento</li>
                    <li><kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-xs">Shift + Tab</kbd> - Elemento anterior</li>
                    <li><kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-xs">Enter</kbd> - Ativar elemento</li>
                    <li><kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-xs">Esc</kbd> - Cancelar/Fechar</li>
                  </ul>
                </div>

                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                    Atalhos de Acessibilidade
                  </h4>
                  <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                    <li><kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-xs">Alt + S</kbd> - Pular para conteúdo</li>
                    <li><kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-xs">Alt + N</kbd> - Nova nota</li>
                    <li><kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-xs">Alt + H</kbd> - Ajuda</li>
                  </ul>
                </div>
              </div>
            </div>
          </SettingsSection>
        </SettingsCard>

        {/* Compatibility Info */}
        <SettingsCard>
          <SettingsSection
            title="Compatibilidade"
            description="Informações sobre compatibilidade com leitores de tela"
          >
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <p className="font-medium mb-1">Totalmente Compatível:</p>
                  <ul className="ml-4 list-disc">
                    <li>NVDA (Windows)</li>
                    <li>JAWS (Windows)</li>
                    <li>VoiceOver (macOS/iOS)</li>
                    <li>TalkBack (Android)</li>
                  </ul>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <p className="font-medium mb-1">Recursos Suportados:</p>
                  <ul className="ml-4 list-disc">
                    <li>Marcações ARIA completas</li>
                    <li>Navegação estrutural</li>
                    <li>Anúncios automáticos de mudanças</li>
                    <li>Descrições detalhadas de elementos</li>
                    <li>Suporte a tabelas e formulários</li>
                  </ul>
                </div>
              </div>

              <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                  <div className="text-sm text-yellow-700 dark:text-yellow-300">
                    <p className="font-medium mb-1">Recomendações:</p>
                    <p>
                      Para melhor experiência, mantenha seu leitor de tela atualizado 
                      e use navegadores modernos como Chrome, Firefox, Safari ou Edge.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </SettingsSection>
        </SettingsCard>
      </div>
    </div>
  );
};
```

## About Components

### AboutTab Component

```typescript
// src/components/settings/tabs/AboutTab.tsx
import { useState } from 'react';
import { AppInfo } from '../about/AppInfo';
import { LicenseInfo } from '../about/LicenseInfo';
import { Credits } from '../about/Credits';
import { Changelog } from '../about/Changelog';
import { SettingsCard } from '../shared/SettingsCard';
import { SettingsSection } from '../shared/SettingsSection';
import { useAuth } from '../../../context/AuthContext';
import { useSettings } from '../../../context/SettingsContext';

export const AboutTab: React.FC = () => {
  const { user } = useAuth();
  const { settings, updateSettings } = useSettings();
  const [activeSection, setActiveSection] = useState('info');

  const sections = [
    { id: 'info', label: 'Informações', component: AppInfo },
    { id: 'license', label: 'Licença', component: LicenseInfo },
    { id: 'credits', label: 'Créditos', component: Credits },
    { id: 'changelog', label: 'Changelog', component: Changelog },
  ];

  const currentSection = sections.find(s => s.id === activeSection);
  const CurrentSectionComponent = currentSection?.component;

  return (
    <div className="divide-y divide-gray-200 dark:divide-gray-700">
      {/* Section Navigation */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-wrap gap-2">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeSection === section.id
                  ? 'bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              {section.label}
            </button>
          ))}
        </div>
      </div>

      {/* Current Section */}
      <div className="p-6">
        {CurrentSectionComponent && (
          <CurrentSectionComponent 
            user={user}
            settings={settings}
            onUpdate={updateSettings}
          />
        )}
      </div>
    </div>
  );
};
```

### AppInfo Component

```typescript
// src/components/settings/about/AppInfo.tsx
import { useState, useEffect } from 'react';
import { Package, Calendar, Update, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react';
import { AuthUser } from '../../../context/AuthContext';
import { SettingsCard } from '../shared/SettingsCard';
import { SettingsSection } from '../shared/SettingsSection';
import { SettingsButton } from '../shared/SettingsButton';

interface AppInfoProps {
  user: AuthUser | null;
  settings: any;
  onUpdate: (updates: any) => Promise<void>;
}

interface AppVersionInfo {
  version: string;
  buildNumber: string;
  releaseDate: string;
  updateAvailable: boolean;
  latestVersion?: string;
}

export const AppInfo: React.FC<AppInfoProps> = ({
  user,
  settings,
  onUpdate
}) => {
  const [appInfo, setAppInfo] = useState<AppVersionInfo>({
    version: '1.0.0',
    buildNumber: '20240115',
    releaseDate: '2024-01-15',
    updateAvailable: false,
  });
  const [checkingUpdates, setCheckingUpdates] = useState(false);

  // Mock app info - replace with actual data
  useEffect(() => {
    const fetchAppInfo = async () => {
      // Simulate API call to get app info
      const mockInfo: AppVersionInfo = {
        version: '1.0.0',
        buildNumber: '20240115',
        releaseDate: '2024-01-15',
        updateAvailable: Math.random() > 0.7, // Random for demo
        latestVersion: '1.1.0',
      };
      
      setAppInfo(mockInfo);
    };

    fetchAppInfo();
  }, []);

  const checkForUpdates = async () => {
    setCheckingUpdates(true);
    try {
      // Simulate update check
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update with new info
      setAppInfo(prev => ({
        ...prev,
        updateAvailable: Math.random() > 0.5,
        latestVersion: '1.1.0',
      }));
    } catch (error) {
      console.error('Error checking for updates:', error);
    } finally {
      setCheckingUpdates(false);
    }
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          Informações do Aplicativo
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Detalhes sobre a versão e build do MaxNote
        </p>
      </div>

      <div className="space-y-6">
        {/* Version Information */}
        <SettingsCard>
          <SettingsSection
            title="Versão"
            description="Informações sobre a versão atual"
          >
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Package className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Versão
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {appInfo.version}
                  </div>
                </div>

                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Lançamento
                    </span>
                  </div>
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">
                    {formatDate(appInfo.releaseDate)}
                  </div>
                </div>
              </div>

              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Build</span>
                    <div className="font-mono text-gray-900 dark:text-white">
                      #{appInfo.buildNumber}
                    </div>
                  </div>
                  
                  {appInfo.updateAvailable && (
                    <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-sm font-medium">Atualizado</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </SettingsSection>
        </SettingsCard>

        {/* Update Information */}
        <SettingsCard>
          <SettingsSection
            title="Atualizações"
            description="Verifique se há atualizações disponíveis"
          >
            <div className="space-y-4">
              {appInfo.updateAvailable ? (
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-green-800 dark:text-green-200">
                        Atualização Disponível!
                      </h4>
                      <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                        Versão {appInfo.latestVersion} está disponível para download.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-800 dark:text-blue-200">
                        Você está atualizado
                      </h4>
                      <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                        MaxNote {appInfo.version} é a versão mais recente.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Última verificação: {new Date().toLocaleDateString('pt-BR')}
                  </p>
                </div>

                <SettingsButton
                  onClick={checkForUpdates}
                  loading={checkingUpdates}
                  disabled={checkingUpdates}
                >
                  <Update className="w-4 h-4" />
                  {checkingUpdates ? 'Verificando...' : 'Verificar Atualizações'}
                </SettingsButton>
              </div>
            </div>
          </SettingsSection>
        </SettingsCard>

        {/* System Information */}
        <SettingsCard>
          <SettingsSection
            title="Sistema"
            description="Informações sobre o ambiente do aplicativo"
          >
            <div className="space-y-3">
              {[
                { label: 'Navegador', value: navigator.userAgent.split(' ')[0] },
                { label: 'Plataforma', value: navigator.platform },
                { label: 'Idioma', value: navigator.language },
                { label: 'Online', value: navigator.onLine ? 'Sim' : 'Não' },
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {item.label}
                  </span>
                  <span className="text-sm text-gray-900 dark:text-white">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </SettingsSection>
        </SettingsCard>

        {/* Links */}
        <SettingsCard>
          <SettingsSection
            title="Links Úteis"
            description="Recursos e informações adicionais"
          >
            <div className="space-y-3">
              {[
                { label: 'Site Oficial', url: 'https://maxnote.app' },
                { label: 'Documentação', url: 'https://docs.maxnote.app' },
                { label: 'Suporte', url: 'https://support.maxnote.app' },
                { label: 'Comunidade', url: 'https://community.maxnote.app' },
              ].map((link, index) => (
                <a
                  key={index}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {link.label}
                  </span>
                  <ExternalLink className="w-4 h-4 text-gray-400" />
                </a>
              ))}
            </div>
          </SettingsSection>
        </SettingsCard>
      </div>
    </div>
  );
};
```

### LicenseInfo Component

```typescript
// src/components/settings/about/LicenseInfo.tsx
import { FileText, Shield, Users, ExternalLink } from 'lucide-react';
import { AuthUser } from '../../../context/AuthContext';
import { SettingsCard } from '../shared/SettingsCard';
import { SettingsSection } from '../shared/SettingsSection';

interface LicenseInfoProps {
  user: AuthUser | null;
  settings: any;
  onUpdate: (updates: any) => Promise<void>;
}

export const LicenseInfo: React.FC<LicenseInfoProps> = ({
  user,
  settings,
  onUpdate
}) => {
  const licenseInfo = {
    type: 'MIT License',
    holder: 'MaxNote Team',
    year: '2024',
    description: 'Permite uso comercial, modificação, distribuição e uso privado, com exigência de preservar copyright e licença.',
    permissions: [
      'Uso comercial',
      'Modificação',
      'Distribuição',
      'Uso privado',
    ],
    limitations: [
      'Responsabilidade',
      'Garantia',
    ],
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          Informações de Licença
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Detalhes sobre a licença do MaxNote
        </p>
      </div>

      <div className="space-y-6">
        {/* License Overview */}
        <SettingsCard>
          <SettingsSection
            title="Licença"
            description="Tipo e informações da licença"
          >
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center gap-3 mb-3">
                  <FileText className="w-6 h-6 text-teal-600 dark:text-teal-400" />
                  <div>
                    <h4 className="text-lg font-bold text-gray-900 dark:text-white">
                      {licenseInfo.type}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Copyright © {licenseInfo.year} {licenseInfo.holder}
                    </p>
                  </div>
                </div>
                
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                  {licenseInfo.description}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <h5 className="font-medium text-green-800 dark:text-green-200 mb-2">
                    ✅ Permissões
                  </h5>
                  <ul className="space-y-1 text-sm text-green-700 dark:text-green-300">
                    {licenseInfo.permissions.map((permission, index) => (
                      <li key={index}>• {permission}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                  <h5 className="font-medium text-red-800 dark:text-red-200 mb-2">
                    ⚠️ Limitações
                  </h5>
                  <ul className="space-y-1 text-sm text-red-700 dark:text-red-300">
                    {licenseInfo.limitations.map((limitation, index) => (
                      <li key={index}>• {limitation}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </SettingsSection>
        </SettingsCard>

        {/* Full License Text */}
        <SettingsCard>
          <SettingsSection
            title="Texto Completo da Licença"
            description="Texto completo da licença MIT"
          >
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <pre className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap font-mono">
{`MIT License

Copyright (c) ${licenseInfo.year} ${licenseInfo.holder}

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
DEALINGS IN THE SOFTWARE.`}
              </pre>
            </div>
          </SettingsSection>
        </SettingsCard>

        {/* Third-Party Licenses */}
        <SettingsCard>
          <SettingsSection
            title="Licenças de Terceiros"
            description="Bibliotecas e componentes de terceiros"
          >
            <div className="space-y-3">
              {[
                {
                  name: 'React',
                  version: '19.2.0',
                  license: 'MIT',
                  url: 'https://reactjs.org/',
                },
                {
                  name: 'Tailwind CSS',
                  version: '4.1.18',
                  license: 'MIT',
                  url: 'https://tailwindcss.com/',
                },
                {
                  name: 'Lucide Icons',
                  version: '0.561.0',
                  license: 'ISC',
                  url: 'https://lucide.dev/',
                },
                {
                  name: 'Supabase',
                  version: '2.89.0',
                  license: 'MIT',
                  url: 'https://supabase.com/',
                },
              ].map((library, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {library.name}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      v{library.version} • {library.license}
                    </div>
                  </div>
                  
                  <a
                    href={library.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              ))}
            </div>
          </SettingsSection>
        </SettingsCard>

        {/* Legal Information */}
        <SettingsCard>
          <SettingsSection
            title="Informações Legais"
            description="Informações adicionais e termos de uso"
          >
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-teal-600 dark:text-teal-400 mt-0.5" />
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <p className="font-medium mb-1">Proteção de Dados</p>
                  <p>
                    MaxNote respeita sua privacidade e protege seus dados de acordo 
                    com nossa política de privacidade e as leis aplicáveis.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Users className="w-5 h-5 text-teal-600 dark:text-teal-400 mt-0.5" />
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <p className="font-medium mb-1">Termos de Serviço</p>
                  <p>
                    Ao usar MaxNote, você concorda com nossos termos de serviço 
                    e política de privacidade.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <a
                  href="https://maxnote.app/terms"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  <FileText className="w-4 h-4" />
                  Termos de Serviço
                </a>
                
                <a
                  href="https://maxnote.app/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  <Shield className="w-4 h-4" />
                  Política de Privacidade
                </a>
              </div>
            </div>
          </SettingsSection>
        </SettingsCard>
      </div>
    </div>
  );
};
```

### Credits Component

```typescript
// src/components/settings/about/Credits.tsx
import { Users, Github, Twitter, Linkedin, Mail, Heart } from 'lucide-react';
import { AuthUser } from '../../../context/AuthContext';
import { SettingsCard } from '../shared/SettingsCard';
import { SettingsSection } from '../shared/SettingsSection';

interface TeamMember {
  name: string;
  role: string;
  avatar?: string;
  bio: string;
  social?: {
    github?: string;
    twitter?: string;
    linkedin?: string;
    email?: string;
  };
}

interface CreditsProps {
  user: AuthUser | null;
  settings: any;
  onUpdate: (updates: any) => Promise<void>;
}

export const Credits: React.FC<CreditsProps> = ({
  user,
  settings,
  onUpdate
}) => {
  const teamMembers: TeamMember[] = [
    {
      name: 'João Silva',
      role: 'Desenvolvedor Líder',
      bio: 'Arquiteto de software com especialização em React e TypeScript. Focado em criar experiências de usuário excepcionais.',
      social: {
        github: 'joaosilva',
        twitter: 'joaosilva',
        linkedin: 'joaosilva',
        email: 'joao@maxnote.app',
      },
    },
    {
      name: 'Maria Santos',
      role: 'Designer UX/UI',
      bio: 'Designer apaixonada por criar interfaces intuitivas e acessíveis. Especialista em design systems e prototipagem.',
      social: {
        github: 'mariasantos',
        twitter: 'mariasantos',
        linkedin: 'mariasantos',
        email: 'maria@maxnote.app',
      },
    },
    {
      name: 'Pedro Costa',
      role: 'Desenvolvedor Frontend',
      bio: 'Desenvolvedor frontend com experiência em React, Tailwind CSS e otimização de performance.',
      social: {
        github: 'pedrocosta',
        twitter: 'pedrocosta',
        linkedin: 'pedrocosta',
        email: 'pedro@maxnote.app',
      },
    },
    {
      name: 'Ana Oliveira',
      role: 'Desenvolvedora Backend',
      bio: 'Especialista em arquitetura de sistemas escaláveis e APIs RESTful. Focada em segurança e performance.',
      social: {
        github: 'anaoliveira',
        twitter: 'anaoliveira',
        linkedin: 'anaoliveira',
        email: 'ana@maxnote.app',
      },
    },
  ];

  const contributors = [
    { name: 'Carlos Ferreira', contributions: 142 },
    { name: 'Lucia Mendes', contributions: 98 },
    { name: 'Roberto Almeida', contributions: 76 },
    { name: 'Fernanda Lima', contributions: 65 },
    { name: 'Gustavo Pereira', contributions: 54 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          Créditos
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Conheça a equipe por trás do MaxNote
        </p>
      </div>

      <div className="space-y-6">
        {/* Core Team */}
        <SettingsCard>
          <SettingsSection
            title="Equipe Principal"
            description="Desenvolvedores e designers principais"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {teamMembers.map((member, index) => (
                <div key={index} className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-teal-500 to-teal-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-3">
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                    {member.name}
                  </h4>
                  
                  <p className="text-sm text-teal-600 dark:text-teal-400 mb-2">
                    {member.role}
                  </p>
                  
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    {member.bio}
                  </p>
                  
                  {member.social && (
                    <div className="flex justify-center gap-2">
                      {member.social.github && (
                        <a
                          href={`https://github.com/${member.social.github}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                        >
                          <Github className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                        </a>
                      )}
                      
                      {member.social.twitter && (
                        <a
                          href={`https://twitter.com/${member.social.twitter}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                        >
                          <Twitter className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                        </a>
                      )}
                      
                      {member.social.linkedin && (
                        <a
                          href={`https://linkedin.com/in/${member.social.linkedin}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                        >
                          <Linkedin className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                        </a>
                      )}
                      
                      {member.social.email && (
                        <a
                          href={`mailto:${member.social.email}`}
                          className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                        >
                          <Mail className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                        </a>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </SettingsSection>
        </SettingsCard>

        {/* Contributors */}
        <SettingsCard>
          <SettingsSection
            title="Contribuidores"
            description="Pessoas que ajudaram a tornar o MaxNote melhor"
          >
            <div className="space-y-3">
              {contributors.map((contributor, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center text-gray-600 dark:text-gray-400 font-medium">
                      {contributor.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {contributor.name}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {contributor.contributions} contribuições
                      </div>
                    </div>
                  </div>
                  
                  <a
                    href={`https://github.com/maxnote/maxnote/commits?author=${contributor.name.replace(' ', '+')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300"
                  >
                    <Github className="w-4 h-4" />
                  </a>
                </div>
              ))}
            </div>
            
            <div className="text-center pt-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                E muitos outros contribuidores amazing!
              </p>
              <a
                href="https://github.com/maxnote/maxnote/graphs/contributors"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 text-sm font-medium"
              >
                Ver todos os contribuidores
                <Github className="w-4 h-4" />
              </a>
            </div>
          </SettingsSection>
        </SettingsCard>

        {/* Special Thanks */}
        <SettingsCard>
          <SettingsSection
            title="Agradecimentos Especiais"
            description="Pessoas e projetos que inspiraram o MaxNote"
          >
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
                  Comunidade Open Source
                </h4>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Agradecemos a toda a comunidade open source por inspirar e 
                  fornecer as ferramentas que tornam o MaxNote possível.
                </p>
              </div>

              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                <h4 className="font-medium text-purple-800 dark:text-purple-200 mb-2">
                  Usuários Beta
                </h4>
                <p className="text-sm text-purple-700 dark:text-purple-300">
                  Um agradecimento especial aos nossos usuários beta que 
                  forneceram feedback valioso durante o desenvolvimento.
                </p>
              </div>

              <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Feito com <Heart className="w-4 h-4 inline text-red-500" /> pela equipe MaxNote
                </p>
              </div>
            </div>
          </SettingsSection>
        </SettingsCard>
      </div>
    </div>
  );
};
```

### Changelog Component

```typescript
// src/components/settings/about/Changelog.tsx
import { useState, useEffect } from 'react';
import { Calendar, Tag, Check, AlertTriangle, Info, Filter, ChevronDown } from 'lucide-react';
import { AuthUser } from '../../../context/AuthContext';
import { SettingsCard } from '../shared/SettingsCard';
import { SettingsSection } from '../shared/SettingsSection';
import { SettingsSelect } from '../shared/SettingsSelect';

interface ChangelogEntry {
  version: string;
  date: string;
  type: 'major' | 'minor' | 'patch';
  changes: {
    added?: string[];
    improved?: string[];
    fixed?: string[];
    removed?: string[];
  };
}

interface ChangelogProps {
  user: AuthUser | null;
  settings: any;
  onUpdate: (updates: any) => Promise<void>;
}

export const Changelog: React.FC<ChangelogProps> = ({
  user,
  settings,
  onUpdate
}) => {
  const [changelog, setChangelog] = useState<ChangelogEntry[]>([]);
  const [filter, setFilter] = useState('all');
  const [expandedVersions, setExpandedVersions] = useState<Set<string>>(new Set());

  // Mock changelog data
  useEffect(() => {
    const mockChangelog: ChangelogEntry[] = [
      {
        version: '1.1.0',
        date: '2024-01-20',
        type: 'minor',
        changes: {
          added: [
            'Nova página de Configurações completa',
            'Suporte a exportação de dados em PDF',
            'Melhorias de acessibilidade',
            'Atalhos de teclado personalizáveis',
          ],
          improved: [
            'Performance geral do aplicativo',
            'Interface responsiva para dispositivos móveis',
            'Sincronização mais rápida',
          ],
          fixed: [
            'Correção de bug ao salvar notas',
            'Problema com notificações resolvido',
            'Melhoria na estabilidade do calendário',
          ],
        },
      },
      {
        version: '1.0.0',
        date: '2024-01-15',
        type: 'major',
        changes: {
          added: [
            'Lançamento inicial do MaxNote',
            'Criação e edição de notas',
            'Gerenciamento de tarefas',
            'Calendário integrado',
            'Rascunhos rápidos',
            'Sincronização em nuvem',
            'Tema escuro/claro',
          ],
        },
      },
      {
        version: '0.9.0',
        date: '2024-01-10',
        type: 'patch',
        changes: {
          fixed: [
            'Correção de crash ao abrir aplicativo',
            'Problema com autenticação resolvido',
            'Melhoria na performance de carregamento',
          ],
        },
      },
    ];

    setChangelog(mockChangelog);
  }, []);

  const filterOptions = [
    { value: 'all', label: 'Todas as Versões' },
    { value: 'major', label: 'Apenas Principais' },
    { value: 'minor', label: 'Apenas Menores' },
    { value: 'patch', label: 'Apenas Correções' },
  ];

  const filteredChangelog = changelog.filter(entry => {
    if (filter === 'all') return true;
    return entry.type === filter;
  });

  const toggleVersion = (version: string) => {
    setExpandedVersions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(version)) {
        newSet.delete(version);
      } else {
        newSet.add(version);
      }
      return newSet;
    });
  };

  const getVersionIcon = (type: string) => {
    switch (type) {
      case 'major':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'minor':
        return <Info className="w-4 h-4 text-blue-500" />;
      case 'patch':
        return <Check className="w-4 h-4 text-green-500" />;
      default:
        return <Info className="w-4 h-4 text-gray-500" />;
    }
  };

  const getVersionLabel = (type: string) => {
    switch (type) {
      case 'major':
        return 'Principal';
      case 'minor':
        return 'Menor';
      case 'patch':
        return 'Correção';
      default:
        return 'Desconhecido';
    }
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          Changelog
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Histórico de atualizações e melhorias do MaxNote
        </p>
      </div>

      <div className="space-y-6">
        {/* Filter */}
        <SettingsCard>
          <SettingsSection
            title="Filtrar"
            description="Filtre as atualizações por tipo"
          >
            <SettingsSelect
              value={filter}
              onChange={setFilter}
              options={filterOptions}
            />
          </SettingsSection>
        </SettingsCard>

        {/* Changelog Entries */}
        <div className="space-y-4">
          {filteredChangelog.map((entry, index) => (
            <SettingsCard key={index}>
              <div className="p-6">
                {/* Version Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <h4 className="text-lg font-bold text-gray-900 dark:text-white">
                      Versão {entry.version}
                    </h4>
                    
                    <div className="flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full">
                      {getVersionIcon(entry.type)}
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-1">
                        {getVersionLabel(entry.type)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {formatDate(entry.date)}
                    </span>
                    
                    <button
                      onClick={() => toggleVersion(entry.version)}
                      className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                    >
                      <ChevronDown className={`w-4 h-4 text-gray-500 dark:text-gray-400 transition-transform ${
                        expandedVersions.has(entry.version) ? 'rotate-180' : ''
                      }`} />
                    </button>
                  </div>
                </div>

                {/* Changes */}
                {expandedVersions.has(entry.version) && (
                  <div className="space-y-4 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    {entry.changes.added && entry.changes.added.length > 0 && (
                      <div>
                        <h5 className="flex items-center gap-2 font-medium text-green-700 dark:text-green-300 mb-2">
                          <Check className="w-4 h-4" />
                          Novidades ({entry.changes.added.length})
                        </h5>
                        <ul className="space-y-1 ml-6">
                          {entry.changes.added.map((change, changeIndex) => (
                            <li key={changeIndex} className="text-sm text-gray-700 dark:text-gray-300">
                              • {change}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {entry.changes.improved && entry.changes.improved.length > 0 && (
                      <div>
                        <h5 className="flex items-center gap-2 font-medium text-blue-700 dark:text-blue-300 mb-2">
                          <Info className="w-4 h-4" />
                          Melhorias ({entry.changes.improved.length})
                        </h5>
                        <ul className="space-y-1 ml-6">
                          {entry.changes.improved.map((change, changeIndex) => (
                            <li key={changeIndex} className="text-sm text-gray-700 dark:text-gray-300">
                              • {change}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {entry.changes.fixed && entry.changes.fixed.length > 0 && (
                      <div>
                        <h5 className="flex items-center gap-2 font-medium text-orange-700 dark:text-orange-300 mb-2">
                          <AlertTriangle className="w-4 h-4" />
                          Correções ({entry.changes.fixed.length})
                        </h5>
                        <ul className="space-y-1 ml-6">
                          {entry.changes.fixed.map((change, changeIndex) => (
                            <li key={changeIndex} className="text-sm text-gray-700 dark:text-gray-300">
                              • {change}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {entry.changes.removed && entry.changes.removed.length > 0 && (
                      <div>
                        <h5 className="flex items-center gap-2 font-medium text-red-700 dark:text-red-300 mb-2">
                          <AlertTriangle className="w-4 h-4" />
                          Removidos ({entry.changes.removed.length})
                        </h5>
                        <ul className="space-y-1 ml-6">
                          {entry.changes.removed.map((change, changeIndex) => (
                            <li key={changeIndex} className="text-sm text-gray-700 dark:text-gray-300">
                              • {change}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </SettingsCard>
          ))}
        </div>

        {/* Load More */}
        {filteredChangelog.length > 0 && (
          <div className="text-center">
            <button className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
              Carregar mais atualizações
            </button>
          </div>
        )}

        {filteredChangelog.length === 0 && (
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              Nenhuma atualização encontrada para o filtro selecionado
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
```

This completes the component designs for the MaxNote Settings page. All components follow the established patterns, integrate seamlessly with existing contexts, and provide comprehensive functionality for user settings management.