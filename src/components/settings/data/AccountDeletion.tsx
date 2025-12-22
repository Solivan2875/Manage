import { useState, useCallback } from 'react';
import { AlertTriangle, Download, Clock, Shield, Eye, EyeOff, Key, Trash2 } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { SettingsCard } from '../shared/SettingsCard';
import { SettingsButton } from '../shared/SettingsButton';
import { SettingsInput } from '../shared/SettingsInput';
import { ConfirmDialog } from '../shared/ConfirmDialog';
import { cn } from '../../../lib/utils';

interface DeletionStep {
    id: number;
    title: string;
    description: string;
    completed: boolean;
    icon: React.ComponentType<{ className?: string }>;
}

export const AccountDeletion: React.FC = () => {
    const { user } = useAuth();
    const [currentStep, setCurrentStep] = useState(0);
    const [confirmationText, setConfirmationText] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [password, setPassword] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);
    const [showFinalDialog, setShowFinalDialog] = useState(false);
    const [exportRequested, setExportRequested] = useState(false);
    const [understandConsequences, setUnderstandConsequences] = useState(false);

    const steps: DeletionStep[] = [
        {
            id: 1,
            title: 'Exportar Dados',
            description: 'Faça o download de todos os seus dados antes de prosseguir',
            completed: exportRequested,
            icon: Download
        },
        {
            id: 2,
            title: 'Entender Consequências',
            description: 'Leia e compreenda o que acontecerá com sua conta',
            completed: understandConsequences,
            icon: AlertTriangle
        },
        {
            id: 3,
            title: 'Verificar Identidade',
            description: 'Confirme sua identidade para proteger sua conta',
            completed: password.length > 0,
            icon: Shield
        },
        {
            id: 4,
            title: 'Confirmação Final',
            description: 'Confirme a exclusão permanentemente',
            completed: confirmationText === 'EXCLUIR MINHA CONTA',
            icon: Trash2
        }
    ];

    const handleExportData = useCallback(async () => {
        try {
            // Simulate data export
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Mock data export
            const exportData = {
                user: {
                    id: user?.id,
                    email: user?.email,
                    displayName: 'Usuário Teste'
                },
                notes: [
                    { id: 1, title: 'Nota 1', content: 'Conteúdo da nota 1', createdAt: new Date().toISOString() }
                ],
                tasks: [
                    { id: 1, title: 'Tarefa 1', completed: false, createdAt: new Date().toISOString() }
                ],
                exportedAt: new Date().toISOString()
            };

            const dataStr = JSON.stringify(exportData, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });

            const url = URL.createObjectURL(dataBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `maxnote-account-data-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            setExportRequested(true);
        } catch (error) {
            console.error('Error exporting data:', error);
        }
    }, [user]);

    const handleDeleteAccount = useCallback(async () => {
        setIsDeleting(true);
        try {
            // Simulate account deletion
            await new Promise(resolve => setTimeout(resolve, 3000));

            // In a real implementation, this would:
            // 1. Verify password with backend
            // 2. Schedule account for deletion
            // 3. Send confirmation email
            // 4. Log out user
            // 5. Redirect to login page

            console.log('Account deletion initiated');
            setShowFinalDialog(false);

            // Simulate redirect after deletion
            setTimeout(() => {
                window.location.href = '/login';
            }, 2000);

        } catch (error) {
            console.error('Error deleting account:', error);
        } finally {
            setIsDeleting(false);
        }
    }, [password]);

    const canProceedToNext = () => {
        switch (currentStep) {
            case 0:
                return exportRequested;
            case 1:
                return understandConsequences;
            case 2:
                return password.length >= 8;
            case 3:
                return confirmationText === 'EXCLUIR MINHA CONTA';
            default:
                return false;
        }
    };

    const nextStep = () => {
        if (canProceedToNext() && currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
        }
    };

    const prevStep = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const currentStepData = steps[currentStep];

    return (
        <div className="space-y-6">
            {/* Progress Steps */}
            <SettingsCard
                title="Processo de Exclusão de Conta"
                description="Siga todas as etapas para excluir sua conta permanentemente"
            >
                <div className="space-y-4">
                    {/* Step Progress */}
                    <div className="flex items-center justify-between mb-6">
                        {steps.map((step, index) => {
                            const Icon = step.icon;
                            const isActive = index === currentStep;
                            const isCompleted = step.completed;
                            const isPast = index < currentStep;

                            return (
                                <div key={step.id} className="flex items-center flex-1">
                                    <div className="flex items-center">
                                        <div className={cn(
                                            "w-10 h-10 rounded-full flex items-center justify-center transition-colors",
                                            isActive && "bg-teal-600 text-white",
                                            isCompleted && "bg-green-600 text-white",
                                            !isActive && !isCompleted && "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                                        )}>
                                            {isCompleted ? (
                                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                            ) : (
                                                <Icon className="w-5 h-5" />
                                            )}
                                        </div>
                                        <div className="ml-3 hidden sm:block">
                                            <p className={cn(
                                                "text-sm font-medium",
                                                isActive && "text-teal-600 dark:text-teal-400",
                                                isCompleted && "text-green-600 dark:text-green-400",
                                                !isActive && !isCompleted && "text-gray-600 dark:text-gray-400"
                                            )}>
                                                {step.title}
                                            </p>
                                        </div>
                                    </div>
                                    {index < steps.length - 1 && (
                                        <div className={cn(
                                            "flex-1 h-0.5 mx-2",
                                            isPast ? "bg-green-600" : "bg-gray-200 dark:bg-gray-700"
                                        )} />
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* Current Step Content */}
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                            {currentStepData.title}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                            {currentStepData.description}
                        </p>

                        {/* Step 1: Export Data */}
                        {currentStep === 0 && (
                            <div className="space-y-4">
                                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                    <div className="flex items-start gap-3">
                                        <Download className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                                                Exporte seus dados
                                            </p>
                                            <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                                                Faça o download de todas as suas notas, tarefas, eventos e configurações.
                                                Isso é sua única oportunidade de salvar seus dados.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <SettingsButton
                                    variant="primary"
                                    onClick={handleExportData}
                                    disabled={exportRequested}
                                    className="w-full sm:w-auto"
                                >
                                    <Download className="w-4 h-4 mr-2" />
                                    {exportRequested ? 'Dados Exportados' : 'Exportar Meus Dados'}
                                </SettingsButton>

                                {exportRequested && (
                                    <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                        <p className="text-sm text-green-800 dark:text-green-200">
                                            ✓ Seus dados foram exportados com sucesso. Verifique sua pasta de downloads.
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Step 2: Understand Consequences */}
                        {currentStep === 1 && (
                            <div className="space-y-4">
                                <div className="space-y-3">
                                    <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                                        <div className="flex items-start gap-3">
                                            <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                                            <div>
                                                <p className="text-sm font-medium text-red-900 dark:text-red-100">
                                                    Perda Permanente de Dados
                                                </p>
                                                <p className="text-xs text-red-700 dark:text-red-300 mt-1">
                                                    Todos os seus dados serão permanentemente excluídos e não poderão ser recuperados.
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                                        <div className="flex items-start gap-3">
                                            <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                                            <div>
                                                <p className="text-sm font-medium text-yellow-900 dark:text-yellow-100">
                                                    Período de Carência
                                                </p>
                                                <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                                                    Sua conta ficará inativa por 30 dias antes da exclusão permanente.
                                                    Você pode reativar sua conta durante este período.
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                                        <div className="flex items-start gap-3">
                                            <Shield className="w-5 h-5 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
                                            <div>
                                                <p className="text-sm font-medium text-orange-900 dark:text-orange-100">
                                                    Perda de Acesso
                                                </p>
                                                <p className="text-xs text-orange-700 dark:text-orange-300 mt-1">
                                                    Você perderá acesso imediato a todos os serviços e recursos do MaxNote.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <label className="flex items-start gap-3 p-3 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
                                    <input
                                        type="checkbox"
                                        checked={understandConsequences}
                                        onChange={(e) => setUnderstandConsequences(e.target.checked)}
                                        className="mt-1"
                                    />
                                    <div>
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                                            Eu entendo as consequências
                                        </p>
                                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                            Li e compreendo que esta ação é permanente e irreversível.
                                        </p>
                                    </div>
                                </label>
                            </div>
                        )}

                        {/* Step 3: Verify Identity */}
                        {currentStep === 2 && (
                            <div className="space-y-4">
                                <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                                    <div className="flex items-start gap-3">
                                        <Shield className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
                                                Verificação de Identidade
                                            </p>
                                            <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                                                Digite sua senha para confirmar que você é o proprietário desta conta.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <div className="relative">
                                        <SettingsInput
                                            label="Senha"
                                            type={showPassword ? 'text' : 'password'}
                                            value={password}
                                            onChange={setPassword}
                                            placeholder="Digite sua senha"
                                            description="Sua senha é necessária para proteger sua conta contra exclusões não autorizadas."
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-8 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                                        >
                                            {showPassword ? (
                                                <EyeOff className="w-5 h-5" />
                                            ) : (
                                                <Eye className="w-5 h-5" />
                                            )}
                                        </button>
                                    </div>
                                </div>

                                {password && password.length < 8 && (
                                    <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                                        <p className="text-sm text-red-800 dark:text-red-200">
                                            A senha deve ter pelo menos 8 caracteres.
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Step 4: Final Confirmation */}
                        {currentStep === 3 && (
                            <div className="space-y-4">
                                <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                                    <div className="flex items-start gap-3">
                                        <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <p className="text-sm font-medium text-red-900 dark:text-red-100">
                                                Confirmação Final
                                            </p>
                                            <p className="text-xs text-red-700 dark:text-red-300 mt-1">
                                                Digite "EXCLUIR MINHA CONTA" para confirmar a exclusão permanente.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <SettingsInput
                                        label="Confirmação"
                                        value={confirmationText}
                                        onChange={setConfirmationText}
                                        placeholder="Digite EXCLUIR MINHA CONTA"
                                        description="Esta etapa é necessária para evitar exclusões acidentais."
                                        className="font-mono"
                                    />
                                </div>

                                {confirmationText && confirmationText !== 'EXCLUIR MINHA CONTA' && (
                                    <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                                        <p className="text-sm text-yellow-800 dark:text-yellow-200">
                                            O texto digitado não corresponde a "EXCLUIR MINHA CONTA".
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Navigation Buttons */}
                        <div className="flex justify-between pt-4">
                            <SettingsButton
                                variant="secondary"
                                onClick={prevStep}
                                disabled={currentStep === 0}
                            >
                                Anterior
                            </SettingsButton>

                            <div className="flex gap-3">
                                {currentStep === steps.length - 1 ? (
                                    <SettingsButton
                                        variant="danger"
                                        onClick={() => setShowFinalDialog(true)}
                                        disabled={!canProceedToNext()}
                                    >
                                        <Trash2 className="w-4 h-4 mr-2" />
                                        Excluir Minha Conta
                                    </SettingsButton>
                                ) : (
                                    <SettingsButton
                                        variant="primary"
                                        onClick={nextStep}
                                        disabled={!canProceedToNext()}
                                    >
                                        Próximo
                                    </SettingsButton>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </SettingsCard>

            {/* Final Confirmation Dialog */}
            <ConfirmDialog
                isOpen={showFinalDialog}
                onClose={() => setShowFinalDialog(false)}
                onConfirm={handleDeleteAccount}
                title="Excluir Conta Permanentemente"
                message="Tem certeza que deseja excluir sua conta? Esta ação é permanente e não pode ser desfeita. Todos os seus dados serão perdidos."
                confirmText="Sim, Excluir Minha Conta"
                cancelText="Cancelar"
                variant="danger"
                loading={isDeleting}
            />
        </div>
    );
};