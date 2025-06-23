import { Tolgee, DevTools, FormatSimple } from '@tolgee/web';

const tolgee = Tolgee()
  .use(DevTools())
  .use(FormatSimple())
  .init({
    language: 'vi-VN', // Default to Vietnamese with correct locale
    apiUrl: process.env.NEXT_PUBLIC_TOLGEE_API_URL,
    apiKey: process.env.NEXT_PUBLIC_TOLGEE_API_KEY,
    
    // Fallback configuration
    fallbackLanguage: 'en',
    
    // Available languages with correct locale codes
    availableLanguages: ['vi-VN', 'en'],
  
    staticData: {
      'vi-VN': () => import('./locales/vi.json'),
      en: () => import('./locales/en.json'),
    },
  });

export { tolgee };