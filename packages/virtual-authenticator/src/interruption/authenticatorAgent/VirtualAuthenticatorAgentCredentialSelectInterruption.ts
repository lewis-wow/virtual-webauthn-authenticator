import type { VirtualAuthenticatorAgentCredentialSelectInterruptionPayload } from '../../validation/authenticatorAgent/interruption/VirtualAuthenticatorAgentCredentialSelectInterruptionPayloadSchema';
import { Interruption } from '../Interruption';

export class VirtualAuthenticatorAgentCredentialSelectInterruption extends Interruption {
  static readonly name =
    'VirtualAuthenticatorAgentCredentialSelectInterruption';
  static message = 'Credential select required.';

  constructor(
    public readonly payload: VirtualAuthenticatorAgentCredentialSelectInterruptionPayload,
  ) {
    super();
  }
}
