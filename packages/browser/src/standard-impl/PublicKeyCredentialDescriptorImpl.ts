export class PublicKeyCredentialDescriptorImpl
  implements PublicKeyCredentialDescriptor
{
  type: 'public-key';
  id: BufferSource;
  transports?: AuthenticatorTransport[];

  constructor(opts: {
    id: BufferSource;
    transports?: AuthenticatorTransport[];
  }) {
    this.type = 'public-key';
    this.id = opts.id;
    this.transports = opts.transports;
  }
}
