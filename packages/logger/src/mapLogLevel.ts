import { LogLevel } from './LogLevel';

export const mapLogLevelTag = (
  logLevelTag: string | undefined,
): LogLevel | undefined => {
  if (logLevelTag === undefined) {
    return undefined;
  }

  if (!Object.hasOwn(LogLevel, logLevelTag)) {
    return undefined;
  }

  return LogLevel[logLevelTag as keyof typeof LogLevel];
};
