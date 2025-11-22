import { PublicKeyCredentialEntityImpl } from './PublicKeyCredentialEntityImpl';

export class PublicKeyCredentialRpEntityImpl
  extends PublicKeyCredentialEntityImpl
  implements PublicKeyCredentialRpEntity
{
  id?: string;

  constructor(opts: { name: string; id?: string }) {
    super(opts.name);
    this.id = opts.id;
  }
}
