import { useState, useCallback } from 'react';
import { Eye, Minus, Plus, Sun, Moon, Monitor, Zap } from 'lucide-react';
import { useSettings } from '../../../context/SettingsContext';
import { SettingsCard } from '../shared/SettingsCard';
import { SettingsButton } from '../shared/SettingsButton';
import { SettingsToggle } from '../shared/SettingsToggle';
import { SettingsSelect } from '../shared/SettingsSelect';
import { cn } from '../../../lib/utils';

export const DisplaySettings: React.FC = () => {
    const { settings, updateSettings } = useSettings();
    const [isPreviewMode, setIsPreviewMode] = useState(false);

    const fontSizeOptions = [
        { value: 'small', label: 'Pequeno', description: 'Texto menor para mais conteúdo na tela' },
        { value: 'medium', label: 'Médio', description: 'Tamanho padrão de texto' },
        { value: 'large', label: 'Grande', description: 'Texto maior para melhor legibilidade' },
        { value: 'extralarge', label: 'Extra Grande', description: 'Texto muito grande para acessibilidade máxima' }
    ];

    const handleFontSizeChange = useCallback((size: string) => {
        updateSettings({ fontSize: size as any });
    }, [updateSettings]);

    const handleHighContrastToggle = useCallback((enabled: boolean) => {
        updateSettings({ highContrast: enabled });
    }, [updateSettings]);

    const handleReduceMotionToggle = useCallback((enabled: boolean) => {
        updateSettings({ reduceMotion: enabled });
    }, [updateSettings]);

    const handleScreenReaderToggle = useCallback((enabled: boolean) => {
        updateSettings({ screenReader: enabled });
    }, [updateSettings]);

    const getFontSizeClass = () => {
        if (isPreviewMode) {
            switch (settings.fontSize) {
                case 'small':
                    return 'text-sm';
                case 'large':
                    return 'text-lg';
                default:
                    return 'text-base';
            }
        }
        return '';
    };

    const getContrastClass = () => {
        if (isPreviewMode && settings.highContrast) {
            return 'bg-black text-white';
        }
        return '';
    };

    const getMotionClass = () => {
        if (isPreviewMode && settings.reduceMotion) {
            return 'transition-none';
        }
        return '';
    };

    return (
        <div className="space-y-6">
            {/* Font Size Settings */}
            <SettingsCard
                title="Tamanho da Fonte"
                description="Ajuste o tamanho do texto para melhor legibilidade"
            >
                <div className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {fontSizeOptions.map((option) => (
                            <button
                                key={option.value}
                                onClick={() => handleFontSizeChange(option.value)}
                                className={cn(
                                    "p-4 border-2 rounded-lg text-left transition-all",
                                    settings.fontSize === option.value
                                        ? "border-teal-500 bg-teal-50 dark:bg-teal-900/20"
                                        : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                                )}
                            >
                                <div className="flex items-center justify-center mb-2">
                                    {option.value === 'small' && <Minus className="w-4 h-4" />}
                                    {option.value === 'medium' && <span className="text-base">Aa</span>}
                                    {option.value === 'large' && <span className="text-lg">Aa</span>}
                                    {option.value === 'extralarge' && <Plus className="w-4 h-4" />}
                                </div>
                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                    {option.label}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    {option.description}
                                </div>
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Tamanho atual
                        </span>
                        <span className="text-sm font-bold text-gray-900 dark:text-white">
                            {fontSizeOptions.find(opt => opt.value === settings.fontSize)?.label}
                        </span>
                    </div>
                </div>
            </SettingsCard>

            {/* Contrast Settings */}
            <SettingsCard
                title="Contraste e Cores"
                description="Melhore a visibilidade com ajustes de contraste"
            >
                <div className="space-y-4">
                    <SettingsToggle
                        label="Alto Contraste"
                        description="Aumenta o contraste entre texto e fundo para melhor legibilidade"
                        checked={settings.highContrast}
                        onChange={handleHighContrastToggle}
                    />

                    <SettingsToggle
                        label="Modo Noturno"
                        description="Reduz a luz azul para melhor conforto visual"
                        checked={settings.theme === 'dark'}
                        onChange={(checked) => updateSettings({ theme: checked ? 'dark' : 'light' })}
                    />

                    <SettingsToggle
                        label="Tema Automático"
                        description="Ajusta automaticamente o tema com base nas preferências do sistema"
                        checked={settings.theme === 'system'}
                        onChange={(checked) => updateSettings({ theme: checked ? 'system' : 'light' })}
                    />
                </div>
            </SettingsCard>

            {/* Motion Settings */}
            <SettingsCard
                title="Animações e Movimento"
                description="Controle animações e efeitos visuais"
            >
                <div className="space-y-4">
                    <SettingsToggle
                        label="Reduzir Movimento"
                        description="Reduz animações e transições para evitar desconforto"
                        checked={settings.reduceMotion}
                        onChange={handleReduceMotionToggle}
                    />

                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                            Efeitos Reduzidos
                        </h4>
                        <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                            <li className="flex items-center gap-2">
                                <div className={cn(
                                    "w-2 h-2 rounded-full",
                                    settings.reduceMotion ? "bg-teal-500" : "bg-gray-300 dark:bg-gray-600"
                                )} />
                                <span>Transições suaves entre páginas</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <div className={cn(
                                    "w-2 h-2 rounded-full",
                                    settings.reduceMotion ? "bg-teal-500" : "bg-gray-300 dark:bg-gray-600"
                                )} />
                                <span>Animações de carregamento</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <div className={cn(
                                    "w-2 h-2 rounded-full",
                                    settings.reduceMotion ? "bg-teal-500" : "bg-gray-300 dark:bg-gray-600"
                                )} />
                                <span>Efeitos de hover e focus</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </SettingsCard>

            {/* Screen Reader Settings */}
            <SettingsCard
                title="Suporte a Leitores de Tela"
                description="Otimizações para tecnologias assistivas"
            >
                <div className="space-y-4">
                    <SettingsToggle
                        label="Modo Leitor de Tela"
                        description="Otimiza a interface para leitores de tela"
                        checked={settings.screenReader}
                        onChange={handleScreenReaderToggle}
                    />

                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                            Recursos Ativados
                        </h4>
                        <ul className="space-y-2 text-sm text-blue-700 dark:text-blue-300">
                            <li className="flex items-center gap-2">
                                <Zap className="w-4 h-4" />
                                <span>Descrições ARIA em todos os elementos interativos</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <Zap className="w-4 h-4" />
                                <span>Navegação por teclado completa</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <Zap className="w-4 h-4" />
                                <span>Anúncios de mudanças de estado</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </SettingsCard>

            {/* Preview Section */}
            <SettingsCard
                title="Visualização Prévia"
                description="Veja como suas configurações afetam a aparência"
            >
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Modo de visualização
                        </span>
                        <SettingsButton
                            variant={isPreviewMode ? "primary" : "secondary"}
                            onClick={() => setIsPreviewMode(!isPreviewMode)}
                        >
                            <Eye className="w-4 h-4 mr-2" />
                            {isPreviewMode ? 'Sair da Visualização' : 'Visualizar Configurações'}
                        </SettingsButton>
                    </div>

                    <div className={cn(
                        "p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg",
                        getFontSizeClass(),
                        getContrastClass(),
                        getMotionClass(),
                        isPreviewMode && "transition-all duration-300"
                    )}>
                        <h3 className="font-bold mb-3">
                            Exemplo de Conteúdo
                        </h3>
                        <p className="mb-4">
                            Este é um exemplo de como o conteúdo aparece com suas configurações de acessibilidade.
                            O tamanho da fonte, contraste e animações são ajustados com base nas suas preferências.
                        </p>
                        <div className="space-y-2">
                            <button className="px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700">
                                Botão de Exemplo
                            </button>
                            <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded">
                                <strong>Nota importante:</strong> As configurações são aplicadas em todo o aplicativo
                                para proporcionar uma experiência consistente e acessível.
                            </div>
                        </div>
                    </div>
                </div>
            </SettingsCard>

            {/* Quick Actions */}
            <SettingsCard
                title="Ações Rápidas"
                description="Redefina ou ajuste rapidamente as configurações"
            >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <SettingsButton
                        variant="secondary"
                        onClick={() => {
                            updateSettings({ fontSize: 'medium' });
                        }}
                        className="justify-center"
                    >
                        Redefinir Fonte
                    </SettingsButton>
                    <SettingsButton
                        variant="secondary"
                        onClick={() => {
                            updateSettings({ highContrast: false, reduceMotion: false, screenReader: false });
                        }}
                        className="justify-center"
                    >
                        Redefinir Acessibilidade
                    </SettingsButton>
                    <SettingsButton
                        variant="primary"
                        onClick={() => {
                            updateSettings({
                                fontSize: 'large',
                                highContrast: true,
                                reduceMotion: true
                            });
                        }}
                        className="justify-center"
                    >
                        Acessibilidade Máxima
                    </SettingsButton>
                </div>
            </SettingsCard>
        </div>
    );
};