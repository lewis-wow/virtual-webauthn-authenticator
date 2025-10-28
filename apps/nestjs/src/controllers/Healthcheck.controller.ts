import { Controller, Get, Req } from '@nestjs/common';
import { JwtPayload } from '@repo/auth'
import type { Request } from 'express'

@Controller()
export class HealthcheckController {
  constructor() {}

  @Get('/api/healthcheck')
  async getHello(@Req() req: Request): Promise<{
    ok: true,
    user: JwtPayload | null
  }> {
    return {
      ok: true,
      user: req.user ?? null,
    }
  }
}
