import { Lazy } from './utils/lazy';

export const prisma = new Lazy('prisma', () =>
  import('@repo/prisma').then((module) => module.prisma),
);
