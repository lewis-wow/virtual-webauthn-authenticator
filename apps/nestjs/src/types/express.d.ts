import type { JwtPayload } from '@repo/zod-validation';

declare global {
  namespace Express {
    export interface Request {
      user?: JwtPayload | null;
    }
  }
}

export {};
