import { Controller, UseFilters } from '@nestjs/common';
import type { JwtPayload } from '@repo/auth/zod-validation';
import { GetProfileResponseSchema } from '@repo/contract/dto';
import { nestjsContract } from '@repo/contract/nestjs';
import { HttpStatusCode } from '@repo/http';
import { tsRestHandler, TsRestHandler } from '@ts-rest/nest';

import { Jwt } from '../decorators/Jwt.decorator';
import { ExceptionFilter } from '../filters/Exception.filter';

@Controller()
@UseFilters(ExceptionFilter)
export class ProfileController {
  @TsRestHandler(nestjsContract.api.profile.get)
  async healthcheck(@Jwt() jwtPayload: JwtPayload) {
    return tsRestHandler(nestjsContract.api.profile.get, async () => {
      return {
        status: HttpStatusCode.OK,
        body: GetProfileResponseSchema[HttpStatusCode.OK].encode({
          jwtPayload,
        }),
      };
    });
  }
}
