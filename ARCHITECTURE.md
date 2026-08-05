# 🏛️ Comunidade Viva - Estrutura do Projeto

## 📂 Organização da Estrutura

```
Igreja-1/
├── igreja-premium/          # Projeto principal (Next.js)
│   ├── src/
│   │   ├── app/
│   │   │   ├── api/         # 🔧 BACKEND - Rotas de API
│   │   │   │   ├── members/      # Endpoints para membros
│   │   │   │   ├── events/       # Endpoints para eventos/cultos
│   │   │   │   ├── ministries/   # Endpoints para ministérios
│   │   │   │   └── health/       # Health check
│   │   │   ├── layout.tsx   # Layout principal
│   │   │   ├── page.tsx     # Página inicial
│   │   │   └── globals.css  # Estilos globais
│   │   ├── components/      # 🎨 FRONTEND - Componentes React
│   │   │   ├── premium-dashboard.tsx
│   │   │   └── ui/         # Componentes UI reutilizáveis
│   │   └── lib/            # Utilitários e helpers
│   ├── package.json
│   ├── next.config.ts
│   └── tsconfig.json
├── vercel.json             # Configuração de deploy
└── README.md              # Este arquivo
```

## 🎯 Funcionalidades

### Frontend (Componentes React)
- Dashboard responsivo e moderno
- Navegação intuitiva
- Componentes reutilizáveis com Tailwind CSS
- Interface com Lucide Icons
- Gráficos com Recharts

### Backend (API Routes)
- `GET/POST /api/members` - Gestão de membros
- `GET/POST /api/events` - Gestão de eventos/cultos
- `GET/POST /api/ministries` - Gestão de ministérios
- `GET /api/health` - Health check

## 🚀 Como Executar Localmente

```bash
# Instalar dependências
cd igreja-premium
npm install

# Executar em desenvolvimento
npm run dev

# Acessar em: http://localhost:3000

# Build para produção
npm run build
npm start
```

## 📡 Deploy na Vercel

O projeto está configurado para deploy automático:

1. Conecte seu repositório no [Vercel](https://vercel.com)
2. Configure as variáveis de ambiente (se necessário)
3. O `vercel.json` na raiz configura o build automaticamente

**Endpoints após deploy:**
- Frontend: `https://seu-dominio.vercel.app`
- API: `https://seu-dominio.vercel.app/api/*`

## 🔧 Tecnologias Utilizadas

- **Frontend:** React 19, Next.js 16, TypeScript
- **UI:** Tailwind CSS, Lucide React, Framer Motion
- **Gráficos:** Recharts
- **Backend:** Next.js API Routes
- **Deploy:** Vercel

## 📝 Próximos Passos

- [ ] Conectar com banco de dados (PostgreSQL, MongoDB, etc.)
- [ ] Implementar autenticação
- [ ] Adicionar validação de dados
- [ ] Criar dashboard administrativo
- [ ] Integrar email para notificações
- [ ] Adicionar autenticação de usuários
- [ ] Implementar sistema de permissões

## 🙏 Estrutura Organizada

A estrutura agora está limpa e organizada:
- ✅ Arquivos antigos removidos
- ✅ Backend e Frontend separados logicamente
- ✅ Rotas de API funcionais e documentadas
- ✅ Configuração Vercel pronta
- ✅ Componentes reutilizáveis

---

**Pronto para produção!** 🚀
