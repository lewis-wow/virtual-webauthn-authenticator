export type EventMap = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: (...args: any[]) => void;
};

/**
 * @see https://github.com/andywer/typed-emitter/blob/master/index.d.ts
 */
export interface TypedEventEmitter<Events extends EventMap> {
  on<E extends keyof Events>(event: E, listener: Events[E]): this;
}
