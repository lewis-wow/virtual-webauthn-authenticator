import { Inject, Injectable } from '@nestjs/common';
import { type Env, EnvProviderToken } from './Env.provider';

@Injectable()
export class EnvService {
  constructor(@Inject(EnvProviderToken) private readonly envProvider: Env) {}

  get<T extends keyof Env>(key: T) {
    return this.envProvider[key];
  }
}
