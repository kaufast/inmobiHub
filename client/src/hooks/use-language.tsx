import { useTranslation } from 'react-i18next';
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/use-auth';

// Define supported languages
export const supportedLanguages = [
  { code: 'en-GB', name: 'English', flag: '🇬🇧' },
  { code: 'es-MX', name: 'Español', flag: '🇲🇽' },
  { code: 'ca-ES', name: 'Català', flag: '🇪🇸' },
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
  'ca': 'ca-ES',
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
    
    // If it's a language code without region (e.g., 'en' instead of 'en-GB')
    const baseCode = code.split('-')[0];
    return languageCodeMap[baseCode] || 'en-GB'; // Default to English if not found
  }, []);
  
  // Change language with normalization and persistence
  const changeLanguage = useCallback(async (langCode: string) => {
    const normalizedCode = normalizeLanguageCode(langCode);
    
    // Change the language in i18next
    await i18n.changeLanguage(normalizedCode);
    
    // Store in localStorage for unauthenticated users
    localStorage.setItem('i18nextLng', normalizedCode);
    
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
      // 2. Previously stored preference in localStorage
      // 3. Browser language setting
      // 4. IP geolocation (optional)
      // 5. Default to English

      let detectedLang;
      
      // 1. Check user profile if authenticated
      if (user?.preferredLanguage) {
        detectedLang = user.preferredLanguage;
      } 
      // 2. Check localStorage
      else if (localStorage.getItem('i18nextLng')) {
        detectedLang = localStorage.getItem('i18nextLng');
      } 
      // 3. Check browser language
      else {
        detectedLang = navigator.language;
        
        // 4. Optionally check IP geolocation (could be implemented in the future)
        // This would require a backend API call to a geolocation service
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
    getCurrentLanguageInfo
  };
}