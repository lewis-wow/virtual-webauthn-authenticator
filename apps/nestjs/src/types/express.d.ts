import type { JwtPayload } from '@repo/validation';

declare global {
  namespace Express {
    export interface Request {
      user?: JwtPayload | null;
    }
  }
}

export {};
