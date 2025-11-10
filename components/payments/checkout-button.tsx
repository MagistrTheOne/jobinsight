"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, CreditCard } from 'lucide-react';
import { PaymentMethodSelector } from './payment-method-selector';
import { useRouter } from 'next/navigation';
import { useTranslations } from '@/lib/i18n/use-translations';

interface CheckoutButtonProps {
  plan: 'pro' | 'enterprise';
  billingCycle?: 'monthly' | 'yearly';
  className?: string;
}

export function CheckoutButton({ plan, billingCycle = 'monthly', className }: CheckoutButtonProps) {
  const { t } = useTranslations();
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
          body: JSON.stringify({ plan, billingCycle }),
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
                {t('payments.creatingPayment')}
              </>
            ) : (
              <>
                <CreditCard className="mr-2 h-4 w-4" />
                {t('payments.checkout')}
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
                {t('payments.creatingPayment')}
              </>
            ) : (
              <>
                <CreditCard className="mr-2 h-4 w-4" />
                {selectedMethod === 'yookassa' ? t('payments.payWithYookassa') : t('payments.payWithPolar')}
              </>
            )}
          </Button>
          <Button
            variant="ghost"
            onClick={() => setSelectedMethod(null)}
            className="w-full"
            disabled={isCreatingPayment}
          >
{t('payments.chooseAnotherMethod')}
          </Button>
        </div>
      )}
    </div>
  );
}

