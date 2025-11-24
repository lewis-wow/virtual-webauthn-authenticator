import { Controller } from '@nestjs/common';
import type { JwtPayload } from '@repo/auth/validation';
import { nestjsContract } from '@repo/contract/nestjs';
import { GetProfileResponseSchema } from '@repo/contract/validation';
import { tsRestHandler, TsRestHandler } from '@ts-rest/nest';
import { Schema } from 'effect';

import { Jwt } from '../decorators/Jwt.decorator';

@Controller()
export class ProfileController {
  @TsRestHandler(nestjsContract.api.profile.get)
  async healthcheck(@Jwt() jwtPayload: JwtPayload) {
    return tsRestHandler(nestjsContract.api.profile.get, async () => {
      return {
        status: 200,
        body: Schema.encodeSync(GetProfileResponseSchema)({
          jwtPayload,
        }),
      };
    });
  }
}
