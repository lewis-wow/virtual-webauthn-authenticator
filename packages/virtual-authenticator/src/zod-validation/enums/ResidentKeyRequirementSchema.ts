import z from 'zod';

import { ResidentKeyRequirement } from '../../enums/ResidentKeyRequirement';

export const ResidentKeyRequirementSchema = z.enum(ResidentKeyRequirement).meta({
  id: 'ResidentKeyRequirement',
  examples: [ResidentKeyRequirement.REQUIRED],
});
