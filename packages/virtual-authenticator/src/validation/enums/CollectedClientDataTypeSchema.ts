import { Schema } from 'effect';

import { CollectedClientDataType } from '../../enums/CollectedClientDataType';

export const CollectedClientDataTypeSchema = Schema.Enums(
  CollectedClientDataType,
).pipe(
  Schema.annotations({
    identifier: 'CollectedClientDataType',
    examples: [
      CollectedClientDataType.WEBAUTHN_CREATE,
      CollectedClientDataType.WEBAUTHN_GET,
    ],
  }),
);
