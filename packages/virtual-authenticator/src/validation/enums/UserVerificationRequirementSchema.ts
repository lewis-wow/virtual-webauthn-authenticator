import z from 'zod';

import { UserVerification } from '../../enums/UserVerification';

export const UserVerificationRequirementSchema = z.enum(UserVerification).meta({
  id: 'UserVerification',
  examples: [UserVerification.DISCOURAGED],
});
