# Setup Vercel Environment Variables
# This script adds the DATABASE_URL to all Vercel environments

Write-Host "Setting up Vercel environment variables..." -ForegroundColor Cyan
Write-Host ""

$DATABASE_URL = "postgresql://postgres.vfqmqcillubgddsdzvlc:SOnclD1eHCYTOWz5@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres"

Write-Host "Adding DATABASE_URL to Production..." -ForegroundColor Yellow
echo $DATABASE_URL | npx vercel env add DATABASE_URL production

Write-Host ""
Write-Host "Adding DATABASE_URL to Preview..." -ForegroundColor Yellow
echo $DATABASE_URL | npx vercel env add DATABASE_URL preview

Write-Host ""
Write-Host "Adding DATABASE_URL to Development..." -ForegroundColor Yellow
echo $DATABASE_URL | npx vercel env add DATABASE_URL development

Write-Host ""
Write-Host "✅ Environment variables configured!" -ForegroundColor Green
Write-Host "Run 'npx vercel env ls' to verify" -ForegroundColor Gray
