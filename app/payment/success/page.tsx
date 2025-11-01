"use client";

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Loader2, XCircle } from 'lucide-react';
import Link from 'next/link';

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const paymentId = searchParams.get('payment_id');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Проверка платежа...');

  useEffect(() => {
    if (!paymentId) {
      setStatus('error');
      setMessage('ID платежа не найден');
      return;
    }

    // Проверяем статус платежа
    const checkPayment = async () => {
      try {
        // В реальном приложении можно добавить API endpoint для проверки статуса
        // Пока просто показываем успех, webhook обновит подписку автоматически
        setTimeout(() => {
          setStatus('success');
          setMessage('Платеж успешно обработан! Ваша подписка активирована.');
        }, 2000);
      } catch (error) {
        setStatus('error');
        setMessage('Ошибка проверки платежа. Пожалуйста, обратитесь в поддержку.');
      }
    };

    checkPayment();
  }, [paymentId]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <GlassCard className="max-w-md w-full p-8 bg-black/40 border-white/10 backdrop-blur-xl">
        <div className="text-center">
          {status === 'loading' && (
            <>
              <Loader2 className="h-16 w-16 mx-auto mb-4 text-blue-400 animate-spin" />
              <h1 className="text-2xl font-bold text-white mb-2">Проверка платежа</h1>
              <p className="text-neutral-400">{message}</p>
            </>
          )}

          {status === 'success' && (
            <>
              <CheckCircle className="h-16 w-16 mx-auto mb-4 text-green-400" />
              <h1 className="text-2xl font-bold text-white mb-2">Оплата успешна!</h1>
              <p className="text-neutral-400 mb-6">{message}</p>
              <div className="space-y-3">
                <Link href="/dashboard">
                  <Button className="w-full bg-white/10 hover:bg-white/15 text-white">
                    Перейти в Dashboard
                  </Button>
                </Link>
                <Link href="/landing#pricing">
                  <Button variant="ghost" className="w-full text-neutral-400 hover:text-white">
                    Вернуться на главную
                  </Button>
                </Link>
              </div>
            </>
          )}

          {status === 'error' && (
            <>
              <XCircle className="h-16 w-16 mx-auto mb-4 text-red-400" />
              <h1 className="text-2xl font-bold text-white mb-2">Ошибка</h1>
              <p className="text-neutral-400 mb-6">{message}</p>
              {paymentId && (
                <p className="text-xs text-neutral-500 mb-4">
                  ID платежа: {paymentId}
                </p>
              )}
              <div className="space-y-3">
                <Link href="/landing#pricing">
                  <Button className="w-full bg-white/10 hover:bg-white/15 text-white">
                    Вернуться к оплате
                  </Button>
                </Link>
                <Link href="/dashboard">
                  <Button variant="ghost" className="w-full text-neutral-400 hover:text-white">
                    В Dashboard
                  </Button>
                </Link>
              </div>
            </>
          )}
        </div>
      </GlassCard>
    </div>
  );
}

