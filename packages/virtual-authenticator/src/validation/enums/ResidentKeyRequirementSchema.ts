import z from 'zod';

import { ResidentKey } from '../../enums/ResidentKey';

export const ResidentKeyRequirementSchema = z.enum(ResidentKey).meta({
  id: 'ResidentKey',
  examples: [ResidentKey.REQUIRED],
});
