import z from 'zod';

import { TokenBindingStatus } from '../../enums/TokenBindingStatus';

export const TokenBindingStatusSchema = z.enum(TokenBindingStatus).meta({
  id: 'TokenBindingStatus',
  examples: [TokenBindingStatus.PRESENT],
});
