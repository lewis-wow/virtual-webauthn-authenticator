import type { AnyException } from './Exception';
import type { ExceptionShape } from './validation';

export type inferExceptionData<T> = T extends { data: infer D } ? D : unknown;

export type ExceptionConstructor<T extends AnyException> = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  new (...args: any[]): T;
  readonly code: string;
};

export type AnyExceptionConstructor = ExceptionConstructor<AnyException>;

export const isExceptionShape = <TCtor extends AnyExceptionConstructor>(
  exceptionConstructor: TCtor,
) => {
  // Infer the instance type from the constructor
  type TInstance = InstanceType<TCtor>;

  return (shape: {
    code: string;
  }): shape is ExceptionShape<TCtor['code'], inferExceptionData<TInstance>> =>
    shape.code === exceptionConstructor.code;
};
