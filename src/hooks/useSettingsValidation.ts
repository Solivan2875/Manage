import { useCallback, useState } from 'react';
import type { UserSettings, SettingsValidationErrors } from '../types/settings';

// Update the SettingsValidationErrors interface to include avatarUrl
interface ExtendedSettingsValidationErrors extends SettingsValidationErrors {
    avatarUrl?: string;
}

interface ValidationRule {
    field: keyof UserSettings;
    validate: (value: any) => string | null;
    required?: boolean;
}

interface UseSettingsValidationReturn {
    validateField: (field: keyof UserSettings, value: any) => string | null;
    validateAll: (data: Partial<UserSettings>) => SettingsValidationErrors;
    isValid: boolean;
    errors: SettingsValidationErrors;
}

export const useSettingsValidation = (): UseSettingsValidationReturn => {
    const validationRules: ValidationRule[] = [
        {
            field: 'displayName',
            validate: (value: string) => {
                if (!value || !value.trim()) {
                    return 'Nome é obrigatório';
                }
                if (value.length < 2) {
                    return 'Nome deve ter pelo menos 2 caracteres';
                }
                if (value.length > 50) {
                    return 'Nome deve ter no máximo 50 caracteres';
                }
                // Check for invalid characters
                if (!/^[a-zA-ZÀ-ÿ\s'-]+$/.test(value)) {
                    return 'Nome contém caracteres inválidos';
                }
                return null;
            },
            required: true
        },
        {
            field: 'phone',
            validate: (value: string) => {
                if (!value) return null; // Phone is optional

                const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
                if (!phoneRegex.test(value)) {
                    return 'Formato de telefone inválido. Use +55 (00) 00000-0000';
                }
                // Check minimum length for valid phone numbers
                const cleanPhone = value.replace(/[^\d]/g, '');
                if (cleanPhone.length < 10 || cleanPhone.length > 15) {
                    return 'Telefone deve ter entre 10 e 15 dígitos';
                }
                return null;
            }
        },
        {
            field: 'bio',
            validate: (value: string) => {
                if (!value) return null; // Bio is optional

                if (value.length > 500) {
                    return 'Biografia deve ter no máximo 500 caracteres';
                }
                // Check for potentially harmful content
                const harmfulPatterns = [
                    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*?<\/script>/gi,
                    /javascript:/gi,
                    /on\w+\s*=/gi
                ];

                for (const pattern of harmfulPatterns) {
                    if (pattern.test(value)) {
                        return 'Biografia contém conteúdo inválido';
                    }
                }
                return null;
            }
        },
        {
            field: 'language',
            validate: (value: string) => {
                if (!value) {
                    return 'Idioma é obrigatória';
                }
                // Validate language code format
                const langRegex = /^[a-z]{2}-[A-Z]{2}$/;
                if (!langRegex.test(value)) {
                    return 'Idioma inválida';
                }
                return null;
            },
            required: true
        },
        {
            field: 'timezone',
            validate: (value: string) => {
                if (!value) {
                    return 'Fuso horário é obrigatório';
                }
                // Basic timezone validation
                const timezoneRegex = /^[A-Za-z_\/]+$/;
                if (!timezoneRegex.test(value)) {
                    return 'Fuso horário inválido';
                }
                return null;
            },
            required: true
        },
        {
            field: 'exportFormat',
            validate: (value: string) => {
                const validFormats = ['json', 'pdf', 'csv'];
                if (!validFormats.includes(value)) {
                    return 'Formato de exportação inválido';
                }
                return null;
            },
            required: true
        },
        {
            field: 'retentionDays',
            validate: (value: number) => {
                if (!value || value < 1) {
                    return 'Período de retenção deve ser de pelo menos 1 dia';
                }
                if (value > 3650) { // 10 years max
                    return 'Período de retenção não pode exceder 10 anos';
                }
                return null;
            },
            required: true
        }
    ];

    const validateField = useCallback((field: keyof UserSettings, value: any): string | null => {
        const rule = validationRules.find(r => r.field === field);
        if (!rule) return null;

        // Check required field validation
        if (rule.required && (!value || value === '')) {
            return `${field} é obrigatório`;
        }

        return rule.validate(value);
    }, []);

    const validateAll = useCallback((data: Partial<UserSettings>): SettingsValidationErrors => {
        const errors: SettingsValidationErrors = {};

        for (const rule of validationRules) {
            const value = data[rule.field];
            const error = validateField(rule.field, value);

            if (error) {
                (errors as any)[rule.field] = error;
            }
        }

        return errors;
    }, [validateField]);

    // Real-time validation for current form data
    const [currentErrors, setCurrentErrors] = useState<ExtendedSettingsValidationErrors>({});
    const [isValid, setIsValid] = useState(true);

    const validateRealTime = useCallback((field: keyof UserSettings, value: any) => {
        const error = validateField(field, value);

        setCurrentErrors(prev => {
            const newErrors = { ...prev };
            if (error) {
                (newErrors as any)[field] = error;
            } else {
                delete (newErrors as any)[field];
            }
            return newErrors;
        });

        setIsValid(Object.keys(currentErrors).length === 0);

        return error;
    }, [validateField, currentErrors]);

    return {
        validateField: validateRealTime,
        validateAll,
        isValid,
        errors: currentErrors as SettingsValidationErrors
    };
};