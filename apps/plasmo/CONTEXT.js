function generateRandomBytes(length) {
  const array = new Uint8Array(length);
  window.crypto.getRandomValues(array);

  return array;
}

function generateUuidBuffer() {
  const uuidString = window.crypto.randomUUID();
  const hexString = uuidString.replace(/-/g, '');
  const bytes = new Uint8Array(16);

  for (let i = 0; i < 16; i++) {
    const hexByte = hexString.substring(i * 2, i * 2 + 2);
    bytes[i] = parseInt(hexByte, 16);
  }

  return bytes;
}
