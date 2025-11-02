import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';
import { HTTPExceptionFilter } from './filters/HTTPException.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalFilters(new HTTPExceptionFilter());

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
