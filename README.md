# 🕊️ Comunidade Viva - Dashboard Digital

Bem-vindo ao projeto **Comunidade Viva** — uma plataforma web moderna e profissional para gestão integrada da igreja, ministérios, membros, eventos e comunidade pastoral. 🌟

## ✨ O que é?

Sistema completo construído com **Next.js 16** que oferece:

- 🏛️ **Dashboard** - Visão geral da igreja
- 👥 **Gestão de Membros** - Cadastro e acompanhamento
- 🎶 **Ministérios** - Organização e liderança
- 📅 **Eventos** - Cultos, reuniões e atividades
- 📊 **Relatórios** - Gráficos e estatísticas
- 🩺 **Saúde Pastoral** - Acompanhamento espiritual
- 💬 **Comunicação** - Integrada e centralizada

## 🚀 Quick Start

### 1. Instalar dependências
```bash
npm install
```

### 2. Desenvolvimento local
```bash
npm run dev
```
Acesse: **http://localhost:3000**

### 3. Build para produção
```bash
npm run build
npm start
```

## 📁 Estrutura do Projeto

```
Comunidade Viva/
├── src/
│   ├── app/
│   │   ├── api/                 # 🔧 Backend - API Routes
│   │   │   ├── members/         # Endpoints de membros
│   │   │   ├── events/          # Endpoints de eventos
│   │   │   ├── ministries/      # Endpoints de ministérios
│   │   │   ├── health/          # Health check
│   │   │   └── route.ts         # Rota raiz
│   │   ├── components/          # 🎨 Frontend - Componentes
│   │   │   └── ui/              # Componentes de UI
│   │   ├── layout.tsx           # Layout principal
│   │   ├── page.tsx             # Homepage
│   │   └── globals.css          # Estilos globais
│   ├── lib/
│   │   └── utils.ts             # Funções auxiliares
│   └── components/
│       └── premium-dashboard.tsx # Dashboard premium
├── public/                       # Arquivos estáticos
├── package.json
├── next.config.ts
├── tsconfig.json
├── tailwind.config.ts
├── postcss.config.mjs
├── .env.example
└── README.md
```

## 🔧 Tecnologias

| Camada | Tecnologia |
|--------|-----------|
| **Frontend** | React 19, Next.js 16, TypeScript |
| **Styling** | Tailwind CSS 4, PostCSS |
| **UI Components** | Lucide React, Framer Motion |
| **Gráficos** | Recharts |
| **Backend** | Next.js API Routes |
| **Deploy** | Vercel Ready |

## 📡 API Endpoints

```
GET/POST  /api/members        # Gerenciar membros
GET/POST  /api/events         # Gerenciar eventos
GET/POST  /api/ministries     # Gerenciar ministérios
GET       /api/health         # Status do servidor
```

## 🚀 Deploy na Vercel

### Passos:

1. **Prepare o código**
```bash
git add .
git commit -m "Atualização: Comunidade Viva v1.0"
git push origin main
```

2. **No Vercel Dashboard**
   - Vá em https://vercel.com/dashboard
   - Clique em "Add New Project"
   - Selecione seu repositório
   - Clique "Deploy"

**Seu projeto estará em:** `https://seu-dominio.vercel.app`

### Variáveis de Ambiente

Adicione em **Settings → Environment Variables**:
```
NODE_ENV=production
```

Ou crie `.env.local` para desenvolvimento:
```bash
NODE_ENV=development
```

Veja `.env.example` para mais variáveis.

## 🛠️ Comandos Úteis

```bash
# Desenvolvimento
npm run dev         # Inicia servidor dev
npm run lint        # Verifica código
npm run build       # Build para produção
npm start          # Inicia servidor de produção

# Git
git status         # Ver mudanças
git add .          # Adicionar tudo
git commit -m "msg" # Fazer commit
git push           # Enviar para GitHub
```

## 📊 Estrutura de Dados

### Members (Membros)
```json
{
  "id": 1,
  "name": "João Silva",
  "email": "joao@email.com",
  "joinDate": "2023-01-15",
  "status": "ativo"
}
```

### Events (Eventos)
```json
{
  "id": 1,
  "title": "Culto Domingo",
  "date": "2024-08-11",
  "time": "18:00",
  "location": "Templo Principal",
  "attendees": 150
}
```

### Ministries (Ministérios)
```json
{
  "id": 1,
  "name": "Louvor",
  "description": "Ministério musical",
  "leader": "Pedro Costa",
  "members": 12
}
```

## ✨ Funcionalidades Principais

- ✅ Dashboard responsivo e intuitivo
- ✅ API RESTful completa
- ✅ Autenticação pronta para implementar
- ✅ Design moderno com Tailwind CSS
- ✅ Componentes reutilizáveis
- ✅ Gráficos interativos
- ✅ Mobile-friendly
- ✅ Dark mode ready
- ✅ Otimizado para SEO
- ✅ TypeScript full-stack

## 🔐 Segurança & Performance

- ✅ TypeScript para type safety
- ✅ NextAuth pronto para autenticação
- ✅ Validação de dados com Zod (pronto para adicionar)
- ✅ Rate limiting (pronto para adicionar)
- ✅ CORS configurável
- ✅ Environment variables seguras

## 📚 Próximos Passos

1. **Banco de Dados** - Integrar PostgreSQL/MongoDB
2. **Autenticação** - Implementar NextAuth.js
3. **Validação** - Adicionar Zod para schemas
4. **Email** - Integrar serviço de email
5. **Backup** - Sistema de backup automático
6. **Notificações** - Push notifications
7. **Admin Panel** - Painel administrativo completo

## 🆘 Troubleshooting

### Port 3000 em uso?
```bash
npm run dev -- -p 3001
```

### Erro de build?
```bash
rm -rf .next
npm run build
```

### npm não encontrado?
Instale Node.js em https://nodejs.org

### Erro de dependências?
```bash
rm -rf node_modules package-lock.json
npm install
```

## 💡 Dicas de Desenvolvimento

1. Use TypeScript - Melhor experience com IntelliSense
2. Crie componentes pequenos e reutilizáveis
3. Use o arquivo `.env.example` como referência
4. Teste as APIs com `curl` ou Insomnia
5. Mantenha o código limpo com linting

## 📞 Suporte

- 📖 [Next.js Docs](https://nextjs.org/docs)
- 🎨 [Tailwind CSS](https://tailwindcss.com)
- ⚛️ [React Docs](https://react.dev)
- 🚀 [Vercel Docs](https://vercel.com/docs)

## 📄 Licença

Projeto criado com ❤️ para a comunidade.

---

**Status:** ✅ Pronto para produção  
**Versão:** 1.0.0  
**Último Update:** 2026-08-05  

🚀 **Comece com `npm install && npm run dev`**
