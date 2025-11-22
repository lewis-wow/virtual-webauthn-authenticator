export type TokenBindingStatus = 'present' | 'supported' | 'not-supported';

export interface TokenBinding {
  status: TokenBindingStatus;
  id?: string;
}

export interface CollectedClientData {
  type: 'webauthn.create' | 'webauthn.get';
  challenge: string;
  origin: string;
  crossOrigin: boolean;
  tokenBinding?: TokenBinding;
}

export class CollectedClientDataImpl implements CollectedClientData {
  type: 'webauthn.create' | 'webauthn.get';
  challenge: string;
  origin: string;
  crossOrigin: boolean;
  tokenBinding?: TokenBinding;

  constructor(opts: {
    type: 'webauthn.create' | 'webauthn.get';
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
