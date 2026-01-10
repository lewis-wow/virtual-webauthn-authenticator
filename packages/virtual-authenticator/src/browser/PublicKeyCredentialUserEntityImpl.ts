import type { Uint8Array_ } from '@repo/types';
import type {
  BufferSource,
  PublicKeyCredentialUserEntity,
} from '@repo/types/dom';

import {
  PublicKeyCredentialEntityImpl,
  type PublicKeyCredentialEntityImplOptions,
} from './PublicKeyCredentialEntityImpl';
import { bytesToBufferSource } from './helpers';

export type PublicKeyCredentialUserEntityImplOptions =
  PublicKeyCredentialEntityImplOptions & {
    id: Uint8Array_;
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

    this.id = bytesToBufferSource(opts.id);
    this.displayName = opts.displayName;
  }
}
