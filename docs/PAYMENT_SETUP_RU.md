# Настройка платежных систем

## 📋 Как работает текущая система

### Polar (Международные платежи)

**Как работает:**
1. Пользователь нажимает "Start Free Trial" → редирект на `/api/checkout?products={PRODUCT_ID}`
2. Polar SDK создает checkout сессию
3. Пользователь оплачивает (Stripe, PayPal и др.)
4. Polar отправляет webhook на `/api/webhooks/polar`
5. Webhook обновляет подписку в БД

**Webhook события:**
- `checkout.succeeded` - подписка активирована
- `subscription.updated` - подписка продлена
- `subscription.cancelled` - подписка отменена

---

## 🇷🇺 Российские платежные системы

### YooKassa (Яндекс.Касса) - ✅ РЕАЛИЗОВАНО

**Поддерживаемые банки:**
- ✅ Сбербанк
- ✅ Тинькофф
- ✅ ВТБ
- ✅ Альфа-Банк
- ✅ ЮMoney
- ✅ QIWI
- ✅ И все остальные банки РФ

**Настройка:**

1. **Регистрация в YooKassa:**
   - Перейдите на https://yookassa.ru
   - Зарегистрируйте личный кабинет (ИП/ООО)
   - Получите Shop ID и Secret Key

2. **Добавьте в `.env.local`:**
   ```env
   YOOKASSA_SHOP_ID=your_shop_id
   YOOKASSA_SECRET_KEY=live_your_secret_key
   YOOKASSA_TEST_MODE=false
   YOOKASSA_SUCCESS_URL=https://yourdomain.com/payment/success?payment_id={PAYMENT_ID}
   ```

3. **Настройте webhook в YooKassa:**
   - URL: `https://yourdomain.com/api/webhooks/yookassa`
   - События: `payment.succeeded`, `payment.canceled`

**Как работает:**
1. Пользователь выбирает "Российские банки" → кликает "Оплатить"
2. API создает платеж через `/api/payments/yookassa/create`
3. Редирект на страницу оплаты YooKassa
4. Пользователь оплачивает через выбранный банк
5. YooKassa отправляет webhook на `/api/webhooks/yookassa`
6. Подписка активируется автоматически

**Цены (в рублях):**
- Pro: 749₽/месяц (~$9 USD)
- Enterprise: 4990₽/месяц (custom)

---

## 🛠 Технические детали

### Схема БД обновлена:

```sql
ALTER TABLE subscriptions ADD COLUMN payment_provider text;
ALTER TABLE subscriptions ADD COLUMN external_customer_id text;
ALTER TABLE subscriptions ADD COLUMN external_subscription_id text;
ALTER TABLE subscriptions ADD COLUMN last_payment_id text;
ALTER TABLE subscriptions ADD COLUMN last_payment_date timestamp;
```

### API Endpoints:

- `POST /api/payments/yookassa/create` - создать платеж
- `POST /api/webhooks/yookassa` - webhook от YooKassa
- `GET /payment/success` - страница успешной оплаты

### Компоненты:

- `components/payments/checkout-button.tsx` - кнопка оплаты с выбором метода
- `components/payments/payment-method-selector.tsx` - селектор метода оплаты

---

## 📝 TODO: Дополнительные платежные системы

### CloudPayments (опционально)

```typescript
// lib/payments/cloudpayments.ts
// Аналогичная реализация
```

### Тинькофф Pay (опционально)

```typescript
// lib/payments/tinkoff.ts
// Прямая интеграция через API Тинькофф
```

---

## 🔒 Безопасность

1. **Webhook верификация:** Проверка подписи от YooKassa
2. **Idempotency:** Защита от дублирования платежей
3. **HTTPS only:** Все webhook endpoints должны быть на HTTPS

---

## 🧪 Тестирование

1. **YooKassa Test Mode:**
   ```env
   YOOKASSA_TEST_MODE=true
   ```
   
2. **Тестовые карты:**
   - Сбербанк: `5555 5555 5555 4444` (срок: любая дата, CVC: любой)
   - Тинькофф: аналогично

3. **Тестовый webhook:**
   - Используйте https://webhook.site для тестирования webhooks

