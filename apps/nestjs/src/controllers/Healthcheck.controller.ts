import { Controller } from '@nestjs/common';
import { contract } from '@repo/contract';
import type { JwtPayload } from '@repo/validation';
import { tsRestHandler, TsRestHandler } from '@ts-rest/nest';

import { Jwt } from '../decorators/Jwt.decorator';

@Controller()
export class HealthcheckController {
  @TsRestHandler(contract.api.healthcheck.get)
  async healthcheck(@Jwt() jwtPayload?: JwtPayload | null) {
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
