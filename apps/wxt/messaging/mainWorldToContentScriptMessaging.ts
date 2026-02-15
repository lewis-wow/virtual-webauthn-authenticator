import type { Response } from '@/types';
import {
  CreateCredentialBodySchema,
  GetCredentialBodySchema,
} from '@repo/contract/dto';
import { PublicKeyCredentialDtoSchema } from '@repo/virtual-authenticator/dto';
import { defineWindowMessaging } from '@webext-core/messaging/page';
import z from 'zod';

export type MainWorldToContentScriptMessagingProtocol = {
  'credentials.create': (
    req: Pick<
      z.input<typeof CreateCredentialBodySchema>,
      'publicKeyCredentialCreationOptions'
    >,
  ) => Response<z.input<typeof PublicKeyCredentialDtoSchema>>;

  'credentials.get': (
    req: Pick<
      z.input<typeof GetCredentialBodySchema>,
      'publicKeyCredentialRequestOptions'
    >,
  ) => Response<z.input<typeof PublicKeyCredentialDtoSchema>>;
};

export const mainWorldToContentScriptMessaging =
  defineWindowMessaging<MainWorldToContentScriptMessagingProtocol>({
    namespace: '@webext-core/messaging/main-world-to-content-script',
  });
