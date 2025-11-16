import { set as _set, get } from 'lodash-es';
import type { Get } from 'type-fest';

export const setDeep = <TObject extends object, TPath extends string>(
  obj: TObject,
  path: TPath,
  value: (currentValue: Get<TObject, TPath>) => unknown,
): TObject => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return _set(obj, path, value(get(obj, path) as any));
};
