import { useState } from 'react';
import { FileText, ExternalLink, Shield, AlertCircle, CheckCircle } from 'lucide-react';
import { SettingsCard } from '../shared/SettingsCard';
import { SettingsButton } from '../shared/SettingsButton';
import { cn } from '../../../lib/utils';

interface LicenseInfo {
    type: 'mit' | 'apache' | 'gpl' | 'commercial';
    name: string;
    description: string;
    permissions: string[];
    limitations: string[];
    can: string[];
    cannot: string[];
    must: string[];
}

interface ThirdPartyLicense {
    name: string;
    version: string;
    license: string;
    website: string;
    description: string;
}

export const LicenseInfo: React.FC = () => {
    const [selectedLicense, setSelectedLicense] = useState<string>('mit');
    const [showThirdParty, setShowThirdParty] = useState(false);

    const licenses: LicenseInfo[] = [
        {
            type: 'mit',
            name: 'MIT License',
            description: 'Permissão livre para usar, copiar, modificar e distribuir o software',
            permissions: [
                'Uso comercial',
                'Modificação',
                'Distribuição',
                'Uso privado'
            ],
            limitations: [
                'Sem responsabilidade',
                'Sem garantia'
            ],
            can: [
                'Usar, copiar e modificar o software',
                'Distribuir cópias do software modificado'
            ],
            cannot: [
                'Reivindicar propriedade de outros'
            ],
            must: [
                'Incluir a licença e o aviso de copyright em todas as cópias',
                'Manter o mesmo nome da licença'
            ]
        },
        {
            type: 'apache',
            name: 'Apache License 2.0',
            description: 'Permissão que permite uso comercial, modificação e distribuição',
            permissions: [
                'Uso comercial',
                'Modificação',
                'Distribuição',
                'Sublicenciamento',
                'Uso privado'
            ],
            limitations: [
                'Sem responsabilidade',
                'Sem garantia',
                'Sem responsabilidade por violação de patente'
            ],
            can: [
                'Usar, copiar e modificar o software',
                'Distribuir cópias do software modificado',
                'Sublicenciar o software'
            ],
            cannot: [
                'Usar nomes de trademark sem permissão'
            ],
            must: [
                'Incluir a licença e o aviso de copyright',
                'Manter o mesmo nome da licença'
            ]
        }
    ];

    const thirdPartyLibraries: ThirdPartyLicense[] = [
        {
            name: 'React',
            version: '18.2.0',
            license: 'MIT',
            website: 'https://reactjs.org',
            description: 'Biblioteca JavaScript para construir interfaces de usuário'
        },
        {
            name: 'Tailwind CSS',
            version: '3.4.0',
            license: 'MIT',
            website: 'https://tailwindcss.com',
            description: 'Framework CSS para design rápido e responsivo'
        },
        {
            name: 'Lucide React',
            version: '0.263.1',
            license: 'ISC',
            website: 'https://lucide.dev',
            description: 'Biblioteca de ícones para interfaces modernas'
        },
        {
            name: 'Vite',
            version: '5.0.0',
            license: 'MIT',
            website: 'https://vitejs.dev',
            description: 'Ferramenta de build para desenvolvimento web moderno'
        },
        {
            name: 'TypeScript',
            version: '5.0.0',
            license: 'Apache-2.0',
            website: 'https://www.typescriptlang.org',
            description: 'Linguagem de programação tipada para JavaScript'
        }
    ];

    const currentLicense = licenses.find(license => license.type === selectedLicense);

    const getLicenseIcon = (type: string) => {
        switch (type) {
            case 'mit':
                return CheckCircle;
            case 'apache':
                return Shield;
            default:
                return FileText;
        }
    };

    const formatDate = (dateString: string): string => {
        return new Date(dateString).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    return (
        <div className="space-y-6">
            {/* Main License */}
            <SettingsCard
                title="Licença do MaxNote"
                description="Informações sobre a licença do aplicativo"
            >
                <div className="space-y-6">
                    {/* License Selector */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                            Tipo de Licença
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {licenses.map((license) => {
                                const Icon = getLicenseIcon(license.type);
                                return (
                                    <button
                                        key={license.type}
                                        onClick={() => setSelectedLicense(license.type)}
                                        className={cn(
                                            "p-4 border-2 rounded-lg text-left transition-all",
                                            selectedLicense === license.type
                                                ? "border-teal-500 bg-teal-50 dark:bg-teal-900/20"
                                                : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                                        )}
                                    >
                                        <div className="flex items-center gap-3">
                                            <Icon className={cn(
                                                "w-6 h-6 flex-shrink-0",
                                                selectedLicense === license.type
                                                    ? "text-teal-600 dark:text-teal-400"
                                                    : "text-gray-600 dark:text-gray-400"
                                            )} />
                                            <div>
                                                <h3 className="font-semibold text-gray-900 dark:text-white">
                                                    {license.name}
                                                </h3>
                                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                                    {license.description}
                                                </p>
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* License Details */}
                    {currentLicense && (
                        <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
                                O que você pode Fazer
                            </h4>
                            <div className="space-y-3">
                                {currentLicense.can.map((permission, index) => (
                                    <div key={index} className="flex items-start gap-3">
                                        <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                                        <p className="text-sm text-gray-700 dark:text-gray-300">
                                            {permission}
                                        </p>
                                    </div>
                                ))}
                            </div>

                            <h4 className="font-semibold text-gray-900 dark:text-white mb-4 mt-6">
                                O que você Não Pode Fazer
                            </h4>
                            <div className="space-y-3">
                                {currentLicense.cannot.map((limitation, index) => (
                                    <div key={index} className="flex items-start gap-3">
                                        <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                                        <p className="text-sm text-gray-700 dark:text-gray-300">
                                            {limitation}
                                        </p>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                                    Condições
                                </h4>
                                <div className="space-y-2">
                                    {currentLicense.must.map((condition, index) => (
                                        <div key={index} className="flex items-start gap-3">
                                            <div className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400 flex-shrink-0 mt-0.5" />
                                            <p className="text-sm text-blue-700 dark:text-blue-300">
                                                {condition}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </SettingsCard>

            {/* License Actions */}
            <SettingsCard
                title="Ações da Licença"
                description="Recursos relacionados à licença"
            >
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <SettingsButton
                            variant="primary"
                            onClick={() => window.open('https://maxnote.com/license', '_blank')}
                            className="justify-center"
                        >
                            <FileText className="w-4 h-4 mr-2" />
                            Ver Licença Completa
                        </SettingsButton>
                        <SettingsButton
                            variant="secondary"
                            onClick={() => window.open('https://maxnote.com/legal', '_blank')}
                            className="justify-center"
                        >
                            <Shield className="w-4 h-4 mr-2" />
                            Termos de Uso
                        </SettingsButton>
                    </div>

                    <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                        <h4 className="font-medium text-amber-900 dark:text-amber-100 mb-2">
                            Informações Importantes
                        </h4>
                        <ul className="space-y-2 text-sm text-amber-700 dark:text-amber-300">
                            <li>• Esta licença se aplica apenas ao MaxNote</li>
                            <li>• O código fonte está disponível para inspeção</li>
                            <li>• Você pode usar este software para fins comerciais</li>
                            <li>• Modificações devem ser licenciadas sob os mesmos termos</li>
                        </ul>
                    </div>
                </div>
            </SettingsCard>

            {/* Third Party Libraries */}
            <SettingsCard
                title="Bibliotecas de Terceiros"
                description="Licenças das bibliotecas utilizadas"
            >
                <div className="space-y-4">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Dependências
                        </h3>
                        <SettingsButton
                            variant="secondary"
                            onClick={() => setShowThirdParty(!showThirdParty)}
                        >
                            {showThirdParty ? 'Ocultar' : 'Mostrar'} Bibliotecas
                        </SettingsButton>
                    </div>

                    {showThirdParty && (
                        <div className="space-y-3">
                            {thirdPartyLibraries.map((library, index) => (
                                <div
                                    key={index}
                                    className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div>
                                            <h4 className="font-semibold text-gray-900 dark:text-white">
                                                {library.name}
                                            </h4>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                {library.description}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                                                {library.license}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                                        <span>Versão: {library.version}</span>
                                        <SettingsButton
                                            variant="secondary"
                                            onClick={() => window.open(library.website, '_blank')}
                                            className="text-xs px-3 py-1"
                                        >
                                            <ExternalLink className="w-3 h-3 mr-1" />
                                            Website
                                        </SettingsButton>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {!showThirdParty && (
                        <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                            <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            <p>MaxNote utiliza bibliotecas de código aberto</p>
                            <p className="text-sm mt-1">
                                Clique em "Mostrar Bibliotecas" para ver detalhes
                            </p>
                        </div>
                    )}
                </div>
            </SettingsCard>
        </div>
    );
};