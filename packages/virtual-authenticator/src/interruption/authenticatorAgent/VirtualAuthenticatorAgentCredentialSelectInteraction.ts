import type { VirtualAuthenticatorAgentCredentialSelectInterruptionPayload } from '../../validation/authenticatorAgent/interruption/VirtualAuthenticatorAgentCredentialSelectInterruptionPayloadSchema';
import { Interruption } from '../Interruption';

export class VirtualAuthenticatorAgentCredentialSelectInterruption extends Interruption {
  constructor(
    public readonly payload: VirtualAuthenticatorAgentCredentialSelectInterruptionPayload,
  ) {
    super({ message: 'Credential select required.' });
  }
}
