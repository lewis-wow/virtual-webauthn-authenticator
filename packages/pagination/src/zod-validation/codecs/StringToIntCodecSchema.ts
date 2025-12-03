import z from 'zod';

export const StringToIntCodecSchema = z.codec(
  z.int().or(z.string().regex(z.regexes.integer)),
  z.int(),
  {
    decode: (str) => (typeof str === 'string' ? Number.parseInt(str, 10) : str),
    encode: (num) => num,
  },
);
