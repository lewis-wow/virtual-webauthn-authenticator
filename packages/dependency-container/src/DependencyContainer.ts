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

  /**
   * Registers a new dependency in the container.
   * @param name - The name of the dependency
   * @param factory - Factory function that creates the dependency
   * @returns Updated DependencyContainer with the new dependency registered
   */
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

  /**
   * Resolves a dependency from the container.
   * @param name - The name of the dependency to resolve
   * @returns The resolved dependency instance
   * @throws Error if the dependency cannot be resolved
   */
  resolve<TName extends keyof TDependencyContainerMap>(
    name: TName,
  ): TDependencyContainerMap[TName] {
    return this.container.resolve(name);
  }
}
