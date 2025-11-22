import type { ValueOfEnum } from '@repo/types';

export const CollectedClientDataType = {
  WEBAUTHN_CREATE: 'webauthn.create',
  WEBAUTHN_GET: 'webauthn.get',
} as const;

export type CollectedClientDataType = ValueOfEnum<
  typeof CollectedClientDataType
>;
