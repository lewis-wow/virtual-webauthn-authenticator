import { Controller } from '@nestjs/common';
import { contract } from '@repo/contract';
import { GetHealthcheckResponseSchema } from '@repo/contract/validation';
import { tsRestHandler, TsRestHandler } from '@ts-rest/nest';
import { Schema } from 'effect';

@Controller()
export class HealthcheckController {
  @TsRestHandler(contract.api.healthcheck.get)
  async healthcheck() {
    return tsRestHandler(contract.api.healthcheck.get, async () => {
      return {
        status: 200,
        body: Schema.encodeSync(GetHealthcheckResponseSchema)({
          healthy: true,
        }),
      };
    });
  }
}
