# Скрипт для деплоя Chaletcoaching на Vercel

Write-Host "🚀 Chaletcoaching Deployment Script" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green

# Проверяем, что мы в правильной папке
if (!(Test-Path "package.json")) {
    Write-Error "❌ package.json не найден. Запустите скрипт из корня проекта."
    exit 1
}

Write-Host "✅ Найден package.json" -ForegroundColor Green

# Проверяем Git
if (!(Test-Path ".git")) {
    Write-Host "📁 Инициализируем Git репозиторий..." -ForegroundColor Yellow
    git init
}

# Проверяем статус Git
Write-Host "📊 Проверяем статус Git..." -ForegroundColor Yellow
git status --porcelain

# Добавляем только нужные файлы
Write-Host "📝 Добавляем файлы в Git..." -ForegroundColor Yellow
git add app/ components/ lib/ prisma/ public/ types/ *.json *.ts *.js *.md .gitignore

# Коммитим изменения
Write-Host "💾 Коммитим изменения..." -ForegroundColor Yellow
git commit -m "feat: remove payment methods, update port to 3001, prepare for production

- Remove Maestro, Amex, Apple Pay, Google Pay from footer
- Update dev port from 3000 to 3001
- Restore PostgreSQL configuration for production
- Clean up local development files
- Prepare for Vercel deployment"

# Настраиваем remote origin
Write-Host "🔗 Настраиваем remote origin..." -ForegroundColor Yellow
git remote remove origin 2>$null
git remote add origin https://github.com/aifitworld5/aifitworld.git

# Пушим на GitHub
Write-Host "🚀 Пушим на GitHub..." -ForegroundColor Yellow
git push -u origin main --force

Write-Host "✅ Деплой завершен!" -ForegroundColor Green
Write-Host "🌐 Проверьте статус деплоя в Vercel Dashboard" -ForegroundColor Cyan
Write-Host "📋 Не забудьте настроить переменные окружения:" -ForegroundColor Yellow
Write-Host "   - DATABASE_URL" -ForegroundColor White
Write-Host "   - NEXTAUTH_URL" -ForegroundColor White
Write-Host "   - NEXTAUTH_SECRET" -ForegroundColor White
Write-Host "   - OPENAI_API_KEY" -ForegroundColor White