import 'zod';
import * as z from 'zod';

declare module 'zod' {
  interface GlobalMeta {
    examples?: z.$input[];
  }
}

export {};
