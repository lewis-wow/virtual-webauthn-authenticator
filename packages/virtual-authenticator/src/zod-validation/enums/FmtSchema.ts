import z from 'zod';

import { Fmt } from '../../enums/Fmt';

export const FmtSchema = z.enum(Fmt).meta({
  id: 'Fmt',
  examples: [Fmt.NONE, Fmt.PACKED],
});
