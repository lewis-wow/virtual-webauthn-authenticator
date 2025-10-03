import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { deepPickUnsafe } from 'deep-pick-omit';

@Injectable()
export class PickInterceptor implements NestInterceptor {
  constructor(private readonly fields: string[]) {}

  intercept(_context: ExecutionContext, next: CallHandler): Observable<any> {
    return next
      .handle()
      .pipe(map((data) => deepPickUnsafe(data as object, this.fields)));
  }
}
