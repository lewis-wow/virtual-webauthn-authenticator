import { Exception } from '@repo/exception';
import type { PublicKeyCredential as DOMPublicKeyCredential } from '@repo/types/dom';
import { omit } from '@repo/utils';
import {
  PublicKeyCredentialCreationOptionsDtoSchema,
  PublicKeyCredentialDtoSchema,
  PublicKeyCredentialRequestOptionsDtoSchema,
} from '@repo/virtual-authenticator/dto';
import type {
  AuthenticatorAssertionResponse,
  AuthenticatorAttestationResponse,
  CredentialCreationOptions,
  CredentialRequestOptions,
  PublicKeyCredentialCreationOptions,
  PublicKeyCredentialRequestOptions,
} from '@repo/virtual-authenticator/validation';
import z from 'zod';

import { UnknownException } from '../exceptions';
import { AuthenticatorAssertionResponseImpl } from './AuthenticatorAssertionResponseImpl';
import { AuthenticatorAttestationResponseImpl } from './AuthenticatorAttestationResponseImpl';
import { PublicKeyCredentialImpl } from './PublicKeyCredentialImpl';
import {
  convertBrowserCreationOptions,
  convertBrowserRequestOptions,
} from './helpers';

export type FetchFn = (
  url: string,
  init: RequestInit,
) => Promise<{ status: number; json: () => Promise<unknown> }>;

export type VirtualAuthenticatorAgentClientOptions = {
  baseUrl: string;
  apiKey: string;
  origin: string;
  /**
   * Custom fetch function for making HTTP requests.
   * Useful for browser extensions where requests need to go through messaging layers
   * (main-world -> content script -> background script -> fetch) or for testing.
   * Defaults to the native fetch API.
   */
  fetch?: FetchFn;
};

const defaultFetch: FetchFn = async (url, init) => {
  const response = await fetch(url, init);
  return {
    status: response.status,
    json: () => response.json(),
  };
};

export class VirtualAuthenticatorAgentClient {
  private readonly baseUrl: string;
  private readonly apiKey: string;
  private readonly origin: string;
  private readonly fetch: FetchFn;

  constructor(opts: VirtualAuthenticatorAgentClientOptions) {
    this.baseUrl = opts.baseUrl;
    this.apiKey = opts.apiKey;
    this.origin = opts.origin;
    this.fetch = opts.fetch ?? defaultFetch;
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
        attestationObject: publicKeyCredentialResponse.attestationObject,
        clientDataJSON: publicKeyCredentialResponse.clientDataJSON,
        transports: publicKeyCredentialResponse.transports,
      });
    } else {
      return new AuthenticatorAssertionResponseImpl({
        authenticatorData: publicKeyCredentialResponse.authenticatorData,
        clientDataJSON: publicKeyCredentialResponse.clientDataJSON,
        signature: publicKeyCredentialResponse.signature,
        userHandle: publicKeyCredentialResponse.userHandle ?? null,
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
    const fetchResponse = await this.fetch(`${this.baseUrl}${opts.path}`, {
      method: 'POST',
      headers: this._createRequestHeaders(),
      body: JSON.stringify({
        ...omit(opts, 'path'),
        meta: {
          origin: this.origin,
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
  ): Promise<DOMPublicKeyCredential> {
    const publicKeyCredentialCreationOptions = convertBrowserCreationOptions(
      opts?.publicKey as PublicKeyCredentialCreationOptions | undefined,
    );

    if (!publicKeyCredentialCreationOptions) {
      throw new UnknownException();
    }

    const encodedOptions = PublicKeyCredentialCreationOptionsDtoSchema.encode(
      publicKeyCredentialCreationOptions,
    );

    const json = await this._fetchApi({
      path: '/api/credentials/create',
      publicKeyCredentialCreationOptions: encodedOptions,
    });

    const publicKeyCredential = PublicKeyCredentialDtoSchema.parse(json);

    return new PublicKeyCredentialImpl({
      id: publicKeyCredential.id,
      rawId: publicKeyCredential.rawId,
      response: this._createResponseImpl(publicKeyCredential.response),
      authenticatorAttachment: publicKeyCredential.authenticatorAttachment,
      clientExtensionResults: publicKeyCredential.clientExtensionResults,
    });
  }

  async getAssertion(
    opts?: CredentialRequestOptions,
  ): Promise<DOMPublicKeyCredential> {
    const publicKeyCredentialRequestOptions = convertBrowserRequestOptions(
      opts?.publicKey as PublicKeyCredentialRequestOptions | undefined,
    );

    if (!publicKeyCredentialRequestOptions) {
      throw new UnknownException();
    }

    const encodedOptions = PublicKeyCredentialRequestOptionsDtoSchema.encode(
      publicKeyCredentialRequestOptions,
    );

    const json = await this._fetchApi({
      path: '/api/credentials/get',
      publicKeyCredentialRequestOptions: encodedOptions,
    });

    const publicKeyCredential = PublicKeyCredentialDtoSchema.parse(json);

    return new PublicKeyCredentialImpl({
      id: publicKeyCredential.id,
      rawId: publicKeyCredential.rawId,
      response: this._createResponseImpl(publicKeyCredential.response),
      authenticatorAttachment: publicKeyCredential.authenticatorAttachment,
      clientExtensionResults: publicKeyCredential.clientExtensionResults,
    });
  }
}
