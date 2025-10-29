import { Controller, Req } from '@nestjs/common';
import { contract } from '@repo/contract';
import { tsRestHandler, TsRestHandler } from '@ts-rest/nest';
import type { Request } from 'express';

@Controller()
export class HealthcheckController {
  constructor() {}

  @TsRestHandler(contract.api.healthcheck.get)
  async healthcheck(@Req() req: Request) {
    return tsRestHandler(contract.api.healthcheck.get, async () => {
      return {
        status: 200,
        body: contract.api.healthcheck.get.responses[200].encode({
          healthy: true,
          codec: new Date(),
          jwtPayload: req.user ?? null,
        }),
      };
    });
  }
}
