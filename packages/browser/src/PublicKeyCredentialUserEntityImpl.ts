import { PublicKeyCredentialEntityImpl } from './PublicKeyCredentialEntityImpl';

export class PublicKeyCredentialUserEntityImpl
  extends PublicKeyCredentialEntityImpl
  implements PublicKeyCredentialUserEntity
{
  id: BufferSource;
  displayName: string;

  constructor(opts: { name: string; id: BufferSource; displayName: string }) {
    super(opts.name);
    this.id = opts.id;
    this.displayName = opts.displayName;
  }
}
