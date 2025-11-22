import { Schema } from 'effect';

import { ResidentKeyRequirement } from '../../enums/ResidentKeyRequirement';

export const ResidentKeyRequirementSchema = Schema.Enums(
  ResidentKeyRequirement,
).pipe(
  Schema.annotations({
    identifier: 'ResidentKeyRequirement',
    examples: [ResidentKeyRequirement.REQUIRED],
  }),
);
