import { Jwt } from '@repo/jwt';

import { prisma } from './prisma';

export const jwt = new Jwt({
  prisma,
  currentKid: '5858dff7-ad5f-432e-a41d-851ceda96ac6',
  encryptionKey: 'secret',
  config: {
    issuer: 'http://localhost:3000',
    audience: 'http://localhost:3001',
  },
});
