import {
  CreateCredentialBodySchema,
  GetCredentialBodySchema,
} from '@repo/contract/dto';
import { AnyExceptionShape } from '@repo/exception/validation';
import { PublicKeyCredentialDtoSchema } from '@repo/virtual-authenticator/dto';
import z from 'zod';

export type SuccessResponse<T> = {
  ok: true;
  data: T;
};

export type ErrorResponse = {
  ok: false;
  error: AnyExceptionShape;
};

export type Response<T> = SuccessResponse<T> | ErrorResponse;

/**
 * Messaging protocol between main-world, content script, and background.
 * Data is serialized in main-world and passed through content to background.
 * Background returns raw API response (unknown) which is parsed in main-world.
 */
export type MessagingProtocol = {
  'credentials.create': (
    req: z.input<typeof CreateCredentialBodySchema>,
  ) => Response<z.input<typeof PublicKeyCredentialDtoSchema>>;

  'credentials.get': (
    req: z.input<typeof GetCredentialBodySchema>,
  ) => Response<z.input<typeof PublicKeyCredentialDtoSchema>>;
};
