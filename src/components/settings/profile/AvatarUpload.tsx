import { useState, useRef, useEffect } from 'react';
import { Upload, X, Camera, Loader2, Check } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { SettingsButton } from '../shared';

interface AvatarUploadProps {
    currentAvatar?: string;
    onAvatarChange: (avatarUrl: string) => Promise<void>;
    maxSize?: number; // in MB
    allowedTypes?: string[];
}

export const AvatarUpload: React.FC<AvatarUploadProps> = ({
    currentAvatar,
    onAvatarChange,
    maxSize = 5,
    allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
}) => {
    const [previewUrl, setPreviewUrl] = useState<string | null>(currentAvatar || null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [dragActive, setDragActive] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Update preview when currentAvatar changes
    useEffect(() => {
        setPreviewUrl(currentAvatar || null);
    }, [currentAvatar]);

    const validateFile = (file: File): boolean => {
        // Check file type
        if (!allowedTypes.includes(file.type)) {
            setError('Tipo de arquivo não suportado. Use JPEG, PNG ou WebP.');
            return false;
        }

        // Check file size
        if (file.size > maxSize * 1024 * 1024) {
            setError(`Arquivo muito grande. Máximo permitido: ${maxSize}MB`);
            return false;
        }

        return true;
    };

    const createPreview = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    };

    const handleFileSelect = async (file: File) => {
        setError(null);
        setUploadStatus('idle');

        if (!validateFile(file)) {
            return;
        }

        try {
            // Create preview
            const preview = await createPreview(file);
            setPreviewUrl(preview);

            // Upload file (in a real app, this would upload to a server)
            setIsUploading(true);

            // Simulate upload delay
            await new Promise(resolve => setTimeout(resolve, 1500));

            // For now, we'll use the data URL as the avatar
            // In production, this would be a URL from the server
            await onAvatarChange(preview);

            setUploadStatus('success');
            setTimeout(() => setUploadStatus('idle'), 3000);
        } catch (err) {
            setError('Falha ao fazer upload da imagem');
            setUploadStatus('error');
            setPreviewUrl(currentAvatar || null);
            setTimeout(() => setUploadStatus('idle'), 3000);
        } finally {
            setIsUploading(false);
        }
    };

    const handleFileInput = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            handleFileSelect(file);
        }
        // Reset input value to allow selecting the same file again
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        const file = e.dataTransfer.files?.[0];
        if (file) {
            handleFileSelect(file);
        }
    };

    const handleRemove = async () => {
        try {
            setIsUploading(true);
            await onAvatarChange('');
            setPreviewUrl(null);
            setUploadStatus('success');
            setTimeout(() => setUploadStatus('idle'), 3000);
        } catch (err) {
            setError('Falha ao remover avatar');
            setUploadStatus('error');
            setTimeout(() => setUploadStatus('idle'), 3000);
        } finally {
            setIsUploading(false);
        }
    };

    const triggerFileSelect = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-4">
                <div className="relative">
                    {/* Avatar Preview */}
                    <div className="relative w-24 h-24 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
                        {previewUrl ? (
                            <img
                                src={previewUrl}
                                alt="Avatar"
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <Camera className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                            </div>
                        )}

                        {/* Upload Status Overlay */}
                        {isUploading && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                <Loader2 className="w-6 h-6 text-white animate-spin" />
                            </div>
                        )}

                        {uploadStatus === 'success' && (
                            <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center">
                                <Check className="w-6 h-6 text-green-600" />
                            </div>
                        )}
                    </div>

                    {/* Remove Button */}
                    {previewUrl && !isUploading && (
                        <button
                            onClick={handleRemove}
                            className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                            aria-label="Remover avatar"
                        >
                            <X className="w-3 h-3" />
                        </button>
                    )}
                </div>

                <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        Foto do Perfil
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Upload uma imagem quadrada. Máximo {maxSize}MB.
                    </p>

                    {error && (
                        <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                            {error}
                        </p>
                    )}
                </div>
            </div>

            {/* Upload Area */}
            <div
                className={cn(
                    "border-2 border-dashed rounded-lg p-6 text-center transition-colors",
                    dragActive
                        ? "border-teal-500 bg-teal-50 dark:bg-teal-900/20"
                        : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
                )}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
            >
                <Upload className="w-8 h-8 mx-auto text-gray-400 dark:text-gray-500 mb-2" />
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Arraste uma imagem aqui ou clique para selecionar
                </p>
                <SettingsButton
                    onClick={triggerFileSelect}
                    disabled={isUploading}
                    variant="secondary"
                >
                    Selecionar Imagem
                </SettingsButton>
            </div>

            {/* Hidden File Input */}
            <input
                ref={fileInputRef}
                type="file"
                accept={allowedTypes.join(',')}
                onChange={handleFileInput}
                className="hidden"
                aria-label="Selecionar arquivo de avatar"
            />

            {/* Upload Status Message */}
            {uploadStatus === 'success' && (
                <div className="flex items-center gap-2 text-green-600 dark:text-green-400 text-sm">
                    <Check className="w-4 h-4" />
                    <span>Avatar atualizado com sucesso!</span>
                </div>
            )}
        </div>
    );
};