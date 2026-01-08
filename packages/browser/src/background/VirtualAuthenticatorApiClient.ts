import { Exception } from '@repo/exception';
import type {
  PublicKeyCredentialCreationOptionsDtoSchema,
  PublicKeyCredentialRequestOptionsDtoSchema,
} from '@repo/virtual-authenticator/dto';
import type z from 'zod';

import { UnknownException } from '../exceptions/UnknownException';

export type VirtualAuthenticatorApiClientOptions = {
  baseUrl: string;
  apiKey: string;
};

export type CreateCredentialRequest = {
  publicKey: z.input<typeof PublicKeyCredentialCreationOptionsDtoSchema>;
  meta: {
    origin: string;
  };
};

export type GetAssertionRequest = {
  publicKey: z.input<typeof PublicKeyCredentialRequestOptionsDtoSchema>;
  meta: {
    origin: string;
  };
};

/**
 * Background-only API client that handles raw API communication.
 * Does NOT parse or transform responses - returns raw JSON for the main world to process.
 */
export class VirtualAuthenticatorApiClient {
  private readonly baseUrl: string;
  private readonly apiKey: string;

  constructor(opts: VirtualAuthenticatorApiClientOptions) {
    this.baseUrl = opts.baseUrl;
    this.apiKey = opts.apiKey;
  }

  private _createRequestHeaders() {
    return new Headers({
      Authorization: `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
    });
  }

  private async _fetchApi(path: string, body: unknown): Promise<unknown> {
    const fetchResponse = await fetch(`${this.baseUrl}${path}`, {
      method: 'POST',
      headers: this._createRequestHeaders(),
      body: JSON.stringify(body),
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

  /**
   * Creates a credential via the API.
   * Returns raw JSON response to be parsed by the main world.
   */
  async createCredential(request: CreateCredentialRequest): Promise<unknown> {
    return this._fetchApi('/api/credentials/create', {
      publicKeyCredentialCreationOptions: request.publicKey,
      meta: request.meta,
    });
  }

  /**
   * Gets an assertion via the API.
   * Returns raw JSON response to be parsed by the main world.
   */
  async getAssertion(request: GetAssertionRequest): Promise<unknown> {
    return this._fetchApi('/api/credentials/get', {
      publicKeyCredentialRequestOptions: request.publicKey,
      meta: request.meta,
    });
  }
}
