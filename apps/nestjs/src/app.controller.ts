import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { PrismaService } from './services/Prisma.service'

@Controller()
export class AppController {
  constructor(private readonly appService: AppService, private readonly prismaService: PrismaService) {}

  @Get()
  async getHello(): Promise<string> {
    const jwks = await this.prismaService.jwks.findMany()
    console.log('jwks', jwks)

    return this.appService.getHello();
  }
}
