import type { AuthenticatorAttachment } from './AuthenticatorAttachment.js';
import type { ResidentKeyRequirement } from './ResidentKeyRequirement.js';
import type { UserVerificationRequirement } from './UserVerificationRequirement.js';

export interface IAuthenticatorSelectionCriteria {
  authenticatorAttachment?: AuthenticatorAttachment;
  requireResidentKey?: boolean;
  residentKey?: ResidentKeyRequirement;
  userVerification?: UserVerificationRequirement;
}
