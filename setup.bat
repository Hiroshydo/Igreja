@echo off
REM Script de Setup para Comunidade Viva
REM Instala dependências e prepara o projeto para desenvolvimento

echo.
echo =========================================
echo Comunidade Viva - Setup Automatizado
echo =========================================
echo.

cd /d "%~dp0\igreja-premium"

echo Instalando dependências...
call npm install

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERRO: Falha ao instalar dependências
    echo Certifique-se de que Node.js e npm estão instalados
    echo Visite: https://nodejs.org/
    pause
    exit /b 1
)

echo.
echo Dependências instaladas com sucesso!
echo.
echo =========================================
echo Próximos passos:
echo =========================================
echo.
echo Para executar em desenvolvimento:
echo   npm run dev
echo.
echo Para fazer build:
echo   npm run build
echo.
echo Para iniciar em produção:
echo   npm start
echo.
pause
