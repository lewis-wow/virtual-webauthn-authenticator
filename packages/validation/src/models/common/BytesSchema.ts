import z from 'zod';

export const BytesSchema = z.instanceof(Uint8Array);
