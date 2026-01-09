export interface IKey {
  // --- Common Parameters ---
  getKty(): string | number | undefined;

  getKid(): string | number | undefined;

  getAlg(): string | number | undefined;

  getKeyOps(): (string | number)[] | undefined;

  // --- OKP (Octet Key Pair) Specific Properties ---
  getOkpCrv(): string | number | undefined;

  getOkpX(): string | Uint8Array | undefined;

  // --- EC (Elliptic Curve) Specific Properties ---
  getEcCrv(): string | number | undefined;

  getEcX(): string | Uint8Array | undefined;

  getEcY(): string | Uint8Array | boolean | undefined;

  // --- RSA Specific Properties ---
  getRsaN(): string | Uint8Array | undefined;

  getRsaE(): string | Uint8Array | undefined;
}
