import { Schema } from 'effect';

import { Fmt } from '../../enums/Fmt';

export const FmtSchema = Schema.Enums(Fmt).pipe(
  Schema.annotations({
    identifier: 'Fmt',
    examples: [Fmt.NONE, Fmt.PACKED],
  }),
);
