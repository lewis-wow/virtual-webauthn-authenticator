import { Prisma } from './generated/client/client';

export * from './client';
export * from './generated/client/client';

export type AnyPrismaError =
  | Prisma.PrismaClientKnownRequestError
  | Prisma.PrismaClientValidationError
  | Prisma.PrismaClientInitializationError
  | Prisma.PrismaClientUnknownRequestError
  | Prisma.PrismaClientRustPanicError;

export const isAnyPrismaError = (error: unknown): error is AnyPrismaError => {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError ||
    error instanceof Prisma.PrismaClientValidationError ||
    error instanceof Prisma.PrismaClientInitializationError ||
    error instanceof Prisma.PrismaClientUnknownRequestError ||
    error instanceof Prisma.PrismaClientRustPanicError
  );
};
