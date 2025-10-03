export type ValueOf<T> = T[keyof T];

export type MaybePromise<T> = T | Promise<T>;
