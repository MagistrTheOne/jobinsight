"use client";

import Link from 'next/link';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Shield, Eye, Lock, Database, Users, Mail, Globe } from 'lucide-react';

export default function PrivacyPolicy() {
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
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-600/10 border border-blue-500/20 mb-4">
              <Shield className="h-8 w-8 text-blue-400" />
            </div>
            <h1 className="text-3xl lg:text-4xl font-bold mb-2">Политика конфиденциальности</h1>
            <p className="text-neutral-400 max-w-2xl mx-auto">
              Ваша конфиденциальность важна для нас. Узнайте, как мы собираем, используем и защищаем ваши данные.
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
                  <Eye className="h-6 w-6 text-blue-400 mt-1 flex-shrink-0" />
                  <div>
                    <h2 className="text-xl font-semibold mb-3">1. Информация, которую мы собираем</h2>
                    <div className="space-y-4 text-neutral-300 leading-relaxed">
                      <p>
                        Мы собираем информацию, которую вы предоставляете нам напрямую, а также автоматически при использовании нашего сервиса.
                      </p>

                      <div>
                        <h3 className="font-medium text-white mb-2">Персональная информация:</h3>
                        <ul className="space-y-2 ml-4">
                          <li>• Имя и контактная информация (email, телефон)</li>
                          <li>• Профессиональная информация (резюме, опыт работы)</li>
                          <li>• Данные учетной записи и платежей</li>
                          <li>• Сообщения и файлы, загружаемые в систему</li>
                        </ul>
                      </div>

                      <div>
                        <h3 className="font-medium text-white mb-2">Автоматически собираемая информация:</h3>
                        <ul className="space-y-2 ml-4">
                          <li>• IP-адрес и геолокационные данные</li>
                          <li>• Информация об устройстве и браузере</li>
                          <li>• Cookies и аналогичные технологии</li>
                          <li>• Данные об использовании сервиса</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Section 2 */}
              <section>
                <div className="flex items-start gap-3 mb-4">
                  <Database className="h-6 w-6 text-green-400 mt-1 flex-shrink-0" />
                  <div>
                    <h2 className="text-xl font-semibold mb-3">2. Как мы используем вашу информацию</h2>
                    <div className="space-y-4 text-neutral-300 leading-relaxed">
                      <p>Мы используем собранную информацию для следующих целей:</p>
                      <ul className="space-y-2 ml-4">
                        <li>• Предоставление и улучшение наших услуг</li>
                        <li>• Персонализация пользовательского опыта</li>
                        <li>• Обработка платежей и транзакций</li>
                        <li>• Коммуникация с пользователями</li>
                        <li>• Анализ и улучшение производительности платформы</li>
                        <li>• Обеспечение безопасности и предотвращение мошенничества</li>
                        <li>• Соблюдение юридических обязательств</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </section>

              {/* Section 3 */}
              <section>
                <div className="flex items-start gap-3 mb-4">
                  <Users className="h-6 w-6 text-purple-400 mt-1 flex-shrink-0" />
                  <div>
                    <h2 className="text-xl font-semibold mb-3">3. Передача информации третьим лицам</h2>
                    <div className="space-y-4 text-neutral-300 leading-relaxed">
                      <p>Мы не продаем и не сдаем в аренду вашу персональную информацию третьим лицам. Мы можем передавать вашу информацию только в следующих случаях:</p>
                      <ul className="space-y-2 ml-4">
                        <li>• С вашего явного согласия</li>
                        <li>• Поставщикам услуг, помогающим нам предоставлять сервис</li>
                        <li>• В случае требования закона или судебного решения</li>
                        <li>• Для защиты наших прав и безопасности пользователей</li>
                        <li>• В связи с корпоративными изменениями (слияние, продажа)</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </section>

              {/* Section 4 */}
              <section>
                <div className="flex items-start gap-3 mb-4">
                  <Lock className="h-6 w-6 text-orange-400 mt-1 flex-shrink-0" />
                  <div>
                    <h2 className="text-xl font-semibold mb-3">4. Безопасность данных</h2>
                    <div className="space-y-4 text-neutral-300 leading-relaxed">
                      <p>
                        Мы принимаем все необходимые меры для защиты вашей информации от несанкционированного доступа, изменения, раскрытия или уничтожения:
                      </p>
                      <ul className="space-y-2 ml-4">
                        <li>• Шифрование данных в транзите и хранении</li>
                        <li>• Регулярные аудиты безопасности</li>
                        <li>• Ограничение доступа к персональным данным</li>
                        <li>• Мониторинг и обнаружение угроз</li>
                        <li>• Регулярные обновления систем безопасности</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </section>

              {/* Section 5 */}
              <section>
                <div className="flex items-start gap-3 mb-4">
                  <Globe className="h-6 w-6 text-cyan-400 mt-1 flex-shrink-0" />
                  <div>
                    <h2 className="text-xl font-semibold mb-3">5. Международные передачи данных</h2>
                    <div className="space-y-4 text-neutral-300 leading-relaxed">
                      <p>
                        Ваши данные могут храниться и обрабатываться в различных странах. Мы обеспечиваем соответствующий уровень защиты данных в соответствии с требованиями законодательства о защите персональных данных.
                      </p>
                      <p>
                        При передаче данных в другие страны мы используем стандартные договорные положения или другие механизмы защиты, признанные компетентными органами.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Section 6 */}
              <section>
                <div className="flex items-start gap-3 mb-4">
                  <Mail className="h-6 w-6 text-pink-400 mt-1 flex-shrink-0" />
                  <div>
                    <h2 className="text-xl font-semibold mb-3">6. Ваши права</h2>
                    <div className="space-y-4 text-neutral-300 leading-relaxed">
                      <p>В соответствии с законодательством о защите персональных данных вы имеете следующие права:</p>
                      <ul className="space-y-2 ml-4">
                        <li>• Право на доступ к своим данным</li>
                        <li>• Право на исправление неточных данных</li>
                        <li>• Право на удаление данных</li>
                        <li>• Право на ограничение обработки</li>
                        <li>• Право на переносимость данных</li>
                        <li>• Право на возражение против обработки</li>
                        <li>• Право отозвать согласие</li>
                      </ul>
                      <p className="mt-4">
                        Для реализации этих прав, пожалуйста, свяжитесь с нами по адресу{' '}
                        <a href="mailto:privacy@jobinsight.ai" className="text-blue-400 hover:text-blue-300 underline">
                          privacy@jobinsight.ai
                        </a>
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Section 7 */}
              <section>
                <h2 className="text-xl font-semibold mb-3">7. Cookies и аналогичные технологии</h2>
                <div className="space-y-4 text-neutral-300 leading-relaxed">
                  <p>
                    Мы используем cookies и аналогичные технологии для улучшения работы сервиса, анализа трафика и персонализации контента.
                  </p>
                  <p>
                    Вы можете управлять настройками cookies в своем браузере или отказаться от их использования.
                  </p>
                </div>
              </section>

              {/* Section 8 */}
              <section>
                <h2 className="text-xl font-semibold mb-3">8. Изменения в политике</h2>
                <div className="space-y-4 text-neutral-300 leading-relaxed">
                  <p>
                    Мы можем обновлять эту политику конфиденциальности время от времени. О существенных изменениях мы будем уведомлять вас по электронной почте или через уведомления в сервисе.
                  </p>
                  <p>
                    Продолжение использования нашего сервиса после вступления изменений в силу означает ваше согласие с обновленной политикой.
                  </p>
                </div>
              </section>

              {/* Section 9 */}
              <section>
                <h2 className="text-xl font-semibold mb-3">9. Контактная информация</h2>
                <div className="space-y-4 text-neutral-300 leading-relaxed">
                  <p>
                    Если у вас есть вопросы или комментарии по поводу этой политики конфиденциальности, пожалуйста, свяжитесь с нами:
                  </p>
                  <div className="bg-neutral-900/30 rounded-lg p-4 border border-neutral-800/50">
                    <p><strong>Email:</strong> privacy@jobinsight.ai</p>
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
