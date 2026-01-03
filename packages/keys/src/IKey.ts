export interface IKey {
  // --- Common Parameters ---
  getKty(): string | number | undefined;

  getKid(): string | number | undefined;

  getAlg(): string | number | undefined;

  getKeyOps(): (string | number)[] | undefined;

  // --- EC (Elliptic Curve) Specific Properties ---
  getEcCrv(): string | number | undefined;

  getEcX(): string | Uint8Array | undefined;

  getEcY(): string | Uint8Array | boolean | undefined;

  getEcD(): string | Uint8Array | undefined;

  // --- RSA Specific Properties ---
  getRsaN(): string | Uint8Array | undefined;

  getRsaE(): string | Uint8Array | undefined;

  getRsaD(): string | Uint8Array | undefined;

  getRsaP(): string | Uint8Array | undefined;

  getRsaQ(): string | Uint8Array | undefined;

  getRsaDp(): string | Uint8Array | undefined;

  getRsaDq(): string | Uint8Array | undefined;

  getRsaQInv(): string | Uint8Array | undefined;
}
