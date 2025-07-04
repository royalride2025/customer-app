// src/i18n.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import ar from './locales/ar.json';
// Remove Redux imports from here - i18n should be independent

// Translation resources
const resources = {
  en: {
    translation: en,
  },
  ar: {
    translation: ar,
  },
};

// Initialize i18next
i18n
  .use(initReactI18next) // Connect React to i18next
  .init({
    resources,
    compatibilityJSON: 'v3',
    lng: 'en', // Set default language explicitly
    fallbackLng: 'en', // Fallback language is set to English
    debug: __DEV__, // Enable debug mode in development
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    react: {
      useSuspense: false, // Disable suspense for better compatibility
    },
  });

// Export language change function (to be called from components)
export const changeLanguage = (language: string) => {
  i18n.changeLanguage(language);
};

// Export current language getter
export const getCurrentLanguage = () => i18n.language;

// Export RTL language checker
export const isRTLLanguage = (language: string) => {
  return ['ar', 'he', 'fa', 'ur'].includes(language); // Add other RTL languages as needed
};

export default i18n;