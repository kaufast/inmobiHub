import { useTranslation } from 'react-i18next';
import { Globe, Check } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

const languages = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Español' },
  { code: 'fr', name: 'Français' },
  { code: 'de', name: 'Deutsch' },
  { code: 'zh', name: '中文' },
  { code: 'ja', name: '日本語' },
  { code: 'ar', name: 'العربية' }
];

export default function LanguageSelector() {
  const { i18n } = useTranslation();
  
  const changeLanguage = (langCode: string) => {
    i18n.changeLanguage(langCode);
    // Optionally store the language preference
    localStorage.setItem('preferredLanguage', langCode);
  };
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Select language">
          <Globe className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="glassmorphism-card min-w-[180px]" align="end">
        {languages.map((language) => {
          const isActive = i18n.language === language.code;
          
          return (
            <DropdownMenuItem
              key={language.code}
              className={`flex items-center justify-between ${isActive ? 'bg-white/10' : ''}`}
              onClick={() => changeLanguage(language.code)}
            >
              <span>{language.name}</span>
              {isActive && <Check className="h-4 w-4 text-primary-500" />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}