import { useTranslation } from 'react-i18next';
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/use-auth';

// Define supported languages
export const supportedLanguages = [
  { code: 'es-MX', name: 'Mexico - ES', flag: '🇲🇽' },
  { code: 'es-ES', name: 'España - ES', flag: '🇪🇸' },
  { code: 'en-ES', name: 'U.K. - ES', flag: '🇬🇧' },
  { code: 'en-GB', name: 'United Kingdom - EN', flag: '🇬🇧' },
  { code: 'en-US', name: 'U.S. - EN', flag: '🇺🇸' },
  { code: 'ca-ES', name: 'Català', flag: '🇪🇸' },
  { code: 'fr-FR', name: 'Français', flag: '🇫🇷' },
  { code: 'de-DE', name: 'Deutschland - DE', flag: '🇩🇪' },
  { code: 'de-AT', name: 'Österreich - DE', flag: '🇦🇹' },
  { code: 'it-IT', name: 'Italiano', flag: '🇮🇹' }
];

// Language code map for partial matching (e.g., 'en' matches 'en-GB')
const languageCodeMap: Record<string, string> = {
  'en': 'en-GB',
  'es': 'es-MX',
  'ca': 'ca-ES',
  'fr': 'fr-FR',
  'de': 'de-DE',
  'it': 'it-IT',
  'ar': 'ar-SA',
  'zh': 'zh-CN'
};

// Region-specific mappings
const regionMap: Record<string, string> = {
  'MX': 'es-MX',
  'ES': 'es-ES',
  'GB': 'en-GB',
  'US': 'en-US',
  'FR': 'fr-FR',
  'DE': 'de-DE',
  'AT': 'de-AT',
  'IT': 'it-IT',
  'SA': 'ar-SA',
  'CN': 'zh-CN'
};

export function useLanguage() {
  const { i18n, t } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language || 'en-GB');
  const [isRTL, setIsRTL] = useState(i18n.language === 'ar-SA' || i18n.language.startsWith('ar'));
  const { user } = useAuth() || { user: null };

  // Update state when i18n language changes
  useEffect(() => {
    setCurrentLanguage(i18n.language);
    setIsRTL(i18n.language === 'ar-SA' || i18n.language.startsWith('ar'));
    
    // Set document language and direction attributes
    document.documentElement.lang = i18n.language.split('-')[0];
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    
    // Add RTL class to body for global styling
    if (isRTL) {
      document.body.classList.add('rtl');
    } else {
      document.body.classList.remove('rtl');
    }
  }, [i18n.language, isRTL]);
  
  // Normalize language code (e.g., 'en' to 'en-GB')
  const normalizeLanguageCode = useCallback((code: string): string => {
    // If it's already a full locale code that we support
    if (supportedLanguages.some(lang => lang.code === code)) {
      return code;
    }
    
    // Split into language and region
    const [lang, region] = code.split('-');
    
    // If we have a region, try to map it
    if (region && regionMap[region]) {
      return regionMap[region];
    }
    
    // If it's a language code without region, use the default mapping
    if (lang && languageCodeMap[lang]) {
      return languageCodeMap[lang];
    }
    
    // Default to English if not found
    return 'en-GB';
  }, []);
  
  // Change language with normalization and persistence
  const changeLanguage = useCallback(async (langCode: string) => {
    const normalizedCode = normalizeLanguageCode(langCode);
    
    // Change the language in i18next
    await i18n.changeLanguage(normalizedCode);
    
    // Store in localStorage and cookie for persistence
    localStorage.setItem('i18nextLng', normalizedCode);
    document.cookie = `i18next=${normalizedCode}; path=/; sameSite=strict`;
    
    // If user is authenticated, update their profile preference
    if (user?.id) {
      try {
        // Update user's language preference if we have a user profile API
        await fetch('/api/user/preferences', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ preferredLanguage: normalizedCode }),
        });
      } catch (error) {
        console.error('Failed to update user language preference:', error);
      }
    }
  }, [i18n, normalizeLanguageCode, user]);
  
  // Get language info
  const getCurrentLanguageInfo = useCallback(() => {
    const lang = supportedLanguages.find(l => l.code === currentLanguage) || 
                 supportedLanguages.find(l => currentLanguage.startsWith(l.code.split('-')[0]));
    return lang || supportedLanguages[0]; // Default to first language if not found
  }, [currentLanguage]);
  
  // Detect and set language based on various factors
  useEffect(() => {
    const detectAndSetLanguage = async () => {
      // Priority order:
      // 1. User's saved preference from profile (if authenticated)
      // 2. Previously stored preference in localStorage/cookie
      // 3. Browser language setting
      // 4. Default to English

      let detectedLang;
      
      // 1. Check user profile if authenticated
      if (user?.preferredLanguage) {
        detectedLang = user.preferredLanguage;
      } 
      // 2. Check localStorage and cookie
      else if (localStorage.getItem('i18nextLng')) {
        detectedLang = localStorage.getItem('i18nextLng');
      } 
      // 3. Check browser language
      else {
        detectedLang = navigator.language;
      }
      
      // Normalize and set the language
      if (detectedLang) {
        const normalizedCode = normalizeLanguageCode(detectedLang);
        await i18n.changeLanguage(normalizedCode);
      }
    };
    
    detectAndSetLanguage();
  }, [i18n, normalizeLanguageCode, user]);
  
  return {
    currentLanguage,
    isRTL,
    supportedLanguages,
    changeLanguage,
    getCurrentLanguageInfo,
    t
  };
}