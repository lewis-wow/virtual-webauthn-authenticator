import { instanceToPlain, plainToClass } from 'class-transformer';
import { deepPickUnsafe, deepOmitUnsafe } from 'deep-pick-omit';

export type SerializeArgs = {
  pick?: string[];
  omit?: string[];
};

export class Transformable {
  serialize(args?: SerializeArgs): Record<string, unknown> {
    let plain = instanceToPlain(this);

    if (args?.omit) {
      plain = deepOmitUnsafe(plain, args.omit);
    }

    if (args?.pick) {
      plain = deepPickUnsafe(plain, args.pick);
    }

    return plain;
  }

  stringify(args?: SerializeArgs): string {
    return JSON.stringify(this.serialize(args));
  }

  static parse<T extends Transformable>(
    this: new (...args: unknown[]) => T,
    json: string,
  ): T {
    return plainToClass(this, JSON.parse(json));
  }

  static deserialize<T extends Transformable>(
    this: new (...args: unknown[]) => T,
    object: unknown,
  ): T {
    return plainToClass(this, object);
  }
}
