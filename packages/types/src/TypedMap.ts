import type { PropertyKey } from './PropertyKey';

export type TypedMapTypes = Record<PropertyKey, unknown>;

export class TypedMap<T extends TypedMapTypes> extends Map<
  keyof T,
  T[keyof T]
> {
  /**
   * Sets the value for the key in the Map object. Returns the Map object.
   * strictly enforces that the value matches the type defined for the specific key in T.
   */
  public set<K extends keyof T>(key: K, value: T[K]): this {
    return super.set(key, value);
  }

  /**
   * Returns the specific element associated with the specified key.
   * The return type is narrowed to the specific value type associated with K in T.
   */
  public get<K extends keyof T>(key: K): T[K] | undefined {
    return super.get(key) as T[K] | undefined;
  }

  /**
   * Removes any value associated to the key.
   * Strictly enforces that the key is a valid key of T.
   */
  public delete(key: keyof T): boolean {
    return super.delete(key);
  }

  /**
   * Returns a boolean asserting whether an element with the given key exists or not.
   * Strictly enforces that the key is a valid key of T.
   */
  public has(key: keyof T): boolean {
    return super.has(key);
  }
}
