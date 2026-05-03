import { EventEmitter } from 'events';

export type InteractionPayload<TArgs, TReturn> = {
  resolve: (result: TReturn) => void;
  reject: (reason?: any) => void;
  args: TArgs;
};

export type ListenerFn<
  TEventMap extends EventMapBase,
  K extends keyof TEventMap,
> = (
  args: Parameters<TEventMap[K]>[0],
  resolve: (result: ReturnType<TEventMap[K]>) => void,
  reject: (reason?: any) => void,
) => void;

export type InteractionServiceOptions = {
  eventEmitter: EventEmitter;
};

export type EventMapBase = Record<string, (...args: any[]) => any>;

export class InteractionService<TEventMap extends EventMapBase = any> {
  private readonly eventEmitter: EventEmitter;

  constructor(opts: InteractionServiceOptions) {
    this.eventEmitter = opts.eventEmitter;
  }

  private readonly listenerMap = new Map<
    Function,
    (payload: InteractionPayload<any, any>) => void
  >();

  /**
   * Emits an event and waits for a listener to resolve the promise.
   *
   * @template K - The event key
   * @param event - The event name
   * @param args - The first argument of the function defined in TEventMap
   */
  public async emitInteraction<K extends keyof TEventMap>(
    event: K,
    args: Parameters<TEventMap[K]>[0],
  ): Promise<ReturnType<TEventMap[K]>> {
    return new Promise((resolve, reject) => {
      const payload: InteractionPayload<
        Parameters<TEventMap[K]>[0],
        ReturnType<TEventMap[K]>
      > = {
        resolve,
        reject,
        args,
      };

      this.eventEmitter.emit(event as string, payload);
    });
  }

  /**
   * Registers a listener.
   * The listener now receives `resolve` and `reject` alongside `args`.
   * This allows you to resolve the promise later (e.g., inside an onClick handler).
   *
   * @template K - The event key
   * @param event - The event name
   * @param listener - A function that receives (args, resolve, reject)
   */
  public onInteraction<K extends keyof TEventMap>(
    event: K,
    listener: ListenerFn<TEventMap, K>,
  ): void {
    const wrapper = (
      payload: InteractionPayload<
        Parameters<TEventMap[K]>[0],
        ReturnType<TEventMap[K]>
      >,
    ) => {
      try {
        listener(payload.args, payload.resolve, payload.reject);
      } catch (e) {
        payload.reject(e);
      }
    };

    this.listenerMap.set(listener, wrapper);
    this.eventEmitter.on(event as string, wrapper);
  }

  /**
   * Removes a listener.
   *
   * @template K - The event key
   */
  public offInteraction<K extends keyof TEventMap>(
    event: K,
    listener: ListenerFn<TEventMap, K>,
  ): void {
    const wrapper = this.listenerMap.get(listener);

    if (wrapper) {
      this.eventEmitter.off(event as string, wrapper);
      this.listenerMap.delete(listener);
    }
  }
}
