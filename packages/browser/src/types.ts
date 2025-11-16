export interface PublicKeyCredential extends Credential {
  readonly rawId: ArrayBuffer;
  readonly response: AuthenticatorResponse;
  readonly authenticatorAttachment: string | null;
  getClientExtensionResults(): AuthenticationExtensionsClientOutputs;
}

export interface AuthenticatorResponse {
  readonly clientDataJSON: ArrayBuffer;
}

export interface AuthenticatorAttestationResponse
  extends AuthenticatorResponse {
  readonly attestationObject: ArrayBuffer;
}

export interface AuthenticatorAssertionResponse extends AuthenticatorResponse {
  readonly authenticatorData: ArrayBuffer;
  readonly signature: ArrayBuffer;
  readonly userHandle: ArrayBuffer | null;
}

export interface AuthenticationExtensionsClientOutputs {
  [key: string]: any;
}
