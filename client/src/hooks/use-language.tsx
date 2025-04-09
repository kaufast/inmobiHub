import { useTranslation } from 'react-i18next';
import { useState, useEffect, useCallback } from 'react';

// Define supported languages
export const supportedLanguages = [
  { code: 'en-GB', name: 'English', flag: '🇬🇧' },
  { code: 'es-MX', name: 'Español', flag: '🇲🇽' },
  { code: 'fr-FR', name: 'Français', flag: '🇫🇷' },
  { code: 'de-DE', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'zh-CN', name: '中文', flag: '🇨🇳' },
  { code: 'ja-JP', name: '日本語', flag: '🇯🇵' },
  { code: 'ar-SA', name: 'العربية', flag: '🇸🇦' }
];

// Language code map for partial matching (e.g., 'en' matches 'en-GB')
const languageCodeMap: Record<string, string> = {
  'en': 'en-GB',
  'es': 'es-MX',
  'fr': 'fr-FR',
  'de': 'de-DE',
  'zh': 'zh-CN',
  'ja': 'ja-JP',
  'ar': 'ar-SA'
};

export function useLanguage() {
  const { i18n } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language || 'en-GB');
  const [isRTL, setIsRTL] = useState(i18n.language === 'ar-SA' || i18n.language.startsWith('ar'));

  // Update state when i18n language changes
  useEffect(() => {
    setCurrentLanguage(i18n.language);
    setIsRTL(i18n.language === 'ar-SA' || i18n.language.startsWith('ar'));
    
    // Set document language and direction attributes
    document.documentElement.lang = i18n.language.split('-')[0];
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    
    // Optional: Add RTL class to body for global styling
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
    
    // If it's a language code without region (e.g., 'en' instead of 'en-GB')
    const baseCode = code.split('-')[0];
    return languageCodeMap[baseCode] || 'en-GB'; // Default to English if not found
  }, []);
  
  // Change language with normalization
  const changeLanguage = useCallback((langCode: string) => {
    const normalizedCode = normalizeLanguageCode(langCode);
    i18n.changeLanguage(normalizedCode);
    localStorage.setItem('i18nextLng', normalizedCode);
  }, [i18n, normalizeLanguageCode]);
  
  // Get language info
  const getCurrentLanguageInfo = useCallback(() => {
    const lang = supportedLanguages.find(l => l.code === currentLanguage) || 
                 supportedLanguages.find(l => currentLanguage.startsWith(l.code.split('-')[0]));
    return lang || supportedLanguages[0]; // Default to first language if not found
  }, [currentLanguage]);
  
  // Detect browser language on initial load
  useEffect(() => {
    const detectAndSetLanguage = () => {
      // Only detect if no language is already set
      if (!localStorage.getItem('i18nextLng')) {
        const browserLang = navigator.language;
        const normalizedCode = normalizeLanguageCode(browserLang);
        i18n.changeLanguage(normalizedCode);
      }
    };
    
    detectAndSetLanguage();
  }, [i18n, normalizeLanguageCode]);
  
  return {
    currentLanguage,
    isRTL,
    supportedLanguages,
    changeLanguage,
    getCurrentLanguageInfo
  };
}