import { passkey } from '@better-auth/passkey';
import { PrismaClient } from '@prisma/client';
import type {} from '@simplewebauthn/server';
import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';

const prisma = new PrismaClient();

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'sqlite',
  }),
  emailAndPassword: {
    enabled: true,
  },
  plugins: [
    passkey({
      rpName: 'Next.js Example',
      rpID: process.env.BETTER_AUTH_RP_ID || 'localhost',
    }),
  ],
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL || 'http://localhost:4000',
});
