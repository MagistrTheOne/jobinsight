"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, CreditCard } from 'lucide-react';
import { PaymentMethodSelector } from './payment-method-selector';
import { useRouter } from 'next/navigation';

interface CheckoutButtonProps {
  plan: 'pro' | 'enterprise';
  className?: string;
}

export function CheckoutButton({ plan, className }: CheckoutButtonProps) {
  const [selectedMethod, setSelectedMethod] = useState<'polar' | 'yookassa' | null>(null);
  const [isCreatingPayment, setIsCreatingPayment] = useState(false);
  const router = useRouter();

  const handleCheckout = async () => {
    if (!selectedMethod) {
      // Если метод не выбран, показываем селектор
      setSelectedMethod('polar'); // Default
      return;
    }

    setIsCreatingPayment(true);

    try {
      if (selectedMethod === 'polar') {
        // Polar checkout (existing)
        const productId = process.env.NEXT_PUBLIC_POLAR_PRODUCT_ID || 'f61ce25c-5122-429f-8b2e-8c77d9380a84';
        window.location.href = `/api/checkout?products=${productId}`;
      } else if (selectedMethod === 'yookassa') {
        // YooKassa checkout
        const response = await fetch('/api/payments/yookassa/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ plan }),
        });

        const data = await response.json();

        if (data.success && data.confirmationUrl) {
          // Редирект на страницу оплаты YooKassa
          window.location.href = data.confirmationUrl;
        } else {
          throw new Error(data.message || 'Failed to create payment');
        }
      }
    } catch (error: any) {
      console.error('Checkout error:', error);
      alert(`Ошибка создания платежа: ${error.message}`);
    } finally {
      setIsCreatingPayment(false);
    }
  };

  return (
    <div className="space-y-4">
      {!selectedMethod ? (
        <>
          <PaymentMethodSelector
            plan={plan}
            onSelect={setSelectedMethod}
          />
          <Button
            onClick={handleCheckout}
            className={`w-full ${className || ''}`}
            disabled={isCreatingPayment}
          >
            {isCreatingPayment ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Создание платежа...
              </>
            ) : (
              <>
                <CreditCard className="mr-2 h-4 w-4" />
                Перейти к оплате
              </>
            )}
          </Button>
        </>
      ) : (
        <div className="space-y-3">
          <PaymentMethodSelector
            plan={plan}
            onSelect={setSelectedMethod}
            selectedMethod={selectedMethod}
          />
          <Button
            onClick={handleCheckout}
            className={`w-full ${className || ''}`}
            disabled={isCreatingPayment}
          >
            {isCreatingPayment ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Создание платежа...
              </>
            ) : (
              <>
                <CreditCard className="mr-2 h-4 w-4" />
                {selectedMethod === 'yookassa' ? 'Оплатить через ЮKassa' : 'Оплатить через Polar'}
              </>
            )}
          </Button>
          <Button
            variant="ghost"
            onClick={() => setSelectedMethod(null)}
            className="w-full"
            disabled={isCreatingPayment}
          >
            Выбрать другой способ
          </Button>
        </div>
      )}
    </div>
  );
}

