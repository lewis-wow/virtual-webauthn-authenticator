export const hasMinBytes = (count: number) => (value: Uint8Array) => {
  return value.byteLength >= count;
};
