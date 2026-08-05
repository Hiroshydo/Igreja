# 📌 Quick Reference - Comunidade Viva

Referência rápida de comandos e estrutura.

## 🚀 Comandos Essenciais

```bash
# Instalar dependências
npm install

# Desenvolvimento
npm run dev              # http://localhost:3000

# Build
npm run build           # Gera .next/
npm start              # Inicia servidor de produção

# Linting
npm run lint           # Verifica código

# Git
git status             # Ver mudanças
git add .              # Adicionar tudo
git commit -m "msg"    # Fazer commit
git push origin main   # Enviar para GitHub
```

## 📁 Estrutura de Pastas Rápida

```
src/
├── app/
│   ├── api/            # API Routes (backend)
│   ├── layout.tsx      # Layout principal
│   ├── page.tsx        # Homepage
│   └── globals.css     # Estilos globais
├── components/         # Componentes React
├── services/          # Serviços (API client)
├── hooks/             # Hooks customizados
├── types/             # Interfaces TypeScript
└── lib/               # Funções auxiliares
```

## 🔧 Tecnologias Stack

```
Frontend: React 19 + Next.js 16
Styling: Tailwind CSS 4
UI: Lucide React, Framer Motion
Backend: Next.js API Routes
Deploy: Vercel
```

## 📡 API Endpoints

```
GET  /api/members                  → Listar membros
POST /api/members                  → Criar membro

GET  /api/events                   → Listar eventos
POST /api/events                   → Criar evento

GET  /api/ministries               → Listar ministérios
POST /api/ministries               → Criar ministério

GET  /api/health                   → Health check
```

## 🎨 Componentes Principais

```typescript
// Componentes disponíveis
<MembersGrid />           // Grid de membros
<EventsList />            // Lista de eventos
<MinistriesGrid />        // Grid de ministérios
<DashboardStats />        // Cartões de stats
<PremiumDashboard />      // Dashboard completo
```

## 🔗 Hooks Customizados

```typescript
// Fazer requisição à API
const { data, loading, error } = useApi(memberService.getAll);

// Gerenciar formulário
const form = useForm({ name: '', email: '' });

// Responsividade
const isMobile = useMediaQuery('(max-width: 768px)');

// Tema escuro
const { isDark, toggle } = useDarkMode();

// Debounce
const debouncedValue = useDebounce(searchValue, 500);

// LocalStorage
const [saved, setSaved] = useLocalStorage('key', defaultValue);
```

## 🎯 Tipos TypeScript

```typescript
import {
  Member,
  Event,
  Ministry,
  DashboardStats,
  ApiResponse,
  HealthStatus
} from '@/types';
```

## 📊 Estrutura de Dados

### Member
```json
{
  "id": 1,
  "name": "João Silva",
  "email": "joao@email.com",
  "phone": "(11) 98765-4321",
  "joinDate": "2023-01-15",
  "status": "ativo"
}
```

### Event
```json
{
  "id": 1,
  "title": "Culto Domingo",
  "date": "2024-08-11",
  "time": "18:00",
  "location": "Templo Principal",
  "category": "culto"
}
```

### Ministry
```json
{
  "id": 1,
  "name": "Louvor",
  "description": "Ministério musical",
  "leader": "Pedro Costa",
  "members": 12
}
```

## 🌐 Variáveis de Ambiente

```bash
# .env.local
NODE_ENV=development
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## 🔄 Importações Comuns

```typescript
// React
import React, { useState } from 'react';

// Next.js
import { NextRequest, NextResponse } from 'next/server';
import Link from 'next/link';
import Image from 'next/image';

// Componentes UI
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

// Serviços
import { memberService, eventService, ministryService } from '@/services/api';

// Hooks
import { useApi, useForm, useDarkMode } from '@/hooks';

// Tipos
import { Member, Event, Ministry } from '@/types';

// Lucide Icons
import { Users, Calendar, Music, ChevronRight } from 'lucide-react';

// Recharts
import { LineChart, BarChart, PieChart, ResponsiveContainer } from 'recharts';

// Framer Motion
import { motion, AnimatePresence } from 'framer-motion';
```

## 🐛 Troubleshooting Rápido

| Problema | Solução |
|----------|---------|
| Port 3000 em uso | `npm run dev -- -p 3001` |
| Build falha | `rm -rf .next && npm run build` |
| npm não encontrado | Instale Node.js |
| Dependências com erro | `rm -rf node_modules && npm install` |
| TypeScript erro | Verifique tipos em `src/types` |

## 📚 Documentação

| Arquivo | Descrição |
|---------|-----------|
| `README.md` | Overview completo |
| `DEVELOPMENT.md` | Guia de desenvolvimento |
| `DATA_STRUCTURE.md` | Estrutura de dados esperada |
| `CHANGELOG.md` | Histórico de mudanças |
| `vercel.json` | Configuração de deploy |

## 🚀 Deploy Vercel

```bash
# 1. Push para GitHub
git add .
git commit -m "Nova feature"
git push origin main

# 2. No Vercel Dashboard (https://vercel.com)
# - Clique "Add New Project"
# - Selecione repositório
# - Deploy automático!
```

## 🎓 Links Úteis

- [Next.js Docs](https://nextjs.org/docs)
- [React Docs](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [TypeScript](https://www.typescriptlang.org)
- [Vercel Docs](https://vercel.com/docs)

---

**Versão:** 1.0.0  
**Última atualização:** 2026-08-05
