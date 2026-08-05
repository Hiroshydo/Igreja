# 🚀 Guia de Deploy na Vercel

## Configuração Automática

O projeto está totalmente configurado para deploy automático na Vercel.

### Pré-requisitos
- Conta no [Vercel](https://vercel.com)
- Repositório GitHub, GitLab ou Bitbucket
- Node.js 18+ instalado localmente

### Passos para Deploy

#### 1. Fazer Push do Código
```bash
git add .
git commit -m "Atualização: projeto reorganizado para Next.js com backend e frontend"
git push origin main
```

#### 2. No Vercel Dashboard

1. Acesse [https://vercel.com/dashboard](https://vercel.com/dashboard)
2. Clique em **"Add New Project"**
3. Selecione seu repositório
4. Configure os settings:
   - **Framework:** Next.js
   - **Root Directory:** `./igreja-premium/` (ou deixe automático)
   - **Build Command:** `npm run build`
   - **Output Directory:** `.next`

5. Clique em **"Deploy"**

#### 3. Variáveis de Ambiente (se necessário)

No Vercel Dashboard, vá para **Settings** → **Environment Variables** e adicione:

```
NODE_ENV=production
```

### Endpoints Disponíveis Após Deploy

Seu projeto estará disponível em:

- **Frontend:** `https://seu-projeto.vercel.app`
- **API Members:** `https://seu-projeto.vercel.app/api/members`
- **API Events:** `https://seu-projeto.vercel.app/api/events`
- **API Ministries:** `https://seu-projeto.vercel.app/api/ministries`
- **Health Check:** `https://seu-projeto.vercel.app/api/health`

### Testar Localmente Antes de Deploy

```bash
cd igreja-premium

# Instalar dependências
npm install

# Executar em desenvolvimento
npm run dev

# Build para produção (simular produção)
npm run build
npm start

# Acessar em: http://localhost:3000
```

### Problemas Comuns

#### Build falha
- Certifique-se de que `package.json` está em `igreja-premium/`
- Verifique se todas as dependências estão listadas

#### Endpoints não encontrados
- Verifique se os arquivos estão em `src/app/api/*/route.ts`
- Restart o servidor de desenvolvimento

#### Variáveis de ambiente não carregam
- Adicione `.env.local` em desenvolvimento
- Configure em **Settings** → **Environment Variables** na Vercel

### Monitoramento

Após deploy, você pode monitorar:

1. **Logs:** Vercel Dashboard → Deployments → View Functions
2. **Performance:** Vercel Analytics → Real Experience
3. **Erros:** Vercel Dashboard → Error Tracking

### Rollback (Voltar para versão anterior)

Se algo der errado:
1. Vercel Dashboard → Deployments
2. Clique no deployment anterior (✓)
3. Clique em **"Redeploy"**

---

**Seu projeto está pronto para o mundo! 🌍**
