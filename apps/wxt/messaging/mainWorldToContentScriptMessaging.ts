import type { Response } from '@/types';
import {
  CreatePublicKeyCredentialBodySchema,
  CreatePublicKeyAssertionBodySchema,
} from '@repo/contract/dto';
import { PublicKeyCredentialDtoSchema } from '@repo/virtual-authenticator/dto';
import { defineWindowMessaging } from '@webext-core/messaging/page';
import z from 'zod';

export type MainWorldToContentScriptMessagingProtocol = {
  'credentials.create': (
    req: Pick<
      z.input<typeof CreatePublicKeyCredentialBodySchema>,
      'publicKeyCredentialCreationOptions'
    >,
  ) => Response<z.input<typeof PublicKeyCredentialDtoSchema>>;

  'credentials.get': (
    req: Pick<
      z.input<typeof CreatePublicKeyAssertionBodySchema>,
      'publicKeyCredentialRequestOptions'
    >,
  ) => Response<z.input<typeof PublicKeyCredentialDtoSchema>>;
};

export const mainWorldToContentScriptMessaging =
  defineWindowMessaging<MainWorldToContentScriptMessagingProtocol>({
    namespace: '@webext-core/messaging/main-world-to-content-script',
  });
