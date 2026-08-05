#!/bin/bash

# Script de Setup para Comunidade Viva
# Instala dependências e prepara o projeto para desenvolvimento

echo ""
echo "========================================="
echo "Comunidade Viva - Setup Automatizado"
echo "========================================="
echo ""

cd "$(dirname "$0")/igreja-premium"

echo "Instalando dependências..."
npm install

if [ $? -ne 0 ]; then
    echo ""
    echo "ERRO: Falha ao instalar dependências"
    echo "Certifique-se de que Node.js e npm estão instalados"
    echo "Visite: https://nodejs.org/"
    exit 1
fi

echo ""
echo "Dependências instaladas com sucesso!"
echo ""
echo "========================================="
echo "Próximos passos:"
echo "========================================="
echo ""
echo "Para executar em desenvolvimento:"
echo "  npm run dev"
echo ""
echo "Para fazer build:"
echo "  npm run build"
echo ""
echo "Para iniciar em produção:"
echo "  npm start"
echo ""
