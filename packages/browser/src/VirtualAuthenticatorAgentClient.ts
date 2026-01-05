import { Exception } from '@repo/exception';
import { omit } from '@repo/utils';
import {
  PublicKeyCredentialCreationOptionsDtoSchema,
  PublicKeyCredentialDtoSchema,
  PublicKeyCredentialOrPublicKeyCredentialCandidateListDtoSchema,
  PublicKeyCredentialRequestOptionsDtoSchema,
} from '@repo/virtual-authenticator/dto';
import type {
  AuthenticatorAssertionResponse,
  AuthenticatorAttestationResponse,
  PublicKeyCredentialCandidate,
} from '@repo/virtual-authenticator/validation';
import z from 'zod';

import { UnknownException } from './exceptions/UnknownException';
import { AuthenticatorAssertionResponseImpl } from './standard-impl/AuthenticatorAssertionResponseImpl';
import { AuthenticatorAttestationResponseImpl } from './standard-impl/AuthenticatorAttestationResponseImpl';
import { PublicKeyCredentialImpl } from './standard-impl/PublicKeyCredentialImpl';
import { PublicKeyCredentialCreationOptionsBrowserSchema } from './zod-validation/credentials/PublicKeyCredentialCreationOptionsBrowserSchema';
import { PublicKeyCredentialRequestOptionsBrowserSchema } from './zod-validation/credentials/PublicKeyCredentialRequestOptionsBrowserSchema';

export type VirtualAuthenticatorAgentClientOptions = {
  baseUrl: string;
  apiKey: string;
};

export class VirtualAuthenticatorAgentClient {
  private readonly baseUrl: string;
  private readonly apiKey: string;

  constructor(opts: VirtualAuthenticatorAgentClientOptions) {
    this.baseUrl = opts.baseUrl;
    this.apiKey = opts.apiKey;
  }

  private _createRequestHeaders() {
    return new Headers({
      Authorization: `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
    });
  }

  private _createResponseImpl(
    publicKeyCredentialResponse:
      | AuthenticatorAttestationResponse
      | AuthenticatorAssertionResponse,
  ) {
    if ('attestationObject' in publicKeyCredentialResponse) {
      return new AuthenticatorAttestationResponseImpl({
        attestationObject:
          publicKeyCredentialResponse.attestationObject.slice().buffer,
        clientDataJSON:
          publicKeyCredentialResponse.clientDataJSON.slice().buffer,
        transports: publicKeyCredentialResponse.transports,
      });
    } else {
      return new AuthenticatorAssertionResponseImpl({
        ...publicKeyCredentialResponse,
        authenticatorData:
          publicKeyCredentialResponse.authenticatorData.slice().buffer,
        clientDataJSON:
          publicKeyCredentialResponse.clientDataJSON.slice().buffer,
        signature: publicKeyCredentialResponse.signature.slice().buffer,
        userHandle:
          publicKeyCredentialResponse.userHandle?.slice().buffer ?? null,
      });
    }
  }

  private async _fetchApi(
    opts:
      | {
          path: string;
          publicKeyCredentialCreationOptions: z.input<
            typeof PublicKeyCredentialCreationOptionsDtoSchema
          >;
        }
      | {
          path: string;
          publicKeyCredentialRequestOptions: z.input<
            typeof PublicKeyCredentialRequestOptionsDtoSchema
          >;
        },
  ): Promise<unknown> {
    const fetchResponse = await fetch(`${this.baseUrl}${opts.path}`, {
      method: 'POST',
      headers: this._createRequestHeaders(),
      body: JSON.stringify({
        ...omit(opts, 'path'),
        meta: {
          origin: window.location.origin,
        },
      }),
    }).catch((error) => {
      throw new UnknownException({ cause: error });
    });

    const json = await fetchResponse.json();

    if (fetchResponse.status < 200 || fetchResponse.status >= 400) {
      const exception = Exception.fromResponse({
        json,
        status: fetchResponse.status,
      });

      if (exception === null) {
        throw new UnknownException();
      }

      throw exception;
    }

    return json;
  }

  async createCredential(
    opts?: CredentialCreationOptions,
  ): Promise<PublicKeyCredential> {
    const publicKeyCredentialCreationOptionsBrowser =
      PublicKeyCredentialCreationOptionsBrowserSchema.parse(opts?.publicKey);

    const publicKeyCredentialCreationOptions =
      PublicKeyCredentialCreationOptionsDtoSchema.encode(
        publicKeyCredentialCreationOptionsBrowser,
      );

    const json = await this._fetchApi({
      path: '/api/credentials/create',
      publicKeyCredentialCreationOptions,
    });

    const publicKeyCredential = PublicKeyCredentialDtoSchema.parse(json);

    return new PublicKeyCredentialImpl({
      id: publicKeyCredential.id,
      rawId: publicKeyCredential.rawId.slice().buffer,
      response: this._createResponseImpl(publicKeyCredential.response),
      authenticatorAttachment: null,
      clientExtensionResults: publicKeyCredential.clientExtensionResults,
    });
  }

  async getAssertion(
    opts?: CredentialRequestOptions,
  ): Promise<PublicKeyCredential | PublicKeyCredentialCandidate[]> {
    const publicKeyCredentialRequestOptionsBrowser =
      PublicKeyCredentialRequestOptionsBrowserSchema.parse(opts?.publicKey);

    const publicKeyCredentialRequestOptions =
      PublicKeyCredentialRequestOptionsDtoSchema.encode(
        publicKeyCredentialRequestOptionsBrowser,
      );

    const json = await this._fetchApi({
      path: '/api/credentials/get',
      publicKeyCredentialRequestOptions,
    });

    const publicKeyCredentialOrPublicKeyCredentialCandidateList =
      PublicKeyCredentialOrPublicKeyCredentialCandidateListDtoSchema.parse(
        json,
      );

    if (Array.isArray(publicKeyCredentialOrPublicKeyCredentialCandidateList)) {
      return publicKeyCredentialOrPublicKeyCredentialCandidateList;
    }

    return new PublicKeyCredentialImpl({
      id: publicKeyCredentialOrPublicKeyCredentialCandidateList.id,
      rawId:
        publicKeyCredentialOrPublicKeyCredentialCandidateList.rawId.slice()
          .buffer,
      response: this._createResponseImpl(
        publicKeyCredentialOrPublicKeyCredentialCandidateList.response,
      ),
      authenticatorAttachment: null,
      clientExtensionResults:
        publicKeyCredentialOrPublicKeyCredentialCandidateList.clientExtensionResults,
    });
  }
}
