import { KnownException } from '@repo/utils/KnownException';

export class MissingRelyingPartyEntityId extends KnownException {
  constructor() {
    super({
      message: `Missing relying party identification. Authenticator requires 'rp.id' to be set in the creation options because it cannot infer the origin like a browser.`,
    });
  }
}
