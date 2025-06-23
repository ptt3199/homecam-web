import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { HeaderProps } from '@/types/camera';
import { useTranslate } from '@tolgee/react';
import { LanguageSwitcher } from '../common/LanguageSwitcher';

export function Header({ connectionQuality, isConnected, latency }: HeaderProps) {
  const { t } = useTranslate();

  const getConnectionBadge = () => {
    if (!isConnected) {
      return <Badge variant="destructive" className="ptt-pulse-red">{t('header.connection.disconnected')}</Badge>;
    }
    
    switch (connectionQuality) {
      case 'excellent':
        return <Badge className="bg-green-500 text-white ptt-pulse-green">{t('header.connection.excellent')} ({latency}ms)</Badge>;
      case 'good':
        return <Badge className="bg-yellow-500 text-white ptt-pulse-yellow">{t('header.connection.good')} ({latency}ms)</Badge>;
      case 'poor':
        return <Badge variant="destructive" className="ptt-pulse-red">{t('header.connection.poor')} ({latency}ms)</Badge>;
      default:
        return <Badge variant="destructive" className="ptt-pulse-red">{t('header.connection.disconnected')}</Badge>;
    }
  };

  return (
    <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 shadow-sm">
      <div className="container mx-auto px-4 py-4 max-w-7xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">P</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 ptt-gradient-text">
                  {t('header.title')}
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {t('header.subtitle')}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {getConnectionBadge()}
            <LanguageSwitcher />
            <Avatar className="h-9 w-9">
              <AvatarFallback className="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                U
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>
    </header>
  );
}