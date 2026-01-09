import type { VirtualAuthenticatorCredentialSelectInterruptionPayload } from '../../validation';
import { Interruption } from '../Interruption';

export class VirtualAuthenticatorCredentialSelectInterruption extends Interruption {
  static readonly name = 'VirtualAuthenticatorCredentialSelectInterruption';
  static message = 'Credential select required.';

  constructor(
    public readonly payload: VirtualAuthenticatorCredentialSelectInterruptionPayload,
  ) {
    super();
  }
}
