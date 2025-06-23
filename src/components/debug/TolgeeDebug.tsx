'use client';

import { useEffect, useState } from 'react';
import { useTolgee } from '@tolgee/react';

export function TolgeeDebug() {
  const [envVars, setEnvVars] = useState<any>({});
  const [testTranslation, setTestTranslation] = useState<string>('');
  const [keyStatus, setKeyStatus] = useState<string>('');
  const tolgee = useTolgee(['language']);

  useEffect(() => {
    setEnvVars({
      apiUrl: process.env.NEXT_PUBLIC_TOLGEE_API_URL,
      apiKey: process.env.NEXT_PUBLIC_TOLGEE_API_KEY ? 'SET' : 'NOT SET',
      nodeEnv: process.env.NODE_ENV
    });

    // Test multiple translations to see server status
    try {
      const currentLang = tolgee.getLanguage();
      const translation = tolgee.t('camera.controls.title');
      const keyExists = translation !== 'camera.controls.title'; // If key exists, it won't return the key itself
      
      setTestTranslation(translation);
      setKeyStatus(keyExists ? '✅ Key found' : '❌ Key missing/fallback');
    } catch (e) {
      setTestTranslation('ERROR');
      setKeyStatus('❌ Translation error');
    }
  }, [tolgee]);

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-4 rounded-lg text-xs max-w-sm z-50 border">
      <h4 className="font-bold mb-2">🐛 Tolgee Debug</h4>
      <div className="space-y-1">
        <div>API URL: {envVars.apiUrl || '❌ NOT SET'}</div>
        <div>API Key: {envVars.apiKey}</div>
        <div>Current Lang: {tolgee.getLanguage()}</div>
        <div>Node Env: {envVars.nodeEnv}</div>
        <div>Test Translation: <span className="text-yellow-300">"{testTranslation}"</span></div>
        <div>Status: <span className="text-blue-300">{keyStatus}</span></div>
        <div className="text-green-300 mt-2">
          {envVars.apiUrl && envVars.apiKey === 'SET' 
            ? '🌐 SERVER-ONLY MODE' 
            : '⚠️ No API configuration'
          }
        </div>
      </div>
    </div>
  );
} 