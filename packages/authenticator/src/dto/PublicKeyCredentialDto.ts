import type {
  IAuthenticationExtensionsClientOutputs,
  IAuthenticatorAssertionResponse,
  IAuthenticatorAttestationResponse,
  IPublicKeyCredential,
  IPublicKeyCredentialJSON,
  IPublicKeyCredentialJSONResponse,
} from '../types.js';
import { assert, isString, isInstanceOf, isUnknown, isLiteral } from 'typanion';

export type PublicKeyCredentialDtoOptions = {
  id: string;
  rawId: Buffer;
  response: IAuthenticatorAttestationResponse | IAuthenticatorAssertionResponse;
  type: 'public-key';
  clientExtensionResults: IAuthenticationExtensionsClientOutputs;
  authenticatorAttachment: AuthenticatorAttachment | null;
};

/**
 * A simple TypeScript class to represent the W3C WebAuthn PublicKeyCredential interface.
 * This DTO (Data Transfer Object) is designed to work on a server, where binary data is handled as Buffers.
 */
export class PublicKeyCredentialDto implements IPublicKeyCredential {
  public readonly id: string;
  public readonly rawId: Buffer;
  public readonly response:
    | IAuthenticatorAttestationResponse
    | IAuthenticatorAssertionResponse;
  public readonly type: 'public-key';
  public readonly clientExtensionResults: IAuthenticationExtensionsClientOutputs;
  public readonly authenticatorAttachment: AuthenticatorAttachment | null;

  constructor(credential: PublicKeyCredentialDtoOptions) {
    const {
      id,
      rawId,
      response,
      type,
      clientExtensionResults = {},
      authenticatorAttachment = null,
    } = credential;

    assert(id, isString());
    assert(rawId, isInstanceOf(Buffer));
    assert(response, isUnknown());
    assert(type, isLiteral('public-key'));

    this.id = id;
    this.rawId = rawId;
    this.response = response;
    this.type = type;
    this.clientExtensionResults = clientExtensionResults;
    this.authenticatorAttachment = authenticatorAttachment;
  }

  /**
   * Returns the client extension results.
   */
  public getClientExtensionResults(): IAuthenticationExtensionsClientOutputs {
    return this.clientExtensionResults;
  }

  /**
   * Type guard to check if a response is an AuthenticatorAttestationResponse.
   */
  private isAttestationResponse(
    response: unknown,
  ): response is IAuthenticatorAttestationResponse {
    return (
      (response as IAuthenticatorAttestationResponse).attestationObject !==
      undefined
    );
  }

  /**
   * Converts a Buffer to a base64url encoded string.
   */
  private bufferToBase64Url(buffer?: Buffer | null): string | undefined {
    if (!buffer) return undefined;
    return buffer.toString('base64url');
  }

  /**
   * Returns a JSON-serializable representation of the PublicKeyCredential.
   * All Buffer properties are converted to base64url strings.
   */
  public toJSON(): IPublicKeyCredentialJSON {
    const responseJSON: IPublicKeyCredentialJSONResponse = {
      clientDataJSON: this.bufferToBase64Url(this.response.clientDataJSON)!,
    };

    // Use the type guard to safely access response properties
    if (this.isAttestationResponse(this.response)) {
      responseJSON.attestationObject = this.bufferToBase64Url(
        this.response.attestationObject,
      );
    } else {
      // It must be an assertion response
      responseJSON.authenticatorData = this.bufferToBase64Url(
        this.response.authenticatorData,
      );
      responseJSON.signature = this.bufferToBase64Url(this.response.signature);
      responseJSON.userHandle = this.bufferToBase64Url(
        this.response.userHandle,
      );
    }

    return {
      id: this.id,
      rawId: this.bufferToBase64Url(this.rawId)!,
      type: this.type,
      clientExtensionResults: this.clientExtensionResults,
      authenticatorAttachment: this.authenticatorAttachment,
      response: responseJSON,
    };
  }
}
