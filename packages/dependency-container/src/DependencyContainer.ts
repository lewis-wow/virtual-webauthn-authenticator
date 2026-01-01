import * as awilix from 'awilix';
import type { Merge } from 'type-fest';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type DependencyContainerMap = Record<string, any>;

export class DependencyContainer<
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  TDependencyContainerMap extends DependencyContainerMap = {},
> {
  /**
   * Type property only for type inference.
   */
  public readonly $dependencies: TDependencyContainerMap =
    undefined as unknown as TDependencyContainerMap;

  private readonly container = awilix.createContainer({
    injectionMode: awilix.InjectionMode.PROXY,
  });

  register<
    TName extends string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    TFactory extends (args: TDependencyContainerMap) => any,
  >(
    name: TName,
    factory: TFactory,
  ): DependencyContainer<
    Merge<TDependencyContainerMap, Record<TName, ReturnType<TFactory>>>
  > {
    this.container.register(name, awilix.asFunction(factory).singleton());
    return this;
  }

  resolve<TName extends keyof TDependencyContainerMap>(
    name: TName,
  ): TDependencyContainerMap[TName] {
    return this.container.resolve(name);
  }
}
