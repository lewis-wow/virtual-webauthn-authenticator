import {
  PublicKeyCredentialEntityImpl,
  type PublicKeyCredentialEntityImplOptions,
} from './PublicKeyCredentialEntityImpl';

export type PublicKeyCredentialRpEntityImplOptions =
  PublicKeyCredentialEntityImplOptions & {
    id?: string;
  };

export class PublicKeyCredentialRpEntityImpl
  extends PublicKeyCredentialEntityImpl
  implements PublicKeyCredentialRpEntity
{
  public readonly id?: string;

  constructor(opts: PublicKeyCredentialRpEntityImplOptions) {
    super({ name: opts.name });
    this.id = opts.id;
  }
}
