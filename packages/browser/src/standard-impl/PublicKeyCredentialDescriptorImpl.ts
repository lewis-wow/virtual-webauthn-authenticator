import { PublicKeyCredentialType } from '@repo/virtual-authenticator/enums';

export class PublicKeyCredentialDescriptorImpl
  implements PublicKeyCredentialDescriptor
{
  public readonly type = PublicKeyCredentialType.PUBLIC_KEY;
  public readonly id: BufferSource;
  public readonly transports?: AuthenticatorTransport[];

  constructor(opts: {
    id: BufferSource;
    transports?: AuthenticatorTransport[];
  }) {
    this.id = opts.id;
    this.transports = opts.transports;
  }
}
