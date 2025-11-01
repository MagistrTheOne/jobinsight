/**
 * YooKassa (Яндекс.Касса) Payment Integration
 * Поддерживает: Сбербанк, Тинькофф, ВТБ, Альфа-Банк и другие российские банки
 * 
 * Документация: https://yookassa.ru/developers/api
 */

import axios from 'axios';
import crypto from 'crypto';

interface YooKassaConfig {
  shopId: string;
  secretKey: string;
  isTestMode?: boolean;
}

interface CreatePaymentRequest {
  amount: {
    value: string; // "9.00"
    currency: "RUB";
  };
  description: string;
  confirmation: {
    type: "redirect";
    return_url: string; // URL для возврата после оплаты
  };
  capture: boolean; // true - списать сразу, false - только зарезервировать
  metadata?: {
    userId?: string;
    email?: string;
    plan?: string;
  };
  receipt?: {
    customer: {
      email: string;
    };
    items: Array<{
      description: string;
      quantity: string;
      amount: {
        value: string;
        currency: "RUB";
      };
      vat_code: number; // НДС код (1 = НДС 20%)
    }>;
  };
}

interface PaymentResponse {
  id: string;
  status: "pending" | "waiting_for_capture" | "succeeded" | "canceled";
  amount: {
    value: string;
    currency: string;
  };
  description: string;
  recipient: {
    account_id: string;
    gateway_id: string;
  };
  created_at: string;
  confirmation: {
    type: string;
    confirmation_url: string;
  };
  metadata?: Record<string, string>;
}

interface CreateSubscriptionRequest {
  amount: {
    value: string;
    currency: "RUB";
  };
  description: string;
  metadata: {
    userId: string;
    email: string;
    plan: string;
  };
}

export class YooKassaPayment {
  private config: YooKassaConfig;
  private baseUrl: string;

  constructor(config: YooKassaConfig) {
    this.config = config;
    this.baseUrl = config.isTestMode
      ? 'https://api.yookassa.ru/v3'
      : 'https://api.yookassa.ru/v3';
  }

  /**
   * Создать одноразовый платеж
   */
  async createPayment(data: CreatePaymentRequest): Promise<PaymentResponse> {
    const idempotenceKey = crypto.randomUUID();

    try {
      const response = await axios.post<PaymentResponse>(
        `${this.baseUrl}/payments`,
        data,
        {
          headers: {
            'Idempotence-Key': idempotenceKey,
            'Content-Type': 'application/json',
          },
          auth: {
            username: this.config.shopId,
            password: this.config.secretKey,
          },
        }
      );

      return response.data;
    } catch (error: any) {
      console.error('YooKassa payment creation error:', error.response?.data || error.message);
      throw new Error(`Failed to create payment: ${error.response?.data?.description || error.message}`);
    }
  }

  /**
   * Создать рекуррентный платеж (подписку)
   * Для рекуррентных платежей нужно сначала создать платеж с save_payment_method=true,
   * а затем использовать сохраненный метод для последующих платежей
   */
  async createSubscription(data: CreateSubscriptionRequest): Promise<PaymentResponse> {
    const baseUrl = process.env.NEXTAUTH_URL || process.env.BETTER_AUTH_URL || 'http://localhost:3000';
    const returnUrl = process.env.YOOKASSA_SUCCESS_URL?.replace('{PAYMENT_ID}', '{PAYMENT_ID}') || 
      `${baseUrl}/payment/success?payment_id={PAYMENT_ID}`;

    return this.createPayment({
      amount: data.amount,
      description: data.description,
      confirmation: {
        type: 'redirect',
        return_url: returnUrl,
      },
      capture: true,
      metadata: data.metadata,
      receipt: {
        customer: {
          email: data.metadata.email,
        },
        items: [
          {
            description: data.description,
            quantity: "1",
            amount: data.amount,
            vat_code: 1, // НДС 20%
          },
        ],
      },
    });
  }

  /**
   * Проверить статус платежа
   */
  async getPayment(paymentId: string): Promise<PaymentResponse> {
    try {
      const response = await axios.get<PaymentResponse>(
        `${this.baseUrl}/payments/${paymentId}`,
        {
          auth: {
            username: this.config.shopId,
            password: this.config.secretKey,
          },
        }
      );

      return response.data;
    } catch (error: any) {
      console.error('YooKassa get payment error:', error.response?.data || error.message);
      throw new Error(`Failed to get payment: ${error.response?.data?.description || error.message}`);
    }
  }

  /**
   * Верифицировать webhook подпись
   */
  verifyWebhookSignature(body: string, signature: string): boolean {
    try {
      const decodedSignature = Buffer.from(signature, 'base64').toString('utf-8');
      const hmac = crypto.createHmac('sha256', this.config.secretKey);
      hmac.update(body);
      const calculatedSignature = hmac.digest('hex');
      
      return crypto.timingSafeEqual(
        Buffer.from(calculatedSignature),
        Buffer.from(decodedSignature)
      );
    } catch (error) {
      console.error('Webhook signature verification error:', error);
      return false;
    }
  }

  /**
   * Обработать webhook от YooKassa
   */
  parseWebhook(body: any): {
    type: string;
    event: string;
    object: PaymentResponse;
  } {
    return {
      type: body.type || 'notification',
      event: body.event || 'payment.succeeded',
      object: body.object,
    };
  }
}

// Singleton instance
let yookassaInstance: YooKassaPayment | null = null;

export function getYooKassaInstance(): YooKassaPayment {
  if (!yookassaInstance) {
    const shopId = process.env.YOOKASSA_SHOP_ID;
    const secretKey = process.env.YOOKASSA_SECRET_KEY;

    if (!shopId || !secretKey) {
      throw new Error('YooKassa credentials not configured. Please set YOOKASSA_SHOP_ID and YOOKASSA_SECRET_KEY');
    }

    yookassaInstance = new YooKassaPayment({
      shopId,
      secretKey,
      isTestMode: process.env.YOOKASSA_TEST_MODE === 'true',
    });
  }

  return yookassaInstance;
}

