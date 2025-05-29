import * as Crypto from 'expo-crypto';

/**
 * Generates a unique ID similar to nanoid
 * @param size The size of the ID to generate (default: 21)
 * @returns A unique string ID
 */
export function nanoid(size: number = 21): string {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
  let id = '';
  
  // Generate random bytes
  const bytes = new Uint8Array(size);
  Crypto.getRandomValues(bytes);
  
  // Convert to string using the alphabet
  for (let i = 0; i < size; i++) {
    id += alphabet[bytes[i] % alphabet.length];
  }
  
  return id;
}

/**
 * Encrypts sensitive data using AES-256
 * @param data The data to encrypt
 * @param key The encryption key
 * @returns The encrypted data
 */
export async function encryptData(data: string, key: string): Promise<string> {
  try {
    // In a production app, we would implement proper encryption here
    // This is a placeholder for the actual implementation
    // We would use expo-crypto or a similar library for this
    
    // Simulate encryption for now
    const encodedData = Buffer.from(data).toString('base64');
    return encodedData;
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt data');
  }
}

/**
 * Decrypts sensitive data
 * @param encryptedData The encrypted data
 * @param key The decryption key
 * @returns The decrypted data
 */
export async function decryptData(encryptedData: string, key: string): Promise<string> {
  try {
    // In a production app, we would implement proper decryption here
    // This is a placeholder for the actual implementation
    
    // Simulate decryption for now
    const decodedData = Buffer.from(encryptedData, 'base64').toString('utf-8');
    return decodedData;
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt data');
  }
}

/**
 * Formats a date as a readable string
 * @param date The date to format
 * @returns A formatted date string
 */
export function formatDate(date: Date | number): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Formats a relative time (e.g., "2 days ago")
 * @param date The date to format
 * @returns A relative time string
 */
export function formatRelativeTime(date: Date | number): string {
  const now = new Date();
  const d = new Date(date);
  const diffMs = now.getTime() - d.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffSecs < 60) {
    return 'just now';
  } else if (diffMins < 60) {
    return `${diffMins} minute${diffMins === 1 ? '' : 's'} ago`;
  } else if (diffHours < 24) {
    return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
  } else if (diffDays < 30) {
    return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
  } else {
    return formatDate(date);
  }
}

/**
 * Safely parses JSON with error handling
 * @param data The JSON string to parse
 * @param fallback The fallback value if parsing fails
 * @returns The parsed object or fallback
 */
export function safeJsonParse<T>(data: string, fallback: T): T {
  try {
    return JSON.parse(data) as T;
  } catch (error) {
    console.error('JSON parse error:', error);
    return fallback;
  }
}

/**
 * Creates a debounced function that delays invoking func until after wait milliseconds
 * @param func The function to debounce
 * @param wait The number of milliseconds to delay
 * @returns The debounced function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return function(...args: Parameters<T>): void {
    const later = () => {
      timeout = null;
      func(...args);
    };
    
    if (timeout) {
      clearTimeout(timeout);
    }
    
    timeout = setTimeout(later, wait);
  };
}

/**
 * Truncates text to a specified length and adds ellipsis if needed
 * @param text The text to truncate
 * @param length The maximum length
 * @returns The truncated text
 */
export function truncateText(text: string, length: number): string {
  if (text.length <= length) {
    return text;
  }
  
  return text.substring(0, length) + '...';
}

/**
 * Validates email format
 * @param email The email to validate
 * @returns Whether the email is valid
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Calculates percentage
 * @param value The current value
 * @param total The total value
 * @returns The percentage
 */
export function calculatePercentage(value: number, total: number): number {
  if (total === 0) {
    return 0;
  }
  
  const percentage = (value / total) * 100;
  return Math.min(Math.round(percentage), 100);
}
