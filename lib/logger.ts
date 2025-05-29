/**
 * Production-ready logging service for Miles AI Coach
 * Replaces console.log with structured logging that can be disabled in production
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

interface LogEntry {
  level: LogLevel;
  message: string;
  data?: any;
  timestamp: number;
  source?: string;
}

class Logger {
  private logLevel: LogLevel;
  private isDevelopment: boolean;

  constructor() {
    this.isDevelopment = __DEV__;
    this.logLevel = this.isDevelopment ? LogLevel.DEBUG : LogLevel.WARN;
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.logLevel;
  }

  private formatMessage(level: LogLevel, message: string, source?: string): string {
    const timestamp = new Date().toISOString();
    const levelName = LogLevel[level];
    const sourcePrefix = source ? `[${source}] ` : '';
    return `${timestamp} [${levelName}] ${sourcePrefix}${message}`;
  }

  private logToConsole(level: LogLevel, message: string, data?: any) {
    if (!this.isDevelopment) return;

    switch (level) {
      case LogLevel.DEBUG:
        console.debug(message, data || '');
        break;
      case LogLevel.INFO:
        console.info(message, data || '');
        break;
      case LogLevel.WARN:
        console.warn(message, data || '');
        break;
      case LogLevel.ERROR:
        console.error(message, data || '');
        break;
    }
  }

  private logToService(entry: LogEntry) {
    // In production, send logs to external service (e.g., Sentry, LogRocket, etc.)
    // For now, we'll just store critical errors
    if (entry.level >= LogLevel.ERROR && !this.isDevelopment) {
      // TODO: Implement external logging service integration
      // Example: Sentry.addBreadcrumb({ message: entry.message, level: 'error', data: entry.data });
    }
  }

  debug(message: string, data?: any, source?: string) {
    if (!this.shouldLog(LogLevel.DEBUG)) return;

    const formattedMessage = this.formatMessage(LogLevel.DEBUG, message, source);
    this.logToConsole(LogLevel.DEBUG, formattedMessage, data);
    
    this.logToService({
      level: LogLevel.DEBUG,
      message,
      data,
      timestamp: Date.now(),
      source,
    });
  }

  info(message: string, data?: any, source?: string) {
    if (!this.shouldLog(LogLevel.INFO)) return;

    const formattedMessage = this.formatMessage(LogLevel.INFO, message, source);
    this.logToConsole(LogLevel.INFO, formattedMessage, data);
    
    this.logToService({
      level: LogLevel.INFO,
      message,
      data,
      timestamp: Date.now(),
      source,
    });
  }

  warn(message: string, data?: any, source?: string) {
    if (!this.shouldLog(LogLevel.WARN)) return;

    const formattedMessage = this.formatMessage(LogLevel.WARN, message, source);
    this.logToConsole(LogLevel.WARN, formattedMessage, data);
    
    this.logToService({
      level: LogLevel.WARN,
      message,
      data,
      timestamp: Date.now(),
      source,
    });
  }

  error(message: string, error?: Error | any, source?: string) {
    if (!this.shouldLog(LogLevel.ERROR)) return;

    const formattedMessage = this.formatMessage(LogLevel.ERROR, message, source);
    this.logToConsole(LogLevel.ERROR, formattedMessage, error);
    
    this.logToService({
      level: LogLevel.ERROR,
      message,
      data: error,
      timestamp: Date.now(),
      source,
    });
  }

  // Convenience methods for common use cases
  authError(message: string, error?: any) {
    this.error(message, error, 'AUTH');
  }

  apiError(message: string, error?: any) {
    this.error(message, error, 'API');
  }

  chatError(message: string, error?: any) {
    this.error(message, error, 'CHAT');
  }

  goalError(message: string, error?: any) {
    this.error(message, error, 'GOAL');
  }

  firebaseError(message: string, error?: any) {
    this.error(message, error, 'FIREBASE');
  }
}

// Export singleton instance
export const logger = new Logger();
export default logger; 