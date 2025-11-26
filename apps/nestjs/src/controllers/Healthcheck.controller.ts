import { Controller } from '@nestjs/common';
import { nestjsContract } from '@repo/contract/nestjs';
import { GetHealthcheckResponseSchema } from '@repo/contract/validation';
import { tsRestHandler, TsRestHandler } from '@ts-rest/nest';
import { Schema } from 'effect';

@Controller()
export class HealthcheckController {
  @TsRestHandler(nestjsContract.api.healthcheck.get)
  async healthcheck() {
    return tsRestHandler(nestjsContract.api.healthcheck.get, async () => {
      return {
        status: 200,
        body: Schema.encodeSync(GetHealthcheckResponseSchema)({
          healthy: true,
        }),
      };
    });
  }
}
