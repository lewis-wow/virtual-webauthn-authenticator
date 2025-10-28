import util from 'util';
import * as winston from 'winston';

export type LoggerOptions = {
  prefix: string;
  logLevel?: string;
};

/**
 * A custom logger class built on top of Winston.
 * It provides standard logging methods (info, warn, error, debug)
 * and automatically prepends a custom prefix (e.g., "[MyPrefix]")
 * to every log message.
 */
export class Logger {
  private logger: winston.Logger;

  /**
   * Creates a new Logger instance.
   * @param prefix - The prefix string to prepend to all log messages, displayed in brackets.
   * @param logLevel - The minimum log level to output (e.g., 'debug', 'info', 'warn', 'error').
   */
  constructor(opts: LoggerOptions) {
    const { prefix, logLevel } = opts;

    const logFormat = winston.format.combine(
      winston.format.errors({ stack: true }),
      winston.format.colorize(),
      winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      winston.format.splat(),
      winston.format.printf((info) => {
        const { timestamp, level, message, stack, ...meta } = info;

        let log = `${timestamp} ${level} [${prefix}]: ${message}`;

        const splatSymbol = Symbol.for('splat');
        const splat = meta[splatSymbol];
        const extras = Array.isArray(splat)
          ? splat
              .map((val) => util.inspect(val, { depth: null, colors: true }))
              .join(' ')
          : '';

        if (extras.length > 0) {
          log += ` ${extras}`;
        }

        if (stack) {
          log += `\n${stack}`;
        }

        return log;
      }),
    );

    this.logger = winston.createLogger({
      level: logLevel ?? 'debug',
      format: logFormat,
      transports: [new winston.transports.Console()],
      exitOnError: false,
    });
  }

  /**
   * Logs an informational message.
   * @param message - The message string (can include format specifiers).
   * @param meta - Additional data to log.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public info(message: string, ...meta: any[]): void {
    this.logger.info(message, ...meta);
  }

  /**
   * Logs a warning message.
   * @param message - The message string (can include format specifiers).
   * @param meta - Additional data to log.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public warn(message: string, ...meta: any[]): void {
    this.logger.warn(message, ...meta);
  }

  /**
   * Logs an error message.
   * @param message - The message string (can include format specifiers).
   * @param meta - Additional data to log (can include an Error object).
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public error(message: string, ...meta: any[]): void {
    this.logger.error(message, ...meta);
  }

  /**
   * Logs a debug message.
   * @param message - The message string (can include format specifiers).
   * @param meta - Additional data to log.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public debug(message: string, ...meta: any[]): void {
    this.logger.debug(message, ...meta);
  }
}
