import { Schema } from 'effect';

import { TokenBindingStatus } from '../../enums/TokenBindingStatus';

export const TokenBindingStatusSchema = Schema.Enums(TokenBindingStatus).pipe(
  Schema.annotations({
    identifier: 'TokenBindingStatus',
    title: 'TokenBindingStatus',
    examples: [TokenBindingStatus.PRESENT],
  }),
);
