import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines class names with tailwind classes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a date to a localized string
 */
export function formatDate(dateInput: string | Date, locale: string = 'en-US'): string {
  const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
  
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date);
}

/**
 * Truncates a string to a specified length and adds an ellipsis
 */
export function truncateText(text: string, length: number = 150): string {
  if (text.length <= length) return text;
  return text.substring(0, length).trim() + '...';
}

/**
 * Generates a slug from a string
 */
export function slugify(text: string): string {
  return text
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-');
}

/**
 * Safely handle image sources with fallbacks
 * @param src Primary image source
 * @param fallback Fallback image to use if primary is unavailable
 * @returns Safe image source
 */
export function getSafeImageSrc(src?: string, fallback: string = '/images/hero-image.jpg'): string {
  if (!src) return fallback;
  
  // If it's a remote URL, return it as is
  if (src.startsWith('http')) {
    return src;
  }
  
  // For local images, return the fallback if needed
  return src || fallback;
} 