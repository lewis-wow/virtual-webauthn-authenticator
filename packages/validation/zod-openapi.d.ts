import type { ZodOpenApiMetadata } from 'zod-openapi';

declare module 'zod' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface GlobalMeta extends ZodOpenApiMetadata {
    ref?: string;
  }
}
