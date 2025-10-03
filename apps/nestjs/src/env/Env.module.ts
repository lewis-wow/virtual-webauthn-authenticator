import { Module } from '@nestjs/common';
import { EnvService } from './Env.service';
import { EnvProvider } from './Env.provider';

@Module({
  imports: [],
  providers: [EnvProvider, EnvService],
  exports: [EnvProvider, EnvService],
})
export class EnvModule {}
