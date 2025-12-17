# MaxNote

**Your intelligent workspace for notes, tasks, and productivity**

MaxNote é uma aplicação moderna de gerenciamento de notas e tarefas, inspirada no Amplenote, mas com recursos e design únicos que a tornam especial.

## ✨ Características Principais

### 📝 **Jots (Notas Rápidas)**
- Notas organizadas por data
- Suporte para tarefas embutidas
- Detecção automática de erros ortográficos
- Interface limpa e minimalista

### 📚 **Notes (Notas Completas)**
- Visualização em grade ou lista
- Sistema de tags
- Notas fixadas (pinned)
- Organização por prioridade

### ✅ **Tasks (Gerenciamento de Tarefas)**
- Tarefas com subtarefas
- Níveis de prioridade (High, Medium, Low)
- Datas de vencimento
- Filtros inteligentes (All, Active, Completed)

### 📅 **Calendar (Calendário)**
- Visualização mensal completa
- Eventos coloridos por tipo
- Sidebar com próximos eventos
- Integração com tarefas

### 🎨 **Design Único**
- **Dark Mode**: Alternância suave entre modo claro e escuro
- **Animações**: Transições suaves e elegantes
- **Responsivo**: Interface adaptável para diferentes tamanhos de tela
- **Cores Personalizadas**: Paleta baseada em teal/cyan para uma identidade única

## 🚀 Tecnologias Utilizadas

- **React 19** - Framework JavaScript moderno
- **TypeScript** - Tipagem estática
- **Vite** - Build tool ultra-rápido
- **Tailwind CSS 4** - Framework CSS utilitário
- **React Router DOM** - Navegação entre páginas
- **Lucide React** - Ícones modernos
- **date-fns** - Manipulação de datas

## 📦 Instalação

```bash
# Instale as dependências
npm install

# Inicie o servidor de desenvolvimento
npm run dev
```

O aplicativo estará disponível em `http://localhost:5173`

## 🛠️ Scripts Disponíveis

```bash
npm run dev      # Inicia o servidor de desenvolvimento
npm run build    # Cria a build de produção
npm run preview  # Preview da build de produção
npm run lint     # Executa o linter
```

## 📁 Estrutura do Projeto

```
novo-app/
├── src/
│   ├── components/
│   │   ├── Layout.tsx       # Layout principal
│   │   └── Sidebar.tsx      # Barra lateral com navegação
│   ├── context/
│   │   └── ThemeContext.tsx # Gerenciamento de tema
│   ├── lib/
│   │   └── utils.ts         # Funções utilitárias
│   ├── pages/
│   │   ├── Jots.tsx         # Página de Jots
│   │   ├── Notes.tsx        # Página de Notes
│   │   ├── Tasks.tsx        # Página de Tasks
│   │   └── Calendar.tsx     # Página de Calendar
│   ├── App.tsx              # Componente raiz
│   └── main.tsx             # Entry point
├── tailwind.config.js       # Configuração Tailwind
├── vite.config.ts           # Configuração Vite
└── package.json
```

## 🎨 Personalização

### Temas

MaxNote suporta modo claro e escuro. O tema é salvo localmente e persiste entre sessões.

Para alternar entre temas, clique no botão de tema na sidebar inferior.

### Cores

As cores principais podem ser personalizadas no arquivo `tailwind.config.js`:

```js
colors: {
  primary: "#2d8b82",
  // Adicione suas cores aqui
}
```

## 🔮 Recursos Futuros

- [ ] Editor de texto rico (Rich Text Editor)
- [ ] Sincronização em nuvem
- [ ] Colaboração em tempo real
- [ ] Integração com AI para sugestões
- [ ] Exportação para PDF/Markdown
- [ ] Templates de notas
- [ ] Busca avançada com filtros
- [ ] Atalhos de teclado personalizáveis
- [ ] Mobile app (React Native)

## 🤝 Contribuindo

Contribuições são bem-vindas! Sinta-se livre para abrir issues e pull requests.

## 📄 Licença

Este projeto está sob a licença MIT.

---

**Desenvolvido com ❤️ usando React + TypeScript + Tailwind CSS**

*MaxNote - Maximize sua produtividade*
