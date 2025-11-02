# Настройка переменных окружения на Vercel

## 📋 Важно понимать:

- **`.env.local`** - ваш локальный файл с реальными ключами (НЕ коммитится в Git)
- **`.env.example`** - шаблон/пример, показывает какие переменные нужны (БЕЗ реальных значений)
- **Vercel Dashboard** - где нужно вручную добавить все переменные

## 🚀 Как добавить переменные на Vercel:

### Шаг 1: Откройте настройки проекта
1. Зайдите на https://vercel.com
2. Выберите ваш проект `jobinsight`
3. Перейдите в **Settings** → **Environment Variables**

### Шаг 2: Добавьте все переменные из `.env.local`

Скопируйте каждую переменную из вашего `.env.local`:

#### 1. GigaChat API:
```
GIGACHAT_CLIENT_ID=0199824b-4c1e-7ef1-b423-bb3156ddecee
GIGACHAT_CLIENT_SECRET=46991ceb-e831-4b1a-b63a-25d18a37d5c7
GIGACHAT_AUTHORIZATION_KEY=MDE5OTgyNGItNGMxZS03ZWYxLWI0MjMtYmIzMTU2ZGRlY2VlOjQ2OTkxY2ViLWU4MzEtNGIxYS1iNjNhLTI1ZDE4YTM3ZDVjNw==
GIGACHAT_OAUTH_URL=https://ngw.devices.sberbank.ru:9443/api/v2/oauth
GIGACHAT_API_URL=https://gigachat.devices.sberbank.ru/api/v1
GIGACHAT_SCOPE=GIGACHAT_API_PERS
```

#### 2. Better Auth:
```
BETTER_AUTH_SECRET=QZaSDiGGyKZEpccjdtjMfVcCOZws2UwK
```
✅ **Автоматически**: `VERCEL_URL` устанавливается автоматически Vercel для всех деплоев (production, preview, branch)
⚠️ **Важно**: `BETTER_AUTH_URL` теперь **опциональный** - будет автоматически определяться из `VERCEL_URL`
📝 **Примечание**: `NEXT_PUBLIC_BETTER_AUTH_URL` НЕ устанавливаем - клиент использует `window.location.origin`

#### 3. OAuth Providers:
```
GITHUB_CLIENT_ID=Ov23lioxLaAh8gksFUQS
GITHUB_CLIENT_SECRET=930b7c37256715128c40548e04594c69ed050d77
GOOGLE_CLIENT_ID=43832583541-63bjlcm30gs72vovq3c5ek6mbaiamlbc.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
```

#### 4. Database:
```
DATABASE_URL=postgresql://neondb_owner:npg_JcElX0LQUTP9@ep-winter-rain-ah8sz7lb-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

#### 5. Polar Payment:
```
POLAR_ACCESS_TOKEN=polar_oat_gKUcbTCfoeDpo6hXKagkjsIf8VRhe8BQpwiKi0kd4LL
POLAR_PRODUCT_ID=f61ce25c-5122-429f-8b2e-8c77d9380a84
POLAR_SUCCESS_URL=https://your-app.vercel.app/checkout/success?checkout_id={CHECKOUT_ID}
NEXT_PUBLIC_POLAR_PRODUCT_ID=f61ce25c-5122-429f-8b2e-8c77d9380a84
```
⚠️ Замените `your-app.vercel.app` на реальный домен!

#### 6. YooKassa (если настроили):
```
YOOKASSA_SHOP_ID=your_shop_id
YOOKASSA_SECRET_KEY=live_your_secret_key
YOOKASSA_TEST_MODE=false
YOOKASSA_SUCCESS_URL=https://your-app.vercel.app/payment/success?payment_id={PAYMENT_ID}
```

### Шаг 3: Выберите окружения

Для каждой переменной выберите:
- ✅ **Production** - для production деплоя
- ✅ **Preview** - для preview/PR деплоев
- ✅ **Development** - (опционально)

### Шаг 4: После добавления переменных

1. Нажмите **Save**
2. Передеплойте проект (Redeploy)
   - Или просто сделайте новый commit и push

## ⚠️ Важные замечания:

1. **`.env.local` НЕ должен быть в Git** (он уже в `.gitignore`)
2. **`.env.example`** - это просто шаблон, его НЕ нужно импортировать
3. **Все переменные добавляются ВРУЧНУЮ** через Vercel Dashboard
4. **Используйте HTTPS URLs** для production (не `http://localhost:3000`)

## 🔍 Проверка:

После добавления переменных и передеплоя, проверьте:
- Логи сборки на Vercel должны быть успешными
- Приложение должно работать на production домене

## 📝 Примечание про OAuth Redirect URLs:

Убедитесь, что в настройках OAuth провайдеров (GitHub, Google) добавлены правильные redirect URLs:
- `https://your-app.vercel.app/api/auth/callback/github`
- `https://your-app.vercel.app/api/auth/callback/google`

