import { UseInterceptors, applyDecorators } from '@nestjs/common';
import { PickInterceptor } from '../interceptors/pick.interceptor';

export function Pick(fields: string[]) {
  return applyDecorators(UseInterceptors(new PickInterceptor(fields)));
}
