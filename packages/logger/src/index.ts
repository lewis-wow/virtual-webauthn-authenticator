import util from 'util';
import {
  createLogger as winstonCreateLogger,
  format,
  transports,
} from 'winston';

const { combine, printf, colorize } = format;

/**
 * Custom log format function for Winston.
 * Formats log messages to include level, service name (if provided), message, and any extra arguments.
 */
const logFormat = printf(
  ({ level, message, prefix, [Symbol.for('splat')]: splat }) => {
    // Determine the service label based on whether serviceName is provided
    const prefixLabel = prefix ? `[${prefix}]` : '';

    // Process extra arguments (splat) for logging.
    // If splat is an array, inspect each element for detailed logging.
    const extras = Array.isArray(splat)
      ? splat
          .map((val) => util.inspect(val, { depth: null, colors: true }))
          .join(' ')
      : '';

    // Construct the final log string
    return `${level} ${prefixLabel} ${message}${extras ? ' ' + extras : ''}`;
  },
);

export const defaultLog = winstonCreateLogger({
  level: 'debug',
  format: combine(colorize(), logFormat),
  transports: [new transports.Console()],
});
