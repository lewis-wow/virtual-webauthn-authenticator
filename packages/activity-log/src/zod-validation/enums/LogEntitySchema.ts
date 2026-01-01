import z from 'zod';

import { LogEntity } from '../../enums/LogEntity';

export const LogEntitySchema = z.enum(LogEntity).meta({
  id: 'LogEntity',
  examples: [LogEntity.WEBAUTHN_PUBLIC_KEY_CREDENTIAL],
});
