import { Controller, UseFilters } from '@nestjs/common';
import { GetHealthcheckResponseSchema } from '@repo/contract/dto';
import { nestjsContract } from '@repo/contract/nestjs';
import { HttpStatusCode } from '@repo/http';
import { tsRestHandler, TsRestHandler } from '@ts-rest/nest';

import { ExceptionFilter } from '../filters/Exception.filter';

@Controller()
@UseFilters(ExceptionFilter)
export class HealthcheckController {
  @TsRestHandler(nestjsContract.api.healthcheck.get)
  async healthcheck() {
    return tsRestHandler(nestjsContract.api.healthcheck.get, async () => {
      return {
        status: HttpStatusCode.OK_200,
        body: GetHealthcheckResponseSchema[HttpStatusCode.OK_200].encode({
          healthy: true,
        }),
      };
    });
  }
}
