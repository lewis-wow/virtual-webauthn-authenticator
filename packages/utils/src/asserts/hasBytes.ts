export const hasBytes =
  (count: number) =>
  (value: unknown): value is Buffer => {
    return Buffer.isBuffer(value) && value.byteLength === count;
  };
