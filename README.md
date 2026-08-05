# 🕊️ Comunidade Viva - Dashboard Digital

Bem-vindo ao projeto **Comunidade Viva** — um painel digital moderno construído com Next.js para organizar e apresentar informações da igreja, ministérios, membros, eventos e conteúdos pastorais. 🌟

## ✨ O que é este projeto?

Uma plataforma web profissional e responsiva que funciona como centro de comunicação e gestão da vida da igreja. Combina um **Frontend moderno** (React/Next.js) com uma **API Backend** robusta.

**Áreas principais:**
- 🏛️ Dashboard da igreja
- 👥 Gestão de membros
- 🎶 Ministérios
- 📅 Eventos e cultos
- 📚 Biblioteca e ensino bíblico
- 🩺 Saúde pastoral
- 📞 Comunicação integrada

## 🚀 Início Rápido

### Opção 1: Setup Automatizado (Recomendado)

**Windows:**
```bash
setup.bat
```

**macOS/Linux:**
```bash
chmod +x setup.sh
./setup.sh
```

### Opção 2: Setup Manual

```bash
cd igreja-premium
npm install
npm run dev
```

Acesse: `http://localhost:3000`

## 📁 Estrutura Organizada

```
Igreja-1/
├── igreja-premium/           # Projeto Principal (Next.js)
│   ├── src/app/
│   │   ├── api/             # 🔧 BACKEND - Rotas de API
│   │   ├── components/      # 🎨 FRONTEND - Componentes React
│   │   ├── layout.tsx       # Layout principal
│   │   └── page.tsx         # Página inicial
│   ├── package.json
│   └── next.config.ts
├── ARCHITECTURE.md          # Documentação da arquitetura
├── DEPLOY_VERCEL.md        # Guia de deploy
├── vercel.json             # Configuração Vercel
└── setup.bat/setup.sh      # Scripts de instalação
```

## 🔧 Tecnologias

| Layer | Tecnologia |
|-------|-----------|
| **Frontend** | React 19, Next.js 16, TypeScript, Tailwind CSS |
| **UI/UX** | Lucide Icons, Framer Motion, Recharts |
| **Backend** | Next.js API Routes, TypeScript |
| **Deploy** | Vercel |

## 📡 Endpoints de API

```
GET/POST /api/members      - Gestão de membros
GET/POST /api/events       - Gestão de eventos
GET/POST /api/ministries   - Gestão de ministérios
GET      /api/health       - Health check
```

## 🚀 Deploy na Vercel

### 1. Prepare o código
```bash
git add .
git commit -m "Atualização: projeto Next.js com backend e frontend"
git push origin main
```

### 2. No Vercel Dashboard
- Acesse https://vercel.com
- Clique "Add New Project"
- Selecione seu repositório
- Clique "Deploy"

**Pronto!** Seu projeto estará em `https://seu-projeto.vercel.app`

> Para instruções detalhadas, consulte [DEPLOY_VERCEL.md](DEPLOY_VERCEL.md)

## 📚 Documentação

- **[ARCHITECTURE.md](ARCHITECTURE.md)** - Estrutura completa do projeto
- **[DEPLOY_VERCEL.md](DEPLOY_VERCEL.md)** - Guia de deploy
- **[igreja-premium/README.md](igreja-premium/README.md)** - Documentação Next.js
- **[igreja-premium/.env.example](igreja-premium/.env.example)** - Variáveis de ambiente

## 🔄 Workflow Recomendado

1. **Desenvolvimento Local**
   ```bash
   npm run dev
   ```

2. **Build para Teste**
   ```bash
   npm run build
   npm start
   ```

3. **Push para GitHub**
   ```bash
   git push origin main
   ```

4. **Deploy Automático** (Vercel)
   - Feito automaticamente após push!

## ✨ Funcionalidades

- ✅ Interface moderna e responsiva
- ✅ Dashboard interativo com gráficos
- ✅ API RESTful para dados
- ✅ Componentes reutilizáveis
- ✅ Design Mobile-first
- ✅ Pronto para produção
- ✅ Configurado para Vercel

## 🔐 Variáveis de Ambiente

Crie um arquivo `.env.local` em `igreja-premium/`:

```bash
NODE_ENV=development
# Adicione outras variáveis conforme necessário
```

Veja [.env.example](igreja-premium/.env.example) para mais opções.

## 🛠️ Desenvolvimento

**Linting:**
```bash
npm run lint
```

**Build:**
```bash
npm run build
```

**Produção:**
```bash
npm start
```

## 📝 O que mudou

- ✅ Arquivos antigos removidos
- ✅ Estrutura reorganizada (Backend + Frontend)
- ✅ Rotas de API funcionais
- ✅ Configuração Vercel pronta
- ✅ Documentação completa
- ✅ Scripts de setup automatizados

## 🙏 Sobre

Projeto desenvolvido com carinho para fortalecer a presença digital da igleja, oferecendo uma experiência moderna, intuitiva e acolhedora.

---

**Pronto para colocar em produção!** 🚀✨
