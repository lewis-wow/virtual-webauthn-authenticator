import 'reflect-metadata';
import type {
  IAuthenticationExtensionsClientOutputs,
  IAuthenticatorAssertionResponse,
  IAuthenticatorAttestationResponse,
  IPublicKeyCredential,
  IPublicKeyCredentialJSON,
  IPublicKeyCredentialJSONResponse,
} from '../types.js';
import {
  assert,
  isString,
  isInstanceOf,
  isUnknown,
  isLiteral,
  isNullable,
  isEnum,
  isRecord,
} from 'typanion';
import { Expose, Transform, Type } from 'class-transformer';
import { bufferTransformer, Transformable } from '@repo/transformers';
import { AuthenticatorAttachment } from '../enums/AuthenticatorAttachment.js';
import { AuthenticatorAttestationResponseDto } from './AuthenticatorAttestationResponseDto.js';
import { AuthenticatorAssertionResponseDto } from './AuthenticatorAssertionResponseDto.js';

export type PublicKeyCredentialDtoOptions = {
  /**
   * Base64URL
   */
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
export class PublicKeyCredentialDto
  extends Transformable
  implements IPublicKeyCredential
{
  @Expose()
  public readonly id: string;

  @Transform(bufferTransformer('base64url'))
  public readonly rawId: Buffer;

  @Type(() => Object, {
    keepDiscriminatorProperty: true,
    discriminator: {
      property: 'type',
      subTypes: [
        {
          value: AuthenticatorAttestationResponseDto,
          name: 'AuthenticatorAttestationResponseDto',
        },
        {
          value: AuthenticatorAssertionResponseDto,
          name: 'AuthenticatorAssertionResponseDto',
        },
      ],
    },
  })
  public readonly response:
    | IAuthenticatorAttestationResponse
    | IAuthenticatorAssertionResponse;

  @Expose()
  public readonly type: 'public-key';

  @Expose()
  public readonly clientExtensionResults: IAuthenticationExtensionsClientOutputs;

  @Expose()
  public readonly authenticatorAttachment: AuthenticatorAttachment | null;

  constructor(credential: PublicKeyCredentialDtoOptions) {
    super();

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
    assert(response, isRecord(isUnknown()));
    assert(type, isLiteral('public-key'));
    assert(clientExtensionResults, isRecord(isUnknown()));
    assert(
      authenticatorAttachment,
      isNullable(isEnum(Object.values(AuthenticatorAttachment))),
    );

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
