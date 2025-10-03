import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate } from 'class-validator';

export class CreateApiTokenDto {
  @ApiProperty()
  @Type(() => Date)
  @IsDate()
  expiresAt!: Date;
}
