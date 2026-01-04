import type { CollectedClientDataType } from '@repo/virtual-authenticator/enums';
import type {
  CollectedClientData,
  TokenBinding,
} from '@repo/virtual-authenticator/validation';

export class CollectedClientDataImpl implements CollectedClientData {
  type: CollectedClientDataType;
  challenge: string;
  origin: string;
  crossOrigin: boolean;
  tokenBinding?: TokenBinding;

  constructor(opts: {
    type: CollectedClientDataType;
    challenge: string;
    origin: string;
    crossOrigin: boolean;
    tokenBinding?: TokenBinding;
  }) {
    this.type = opts.type;
    this.challenge = opts.challenge;
    this.origin = opts.origin;
    this.crossOrigin = opts.crossOrigin;
    this.tokenBinding = opts.tokenBinding;
  }
}
