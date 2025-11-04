export const bytesNotEmpty =
  () =>
  (value: unknown): value is Buffer => {
    return Buffer.isBuffer(value) && value.byteLength > 0;
  };
