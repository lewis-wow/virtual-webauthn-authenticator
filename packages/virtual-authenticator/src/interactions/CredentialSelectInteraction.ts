import type { CredentialSelectExceptionPayload } from '../validation/exceptions/CredentialSelectExceptionPayloadSchema';
import { Interaction } from './Interaction';

export class CredentialSelectInteraction extends Interaction {
  constructor(public readonly payload: CredentialSelectExceptionPayload) {
    super('Credential select required.');
  }
}
