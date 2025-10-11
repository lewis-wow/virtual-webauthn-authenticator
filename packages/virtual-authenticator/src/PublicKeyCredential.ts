import type {
  PublicKeyCredentialType,
  AuthenticatorAttachment,
} from '@repo/enums';
import type {
  Base64URLString,
  IAuthenticationExtensionsClientOutputs,
  IAuthenticatorAssertionResponse,
  IAuthenticatorAttestationResponse,
  IPublicKeyCredential,
} from '@repo/types';
import { PublicKeyCredentialSchema } from '@repo/validation';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface PublicKeyCredentialOptions extends IPublicKeyCredential {}

export class PublicKeyCredential<
  TResponse extends
    | IAuthenticatorAttestationResponse
    | IAuthenticatorAssertionResponse =
    | IAuthenticatorAttestationResponse
    | IAuthenticatorAssertionResponse,
> implements IPublicKeyCredential
{
  /** The unique, Base64URL-encoded ID for this credential. */
  id!: Base64URLString;
  /** The raw binary version of the credential ID. */
  rawId!: Buffer;
  /** The authenticator's response, either for registration or authentication. */
  response!: TResponse;
  /** The type of credential, which is always 'public-key' for WebAuthn. */
  type!: PublicKeyCredentialType;
  /** The client extension results from the ceremony. */
  clientExtensionResults!: IAuthenticationExtensionsClientOutputs;
  /** The attachment type of the authenticator, if known. */
  authenticatorAttachment!: AuthenticatorAttachment | null;

  constructor(opts: PublicKeyCredentialOptions) {
    Object.assign(this, opts);
  }

  toJSON() {
    return PublicKeyCredentialSchema.encode(this);
  }

  static parse(data: unknown) {
    return new PublicKeyCredential(PublicKeyCredentialSchema.parse(data));
  }
}
