"use client";

import { useState } from 'react';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { CreditCard, Globe, CreditCard as RubIcon } from 'lucide-react';

interface PaymentMethod {
  id: 'polar' | 'yookassa';
  name: string;
  description: string;
  icon: React.ReactNode;
  available: boolean;
}

const paymentMethods: PaymentMethod[] = [
  {
    id: 'polar',
    name: 'International (Stripe/PayPal)',
    description: 'Pay with credit card via Polar',
    icon: <Globe className="h-5 w-5" />,
    available: true,
  },
  {
    id: 'yookassa',
    name: 'Российские банки (Сбер, Тинькофф и др.)',
    description: 'Оплата через ЮKassa (Яндекс.Касса)',
    icon: <RubIcon className="h-5 w-5" />,
    available: true,
  },
];

interface PaymentMethodSelectorProps {
  plan: 'pro' | 'enterprise';
  onSelect: (method: 'polar' | 'yookassa') => void;
  selectedMethod?: 'polar' | 'yookassa';
}

export function PaymentMethodSelector({ plan, onSelect, selectedMethod }: PaymentMethodSelectorProps) {
  return (
    <GlassCard className="p-6 bg-black/40 border-white/10 backdrop-blur-xl">
      <h3 className="text-lg font-semibold text-white mb-4">Выберите способ оплаты</h3>
      <div className="space-y-3">
        {paymentMethods.map((method) => (
          <button
            key={method.id}
            onClick={() => method.available && onSelect(method.id)}
            disabled={!method.available}
            className={`w-full p-4 rounded-lg border transition-all text-left ${
              selectedMethod === method.id
                ? 'border-white/30 bg-white/10'
                : 'border-white/10 bg-black/20 hover:border-white/20 hover:bg-white/5'
            } ${!method.available ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-md bg-white/5 border border-white/10">
                {method.icon}
              </div>
              <div className="flex-1">
                <div className="font-medium text-white text-sm">{method.name}</div>
                <div className="text-xs text-neutral-400 mt-0.5">{method.description}</div>
              </div>
              {selectedMethod === method.id && (
                <div className="h-4 w-4 rounded-full bg-white border-2 border-black" />
              )}
            </div>
          </button>
        ))}
      </div>
    </GlassCard>
  );
}

