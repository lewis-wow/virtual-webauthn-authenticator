import type { JwtPayload } from '@repo/jwt/validation';

declare global {
  namespace Express {
    export interface Request {
      user?: JwtPayload | null;
    }
  }
}

export {};
