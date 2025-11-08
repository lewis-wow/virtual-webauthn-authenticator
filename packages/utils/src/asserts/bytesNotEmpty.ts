export const bytesNotEmpty = () => (value: Uint8Array) => {
  return value.byteLength > 0;
};
