import type { PublicKeyCredentialEntity } from '@repo/types/dom';

export type PublicKeyCredentialEntityImplOptions = {
  name: string;
};

export class PublicKeyCredentialEntityImpl
  implements PublicKeyCredentialEntity
{
  public readonly name: string;

  constructor(opts: PublicKeyCredentialEntityImplOptions) {
    this.name = opts.name;
  }
}
