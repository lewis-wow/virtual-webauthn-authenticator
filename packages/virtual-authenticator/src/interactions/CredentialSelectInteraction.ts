import type { CredentialSelectExceptionPayload } from '../validation/exceptions/CredentialSelectExceptionPayloadSchema';
import { Interaction } from './Interaction';

export class CredentialSelectInteraction extends Interaction {
  static readonly code = 'CredentialSelectInteraction';

  constructor(public readonly payload: CredentialSelectExceptionPayload) {
    super('Credential select required.');
  }
}
