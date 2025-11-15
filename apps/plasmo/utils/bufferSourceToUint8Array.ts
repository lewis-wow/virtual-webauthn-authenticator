export const bufferSourceToUint8Array = (bufferSource: BufferSource) => {
  // Case 1: If it's an ArrayBufferView (e.g., Uint8Array, DataView, Uint16Array)
  if (ArrayBuffer.isView(bufferSource)) {
    // If it's already a Uint8Array, you can return it directly or create a copy
    // This creates a new Uint8Array view on the *same* underlying memory segment
    return new Uint8Array(
      bufferSource.buffer,
      bufferSource.byteOffset,
      bufferSource.byteLength,
    );
  }

  // Case 2: If it's an ArrayBuffer
  if (bufferSource instanceof ArrayBuffer) {
    return new Uint8Array(bufferSource);
  }

  // Handle other potential cases or invalid input
  throw new Error('Input is not a valid BufferSource.');
};
