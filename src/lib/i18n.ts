// Import translation files
import bgCommon from '../../locales/bg/common.json';
import enCommon from '../../locales/en/common.json';

/**
 * Supported locales for the application
 */
export const locales = ['en', 'bg'] as const;

/**
 * Default locale for the application
 */
export const defaultLocale = 'bg';

/**
 * Type representing valid locales
 */
export type Locale = typeof locales[number];

/**
 * Type for translation objects
 */
export type Translation = typeof bgCommon;

// Validate that all locale files have the expected structure
const translations: Record<Locale, Translation> = {
  bg: bgCommon,
  en: enCommon,
};

/**
 * Extracts the locale and pathname from a URL path
 * 
 * @param path - The URL path to parse
 * @returns An object containing the extracted locale and pathname
 */
export function getLocalePartsFrom(path: string): {
  locale: Locale;
  pathname: string;
} {
  try {
    const pathnameParts = path.split('/').filter(Boolean);
    const firstPart = pathnameParts[0]?.toLowerCase();
    const isLocale = firstPart && locales.includes(firstPart as Locale);
    const locale = isLocale ? (firstPart as Locale) : defaultLocale;
    const pathname = isLocale ? `/${pathnameParts.slice(1).join('/')}` : path;

    return {
      locale,
      pathname,
    };
  } catch (error) {
    console.error('Error extracting locale parts from path:', error);
    // Fallback to default values
    return {
      locale: defaultLocale,
      pathname: path || '/',
    };
  }
}

/**
 * Redirects to the current page with the given locale
 * 
 * @param locale - The target locale to redirect to
 */
export function redirectToLocale(locale: Locale): void {
  if (typeof window === 'undefined') {
    console.warn('redirectToLocale called on the server side');
    return;
  }
  
  try {
    const { pathname, search } = window.location;
    const currentLocale = getLocalePartsFrom(pathname).locale;
    
    if (currentLocale === locale) {
      console.log(`Already using locale: ${locale}`);
      return;
    }
    
    const path = pathname.replace(`/${currentLocale}`, `/${locale}`);
    const targetUrl = `${path}${search}`;
    
    console.log(`Redirecting to locale: ${locale}, URL: ${targetUrl}`);
    window.location.href = targetUrl;
  } catch (error) {
    console.error(`Error redirecting to locale ${locale}:`, error);
  }
}

/**
 * Validates if a string is a supported locale
 * 
 * @param locale - The locale string to validate
 * @returns True if the locale is supported, false otherwise
 */
export function isValidLocale(locale: string): locale is Locale {
  // Handle case-insensitive comparison
  const normalizedLocale = locale.toLowerCase();
  return locales.includes(normalizedLocale as Locale);
}

/**
 * Simple helper to load translations from JSON files
 * 
 * @param locale - The locale to get translations for
 * @returns The translation object for the specified locale
 */
export function getTranslations(locale: Locale = defaultLocale): Translation {
  try {
    // Handle case insensitivity
    const normalizedLocale = locale.toLowerCase() as Locale;
    if (!isValidLocale(normalizedLocale)) {
      console.warn(`Requested translations for unsupported locale: ${locale}. Falling back to ${defaultLocale}.`);
      return translations[defaultLocale];
    }
    
    return translations[normalizedLocale];
  } catch (error) {
    console.error(`Error getting translations for locale ${locale}:`, error);
    return translations[defaultLocale];
  }
} 