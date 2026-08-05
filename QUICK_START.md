# 🚀 Guia Rápido - Comandos Úteis

## 📦 Instalação

### Windows
```bash
setup.bat
```

### macOS/Linux
```bash
./setup.sh
```

### Manual
```bash
cd igreja-premium
npm install
```

## 🔄 Desenvolvimento

```bash
cd igreja-premium

# Iniciar servidor de desenvolvimento
npm run dev

# Acessa: http://localhost:3000
```

## 🏗️ Build

```bash
cd igreja-premium

# Build para produção
npm run build

# Iniciar em produção
npm start

# Linting
npm run lint
```

## 📝 Git

```bash
# Ver status
git status

# Adicionar tudo
git add .

# Commit
git commit -m "Seu mensagem aqui"

# Push
git push origin main
```

## 🚀 Vercel Deploy

```bash
# 1. Commit suas mudanças
git add .
git commit -m "Nova atualização"
git push origin main

# 2. Acesse: https://vercel.com/dashboard
# 3. Clique "Add New Project"
# 4. Selecione seu repositório
# 5. Clique "Deploy"
```

## 🧪 Testar APIs Localmente

```bash
# Membros
curl http://localhost:3000/api/members

# Eventos
curl http://localhost:3000/api/events

# Ministérios
curl http://localhost:3000/api/ministries

# Health Check
curl http://localhost:3000/api/health
```

## 📊 Estrutura de Pastas

```
Igreja-1/
├── igreja-premium/              # Projeto Principal
│   ├── src/app/api/            # APIs (Backend)
│   ├── src/components/         # Componentes (Frontend)
│   ├── src/app/                # Páginas
│   ├── package.json
│   └── ...
├── README.md                   # Documentação
├── ARCHITECTURE.md             # Arquitetura
├── DEPLOY_VERCEL.md           # Deploy
├── setup.bat                   # Setup Windows
└── setup.sh                    # Setup macOS/Linux
```

## 🔑 Variáveis de Ambiente

Criar arquivo `igreja-premium/.env.local`:

```
NODE_ENV=development
```

Veja `igreja-premium/.env.example` para mais opções.

## 🆘 Problemas Comuns

### npm not found
- Instale Node.js em: https://nodejs.org/
- Reinicie o terminal após instalação

### Port 3000 em uso
```bash
# Use outra port
npm run dev -- -p 3001
```

### Build falha
```bash
# Limpe cache
rm -rf .next
npm run build
```

### Erro de dependências
```bash
# Reinstale
rm -rf node_modules package-lock.json
npm install
```

## 📚 Documentação Completa

- [README.md](README.md) - Overview completo
- [ARCHITECTURE.md](ARCHITECTURE.md) - Estrutura detalhada
- [DEPLOY_VERCEL.md](DEPLOY_VERCEL.md) - Guia de deploy
- [MUDANCAS.md](MUDANCAS.md) - O que mudou

## 🎯 Checklist de Deploy

- [ ] Instalar dependências (`setup.bat` ou `npm install`)
- [ ] Testar localmente (`npm run dev`)
- [ ] Fazer build (`npm run build`)
- [ ] Fazer commit de todas as mudanças
- [ ] Push para GitHub (`git push`)
- [ ] Conectar repositório no Vercel
- [ ] Deploy automático

---

**Tudo pronto! Comece com `setup.bat` ou `./setup.sh`** 🎉
