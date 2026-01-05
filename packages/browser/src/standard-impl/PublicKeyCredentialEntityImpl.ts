export type PublicKeyCredentialEntityImplOptions = {
  name: string;
};

export class PublicKeyCredentialEntityImpl {
  public readonly name: string;

  constructor(opts: PublicKeyCredentialEntityImplOptions) {
    this.name = opts.name;
  }
}
