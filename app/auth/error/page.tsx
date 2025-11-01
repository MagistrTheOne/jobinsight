"use client";

import { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Home, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const errorMessages: Record<string, string> = {
  Configuration: 'Произошла ошибка конфигурации сервера. Пожалуйста, попробуйте позже.',
  AccessDenied: 'У вас нет доступа. Пожалуйста, проверьте свои учетные данные.',
  Verification: 'Ссылка для верификации больше не действительна. Возможно, она уже была использована или истекла.',
  Default: 'Произошла ошибка при авторизации. Пожалуйста, попробуйте еще раз.',
};

function AuthErrorContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const error = searchParams.get('error') || 'Default';
  
  const errorMessage = errorMessages[error] || errorMessages.Default;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <GlassCard className="w-full max-w-md">
        <div className="space-y-6">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-white mb-2">Ошибка авторизации</h1>
            <p className="text-gray-400">Произошла проблема при попытке входа</p>
          </div>

          <Alert variant="destructive" className="bg-red-950/50 border-red-800/50">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-red-300">
              {errorMessage}
            </AlertDescription>
          </Alert>

          <div className="flex flex-col gap-3">
            <Link href="/auth/signin">
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                Попробовать снова
              </Button>
            </Link>
            
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => router.back()}
                className="flex-1 border-gray-700 text-gray-300 hover:bg-gray-800"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Назад
              </Button>
              
              <Link href="/landing" className="flex-1">
                <Button
                  variant="outline"
                  className="w-full border-gray-700 text-gray-300 hover:bg-gray-800"
                >
                  <Home className="mr-2 h-4 w-4" />
                  На главную
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    }>
      <AuthErrorContent />
    </Suspense>
  );
}

