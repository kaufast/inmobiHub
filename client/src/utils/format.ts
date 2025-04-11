/**
 * Format a number as currency
 * @param value Amount to format
 * @param locale Locale to use for formatting (defaults to user's browser locale)
 * @param currency Currency code (defaults to USD)
 * @returns Formatted currency string
 */
export function formatCurrency(
  value: number, 
  locale?: string, 
  currency: string = 'USD'
): string {
  const formatter = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  });
  
  return formatter.format(value);
}

/**
 * Format a date string or date object
 * @param date Date to format
 * @param options Intl.DateTimeFormat options
 * @param locale Locale to use for formatting
 * @returns Formatted date string
 */
export function formatDate(
  date: string | Date,
  options: Intl.DateTimeFormatOptions = { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  },
  locale?: string
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale, options).format(dateObj);
}

/**
 * Format a number with commas and optional decimal places
 * @param value Number to format
 * @param decimalPlaces Number of decimal places
 * @param locale Locale to use for formatting
 * @returns Formatted number string
 */
export function formatNumber(
  value: number,
  decimalPlaces: number = 0,
  locale?: string
): string {
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimalPlaces,
    maximumFractionDigits: decimalPlaces,
  }).format(value);
}

/**
 * Format a number as square feet
 * @param value Square feet value
 * @param locale Locale to use for formatting
 * @returns Formatted square feet string
 */
export function formatSquareFeet(value: number, locale?: string): string {
  return `${formatNumber(value, 0, locale)} ft²`;
}

/**
 * Format property field values consistently
 * @param value Property value to format
 * @param fieldType Type of property field
 * @param locale Locale to use for formatting
 * @returns Formatted property value string
 */
export function formatPropertyValue(
  value: any,
  fieldType: 'price' | 'area' | 'date' | 'location' | 'count' | string,
  locale?: string
): string {
  if (value === null || value === undefined) {
    return 'N/A';
  }

  switch (fieldType) {
    case 'price':
      return formatCurrency(Number(value), locale);
    case 'area':
      return formatSquareFeet(Number(value), locale);
    case 'date':
      return formatDate(value, undefined, locale);
    case 'count':
      return formatNumber(Number(value), 0, locale);
    case 'location':
      return String(value);
    default:
      return String(value);
  }
}