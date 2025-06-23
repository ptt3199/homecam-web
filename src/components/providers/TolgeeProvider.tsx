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
      console.log('🚀 Tolgee initialized successfully');
      
      // ALWAYS try to fetch from server first (even without API key for testing)
      if (process.env.NEXT_PUBLIC_TOLGEE_API_URL) {
        console.log('📡 FORCING fetch translations from server...');
        console.log('Server URL:', process.env.NEXT_PUBLIC_TOLGEE_API_URL);
        console.log('API Key present:', !!process.env.NEXT_PUBLIC_TOLGEE_API_KEY);
        
        // Force reload from server
        try {
          console.log('🔄 Forcing loadRecord for vi-VN...');
          const viResult = await tolgee.loadRecord({ 
            language: 'vi-VN',
            namespace: 'translation'
          });
          console.log('✅ vi-VN loadRecord result:', viResult);
          
          console.log('🔄 Forcing loadRecord for en...');
          const enResult = await tolgee.loadRecord({ 
            language: 'en',
            namespace: 'translation' 
          });
          console.log('✅ en loadRecord result:', enResult);
          
        } catch (error) {
          console.error('❌ Failed to load translations from server:', error);
          console.log('📁 Error details:', error);
          
          // Test raw connectivity to check if it's a network issue
          console.log('🔧 Testing raw connectivity...');
          try {
            const testUrl = `${process.env.NEXT_PUBLIC_TOLGEE_API_URL}/v2/projects/2/keys`;
            console.log('🌐 Testing URL:', testUrl);
            
            const response = await fetch(testUrl, {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${process.env.NEXT_PUBLIC_TOLGEE_API_KEY}`,
                'Content-Type': 'application/json',
              }
            });
            console.log('🏥 Raw API test response:', response.status, response.statusText);
            
            if (response.ok) {
              const data = await response.json();
              console.log('📊 API data preview:', Object.keys(data));
            }
          } catch (networkError) {
            console.error('🚨 Network test failed:', networkError);
          }
        }
      } else {
        console.log('⚠️ No API URL configured');
      }
      
      if (language) {
        console.log('🔄 Changing language to:', language);
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