import type { CollectedClientDataType } from '../enums';
import type { CollectedClientData, TokenBinding } from '../validation';

export type CollectedClientDataImplOptions = {
  type: CollectedClientDataType;
  challenge: string;
  origin: string;
  crossOrigin: boolean;
  tokenBinding?: TokenBinding;
};

export class CollectedClientDataImpl implements CollectedClientData {
  public readonly type: CollectedClientDataType;
  public readonly challenge: string;
  public readonly origin: string;
  public readonly crossOrigin: boolean;
  public readonly tokenBinding?: TokenBinding;

  constructor(opts: CollectedClientDataImplOptions) {
    this.type = opts.type;
    this.challenge = opts.challenge;
    this.origin = opts.origin;
    this.crossOrigin = opts.crossOrigin;
    this.tokenBinding = opts.tokenBinding;
  }
}
