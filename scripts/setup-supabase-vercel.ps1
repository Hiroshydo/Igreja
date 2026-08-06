param(
  [string]$ProjectRef = "drmfmfdgzfwzlajulujq"
)

$ErrorActionPreference = "Stop"

Write-Host "[1/6] Instalando dependencias do projeto..." -ForegroundColor Cyan
npm install

Write-Host "[2/6] Validando .env.local..." -ForegroundColor Cyan
if (!(Test-Path ".env.local")) {
  throw ".env.local nao encontrado."
}

$envFile = Get-Content ".env.local"
function Get-EnvValue([string]$name) {
  $line = $envFile | Where-Object { $_ -like "$name=*" } | Select-Object -First 1
  if ($null -eq $line) { return $null }
  return $line.Substring($name.Length + 1)
}

$supabaseUrl = Get-EnvValue "NEXT_PUBLIC_SUPABASE_URL"
$publishableKey = Get-EnvValue "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"
$secretKey = Get-EnvValue "SUPABASE_SECRET_KEY"

if ([string]::IsNullOrWhiteSpace($supabaseUrl) -or [string]::IsNullOrWhiteSpace($publishableKey) -or [string]::IsNullOrWhiteSpace($secretKey)) {
  throw "Variaveis Supabase incompletas em .env.local"
}

Write-Host "[3/6] Aplicando migrations no Supabase (requer login)..." -ForegroundColor Cyan
npx supabase link --project-ref $ProjectRef
npx supabase db push

Write-Host "[4/6] Vinculando projeto na Vercel (requer login)..." -ForegroundColor Cyan
npx vercel link --yes

Write-Host "[5/6] Enviando variaveis de ambiente para Vercel..." -ForegroundColor Cyan
$publishableKey | npx vercel env add NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY production
$publishableKey | npx vercel env add NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY preview
$publishableKey | npx vercel env add NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY development

$supabaseUrl | npx vercel env add NEXT_PUBLIC_SUPABASE_URL production
$supabaseUrl | npx vercel env add NEXT_PUBLIC_SUPABASE_URL preview
$supabaseUrl | npx vercel env add NEXT_PUBLIC_SUPABASE_URL development

$secretKey | npx vercel env add SUPABASE_SECRET_KEY production
$secretKey | npx vercel env add SUPABASE_SECRET_KEY preview
$secretKey | npx vercel env add SUPABASE_SECRET_KEY development

Write-Host "[6/6] Publicando na Vercel..." -ForegroundColor Cyan
npx vercel --prod --yes

Write-Host "Concluido. Abra o dominio gerado e teste login DEV." -ForegroundColor Green
