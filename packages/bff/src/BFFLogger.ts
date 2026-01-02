import { Logger } from '@repo/logger';

export type BFFLoggerOptions = {
  logger: Logger;
};

export class BFFLogger {
  private readonly logger: Logger;

  constructor(opts: BFFLoggerOptions) {
    this.logger = opts.logger;
  }

  logRequest(request: Request) {
    this.logger.debug('Request', {
      url: request.url,
      method: request.method,
      headers: Object.fromEntries(request.headers.entries()),
    });
  }

  logResponse(request: Request, response: Response) {
    this.logger.debug('Response', {
      url: request.url,
      method: request.method,

      headers: Object.fromEntries(response.headers.entries()),
    });
  }
}
