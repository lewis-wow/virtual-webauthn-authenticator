import type { VirtualAuthenticatorCredentialSelectInterruptionPayload } from '../../validation';
import { Interruption } from '../Interruption';

export class VirtualAuthenticatorCredentialSelectInterruption extends Interruption {
  constructor(
    public readonly payload: VirtualAuthenticatorCredentialSelectInterruptionPayload,
  ) {
    super({ message: 'Credential select required.' });
  }
}
