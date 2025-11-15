import { Controller } from '@nestjs/common';
import { contract } from '@repo/contract';
import type { JwtPayload } from '@repo/validation';
import { tsRestHandler, TsRestHandler } from '@ts-rest/nest';

import { User } from '../decorators/User.decorator';

@Controller()
export class HealthcheckController {
  @TsRestHandler(contract.api.healthcheck.get)
  async healthcheck(@User() jwtPayload?: JwtPayload | null) {
    return tsRestHandler(contract.api.healthcheck.get, async () => {
      return {
        status: 200,
        body: contract.api.healthcheck.get.responses[200].encode({
          healthy: true,
          jwtPayload: jwtPayload ?? null,
        }),
      };
    });
  }
}
