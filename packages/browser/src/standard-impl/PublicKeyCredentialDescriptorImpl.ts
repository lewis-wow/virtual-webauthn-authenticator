import { PublicKeyCredentialType } from '@repo/virtual-authenticator/enums';

export class PublicKeyCredentialDescriptorImpl
  implements PublicKeyCredentialDescriptor
{
  type: typeof PublicKeyCredentialType.PUBLIC_KEY;
  id: BufferSource;
  transports?: AuthenticatorTransport[];

  constructor(opts: {
    id: BufferSource;
    transports?: AuthenticatorTransport[];
  }) {
    this.type = PublicKeyCredentialType.PUBLIC_KEY;
    this.id = opts.id;
    this.transports = opts.transports;
  }
}
