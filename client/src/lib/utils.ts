import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number): string {
  if (price >= 1000000) {
    return `$${(price / 1000000).toFixed(2)}M`;
  } else {
    return `$${(price / 1000).toLocaleString()}K`;
  }
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(part => part.charAt(0))
    .join('')
    .toUpperCase();
}

export function formatDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatTimeAgo(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const seconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);
  
  let interval = seconds / 31536000; // years
  if (interval > 1) {
    return Math.floor(interval) + 'y ago';
  }
  interval = seconds / 2592000; // months
  if (interval > 1) {
    return Math.floor(interval) + 'mo ago';
  }
  interval = seconds / 86400; // days
  if (interval > 1) {
    return Math.floor(interval) + 'd ago';
  }
  interval = seconds / 3600; // hours
  if (interval > 1) {
    return Math.floor(interval) + 'h ago';
  }
  interval = seconds / 60; // minutes
  if (interval > 1) {
    return Math.floor(interval) + 'm ago';
  }
  return Math.floor(seconds) + 's ago';
}

export function getPropertyTypeLabel(type: string): string {
  const typeMap: Record<string, string> = {
    house: 'House',
    condo: 'Condo',
    apartment: 'Apartment',
    townhouse: 'Townhouse',
    land: 'Land'
  };
  
  return typeMap[type] || type;
}

export function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  
  return function(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };
    
    if (timeout !== null) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}
