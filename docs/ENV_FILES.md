# Файлы переменных окружения

## 📁 Структура файлов:

### `.env.local` (локальная разработка)
- Используется для локальной разработки
- Не коммитится в Git
- Использует `http://localhost:3000`

### `.env.production` (production на Vercel)
- Используется для production деплоя на `jobinsightai.vercel.app`
- Не коммитится в Git
- Использует `https://jobinsightai.vercel.app`

### `.env.example` (шаблон)
- Показывает какие переменные нужны
- Коммитится в Git (БЕЗ реальных значений)
- Используется как документация

## 🚀 Как использовать:

### Для локальной разработки:
```bash
# Файл .env.local уже настроен
npm run dev
```

### Для production на Vercel:
1. Скопируйте значения из `.env.production`
2. Добавьте в Vercel Dashboard → Settings → Environment Variables
3. Убедитесь что домен правильный: `https://jobinsightai.vercel.app`

## ⚠️ Важно:

- **НИКОГДА не коммитьте** `.env.local` или `.env.production` в Git
- Все эти файлы уже в `.gitignore`
- Для Vercel добавляйте переменные **вручную** через Dashboard

## 🔄 Обновление production переменных:

Если нужно обновить production переменные:
1. Обновите `.env.production` локально
2. Скопируйте новые значения в Vercel Dashboard
3. Передеплойте проект

