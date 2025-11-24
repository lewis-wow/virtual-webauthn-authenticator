import z from 'zod';

import { UserVerificationRequirement } from '../../enums/UserVerificationRequirement';

export const UserVerificationRequirementSchema = z.enum(UserVerificationRequirement).meta({
  id: 'UserVerificationRequirement',
  examples: [UserVerificationRequirement.DISCOURAGED],
});
