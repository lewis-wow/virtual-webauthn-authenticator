import z from 'zod';

import { LogEntity } from '../../enums/LogEntity';

export const LogEntitySchema = z.enum(LogEntity).meta({
  id: 'LogEntity',
  examples: [LogEntity.WEB_AUTHN_PUBLIC_KEY_CREDENTIAL],
});
