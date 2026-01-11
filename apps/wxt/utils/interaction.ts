import { ErrorResponse } from '@/types';
import { AuthenticatorAgentContextArgs } from '@repo/virtual-authenticator/validation';
import { EventEmitter } from 'events';

import { InteractionService } from './InteractionService';

export type InteractionEventMap = {
  error: (opts: {
    response: ErrorResponse;
  }) => AuthenticatorAgentContextArgs | null | undefined;
};

export const interaction = new InteractionService<InteractionEventMap>({
  eventEmitter: new EventEmitter(),
});
