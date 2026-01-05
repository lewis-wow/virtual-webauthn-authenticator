import {
  PublicKeyCredentialEntityImpl,
  type PublicKeyCredentialEntityImplOptions,
} from './PublicKeyCredentialEntityImpl';

export type PublicKeyCredentialUserEntityImplOptions =
  PublicKeyCredentialEntityImplOptions & {
    id: BufferSource;
    displayName: string;
  };

export class PublicKeyCredentialUserEntityImpl
  extends PublicKeyCredentialEntityImpl
  implements PublicKeyCredentialUserEntity
{
  public readonly id: BufferSource;
  public readonly displayName: string;

  constructor(opts: PublicKeyCredentialUserEntityImplOptions) {
    super({ name: opts.name });

    this.id = opts.id;
    this.displayName = opts.displayName;
  }
}
