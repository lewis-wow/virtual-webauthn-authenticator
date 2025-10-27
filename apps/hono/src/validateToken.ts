import { createRemoteJWKSet, jwtVerify } from 'jose';

export async function validateToken(token: string) {
  try {
    const JWKS = createRemoteJWKSet(
      new URL('http://localhost:3000/api/auth/jwks'),
    );
    const { payload } = await jwtVerify(token, JWKS, {
      issuer: 'http://localhost:3002', // Should match your JWT issuer, which is the BASE_URL
      audience: 'http://localhost:3001', // Should match your JWT audience, which is the BASE_URL by default
    });
    return payload;
  } catch (error) {
    console.error('Token validation failed:', error);
    throw error;
  }
}
