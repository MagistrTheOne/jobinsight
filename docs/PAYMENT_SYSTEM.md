# Система оплаты JobInsight

## 📊 Текущая система (Polar)

### Как работает Polar:

1. **Инициализация платежа:**
   - Пользователь нажимает "Start Free Trial" на странице Pricing
   - Клиент отправляет GET запрос на `/api/checkout?products={PRODUCT_ID}`
   - Polar SDK создает checkout сессию и редиректит на страницу оплаты Polar

2. **Обработка платежа:**
   - Пользователь оплачивает через Polar (Stripe, PayPal и др.)
   - После успешной оплаты Polar отправляет webhook на `/api/webhooks/polar`

3. **Webhook события:**
   - `checkout.succeeded` - новая подписка активирована
   - `subscription.updated` - подписка обновлена (например, продлена)
   - `subscription.cancelled` - подписка отменена

4. **Обновление в БД:**
   - Webhook находит пользователя по email
   - Создает/обновляет запись в таблице `subscriptions`
   - Сохраняет `polarCustomerId` и `polarSubscriptionId` для связи

5. **Использование:**
   - При каждом запросе проверяется подписка через `checkUsageLimit()`
   - Pro/Enterprise пользователи имеют безлимитный доступ
   - Free пользователи ограничены (5 анализов резюме, 5 вакансий, 2 письма)

### Структура данных:

```typescript
subscriptions {
  id: UUID
  userId: UUID (unique)
  plan: "free" | "pro" | "enterprise"
  status: "active" | "cancelled" | "expired"
  polarCustomerId: string | null
  polarSubscriptionId: string | null
  currentPeriodStart: Date | null
  currentPeriodEnd: Date | null
}
```

---

## 🇷🇺 Интеграция с российскими банками

### Рекомендуемые решения:

1. **ЮKassa (Яндекс.Касса)** - ✅ РЕКОМЕНДУЕТСЯ
   - Поддерживает все основные банки РФ
   - Рекуррентные платежи (подписки)
   - Возвраты
   - Webhooks для уведомлений

2. **CloudPayments**
   - Альтернативный вариант
   - Поддержка рекуррентных платежей
   - Хорошая документация

3. **Тинькофф Pay**
   - Собственный API от Тинькофф
   - Прямая интеграция без посредников

### Предлагаемая архитектура:

1. Добавить в схему БД поддержку нескольких платежных систем
2. Создать унифицированный интерфейс для обработки платежей
3. Добавить выбор метода оплаты в UI
4. Реализовать webhook handlers для каждой системы

