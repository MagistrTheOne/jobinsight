"use client";

import Link from 'next/link';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Cookie, Settings, Shield, BarChart3, Target } from 'lucide-react';

export default function CookiePolicy() {
  return (
    <div className="min-h-screen bg-[#0b0b0b] text-white overflow-safe">
      <div className="container-global py-8 lg:py-16">
        {/* Header */}
        <div className="mb-8 lg:mb-12">
          <Link href="/landing">
            <Button variant="ghost" className="mb-4 text-neutral-400 hover:text-white">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Назад на главную
            </Button>
          </Link>
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-orange-600/10 border border-orange-500/20 mb-4">
              <Cookie className="h-8 w-8 text-orange-400" />
            </div>
            <h1 className="text-3xl lg:text-4xl font-bold mb-2">Политика использования cookies</h1>
            <p className="text-neutral-400 max-w-2xl mx-auto">
              Информация о том, как мы используем cookies и аналогичные технологии для улучшения вашего опыта использования платформы.
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto space-y-6">
          <GlassCard className="p-6 lg:p-8">
            <div className="space-y-8">
              {/* Effective Date */}
              <div className="border-b border-neutral-800/50 pb-4">
                <p className="text-sm text-neutral-500">
                  <strong>Дата вступления в силу:</strong> 1 января 2025 года
                </p>
              </div>

              {/* Section 1 */}
              <section>
                <div className="flex items-start gap-3 mb-4">
                  <Cookie className="h-6 w-6 text-orange-400 mt-1 shrink-0" />
                  <div>
                    <h2 className="text-xl font-semibold mb-3">1. Что такое cookies</h2>
                    <div className="space-y-4 text-neutral-300 leading-relaxed">
                      <p>
                        Cookies — это небольшие текстовые файлы, которые сохраняются на вашем устройстве при посещении веб-сайтов.
                        Они помогают сайтам запоминать ваши предпочтения и улучшать пользовательский опыт.
                      </p>
                      <p>
                        Мы используем cookies и аналогичные технологии (веб-маяки, пиксельные теги, локальное хранилище) для различных целей.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Section 2 */}
              <section>
                <div className="flex items-start gap-3 mb-4">
                  <Settings className="h-6 w-6 text-blue-400 mt-1 shrink-0" />
                  <div>
                    <h2 className="text-xl font-semibold mb-3">2. Типы cookies, которые мы используем</h2>
                    <div className="space-y-6 text-neutral-300 leading-relaxed">
                      <div>
                        <h3 className="font-medium text-white mb-3 flex items-center gap-2">
                          <Shield className="h-4 w-4 text-green-400" />
                          Необходимые cookies
                        </h3>
                        <p className="mb-2">Эти cookies необходимы для работы нашего сервиса:</p>
                        <ul className="space-y-1 ml-4 text-sm">
                          <li>• Аутентификация и безопасность</li>
                          <li>• Управление сессиями</li>
                          <li>• Запоминание настроек языка</li>
                          <li>• CSRF-защита</li>
                        </ul>
                      </div>

                      <div>
                        <h3 className="font-medium text-white mb-3 flex items-center gap-2">
                          <BarChart3 className="h-4 w-4 text-purple-400" />
                          Аналитические cookies
                        </h3>
                        <p className="mb-2">Помогают нам понимать, как пользователи взаимодействуют с платформой:</p>
                        <ul className="space-y-1 ml-4 text-sm">
                          <li>• Количество посещений страниц</li>
                          <li>• Время, проведенное на сайте</li>
                          <li>• Популярные функции</li>
                          <li>• Источники трафика</li>
                        </ul>
                      </div>

                      <div>
                        <h3 className="font-medium text-white mb-3 flex items-center gap-2">
                          <Target className="h-4 w-4 text-pink-400" />
                          Функциональные cookies
                        </h3>
                        <p className="mb-2">Улучшают функциональность и персонализируют опыт:</p>
                        <ul className="space-y-1 ml-4 text-sm">
                          <li>• Запоминание темы (светлая/темная)</li>
                          <li>• Сохранение предпочтений интерфейса</li>
                          <li>• Персонализация контента</li>
                          <li>• Предыдущие взаимодействия</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Section 3 */}
              <section>
                <h2 className="text-xl font-semibold mb-3">3. Cookies третьих сторон</h2>
                <div className="space-y-4 text-neutral-300 leading-relaxed">
                  <p>
                    Мы можем использовать сервисы третьих сторон, которые устанавливают свои cookies:
                  </p>
                  <div className="bg-neutral-900/30 rounded-lg p-4 border border-neutral-800/50">
                    <h3 className="font-medium text-white mb-2">Поставщики услуг:</h3>
                    <ul className="space-y-2 ml-4">
                      <li>• <strong>Платежные системы:</strong> Для обработки платежей</li>
                      <li>• <strong>Аналитика:</strong> Для отслеживания использования сервиса</li>
                      <li>• <strong>Облачные сервисы:</strong> Для хранения и обработки данных</li>
                      <li>• <strong>CDN:</strong> Для быстрой загрузки контента</li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* Section 4 */}
              <section>
                <h2 className="text-xl font-semibold mb-3">4. Управление cookies</h2>
                <div className="space-y-4 text-neutral-300 leading-relaxed">
                  <p>
                    Вы можете контролировать использование cookies различными способами:
                  </p>

                  <div>
                    <h3 className="font-medium text-white mb-2">Настройки браузера:</h3>
                    <ul className="space-y-2 ml-4">
                      <li>• Отключить cookies полностью</li>
                      <li>• Удалить существующие cookies</li>
                      <li>• Разрешить cookies только для определенных сайтов</li>
                      <li>• Использовать режим инкогнито</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-medium text-white mb-2">Наши настройки:</h3>
                    <ul className="space-y-2 ml-4">
                      <li>• Управление через панель настроек аккаунта</li>
                      <li>• Отказ от аналитических cookies</li>
                      <li>• Выбор предпочтений персонализации</li>
                    </ul>
                  </div>

                  <div className="bg-yellow-900/20 border border-yellow-800/50 rounded-lg p-4">
                    <p className="text-yellow-300 text-sm">
                      <strong>Примечание:</strong> Отключение некоторых cookies может повлиять на функциональность сервиса.
                      Необходимые cookies нельзя отключить, так как они требуются для работы платформы.
                    </p>
                  </div>
                </div>
              </section>

              {/* Section 5 */}
              <section>
                <h2 className="text-xl font-semibold mb-3">5. Срок хранения cookies</h2>
                <div className="space-y-4 text-neutral-300 leading-relaxed">
                  <p>
                    Cookies хранятся разное время в зависимости от их типа и назначения:
                  </p>
                  <ul className="space-y-2 ml-4">
                    <li>• <strong>Сессионные cookies:</strong> Удаляются при закрытии браузера</li>
                    <li>• <strong>Постоянные cookies:</strong> Хранятся до 2 лет или до ручного удаления</li>
                    <li>• <strong>Необходимые cookies:</strong> Обычно сессионные или короткосрочные</li>
                    <li>• <strong>Аналитические cookies:</strong> Обычно хранятся 1-2 года</li>
                  </ul>
                </div>
              </section>

              {/* Section 6 */}
              <section>
                <h2 className="text-xl font-semibold mb-3">6. Обновления политики</h2>
                <div className="space-y-4 text-neutral-300 leading-relaxed">
                  <p>
                    Мы можем обновлять эту политику cookies время от времени. О существенных изменениях мы будем уведомлять вас через email или уведомления в сервисе.
                  </p>
                  <p>
                    Рекомендуем периодически проверять эту страницу для ознакомления с актуальной версией.
                  </p>
                </div>
              </section>

              {/* Section 7 */}
              <section>
                <h2 className="text-xl font-semibold mb-3">7. Контакты</h2>
                <div className="space-y-4 text-neutral-300 leading-relaxed">
                  <p>
                    Если у вас есть вопросы по поводу использования cookies или этой политики, пожалуйста, свяжитесь с нами:
                  </p>
                  <div className="bg-neutral-900/30 rounded-lg p-4 border border-neutral-800/50">
                    <p><strong>Email:</strong> privacy@jobinsight.ai</p>
                    <p><strong>Тема:</strong> Cookies Policy Inquiry</p>
                  </div>
                </div>
              </section>

              {/* Cookie Settings */}
              <div className="border-t border-neutral-800/50 pt-6">
                <div className="bg-blue-900/20 border border-blue-800/50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-blue-400 mb-3">Управление настройками cookies</h3>
                  <p className="text-neutral-300 mb-4">
                    Вы можете изменить свои предпочтения по использованию cookies в любое время.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                      Настройки cookies
                    </Button>
                    <Button variant="outline" className="border-neutral-800/50 hover:bg-neutral-900/50">
                      Принять все
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
