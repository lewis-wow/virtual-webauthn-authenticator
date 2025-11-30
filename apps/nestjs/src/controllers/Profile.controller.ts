import { Controller } from '@nestjs/common';
import type { JwtPayload } from '@repo/auth/zod-validation';
import { GetProfileResponseSchema } from '@repo/contract/dto';
import { nestjsContract } from '@repo/contract/nestjs';
import { tsRestHandler, TsRestHandler } from '@ts-rest/nest';

import { Jwt } from '../decorators/Jwt.decorator';

@Controller()
export class ProfileController {
  @TsRestHandler(nestjsContract.api.profile.get)
  async healthcheck(@Jwt() jwtPayload: JwtPayload) {
    return tsRestHandler(nestjsContract.api.profile.get, async () => {
      return {
        status: 200,
        body: GetProfileResponseSchema.encode({
          jwtPayload,
        }),
      };
    });
  }
}
