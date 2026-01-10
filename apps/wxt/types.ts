import {
  CreateCredentialBodySchema,
  GetCredentialBodySchema,
} from '@repo/contract/dto';
import { ExceptionShape } from '@repo/exception/validation';
import { PublicKeyCredentialDtoSchema } from '@repo/virtual-authenticator/dto';
import z from 'zod';

export type Response<T> =
  | {
      ok: true;
      error?: undefined;
      data: T;
    }
  | {
      ok: false;
      error: ExceptionShape;
      data?: undefined;
    };

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
