export const hasBytes = (count: number) => (value: Uint8Array) => {
  return value.byteLength === count;
};
