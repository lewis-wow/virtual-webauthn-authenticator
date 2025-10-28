import { Provider } from '@nestjs/common';
import { Logger } from '@repo/logger';

export const LoggerProvider: Provider = {
  provide: Logger,
  useFactory: () => {
    const logger = new Logger({
      prefix: 'Nestjs',
    });

    return logger;
  },
};
