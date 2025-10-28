import { Controller } from '@nestjs/common';
import { contract } from '@repo/contract';
import { tsRestHandler, TsRestHandler } from '@ts-rest/nest';

@Controller()
export class HealthcheckController {
  constructor() {}

  @TsRestHandler(contract.api.healthcheck.get)
  async healthcheck() {
    return tsRestHandler(contract.api.healthcheck.get, async () => {
      return {
        status: 200,
        body: contract.api.healthcheck.get.responses[200].encode({
          healthy: true,
          codec: new Date(),
        }),
      };
    });
  }
}
