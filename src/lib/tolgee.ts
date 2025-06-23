import { Tolgee, DevTools, FormatSimple } from '@tolgee/web';

// Debug logging for production
console.log('🌐 Tolgee Configuration:');
console.log('API URL:', process.env.NEXT_PUBLIC_TOLGEE_API_URL);
console.log('API Key:', process.env.NEXT_PUBLIC_TOLGEE_API_KEY ? 'SET' : 'NOT SET');
console.log('Node Env:', process.env.NODE_ENV);

const tolgee = Tolgee()
  .use(DevTools())
  .use(FormatSimple())
  .init({
    language: 'vi-VN',
    apiUrl: process.env.NEXT_PUBLIC_TOLGEE_API_URL,
    apiKey: process.env.NEXT_PUBLIC_TOLGEE_API_KEY,
    
    // Available languages with correct locale codes
    availableLanguages: ['vi-VN', 'en'],
    
    // REMOVE staticData to force server calls in production
    // staticData: {
    //   'vi-VN': () => import('./locales/vi.json'),
    //   'en': () => import('./locales/en.json'),
    // },
    
    // Force server mode - don't use static files
    defaultNs: 'translation',
    fallbackNs: 'translation',
  });

export { tolgee };