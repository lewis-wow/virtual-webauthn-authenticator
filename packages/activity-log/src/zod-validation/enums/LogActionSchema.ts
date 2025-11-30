import z from 'zod';

import { LogAction } from '../../enums/LogAction';

export const LogActionSchema = z.enum(LogAction).meta({
  id: 'LogAction',
  examples: [LogAction.CREATE],
});
