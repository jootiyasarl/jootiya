import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function toSlug(text: string) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')     // تحويل المسافات لشرطات
    .replace(/[^\w\u0621-\u064A-]+/g, '') // دعم العربية والانجليزية وحذف الرموز
    .replace(/--+/g, '-');    // منع تكرار الشرطات
}
