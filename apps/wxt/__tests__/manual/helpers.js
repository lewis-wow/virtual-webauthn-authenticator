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

navigator.credentials.create({
  publicKey: {
    rp: {
      name: 'localhost',
      id: 'localhost',
    },
    user: {
      id: generateUuidBuffer(),
      name: 'test',
      displayName: 'test',
    },
    challenge: generateRandomBytes(32),
    pubKeyCredParams: [{ type: 'public-key', alg: -7 }],
    timeout: 60000,
    attestation: 'none',
  },
});
