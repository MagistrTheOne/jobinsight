// Translation files for the application
export const translations = {
  ru: {
    // Navigation
    dashboard: 'Дашборд',
    chat: 'AI Чат',
    profile: 'Профиль',
    settings: 'Настройки',
    logout: 'Выйти',

    // Landing page
    hero: {
      title: 'Найди работу мечты с AI',
      subtitle: 'Умный помощник по поиску работы с анализом резюме, вакансий и автоматизацией процессов',
      cta: 'Начать бесплатно',
      demo: 'Попробовать демо',
    },

    // Pricing
    pricing: {
      title: 'Выберите подходящий тариф',
      subtitle: 'От бесплатного плана до корпоративных решений',
      free: {
        name: 'Бесплатный',
        price: '0',
        period: 'навсегда',
        description: 'Идеально для тестирования наших AI-инструментов поиска работы.',
        cta: 'Начать',
      },
      pro: {
        name: 'Pro',
        price: '50',
        period: 'месяц',
        yearlyPrice: '480',
        description: 'Для серьезных соискателей, которым нужен полный доступ.',
        cta: 'Начать бесплатный trial',
        features: [
          'Неограниченный анализ вакансий',
          'Неограниченная оптимизация резюме',
          'Расширенная совместимость с ATS',
          'Приоритетная обработка AI',
          'Синхронизация истории в облаке',
          'Оценка уровня вакансии',
          'Оптимизация в реальном времени',
          'Поддержка по email',
          'Расширенные функции чата',
          'Конструктор резюме с AI',
          'Помощник по переговорам о зарплате',
          'Приоритетная поддержка клиентов',
        ],
      },
    },

    // Payments
    payments: {
      checkout: 'Перейти к оплате',
      creatingPayment: 'Создание платежа...',
      payWithPolar: 'Оплатить через Polar',
      payWithYookassa: 'Оплатить через ЮKassa',
      selectPaymentMethod: 'Выбрать способ оплаты',
      chooseAnotherMethod: 'Выбрать другой способ',
    },

    // Common
    loading: 'Загрузка...',
    error: 'Ошибка',
    success: 'Успешно',
    save: 'Сохранить',
    cancel: 'Отмена',
    delete: 'Удалить',
    edit: 'Редактировать',
    create: 'Создать',
    search: 'Поиск...',
    back: 'Назад',

    // Auth
    signIn: 'Войти',
    signUp: 'Регистрация',
    signOut: 'Выйти',
    email: 'Email',
    password: 'Пароль',
    confirmPassword: 'Подтвердите пароль',
    forgotPassword: 'Забыли пароль?',

    // Languages
    language: 'Язык',
    russian: 'Русский',
    english: 'English',

    // Themes
    theme: 'Тема',
    light: 'Светлая',
    dark: 'Темная',
    system: 'Системная',
  },

  en: {
    // Navigation
    dashboard: 'Dashboard',
    chat: 'AI Chat',
    profile: 'Profile',
    settings: 'Settings',
    logout: 'Logout',

    // Landing page
    hero: {
      title: 'Land Your Dream Job with AI',
      subtitle: 'Smart job search assistant with resume analysis, job matching, and process automation',
      cta: 'Get Started Free',
      demo: 'Try Demo',
    },

    // Pricing
    pricing: {
      title: 'Choose Your Plan',
      subtitle: 'From free tier to enterprise solutions',
      free: {
        name: 'Free',
        price: '0',
        period: 'forever',
        description: 'Perfect for trying out our AI-powered job search tools.',
        cta: 'Get Started',
      },
        monthly: 'Monthly',
      yearly: 'Yearly',
    pro: {
        name: 'Pro',
        price: '50',
        period: 'month',
        yearlyPrice: '480',
        description: 'For serious job seekers who want unlimited access.',
        cta: 'Start Free Trial',
        features: [
          'Unlimited job analyses',
          'Unlimited resume optimizations',
          'Advanced ATS compatibility scoring',
          'Priority AI processing',
          'Cloud history sync',
          'Job grade assessment',
          'Real-time optimization',
          'Email support',
          'Advanced chat features',
          'Resume builder with AI',
          'Salary negotiation assistant',
          'Priority customer support',
        ],
      },
    },

    // Payments
    payments: {
      checkout: 'Proceed to Payment',
      creatingPayment: 'Creating payment...',
      payWithPolar: 'Pay with Polar',
      payWithYookassa: 'Pay with YooKassa',
      selectPaymentMethod: 'Select Payment Method',
      chooseAnotherMethod: 'Choose Another Method',
    },

    // Common
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    create: 'Create',
    search: 'Search...',
    back: 'Back',

    // Auth
    signIn: 'Sign In',
    signUp: 'Sign Up',
    signOut: 'Sign Out',
    email: 'Email',
    password: 'Password',
    confirmPassword: 'Confirm Password',
    forgotPassword: 'Forgot Password?',

    // Languages
    language: 'Language',
    russian: 'Русский',
    english: 'English',

    // Themes
    theme: 'Theme',
    light: 'Light',
    dark: 'Dark',
    system: 'System',
  },
} as const;

export type Language = keyof typeof translations;
export type TranslationKeys = typeof translations.ru;
