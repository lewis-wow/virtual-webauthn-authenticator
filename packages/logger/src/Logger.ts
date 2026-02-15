import { isError } from '@repo/utils';
import { type ConsolaInstance, createConsola } from 'consola';

import { LogLevel } from './LogLevel';

export type LoggerOptions = {
  prefix: string;
  level?: LogLevel;
};

const parentLogger = createConsola();

export class Logger {
  static readonly DEFAULT_LOG_LEVEL = LogLevel.info;

  private logger: ConsolaInstance;

  /**
   * Creates a new Logger instance as a tagged child of the main logger.
   * @param opts - Options containing the prefix for this child logger.
   */
  constructor(opts: LoggerOptions) {
    const { prefix, level } = opts;

    this.logger = parentLogger.withTag(prefix);
    this.logger.level = level ?? Logger.DEFAULT_LOG_LEVEL;
  }

  /**
   * Logs an informational message.
   * @param message - The message string.
   * @param meta - Additional data to log.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public info(message: string, ...meta: any[]): void {
    this.logger.info(message, ...meta);
  }

  /**
   * Logs a warning message.
   * @param message - The message string.
   * @param meta - Additional data to log.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public warn(message: string, ...meta: any[]): void {
    this.logger.warn(message, ...meta);
  }

  /**
   * Logs an error message.
   * @param message - The message string.
   * @param meta - Additional data to log.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public error(message: string, ...meta: any[]): void {
    this.logger.error(message, ...meta);
  }

  /**
   * Logs an exception object at the 'error' level.
   *
   * @param error - The Error object to log.
   * @param message - Optional message override (defaults to error.message).
   */
  public exception(error: Error, message?: string): void {
    this.logger.error(message ?? error.message, { exception: error });
  }

  /**
   * Logs a debug message.
   * @param message - The message string.
   * @param meta - Additional data to log.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public debug(message: string, ...meta: any[]): void {
    this.logger.debug(message, ...meta);
  }

  public exceptionOrError(exception: unknown, message: string) {
    if (isError(exception)) {
      this.exception(exception, message);
      return;
    }

    this.logger.error(message, { exception });
  }
}
