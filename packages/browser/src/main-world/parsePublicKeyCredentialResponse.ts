import {
  PublicKeyCredentialDtoSchema,
  PublicKeyCredentialOrApplicablePublicKeyCredentialsListDtoSchema,
} from '@repo/virtual-authenticator/dto';
import type {
  ApplicablePublicKeyCredential,
  AuthenticatorAssertionResponse,
  AuthenticatorAttestationResponse,
} from '@repo/virtual-authenticator/validation';

import { AuthenticatorAssertionResponseImpl } from '../standard-impl/AuthenticatorAssertionResponseImpl';
import { AuthenticatorAttestationResponseImpl } from '../standard-impl/AuthenticatorAttestationResponseImpl';
import { PublicKeyCredentialImpl } from '../standard-impl/PublicKeyCredentialImpl';

function createResponseImpl(
  publicKeyCredentialResponse:
    | AuthenticatorAttestationResponse
    | AuthenticatorAssertionResponse,
) {
  if ('attestationObject' in publicKeyCredentialResponse) {
    return new AuthenticatorAttestationResponseImpl({
      attestationObject:
        publicKeyCredentialResponse.attestationObject.slice().buffer,
      clientDataJSON: publicKeyCredentialResponse.clientDataJSON.slice().buffer,
      transports: publicKeyCredentialResponse.transports,
    });
  } else {
    return new AuthenticatorAssertionResponseImpl({
      ...publicKeyCredentialResponse,
      authenticatorData:
        publicKeyCredentialResponse.authenticatorData.slice().buffer,
      clientDataJSON: publicKeyCredentialResponse.clientDataJSON.slice().buffer,
      signature: publicKeyCredentialResponse.signature.slice().buffer,
      userHandle:
        publicKeyCredentialResponse.userHandle?.slice().buffer ?? null,
    });
  }
}

/**
 * Parses a raw API response for credential creation and creates the
 * PublicKeyCredentialImpl object for use in the main world.
 */
export function parsePublicKeyCredentialCreationResponse(
  json: unknown,
): PublicKeyCredential {
  const publicKeyCredential = PublicKeyCredentialDtoSchema.parse(json);

  return new PublicKeyCredentialImpl({
    id: publicKeyCredential.id,
    rawId: publicKeyCredential.rawId.slice().buffer,
    response: createResponseImpl(publicKeyCredential.response),
    authenticatorAttachment: publicKeyCredential.authenticatorAttachment,
    clientExtensionResults: publicKeyCredential.clientExtensionResults,
  });
}

/**
 * Parses a raw API response for credential get (assertion) and creates either
 * a PublicKeyCredentialImpl or returns the list of applicable credentials.
 */
export function parsePublicKeyCredentialGetResponse(
  json: unknown,
): PublicKeyCredential | ApplicablePublicKeyCredential[] {
  const publicKeyCredentialOrApplicablePublicKeyCredentialsList =
    PublicKeyCredentialOrApplicablePublicKeyCredentialsListDtoSchema.parse(
      json,
    );

  if (Array.isArray(publicKeyCredentialOrApplicablePublicKeyCredentialsList)) {
    return publicKeyCredentialOrApplicablePublicKeyCredentialsList;
  }

  return new PublicKeyCredentialImpl({
    id: publicKeyCredentialOrApplicablePublicKeyCredentialsList.id,
    rawId:
      publicKeyCredentialOrApplicablePublicKeyCredentialsList.rawId.slice()
        .buffer,
    response: createResponseImpl(
      publicKeyCredentialOrApplicablePublicKeyCredentialsList.response,
    ),
    authenticatorAttachment:
      publicKeyCredentialOrApplicablePublicKeyCredentialsList.authenticatorAttachment,
    clientExtensionResults:
      publicKeyCredentialOrApplicablePublicKeyCredentialsList.clientExtensionResults,
  });
}
