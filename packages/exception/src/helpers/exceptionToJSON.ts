import { omitUndefined } from '@repo/utils';

import type { AnyException } from '../Exception';

export function exceptionToJSON(
  exception: AnyException,
  opts?: { omitData?: boolean },
) {
  return omitUndefined({
    message: exception.message,
    code: exception.code,
    data: opts?.omitData === true ? undefined : exception.data,
  });
}
