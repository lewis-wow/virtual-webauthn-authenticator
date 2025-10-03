import { KnownException } from '@repo/utils/KnownException';

export class MissingRelayingPartyEntityId extends KnownException {
  constructor() {
    super({
      message: `Missing relaying party identification. Authenticator requires 'rp.id' to be set in the creation options because it cannot infer the origin like a browser.`,
    });
  }
}
