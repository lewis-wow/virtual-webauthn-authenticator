import type { JwtPayload } from '@repo/auth/validation';

declare global {
  namespace Express {
    export interface Request {
      user?: JwtPayload | null;
    }
  }
}

export {};
