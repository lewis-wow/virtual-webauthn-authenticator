import type { MaybePromise } from '@repo/types';
import type { Context, MiddlewareHandler } from 'hono';

export class Lazy<
  TName extends string,
  TModule,
  TContext extends Context | undefined | void = undefined | void,
> {
  readonly $InferLazyModule!: TModule;
  readonly $InferVariables!: Record<TName, TModule>;

  constructor(
    private readonly name: TName,
    private readonly factory: (ctx: TContext) => MaybePromise<TModule>,
  ) {}

  private cached?: TModule;

  async resolve(ctx: TContext): Promise<TModule> {
    return (this.cached ??= await this.factory(ctx));
  }

  middleware(): MiddlewareHandler<{ Variables: Record<TName, TModule> }> {
    return async (ctx, next) => {
      const module = await this.resolve(ctx as TContext);
      ctx.set(this.name, module);

      return next();
    };
  }
}

export type AnyLazy = Lazy<string, any>;
