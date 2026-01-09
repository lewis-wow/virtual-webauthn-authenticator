import { Buffer } from 'buffer';

export const toB64url = (bytes: Uint8Array) => {
  return Buffer.from(bytes).toString('base64url');
};

export const fromB64url = (bytes: Uint8Array) => {
  return Buffer.from(bytes).toString('base64url');
};
