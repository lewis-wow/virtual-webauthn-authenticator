import { Schema } from 'effect';

import { UserVerificationRequirement } from '../../enums/UserVerificationRequirement';

export const UserVerificationRequirementSchema = Schema.Enums(
  UserVerificationRequirement,
).pipe(
  Schema.annotations({
    identifier: 'UserVerificationRequirement',
    examples: [UserVerificationRequirement.DISCOURAGED],
  }),
);
