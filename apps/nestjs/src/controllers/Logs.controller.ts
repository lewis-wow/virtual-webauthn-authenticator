import { Controller } from '@nestjs/common';
import { ActivityLog } from '@repo/activity-log';
import type { JwtPayload } from '@repo/auth/zod-validation';
import { ListLogsResponseSchema } from '@repo/contract/dto';
import { nestjsContract } from '@repo/contract/nestjs';
import { tsRestHandler, TsRestHandler } from '@ts-rest/nest';

import { Jwt } from '../decorators/Jwt.decorator';

@Controller()
export class LogsController {
  constructor(private readonly activityLog: ActivityLog) {}

  @TsRestHandler(nestjsContract.api.logs.list)
  async healthcheck(@Jwt() jwtPayload: JwtPayload) {
    return tsRestHandler(nestjsContract.api.logs.list, async ({ query }) => {
      const logs = await this.activityLog.getUserHistory({
        userId: jwtPayload.userId,
        limit: query?.limit,
        cursor: query?.cursor,
      });

      return {
        status: 200,
        body: ListLogsResponseSchema.encode(logs),
      };
    });
  }
}
