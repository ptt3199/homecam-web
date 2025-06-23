'use client';

import { ReactNode, useEffect, useState } from 'react';
import { TolgeeProvider } from '@tolgee/react';
import { tolgee } from '@/lib/tolgee';

interface Props {
  children: ReactNode;
  language?: string;
}

export function TolgeeNextProvider({ children, language }: Props) {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Wait for Tolgee to initialize and load data
    tolgee.run().then(async () => {
      // Force load both Vietnamese and English from server with correct locale codes
      if (process.env.NEXT_PUBLIC_TOLGEE_API_KEY) {
        try {
          await tolgee.loadRecord({ language: 'vi-VN' });
          await tolgee.loadRecord({ language: 'en' });
        } catch (error) {
          console.warn('Failed to load translations from server:', error);
        }
      }
      
      if (language) {
        tolgee.changeLanguage(language);
      }
      setIsLoaded(true);
    });
  }, [language]);

  if (!isLoaded) {
    return <div>Loading translations...</div>;
  }
  
  return (
    <TolgeeProvider
      tolgee={tolgee}
      fallback="Loading translations..."
    >
      {children}
    </TolgeeProvider>
  );
}