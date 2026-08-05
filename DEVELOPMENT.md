# 👨‍💻 Guia de Desenvolvimento

Boas práticas e padrões de desenvolvimento para o projeto Comunidade Viva.

## 🎯 Padrões de Código

### TypeScript

Sempre use tipos explícitos:

```typescript
// ✅ BOM
function getMember(id: string): Promise<Member | null> {
  // ...
}

// ❌ RUIM
function getMember(id) {
  // ...
}
```

### Componentes React

Use componentes funcionais com TypeScript:

```typescript
// ✅ BOM
interface ButtonProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

export function MyButton({ label, onClick, disabled }: ButtonProps) {
  return (
    <button onClick={onClick} disabled={disabled}>
      {label}
    </button>
  );
}

// ❌ RUIM
export const MyButton = ({ label, onClick }) => (
  <button onClick={onClick}>{label}</button>
);
```

### API Routes

```typescript
// ✅ BOM - Tipado e estruturado
import { NextRequest, NextResponse } from 'next/server';
import { Member } from '@/types';

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const members: Member[] = []; // Sua lógica aqui
    return NextResponse.json({
      success: true,
      data: members,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Erro ao buscar membros' },
      { status: 500 }
    );
  }
}
```

## 📁 Estrutura de Pastas

```
src/
├── app/                    # App Router (Next.js)
│   ├── api/               # API Routes
│   ├── layout.tsx         # Layout global
│   ├── page.tsx           # Homepage
│   └── globals.css        # Estilos globais
├── components/            # Componentes reutilizáveis
│   ├── ui/               # Componentes base de UI
│   ├── sections/         # Seções da página (futuro)
│   └── *-grid.tsx        # Componentes específicos
├── services/             # Serviços (API, DB, etc)
├── hooks/                # Hooks customizados
├── types/                # TypeScript interfaces
└── lib/                  # Funções auxiliares
```

## 🔄 Workflow de Desenvolvimento

### 1. Criar uma Feature

```bash
# 1. Crie uma branch
git checkout -b feature/nova-feature

# 2. Implemente a feature
# ... escreva código ...

# 3. Teste localmente
npm run dev

# 4. Faça commit
git add .
git commit -m "feat: descrição da feature"

# 5. Push
git push origin feature/nova-feature

# 6. Crie um Pull Request no GitHub
```

### 2. Mensagens de Commit

Use o padrão Conventional Commits:

```
feat: adiciona novo componente
fix: corrige bug no formulário
docs: atualiza documentação
style: formata código
refactor: refatora componente
test: adiciona testes
chore: atualiza dependências
```

### 3. Code Review

Antes de fazer merge:
- ✅ Código está formatado
- ✅ TypeScript sem erros
- ✅ Testes passando
- ✅ Documentação atualizada

## 🎨 Styles & CSS

### Tailwind CSS

Use classes Tailwind para estilos:

```typescript
// ✅ BOM
<div className="p-4 bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors">
  Conteúdo
</div>

// ❌ RUIM - CSS externo
import styles from './styles.module.css'
<div className={styles.container}>
```

### Cores do Projeto

```css
/* Primárias */
--amber-500: #f59e0b
--indigo-600: #4f46e5
--violet-600: #7c3aed

/* Fundo */
--slate-950: #030712
--slate-900: #0f172a
--slate-800: #1e293b
```

## 📚 Componentes Reutilizáveis

### Criar um novo componente

```typescript
// src/components/my-component.tsx
'use client';

import React from 'react';

interface MyComponentProps {
  title: string;
  children: React.ReactNode;
}

/**
 * Descrição do componente
 * @example
 * <MyComponent title="Exemplo">
 *   Conteúdo
 * </MyComponent>
 */
export function MyComponent({ title, children }: MyComponentProps) {
  return (
    <div>
      <h2>{title}</h2>
      {children}
    </div>
  );
}
```

## 🔌 Criar um novo Hook

```typescript
// src/hooks/useMyHook.ts
import { useState } from 'react';

/**
 * Hook para gerenciar estado de X
 * @returns [value, setValue]
 */
export function useMyHook(initialValue: string) {
  const [value, setValue] = useState(initialValue);
  
  return { value, setValue };
}
```

## 🌐 Criar uma nova API Route

```typescript
// src/app/api/my-endpoint/route.ts
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/my-endpoint
 * Descrição da rota
 */
export async function GET(request: NextRequest) {
  try {
    // Sua lógica aqui
    return NextResponse.json({ success: true, data: {} });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Erro' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/my-endpoint
 * Descrição da rota
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    // Sua lógica aqui
    return NextResponse.json(
      { success: true, data: {} },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Erro' },
      { status: 400 }
    );
  }
}
```

## 🧪 Teste Local

### Testar APIs

```bash
# Usando curl
curl http://localhost:3000/api/members

# Usando curl com POST
curl -X POST http://localhost:3000/api/members \
  -H "Content-Type: application/json" \
  -d '{"name":"João","email":"joao@email.com","joinDate":"2024-08-05","status":"ativo"}'
```

### Testar Build

```bash
npm run build
npm start
# Acesse http://localhost:3000
```

## 📝 Documentação

### Documenta suas funções

```typescript
/**
 * Busca membro pelo ID
 * @param id - ID do membro
 * @returns Promise com dados do membro
 * @throws Error se membro não encontrado
 */
export async function getMemberById(id: string): Promise<Member> {
  // ...
}
```

### Componentes no Storybook (futuro)

```typescript
/**
 * Botão customizado
 * @example
 * <MyButton label="Clique" onClick={() => {}} />
 */
```

## 🔐 Variáveis de Ambiente

### Desenvolvimento (.env.local)

```bash
NODE_ENV=development
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### Produção (Vercel)

Configure em **Settings → Environment Variables**

## 🚀 Performance

### Otimizações

1. **Code Splitting**
```typescript
import dynamic from 'next/dynamic';

const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <p>Carregando...</p>,
});
```

2. **Lazy Loading**
```typescript
<Image
  src="/image.jpg"
  alt="Descrição"
  loading="lazy"
/>
```

3. **Memoização**
```typescript
import { memo } from 'react';

const MyComponent = memo(function Component() {
  // ...
});
```

## 🧵 Dependências

### Adicionar nova dependência

```bash
npm install nome-do-pacote
npm install -D nome-do-pacote-dev
```

### Atualizar dependências

```bash
# Verificar atualizações
npm outdated

# Atualizar
npm update
```

## 🐛 Debugging

### Usar console.log

```typescript
// Em desenvolvimento
if (process.env.NODE_ENV === 'development') {
  console.log('Debug info:', data);
}

// Ou usar o logger melhorado
console.error('Erro:', error);
```

### Erros comuns

**Erro: "Cannot find module"**
- Verifique o import path
- Execute `npm install`

**Erro: "TypeScript error"**
- Verifique os tipos
- Use `npm run build` para ver todos os erros

## 📋 Checklist Antes de Deploy

- [ ] Código compilado sem erros
- [ ] TypeScript sem warnings
- [ ] Testes passando (quando disponível)
- [ ] `.env` configurado
- [ ] `vercel.json` atualizado
- [ ] Documentação atualizada
- [ ] Commit message clara
- [ ] Branch atualizada com main

## 🎓 Recursos

- [Next.js Docs](https://nextjs.org/docs)
- [React Docs](https://react.dev)
- [TypeScript Docs](https://www.typescriptlang.org)
- [Tailwind CSS](https://tailwindcss.com)
- [Vercel Docs](https://vercel.com/docs)

---

**Última atualização:** 2026-08-05
