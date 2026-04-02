import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';
import { env } from './env';

const bootstrap = async (): Promise<void> => {
  const app = await NestFactory.create(AppModule);

  await app.listen(env.PORT);
};
void bootstrap();
