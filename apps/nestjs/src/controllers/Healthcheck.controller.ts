import { Controller, UseFilters } from '@nestjs/common';
import { GetHealthcheckResponseSchema } from '@repo/contract/dto';
import { nestjsContract } from '@repo/contract/nestjs';
import { tsRestHandler, TsRestHandler } from '@ts-rest/nest';

import { ExceptionFilter } from '../filters/Exception.filter';

@Controller()
@UseFilters(ExceptionFilter)
export class HealthcheckController {
  @TsRestHandler(nestjsContract.api.healthcheck.get)
  async healthcheck() {
    return tsRestHandler(nestjsContract.api.healthcheck.get, async () => {
      return {
        status: 200,
        body: GetHealthcheckResponseSchema.encode({
          healthy: true,
        }),
      };
    });
  }
}
