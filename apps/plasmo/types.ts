import type { SerializableError } from '~utils/serializeError';

export type MessageResponse<TData> = {
  ok: boolean;
  error?: SerializableError | null;
  data?: TData;
} & Record<string, unknown>;
