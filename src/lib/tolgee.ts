import { Tolgee, DevTools, FormatSimple } from '@tolgee/web';

const tolgee = Tolgee()
  .use(DevTools())
  .use(FormatSimple())
  .init({
    language: 'vi-VN', // Default to Vietnamese with correct locale
    apiUrl: process.env.NEXT_PUBLIC_TOLGEE_API_URL,
    apiKey: process.env.NEXT_PUBLIC_TOLGEE_API_KEY,
    
    // Available languages with correct locale codes
    availableLanguages: ['vi-VN', 'en'],
  });

export { tolgee };