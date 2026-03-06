import { Extension } from './Extension';

export type CredPropsOutputOptions = {
  requireResidentKey: boolean;
};

export type CredPropsOutput = {
  rk: boolean;
};

/**
 * Credential Properties Extension (credProps).
 *
 * This extension allows a Relying Party to determine certain credential properties
 * after it is created. Specifically, it allows the RP to determine if the credential
 * is a client-side discoverable credential (formerly known as a resident key).
 *
 * @see https://www.w3.org/TR/webauthn-3/#sctn-authenticator-credential-properties-extension
 */
export class CredPropsExtension extends Extension<
  unknown,
  null,
  CredPropsOutputOptions,
  CredPropsOutput
> {
  readonly identifier = 'credProps';
  readonly requiresAuthenticatorProcessing = false;

  /**
   * This extension does not require input processing.
   * The credProps extension only processes output.
   */
  processInput(): null {
    return null;
  }

  /**
   * Process the output to determine credential properties.
   *
   * @param opts - Contains requireResidentKey indicating if resident key was required
   * @returns Object containing rk (resident key) property
   */
  processOutput(opts: CredPropsOutputOptions): CredPropsOutput {
    const { requireResidentKey } = opts;

    return {
      rk: requireResidentKey,
    };
  }
}
