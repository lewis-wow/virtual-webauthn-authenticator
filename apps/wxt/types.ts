import { ErrorJSON } from '@repo/core/mappers';

export type MessageResponse<TData> = {
  ok: boolean;
  error?: ErrorJSON | null;
  data?: TData;
} & Record<string, unknown>;
