// src/types/express.d.ts
import { JwtPayload } from '@repo/auth';

// You may need to import this

declare global {
  namespace Express {
    export interface Request {
      user?: JwtPayload | null;
    }
  }
}

// You need this empty export to make it a "module"
// and not a "script," which prevents it from
// polluting the global scope unintentionally.
export {};
