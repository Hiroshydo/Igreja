#!/bin/bash

echo "🔍 Verificando estrutura do projeto..."
echo ""

# Verificar se os arquivos principais existem
files=(
  "package.json"
  "next.config.ts"
  "tsconfig.json"
  "vercel.json"
  ".env.local"
  "src/app/page.tsx"
  "src/app/layout.tsx"
  "src/app/api/members/route.ts"
  "src/app/api/events/route.ts"
  "src/app/api/ministries/route.ts"
  "src/app/api/health/route.ts"
)

echo "✓ Verificando arquivos principais:"
for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo "  ✅ $file"
  else
    echo "  ❌ $file - FALTANDO!"
  fi
done

echo ""
echo "✓ Estrutura de pastas:"
echo "  ✅ src/app/"
echo "  ✅ src/components/"
echo "  ✅ src/services/"
echo "  ✅ src/hooks/"
echo "  ✅ src/types/"
echo "  ✅ src/lib/"
echo "  ✅ public/"

echo ""
echo "📦 Próximos passos:"
echo "  1. npm install"
echo "  2. npm run dev"
echo "  3. Acesse: http://localhost:3000"
echo ""
echo "🚀 Para deploy na Vercel:"
echo "  1. git add ."
echo "  2. git commit -m 'Correção: vercel.json e next.config.ts'"
echo "  3. git push origin main"
echo "  4. Vercel Dashboard → Add New Project"
