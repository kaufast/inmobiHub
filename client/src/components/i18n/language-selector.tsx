import { useTranslation } from 'react-i18next';
import { Globe, Check } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useLanguage, supportedLanguages } from '@/hooks/use-language';

export default function LanguageSelector() {
  const { t } = useTranslation();
  const { 
    currentLanguage,
    isRTL,
    changeLanguage,
    getCurrentLanguageInfo 
  } = useLanguage();
  
  const currentLangInfo = getCurrentLanguageInfo();
  
  // Check if language is active
  const isLanguageActive = (langCode: string) => {
    // Direct match
    if (currentLanguage === langCode) return true;
    // Partial match (like 'en' in 'en-GB')
    if (currentLanguage.startsWith(langCode.split('-')[0])) return true;
    return false;
  };
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="flex items-center gap-2">
          <Globe className="h-4 w-4" />
          <span className="hidden md:inline-block text-sm">
            <span className="mr-1">{currentLangInfo.flag}</span>
            <span>{currentLangInfo.name}</span>
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        className={`w-56 ${isRTL ? 'rtl-menu' : ''}`} 
        align="end"
      >
        <DropdownMenuLabel>{t('common.selectLanguage', 'Select Language')}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {supportedLanguages.map((language) => {
          const isActive = isLanguageActive(language.code);
          
          return (
            <DropdownMenuItem
              key={language.code}
              className={`flex items-center justify-between ${isActive ? 'bg-primary-50 dark:bg-primary-900/20' : ''}`}
              onClick={() => changeLanguage(language.code)}
            >
              <span className="flex items-center gap-2">
                <span className="text-base" role="img" aria-label={language.name}>{language.flag}</span>
                <span>{language.name}</span>
              </span>
              {isActive && <Check className="h-4 w-4 text-primary-600" />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}