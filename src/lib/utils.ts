// ─── Currency Utilities ─────────────────────────────────

/**
 * Convert paise to rupees for display.
 * Example: 19900 → "199.00"
 */
export function paiseToRupees(paise: number): string {
  return (paise / 100).toFixed(2);
}

/**
 * Format paise as Indian Rupee string.
 * Example: 19900 → "₹199.00"
 */
export function formatCurrency(paise: number): string {
  return `₹${paiseToRupees(paise)}`;
}

/**
 * Convert rupees to paise.
 * Example: 199 → 19900
 */
export function rupeesToPaise(rupees: number): number {
  return Math.round(rupees * 100);
}

// ─── Date Utilities ─────────────────────────────────────

/**
 * Format a UTC date to localized display string.
 */
export function formatDate(date: Date | string, locale: string = 'en-IN'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(d);
}

/**
 * Format a date with time.
 */
export function formatDateTime(date: Date | string, locale: string = 'en-IN'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}

/**
 * Get the number of days remaining until a date.
 * Returns negative if the date has passed.
 */
export function daysUntil(date: Date | string): number {
  const target = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diff = target.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

/**
 * Check if a date is within N days from now.
 */
export function isExpiringSoon(date: Date | string, days: number = 7): boolean {
  const remaining = daysUntil(date);
  return remaining > 0 && remaining <= days;
}

/**
 * Check if a date has passed.
 */
export function isExpired(date: Date | string): boolean {
  return daysUntil(date) <= 0;
}

/**
 * Add days to a date.
 */
export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

// ─── Platform Billing Prices ────────────────────────────

export const PLATFORM_PLANS = {
  MONTHLY: { label: 'Basic', pricePaise: 19900, durationDays: 30 },
  QUARTERLY: { label: 'Standard', pricePaise: 49900, durationDays: 90 },
  YEARLY: { label: 'Premium', pricePaise: 149900, durationDays: 365 },
} as const;

// ─── String Utilities ───────────────────────────────────

/**
 * Truncate a string with ellipsis.
 */
export function truncate(str: string, maxLength: number = 30): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength) + '...';
}

/**
 * Generate a random math CAPTCHA question.
 * Returns { question, answer }.
 */
export function generateCaptcha(): { question: string; answer: number } {
  const a = Math.floor(Math.random() * 20) + 1;
  const b = Math.floor(Math.random() * 20) + 1;
  const operators = ['+', '-', '×'] as const;
  const op = operators[Math.floor(Math.random() * operators.length)];

  let answer: number;
  switch (op) {
    case '+':
      answer = a + b;
      break;
    case '-':
      answer = a - b;
      break;
    case '×':
      answer = a * b;
      break;
  }

  return { question: `${a} ${op} ${b} = ?`, answer };
}

// ─── API Response Helpers ───────────────────────────────

export function apiSuccess<T>(data: T, message?: string) {
  return { success: true as const, data, message };
}

export function apiError(message: string, errors?: Record<string, string[]>) {
  return { success: false as const, message, errors };
}

// ─── Class Name Utility ─────────────────────────────────

/**
 * Merge class names conditionally (lightweight clsx alternative).
 */
export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}
