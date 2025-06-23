# Tolgee Internationalization Setup Guide

## 🌐 Overview: Multilingual Support with Vietnamese & English

This guide covers integrating Tolgee for internationalization in the PTT Home Camera system with Vietnamese as default language and English as secondary.

**Server Configuration:**
- Production: `tolgee.thanhpt.xyz`
- Local Development: `localhost:8085`
- Default Language: Vietnamese (vi) 🇻🇳
- Secondary Language: English (en) 🇺🇸

## 🚨 CORS Configuration Fix

**Problem:** `Access to fetch at 'https://tolgee.thanhpt.xyz/v2/projects/...' has been blocked by CORS policy`

**Solution:** Configure your Tolgee Docker instance with proper CORS settings:

### Docker Compose for Tolgee Server

```yaml
# docker-compose.yml for Tolgee
version: '3.8'
services:
  tolgee:
    image: tolgee/tolgee:latest
    ports:
      - "8085:8080"
    environment:
      # Database configuration
      TOLGEE_POSTGRES_URL: jdbc:postgresql://db:5432/tolgee
      TOLGEE_POSTGRES_USERNAME: tolgee
      TOLGEE_POSTGRES_PASSWORD: your_password
      
      # CORS Configuration - ADD THESE LINES
      TOLGEE_CORS_ALLOWED_ORIGINS: "http://localhost:3000,https://homecam.thanhpt.xyz,http://localhost:3001"
      TOLGEE_CORS_ALLOWED_METHODS: "GET,POST,PUT,DELETE,OPTIONS"
      TOLGEE_CORS_ALLOWED_HEADERS: "Content-Type,Authorization,X-Requested-With"
      TOLGEE_CORS_ALLOW_CREDENTIALS: "true"
      
      # Other settings
      TOLGEE_AUTHENTICATION_ENABLED: "true"
      TOLGEE_JWT_SECRET: "your_jwt_secret"
      
  db:
    image: postgres:13
    environment:
      POSTGRES_DB: tolgee
      POSTGRES_USER: tolgee
      POSTGRES_PASSWORD: your_password
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

### Quick Fix Commands

```bash
# 1. Stop current Tolgee container
docker stop tolgee_container_name

# 2. Update with CORS environment variables
docker run -d \
  --name tolgee \
  -p 8085:8080 \
  -e TOLGEE_CORS_ALLOWED_ORIGINS="http://localhost:3000,https://homecam.thanhpt.xyz" \
  -e TOLGEE_CORS_ALLOWED_METHODS="GET,POST,PUT,DELETE,OPTIONS" \
  -e TOLGEE_CORS_ALLOWED_HEADERS="Content-Type,Authorization,X-Requested-With" \
  -e TOLGEE_CORS_ALLOW_CREDENTIALS="true" \
  tolgee/tolgee:latest

# 3. Restart container
docker restart tolgee
```

## 📋 Step-by-Step Integration

### Step 1: Install Tolgee Dependencies

```bash
cd homecam-web
npm install @tolgee/react @tolgee/web @tolgee/i18next i18next react-i18next
```

### Step 2: Environment Variables

Create or update `.env.local`:

```bash
# Tolgee Configuration
NEXT_PUBLIC_TOLGEE_API_URL=https://tolgee.thanhpt.xyz
NEXT_PUBLIC_TOLGEE_API_KEY=your_api_key_here

# Development
# NEXT_PUBLIC_TOLGEE_API_URL=http://localhost:8085
```

### Step 3: Tolgee Configuration

File: `src/lib/tolgee.ts` ✅ (Already created)

### Step 4: Translation Files

Files: `src/lib/locales/vi.json` and `src/lib/locales/en.json` ✅ (Already created)

### Step 5: Tolgee Provider

File: `src/components/providers/TolgeeProvider.tsx` ✅ (Already created)

### Step 6: Update Root Layout

```tsx
// src/app/layout.tsx
import { TolgeeNextProvider } from '@/components/providers/TolgeeProvider';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body>
        <TolgeeNextProvider language="vi">
          {children}
        </TolgeeNextProvider>
      </body>
    </html>
  );
}
```

### Step 7: Language Switcher Component

```tsx
// src/components/common/LanguageSwitcher.tsx
'use client';

import { useTranslate } from '@tolgee/react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function LanguageSwitcher() {
  const { t, getLanguage, changeLanguage } = useTranslate();
  
  const languages = [
    { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳' },
    { code: 'en', name: 'English', flag: '🇺🇸' }
  ];

  return (
    <Select value={getLanguage()} onValueChange={changeLanguage}>
      <SelectTrigger className="w-40">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {languages.map((lang) => (
          <SelectItem key={lang.code} value={lang.code}>
            <span className="flex items-center gap-2">
              <span>{lang.flag}</span>
              <span>{lang.name}</span>
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
```

## 🎯 Usage in Components

### Example: Using translations in Header ✅ (Already applied)

```tsx
import { useTranslate } from '@tolgee/react';

export function Header() {
  const { t } = useTranslate();
  
  return (
    <h1>{t('header.title')}</h1>
  );
}
```

## 🧪 Testing & Deployment

### Local Testing
1. Start Tolgee server with CORS: `docker run ...` (see commands above)
2. Access Tolgee UI: `http://localhost:8085`
3. Create project and get API key
4. Test translations: `npm run dev`

### Production Deployment
1. Update production Tolgee with CORS settings
2. Set environment variables in Vercel:
   - `NEXT_PUBLIC_TOLGEE_API_URL=https://tolgee.thanhpt.xyz`
   - `NEXT_PUBLIC_TOLGEE_API_KEY=your_production_key`

## 🔧 Troubleshooting

### CORS Issues ✅ (Fixed above)
- Configure `TOLGEE_CORS_ALLOWED_ORIGINS` in Docker
- Include all frontend domains

### Translation Loading
- Check API key permissions
- Verify project ID in Tolgee dashboard
- Check network tab for API responses

### In-Context Editing
- Only works in development mode
- Requires proper API key with edit permissions
- Alt+Click on text to edit

## 📚 Resources

- [Tolgee React Docs](https://tolgee.io/integrations/react)
- [Tolgee Next.js Guide](https://tolgee.io/integrations/react/installation)
- [Docker Configuration](https://tolgee.io/platform/self_hosting/running_with_docker)

---

**Next Steps**: After completing this setup, you can start translating your existing components by replacing hardcoded text with `t()` function calls. 