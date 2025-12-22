import { useState } from 'react';
import { Users, Github, Twitter, Linkedin, Mail, ExternalLink, Star } from 'lucide-react';
import { SettingsCard } from '../shared/SettingsCard';
import { SettingsButton } from '../shared/SettingsButton';
import { cn } from '../../../lib/utils';

interface TeamMember {
    id: string;
    name: string;
    role: string;
    avatar: string;
    bio: string;
    github?: string;
    twitter?: string;
    linkedin?: string;
    email?: string;
}

interface Contributor {
    id: string;
    name: string;
    avatar: string;
    contributions: number;
    github?: string;
    twitter?: string;
}

export const Credits: React.FC = () => {
    const [showContributors, setShowContributors] = useState(false);

    const teamMembers: TeamMember[] = [
        {
            id: '1',
            name: 'João Silva',
            role: 'Desenvolvedor Líder',
            avatar: '👨‍💻',
            bio: 'Arquiteto principal e desenvolvedor do MaxNote, com mais de 10 anos de experiência em desenvolvimento web e mobile.',
            github: 'joaosilva',
            twitter: 'joaosilva',
            linkedin: 'joaosilva',
            email: 'joao@maxnote.com'
        },
        {
            id: '2',
            name: 'Maria Santos',
            role: 'Designer UX/UI',
            avatar: '👩‍💻',
            bio: 'Responsável pelo design e experiência do usuário, criando interfaces intuitivas e acessíveis.',
            github: 'mariasantos',
            twitter: 'mariasantos',
            linkedin: 'mariasantos',
            email: 'maria@maxnote.com'
        },
        {
            id: '3',
            name: 'Pedro Costa',
            role: 'Desenvolvedor Frontend',
            avatar: '👨‍💻',
            bio: 'Especialista em React e TypeScript, focado em performance e otimização.',
            github: 'pedrocosta',
            twitter: 'pedrocosta',
            linkedin: 'pedrocosta',
            email: 'pedro@maxnote.com'
        },
        {
            id: '4',
            name: 'Ana Oliveira',
            role: 'Desenvolvedora Backend',
            avatar: '👩‍💻',
            bio: 'Arquiteta de sistemas com especialização em APIs e banco de dados.',
            github: 'anaoliveira',
            twitter: 'anaoliveira',
            linkedin: 'anaoliveira',
            email: 'ana@maxnote.com'
        }
    ];

    const contributors: Contributor[] = [
        {
            id: '1',
            name: 'Carlos Ferreira',
            avatar: '👨‍💻',
            contributions: 142,
            github: 'carlosferreira'
        },
        {
            id: '2',
            name: 'Lucas Mendes',
            avatar: '👨‍💻',
            contributions: 98,
            github: 'lucasmendes'
        },
        {
            id: '3',
            name: 'Fernanda Lima',
            avatar: '👩‍💻',
            contributions: 76,
            github: 'fernandalima'
        },
        {
            id: '4',
            name: 'Ricardo Alves',
            avatar: '👨‍💻',
            contributions: 65,
            github: 'ricardoalves'
        },
        {
            id: '5',
            name: 'Juliana Castro',
            avatar: '👩‍💻',
            contributions: 54,
            github: 'julianacastro'
        },
        {
            id: '6',
            name: 'Bruno Santos',
            avatar: '👨‍💻',
            contributions: 43,
            github: 'brunosantos'
        },
        {
            id: '7',
            name: 'Camila Souza',
            avatar: '👩‍💻',
            contributions: 38,
            github: 'camilasouza'
        },
        {
            id: '8',
            name: 'Thiago Oliveira',
            avatar: '👨‍💻',
            contributions: 32,
            github: 'thiagooliveira'
        }
    ];

    const getRoleIcon = (role: string) => {
        if (role.includes('Líder') || role.includes('Arquiteto')) {
            return '👑‍💼';
        }
        if (role.includes('Designer')) {
            return '🎨';
        }
        if (role.includes('Backend')) {
            return '⚙️';
        }
        return '💻';
    };

    return (
        <div className="space-y-6">
            {/* Core Team */}
            <SettingsCard
                title="Equipe Principal"
                description="Desenvolvedores e designers por trás do MaxNote"
            >
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {teamMembers.map((member) => (
                            <div
                                key={member.id}
                                className="p-6 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            >
                                <div className="flex items-start gap-4">
                                    <div className="text-4xl">
                                        {member.avatar}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                            {member.name}
                                        </h3>
                                        <div className="flex items-center gap-2 mb-3">
                                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                                {getRoleIcon(member.role)}
                                            </span>
                                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                                                {member.role}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                            {member.bio}
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                            {member.github && (
                                                <SettingsButton
                                                    variant="secondary"
                                                    onClick={() => window.open(`https://github.com/${member.github}`, '_blank')}
                                                    className="text-xs px-3 py-1"
                                                >
                                                    <Github className="w-3 h-3 mr-1" />
                                                    GitHub
                                                </SettingsButton>
                                            )}
                                            {member.twitter && (
                                                <SettingsButton
                                                    variant="secondary"
                                                    onClick={() => window.open(`https://twitter.com/${member.twitter}`, '_blank')}
                                                    className="text-xs px-3 py-1"
                                                >
                                                    <Twitter className="w-3 h-3 mr-1" />
                                                    Twitter
                                                </SettingsButton>
                                            )}
                                            {member.linkedin && (
                                                <SettingsButton
                                                    variant="secondary"
                                                    onClick={() => window.open(`https://linkedin.com/in/${member.linkedin}`, '_blank')}
                                                    className="text-xs px-3 py-1"
                                                >
                                                    <Linkedin className="w-3 h-3 mr-1" />
                                                    LinkedIn
                                                </SettingsButton>
                                            )}
                                            {member.email && (
                                                <SettingsButton
                                                    variant="secondary"
                                                    onClick={() => window.open(`mailto:${member.email}`, '_blank')}
                                                    className="text-xs px-3 py-1"
                                                >
                                                    <Mail className="w-3 h-3 mr-1" />
                                                    Email
                                                </SettingsButton>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}

                    </div>
                </div>
            </SettingsCard>

            {/* Contributors */}
            <SettingsCard
                title="Contribuidores"
                description="Desenvolvedores que ajudaram a construir o MaxNote"
            >
                <div className="space-y-4">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Comunidade
                        </h3>
                        <SettingsButton
                            variant="secondary"
                            onClick={() => setShowContributors(!showContributors)}
                        >
                            {showContributors ? 'Ocultar' : 'Mostrar'} Contribuidores
                        </SettingsButton>
                    </div>

                    {showContributors && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {contributors.map((contributor) => (
                                <div
                                    key={contributor.id}
                                    className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="text-2xl">
                                            {contributor.avatar}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-medium text-gray-900 dark:text-white">
                                                {contributor.name}
                                            </h4>
                                            <div className="flex items-center gap-2 mb-2">
                                                <Star className="w-4 h-4 text-yellow-500" />
                                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                                    {contributor.contributions} contribuições
                                                </span>
                                            </div>
                                            <div className="flex gap-2">
                                                {contributor.github && (
                                                    <SettingsButton
                                                        variant="secondary"
                                                        onClick={() => window.open(`https://github.com/${contributor.github}`, '_blank')}
                                                        className="text-xs px-3 py-1"
                                                    >
                                                        <Github className="w-3 h-3 mr-1" />
                                                        GitHub
                                                    </SettingsButton>
                                                )}
                                                {contributor.twitter && (
                                                    <SettingsButton
                                                        variant="secondary"
                                                        onClick={() => window.open(`https://twitter.com/${contributor.twitter}`, '_blank')}
                                                        className="text-xs px-3 py-1"
                                                    >
                                                        <Twitter className="w-3 h-3 mr-1" />
                                                        Twitter
                                                    </SettingsButton>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {!showContributors && (
                        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                            <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p className="text-lg font-medium mb-2">
                                8+ Contribuidores
                            </p>
                            <p className="text-sm">
                                Faça parte da comunidade MaxNote
                            </p>
                            <SettingsButton
                                variant="primary"
                                onClick={() => setShowContributors(true)}
                                className="mt-4"
                            >
                                <Users className="w-4 h-4 mr-2" />
                                Ver Todos os Contribuidores
                            </SettingsButton>
                        </div>
                    )}
                </div>
            </SettingsCard>

            {/* Special Thanks */}
            <SettingsCard
                title="Agradecimentos Especiais"
                description="Pessoas e projetos que tornaram o MaxNote possível"
            >
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                            <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-3">
                                Open Source
                            </h4>
                            <p className="text-sm text-blue-700 dark:text-blue-300 mb-4">
                                Agradecemos a toda comunidade de código aberto pelas ferramentas e bibliotecas
                                que tornaram este projeto possível.
                            </p>
                            <div className="space-y-2">
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400" />
                                    <span className="text-sm text-blue-700 dark:text-blue-300">
                                        React, TypeScript, Tailwind CSS
                                    </span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400" />
                                    <span className="text-sm text-blue-700 dark:text-blue-300">
                                        Vite, Lucide Icons
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                            <h4 className="font-semibold text-green-900 dark:text-green-100 mb-3">
                                Design e Inspiração
                            </h4>
                            <p className="text-sm text-green-700 dark:text-green-300 mb-4">
                                Inspirados pelas melhores aplicações de produtividade e ferramentas de desenvolvimento
                                para criar uma experiência única e poderosa.
                            </p>
                            <div className="space-y-2">
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-green-600 dark:bg-green-400" />
                                    <span className="text-sm text-green-700 dark:text-green-300">
                                        Notion, Obsidian, Evernote
                                    </span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-green-600 dark:bg-green-400" />
                                    <span className="text-sm text-green-700 dark:text-green-300">
                                        Material Design, Apple Human Interface
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </SettingsCard>

            {/* Contact */}
            <SettingsCard
                title="Entre em Contato"
                description="Conecte-se com a equipe do MaxNote"
            >
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <SettingsButton
                            variant="primary"
                            onClick={() => window.open('mailto:team@maxnote.com', '_blank')}
                            className="justify-center"
                        >
                            <Mail className="w-4 h-4 mr-2" />
                            Email da Equipe
                        </SettingsButton>
                        <SettingsButton
                            variant="secondary"
                            onClick={() => window.open('https://github.com/maxnote', '_blank')}
                            className="justify-center"
                        >
                            <Github className="w-4 h-4 mr-2" />
                            GitHub do Projeto
                        </SettingsButton>
                    </div>

                    <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                        <h4 className="font-medium text-amber-900 dark:text-amber-100 mb-2">
                            Feedback e Sugestões
                        </h4>
                        <p className="text-sm text-amber-700 dark:text-amber-300">
                            Sua opinião é importante para nós! Envie sugestões, reporte bugs
                            e compartilhe suas ideias para ajudar a melhorar o MaxNote.
                        </p>
                        <div className="flex gap-3 mt-4">
                            <SettingsButton
                                variant="primary"
                                onClick={() => window.open('https://maxnote.com/feedback', '_blank')}
                                className="flex-1"
                            >
                                <ExternalLink className="w-4 h-4 mr-2" />
                                Enviar Feedback
                            </SettingsButton>
                            <SettingsButton
                                variant="secondary"
                                onClick={() => window.open('https://maxnote.com/suggestions', '_blank')}
                                className="flex-1"
                            >
                                <Star className="w-4 h-4 mr-2" />
                                Sugerir Funcionalidade
                            </SettingsButton>
                        </div>
                    </div>
                </div>
            </SettingsCard>
        </div>
    );
};