import { Exception } from '@repo/exception';

export class UserPresenceRequired extends Exception {
  static readonly code = 'USER_PRESENCE_REQUIRED';
  static readonly status = 400;

  constructor(message = 'User Presence (UP) is required to proceed.') {
    super({ message });
  }
}
