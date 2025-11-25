import { Controller } from '@nestjs/common';
import { AuditLog } from '@repo/audit-log';
import type { JwtPayload } from '@repo/auth/validation';
import { nestjsContract } from '@repo/contract/nestjs';
import { ListAuditLogsResponseSchema } from '@repo/contract/validation';
import { tsRestHandler, TsRestHandler } from '@ts-rest/nest';
import { Schema } from 'effect';

import { Jwt } from '../decorators/Jwt.decorator';

@Controller()
export class AuditLogsController {
  constructor(private readonly auditLog: AuditLog) {}

  @TsRestHandler(nestjsContract.api.auditLogs.list)
  async healthcheck(@Jwt() jwtPayload: JwtPayload) {
    return tsRestHandler(nestjsContract.api.auditLogs.list, async () => {
      const logsPagination = await this.auditLog.getUserHistory({
        userId: jwtPayload.userId,
      });

      return {
        status: 200,
        body: Schema.encodeSync(ListAuditLogsResponseSchema)(logsPagination),
      };
    });
  }
}
