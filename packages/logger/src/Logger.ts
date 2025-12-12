import util from 'util';
import * as winston from 'winston';

export type LoggerOptions = {
  prefix: string;
  // logLevel is removed, as the level is now controlled
  // globally by the single parent logger.
};

// --- Parent Logger Setup ---

/**
 * Define the log format for the parent logger.
 * This format will be inherited by all child loggers.
 */
const logFormat = winston.format.combine(
  winston.format.errors({ stack: true }),
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.splat(),
  winston.format.printf((info) => {
    // We destructure 'prefix' from the info object.
    // winston.child() will add this to the info for us.
    const { timestamp, level, message, stack, prefix, ...meta } = info;

    // Conditionally add the prefix if it exists
    const prefixStr = prefix ? ` [${prefix}]` : '';

    let log = `${timestamp} ${level}${prefixStr}: ${message}`;

    const splatSymbol = Symbol.for('splat');
    const splat = meta[splatSymbol as keyof typeof meta]; // Type assertion
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

/**
 * The ONE and ONLY parent logger instance.
 * Its log level is set globally (e.g., via environment variables).
 * All child loggers will inherit this level.
 */
const parentLogger = winston.createLogger({
  // eslint-disable-next-line turbo/no-undeclared-env-vars
  level: process.env.LOG_LEVEL ?? 'debug', // Global log level
  format: logFormat,
  transports: [new winston.transports.Console()],
  exitOnError: false,
});

// --- Logger Class ---

/**
 * A custom logger class that creates a CHILD of the main winston logger.
 * It provides standard logging methods (info, warn, error, debug)
 * and automatically adds its context (prefix) to every log message.
 */
export class Logger {
  private logger: winston.Logger;

  /**
   * Creates a new Logger instance as a child of the main logger.
   * @param opts - Options containing the prefix for this child logger.
   */
  constructor(opts: LoggerOptions) {
    const { prefix } = opts;

    // Create a CHILD logger, passing the prefix as metadata.
    // The printf format will automatically pick up this 'prefix'
    // and include it in the output.
    this.logger = parentLogger.child({ prefix });
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
   * Logs an exception object at the 'error' level with pretty-printing.
   * This method uses the `util.inspect` logic from your `printf`
   * format to print the full error object.
   *
   * @param error - The Error object to log.
   */
  public exception(error: Error): void {
    // We pass the error.message as the main message,
    // and the error itself as an object in the 'meta' array.
    // Your 'splat' logic will find it and 'util.inspect' it.
    this.logger.error(error.message, { exception: error });
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
