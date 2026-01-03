import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';
import { env } from './env';

/**
 * Bootstraps the NestJS application.
 * Initializes the application and starts listening on the configured port.
 */
async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  await app.listen(env.PORT);
}
void bootstrap();
