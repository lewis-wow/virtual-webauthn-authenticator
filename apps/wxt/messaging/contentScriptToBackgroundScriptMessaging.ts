import type { Response } from '@/types';
import {
  CreatePublicKeyCredentialBodySchema,
  CreatePublicKeyAssertionBodySchema,
} from '@repo/contract/dto';
import { PublicKeyCredentialDtoSchema } from '@repo/virtual-authenticator/dto';
import { defineExtensionMessaging } from '@webext-core/messaging';
import z from 'zod';

export type ContentScriptToBackgroundScriptMessagingProtocol = {
  'credentials.create': (
    req: z.input<typeof CreatePublicKeyCredentialBodySchema>,
  ) => Response<z.input<typeof PublicKeyCredentialDtoSchema>>;

  'credentials.get': (
    req: z.input<typeof CreatePublicKeyAssertionBodySchema>,
  ) => Response<z.input<typeof PublicKeyCredentialDtoSchema>>;
};

export const contentScriptToBackgroundScriptMessaging =
  defineExtensionMessaging<ContentScriptToBackgroundScriptMessagingProtocol>();
