import z from 'zod';

import { CollectedClientDataType } from '../../enums/CollectedClientDataType';

export const CollectedClientDataTypeSchema = z
  .enum(CollectedClientDataType)
  .meta({
    id: 'CollectedClientDataType',
    examples: [
      CollectedClientDataType.WEBAUTHN_CREATE,
      CollectedClientDataType.WEBAUTHN_GET,
    ],
  });
