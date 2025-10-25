import z from 'zod';

import type { ValueOfEnum } from '../types';

export const CollectedClientDataType = {
  WEBAUTHN_CREATE: 'webauthn.create',
  WEBAUTHN_GET: 'webauthn.get',
} as const;

export type CollectedClientDataType = ValueOfEnum<
  typeof CollectedClientDataType
>;

export const CollectedClientDataTypeSchema = z
  .enum(CollectedClientDataType)
  .meta({
    description: 'Collected client data type',
    examples: [
      CollectedClientDataType.WEBAUTHN_CREATE,
      CollectedClientDataType.WEBAUTHN_GET,
    ],
  });
