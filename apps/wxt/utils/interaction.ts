import { ErrorResponse } from '@/types';
import {
  AuthenticationState,
  RegistrationState,
} from '@repo/virtual-authenticator/state';
import { EventEmitter } from 'events';

import { InteractionService } from './InteractionService';

export type InteractionResult =
  | ((RegistrationState | AuthenticationState) & { stateToken: string })
  | null
  | undefined;

export type InteractionEventMap = {
  error: (opts: { response: ErrorResponse }) => InteractionResult;
};

export const interaction = new InteractionService<InteractionEventMap>({
  eventEmitter: new EventEmitter(),
});
