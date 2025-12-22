import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, Eye, EyeOff, UserPlus, Loader2, AlertCircle, BookOpen, User, Check, X } from 'lucide-react';

export const RegisterPage = () => {
    const navigate = useNavigate();
    const { register, isAuthenticated, isLoading, error, clearError } = useAuth();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [localError, setLocalError] = useState('');
    const [acceptedTerms, setAcceptedTerms] = useState(false);

    // Password strength indicators
    const passwordChecks = {
        length: password.length >= 6,
        hasContent: password.length > 0,
    };

    const passwordsMatch = password === confirmPassword && confirmPassword.length > 0;

    // Redirect if already authenticated
    useEffect(() => {
        if (isAuthenticated && !isLoading) {
            navigate('/');
        }
    }, [isAuthenticated, isLoading, navigate]);

    // Clear errors when inputs change
    useEffect(() => {
        if (error) clearError();
        if (localError) setLocalError('');
    }, [name, email, password, confirmPassword]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLocalError('');

        // Validation
        if (!name.trim()) {
            setLocalError('Digite seu nome');
            return;
        }
        if (!email.trim()) {
            setLocalError('Digite seu email');
            return;
        }
        if (!password) {
            setLocalError('Digite sua senha');
            return;
        }
        if (password.length < 6) {
            setLocalError('A senha deve ter pelo menos 6 caracteres');
            return;
        }
        if (password !== confirmPassword) {
            setLocalError('As senhas não coincidem');
            return;
        }
        if (!acceptedTerms) {
            setLocalError('Você precisa aceitar os termos de uso');
            return;
        }

        setIsSubmitting(true);

        const success = await register({
            name: name.trim(),
            email: email.trim(),
            password,
            confirmPassword,
        });

        setIsSubmitting(false);

        if (success) {
            navigate('/');
        }
    };

    const displayError = localError || error;

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
                    <p className="text-gray-600 dark:text-gray-400">Carregando...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex bg-gradient-to-br from-gray-50 via-white to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
            {/* Left side - Branding */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-teal-600 to-teal-800 p-12 flex-col justify-between relative overflow-hidden">
                {/* Background pattern */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 left-0 w-full h-full" style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                    }} />
                </div>

                {/* Logo and tagline */}
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                            <BookOpen className="w-7 h-7 text-white" />
                        </div>
                        <h1 className="text-3xl font-bold text-white">MaxNote</h1>
                    </div>
                    <p className="text-xl text-teal-100 max-w-md leading-relaxed">
                        Comece sua jornada de produtividade hoje mesmo. Crie sua conta gratuita!
                    </p>
                </div>

                {/* Features */}
                <div className="relative z-10 space-y-6">
                    <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center shrink-0">
                            <span className="text-white font-semibold">1</span>
                        </div>
                        <div>
                            <h3 className="text-white font-semibold mb-1">Crie sua conta</h3>
                            <p className="text-teal-100 text-sm">Preencha seus dados em segundos</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center shrink-0">
                            <span className="text-white font-semibold">2</span>
                        </div>
                        <div>
                            <h3 className="text-white font-semibold mb-1">Configure seu espaço</h3>
                            <p className="text-teal-100 text-sm">Personalize sua experiência</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center shrink-0">
                            <span className="text-white font-semibold">3</span>
                        </div>
                        <div>
                            <h3 className="text-white font-semibold mb-1">Comece a organizar</h3>
                            <p className="text-teal-100 text-sm">Capture ideias e gerencie tarefas</p>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="relative z-10">
                    <p className="text-teal-200 text-sm">© 2025 MaxNote. Todos os direitos reservados.</p>
                </div>
            </div>

            {/* Right side - Register form */}
            <div className="flex-1 flex items-center justify-center p-8 overflow-auto">
                <div className="w-full max-w-md">
                    {/* Mobile logo */}
                    <div className="lg:hidden text-center mb-8">
                        <div className="flex items-center justify-center gap-3 mb-4">
                            <div className="w-12 h-12 bg-teal-600 rounded-xl flex items-center justify-center">
                                <BookOpen className="w-7 h-7 text-white" />
                            </div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">MaxNote</h1>
                        </div>
                    </div>

                    {/* Form header */}
                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                            Criar sua conta
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400">
                            Preencha os dados abaixo para começar
                        </p>
                    </div>

                    {/* Error message */}
                    {displayError && (
                        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                            <p className="text-sm text-red-600 dark:text-red-400">{displayError}</p>
                        </div>
                    )}

                    {/* Register form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Name field */}
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Nome completo
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                    <User className="w-5 h-5 text-gray-400" />
                                </div>
                                <input
                                    id="name"
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Seu nome"
                                    autoComplete="name"
                                    className="w-full pl-11 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder:text-gray-400 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                                />
                            </div>
                        </div>

                        {/* Email field */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Email
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                    <Mail className="w-5 h-5 text-gray-400" />
                                </div>
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="seu@email.com"
                                    autoComplete="email"
                                    className="w-full pl-11 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder:text-gray-400 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                                />
                            </div>
                        </div>

                        {/* Password field */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Senha
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                    <Lock className="w-5 h-5 text-gray-400" />
                                </div>
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    autoComplete="new-password"
                                    className="w-full pl-11 pr-12 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder:text-gray-400 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                            {/* Password strength indicator */}
                            {passwordChecks.hasContent && (
                                <div className="mt-2 flex items-center gap-2 text-xs">
                                    <span className={`flex items-center gap-1 ${passwordChecks.length ? 'text-green-600 dark:text-green-400' : 'text-gray-500'}`}>
                                        {passwordChecks.length ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                                        6+ caracteres
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Confirm Password field */}
                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Confirmar senha
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                    <Lock className="w-5 h-5 text-gray-400" />
                                </div>
                                <input
                                    id="confirmPassword"
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="••••••••"
                                    autoComplete="new-password"
                                    className="w-full pl-11 pr-12 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder:text-gray-400 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                                >
                                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                            {/* Password match indicator */}
                            {confirmPassword.length > 0 && (
                                <div className="mt-2 flex items-center gap-1 text-xs">
                                    {passwordsMatch ? (
                                        <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                                            <Check className="w-3 h-3" />
                                            Senhas coincidem
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-1 text-red-500">
                                            <X className="w-3 h-3" />
                                            Senhas não coincidem
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Terms checkbox */}
                        <div className="flex items-start gap-3">
                            <input
                                id="terms"
                                type="checkbox"
                                checked={acceptedTerms}
                                onChange={(e) => setAcceptedTerms(e.target.checked)}
                                className="mt-1 w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-teal-600 focus:ring-teal-500 bg-white dark:bg-gray-800"
                            />
                            <label htmlFor="terms" className="text-sm text-gray-600 dark:text-gray-400">
                                Eu concordo com os{' '}
                                <a href="#" className="text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300">
                                    Termos de Uso
                                </a>{' '}
                                e{' '}
                                <a href="#" className="text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300">
                                    Política de Privacidade
                                </a>
                            </label>
                        </div>

                        {/* Submit button */}
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full py-3 px-4 bg-teal-600 hover:bg-teal-700 disabled:bg-teal-400 text-white font-medium rounded-lg flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg disabled:shadow-none"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Criando conta...
                                </>
                            ) : (
                                <>
                                    <UserPlus className="w-5 h-5" />
                                    Criar conta
                                </>
                            )}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="my-8 flex items-center gap-4">
                        <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
                        <span className="text-sm text-gray-500 dark:text-gray-400">ou</span>
                        <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
                    </div>

                    {/* Login link */}
                    <div className="text-center">
                        <p className="text-gray-600 dark:text-gray-400">
                            Já tem uma conta?{' '}
                            <Link
                                to="/login"
                                className="text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 font-medium transition-colors"
                            >
                                Entrar
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
