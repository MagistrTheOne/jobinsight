"use client";

import Link from 'next/link';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, FileText, Scale, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

export default function TermsOfService() {
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
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-600/10 border border-green-500/20 mb-4">
              <Scale className="h-8 w-8 text-green-400" />
            </div>
            <h1 className="text-3xl lg:text-4xl font-bold mb-2">Условия использования</h1>
            <p className="text-neutral-400 max-w-2xl mx-auto">
              Правила и условия использования платформы JobInsight AI. Пожалуйста, прочитайте внимательно перед использованием сервиса.
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
                  <FileText className="h-6 w-6 text-blue-400 mt-1 flex-shrink-0" />
                  <div>
                    <h2 className="text-xl font-semibold mb-3">1. Принятие условий</h2>
                    <div className="space-y-4 text-neutral-300 leading-relaxed">
                      <p>
                        Используя платформу JobInsight AI ("Сервис"), вы соглашаетесь с настоящими Условиями использования ("Условия").
                        Если вы не согласны с этими Условиями, пожалуйста, не используйте наш Сервис.
                      </p>
                      <p>
                        Эти Условия регулируют ваше использование нашего веб-сайта, мобильных приложений и всех связанных услуг.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Section 2 */}
              <section>
                <div className="flex items-start gap-3 mb-4">
                  <CheckCircle className="h-6 w-6 text-green-400 mt-1 flex-shrink-0" />
                  <div>
                    <h2 className="text-xl font-semibold mb-3">2. Описание сервиса</h2>
                    <div className="space-y-4 text-neutral-300 leading-relaxed">
                      <p>
                        JobInsight AI предоставляет платформу для анализа резюме, вакансий и помощи в поиске работы с использованием искусственного интеллекта.
                      </p>
                      <div>
                        <h3 className="font-medium text-white mb-2">Наши услуги включают:</h3>
                        <ul className="space-y-2 ml-4">
                          <li>• Анализ и оптимизация резюме</li>
                          <li>• Анализ вакансий и совместимости</li>
                          <li>• Генерация сопроводительных писем</li>
                          <li>• AI-помощник по поиску работы</li>
                          <li>• Трекинг заявок и коммуникаций</li>
                          <li>• Аналитика рынка труда</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Section 3 */}
              <section>
                <div className="flex items-start gap-3 mb-4">
                  <AlertTriangle className="h-6 w-6 text-yellow-400 mt-1 flex-shrink-0" />
                  <div>
                    <h2 className="text-xl font-semibold mb-3">3. Пользовательские обязательства</h2>
                    <div className="space-y-4 text-neutral-300 leading-relaxed">
                      <p>При использовании нашего Сервиса вы обязуетесь:</p>
                      <ul className="space-y-2 ml-4">
                        <li>• Предоставлять точную и актуальную информацию</li>
                        <li>• Не нарушать права третьих лиц</li>
                        <li>• Не использовать Сервис для незаконных целей</li>
                        <li>• Не пытаться получить несанкционированный доступ</li>
                        <li>• Соблюдать все применимые законы и регуляции</li>
                        <li>• Не распространять вредоносное ПО или вирусы</li>
                      </ul>

                      <div className="bg-red-900/20 border border-red-800/50 rounded-lg p-4 mt-4">
                        <h3 className="font-medium text-red-400 mb-2 flex items-center gap-2">
                          <XCircle className="h-4 w-4" />
                          Запрещенные действия
                        </h3>
                        <ul className="space-y-1 text-sm text-red-300 ml-4">
                          <li>• Распространение ложной информации</li>
                          <li>• Нарушение авторских прав</li>
                          <li>• Спам и нежелательная рассылка</li>
                          <li>• Мошеннические действия</li>
                          <li>• Нарушение конфиденциальности других пользователей</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Section 4 */}
              <section>
                <h2 className="text-xl font-semibold mb-3">4. Интеллектуальная собственность</h2>
                <div className="space-y-4 text-neutral-300 leading-relaxed">
                  <p>
                    Сервис и его оригинальный контент, особенности и функциональность являются и остаются исключительной собственностью JobInsight AI.
                  </p>
                  <p>
                    Вы сохраняете все права на контент, который загружаете или создаете с помощью нашего Сервиса. Однако, предоставляя нам контент, вы предоставляете нам лицензию на его использование в целях предоставления услуг.
                  </p>
                  <p>
                    Искусственный интеллект и алгоритмы анализа остаются нашей интеллектуальной собственностью.
                  </p>
                </div>
              </section>

              {/* Section 5 */}
              <section>
                <h2 className="text-xl font-semibold mb-3">5. Оплата и подписки</h2>
                <div className="space-y-4 text-neutral-300 leading-relaxed">
                  <p>
                    Некоторые функции нашего Сервиса требуют оплаты. Все платежи обрабатываются через безопасных платежных провайдеров.
                  </p>
                  <div>
                    <h3 className="font-medium text-white mb-2">Политика оплаты:</h3>
                    <ul className="space-y-2 ml-4">
                      <li>• Цены указаны в соответствующей валюте</li>
                      <li>• Оплата производится заранее за выбранный период</li>
                      <li>• Автоматическое продление подписки (если не отменено)</li>
                      <li>• Возможность отмены в любое время</li>
                      <li>• Возврат средств согласно условиям тарифного плана</li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* Section 6 */}
              <section>
                <h2 className="text-xl font-semibold mb-3">6. Ограничение ответственности</h2>
                <div className="space-y-4 text-neutral-300 leading-relaxed">
                  <p>
                    Сервис предоставляется "как есть" без каких-либо гарантий. Мы не гарантируем точность результатов AI-анализа или успешность трудоустройства.
                  </p>
                  <p>
                    В максимальной степени, разрешенной законом, JobInsight AI не несет ответственности за:
                  </p>
                  <ul className="space-y-2 ml-4">
                    <li>• Косвенные или случайные убытки</li>
                    <li>• Потерю данных или информации</li>
                    <li>• Прерывание бизнеса</li>
                    <li>• Решения, принятые на основе наших рекомендаций</li>
                    <li>• Действия третьих лиц</li>
                  </ul>
                </div>
              </section>

              {/* Section 7 */}
              <section>
                <h2 className="text-xl font-semibold mb-3">7. Прекращение использования</h2>
                <div className="space-y-4 text-neutral-300 leading-relaxed">
                  <p>
                    Мы можем приостановить или прекратить ваш доступ к Сервису в любое время по следующим причинам:
                  </p>
                  <ul className="space-y-2 ml-4">
                    <li>• Нарушение настоящих Условий</li>
                    <li>• Незаконное использование Сервиса</li>
                    <li>• По требованию правоохранительных органов</li>
                    <li>• Технические проблемы или обслуживание</li>
                  </ul>
                  <p>
                    При прекращении доступа, все ваши данные могут быть удалены в соответствии с нашей Политикой конфиденциальности.
                  </p>
                </div>
              </section>

              {/* Section 8 */}
              <section>
                <h2 className="text-xl font-semibold mb-3">8. Применимое право</h2>
                <div className="space-y-4 text-neutral-300 leading-relaxed">
                  <p>
                    Эти Условия регулируются законодательством Российской Федерации. Все споры разрешаются в соответствии с законодательством РФ.
                  </p>
                  <p>
                    Любые споры, возникающие из или в связи с настоящими Условиями, разрешаются путем переговоров. Если переговоры не приводят к решению, спор передается в суд по месту нахождения JobInsight AI.
                  </p>
                </div>
              </section>

              {/* Section 9 */}
              <section>
                <h2 className="text-xl font-semibold mb-3">9. Изменения условий</h2>
                <div className="space-y-4 text-neutral-300 leading-relaxed">
                  <p>
                    Мы можем изменять эти Условия в любое время. О существенных изменениях мы уведомим вас заранее.
                  </p>
                  <p>
                    Продолжение использования Сервиса после вступления изменений в силу означает ваше согласие с обновленными Условиями.
                  </p>
                </div>
              </section>

              {/* Section 10 */}
              <section>
                <h2 className="text-xl font-semibold mb-3">10. Контакты</h2>
                <div className="space-y-4 text-neutral-300 leading-relaxed">
                  <p>
                    Если у вас есть вопросы по поводу этих Условий, пожалуйста, свяжитесь с нами:
                  </p>
                  <div className="bg-neutral-900/30 rounded-lg p-4 border border-neutral-800/50">
                    <p><strong>Email:</strong> legal@jobinsight.ai</p>
                    <p><strong>Адрес:</strong> Россия, Москва</p>
                    <p><strong>Телефон:</strong> +7 (495) XXX-XX-XX</p>
                  </div>
                </div>
              </section>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
