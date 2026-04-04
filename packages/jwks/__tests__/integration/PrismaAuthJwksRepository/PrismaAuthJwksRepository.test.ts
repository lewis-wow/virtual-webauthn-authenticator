import { PrismaClient } from '@repo/prisma';
import { afterAll, describe, expect, test } from 'vitest';

import { PrismaAuthJwksRepository } from '../../../src/PrismaAuthJwksRepository';

describe('PrismaAuthJwksRepository with Prisma', () => {
  const prisma = new PrismaClient();
  const repository = new PrismaAuthJwksRepository({ prisma });

  const createdJwksIds = new Set<string>();

  const createKeyPair = (suffix: string) => ({
    publicKey: `test-public-key-${suffix}`,
    privateKey: `test-private-key-${suffix}`,
  });

  afterAll(async () => {
    await prisma.jwks.deleteMany({
      where: {
        id: {
          in: [...createdJwksIds],
        },
      },
    });
  });

  test('create() should persist key pair with auth label', async () => {
    const keyPair = createKeyPair(`create-${Date.now()}`);

    const created = await repository.create(keyPair);
    createdJwksIds.add(created.id);

    expect(created.publicKey).toBe(keyPair.publicKey);
    expect(created.privateKey).toBe(keyPair.privateKey);

    const inDb = await prisma.jwks.findUnique({
      where: {
        id: created.id,
      },
    });

    expect(inDb).not.toBeNull();
    expect(inDb!.publicKey).toBe(keyPair.publicKey);
    expect(inDb!.privateKey).toBe(keyPair.privateKey);
    expect(inDb!.label).toBe(PrismaAuthJwksRepository.DATABASE_LABEL);
  });

  test('findLatest() should return latest auth-labeled key', async () => {
    const first = await repository.create(
      createKeyPair(`latest-first-${Date.now()}`),
    );
    createdJwksIds.add(first.id);

    const nonAuth = await prisma.jwks.create({
      data: {
        ...createKeyPair(`latest-non-auth-${Date.now()}`),
        label: 'non-auth',
      },
    });
    createdJwksIds.add(nonAuth.id);

    const second = await repository.create(
      createKeyPair(`latest-second-${Date.now()}`),
    );
    createdJwksIds.add(second.id);

    const latest = await repository.findLatest();

    expect(latest).not.toBeNull();
    expect(latest!.id).toBe(second.id);
  });

  test('findAll() should return only auth-labeled keys sorted by createdAt desc', async () => {
    const authFirst = await repository.create(
      createKeyPair(`all-first-${Date.now()}`),
    );
    createdJwksIds.add(authFirst.id);

    const nonAuth = await prisma.jwks.create({
      data: {
        ...createKeyPair(`all-non-auth-${Date.now()}`),
        label: 'non-auth',
      },
    });
    createdJwksIds.add(nonAuth.id);

    const authSecond = await repository.create(
      createKeyPair(`all-second-${Date.now()}`),
    );
    createdJwksIds.add(authSecond.id);

    const all = await repository.findAll();
    const createdAuthIds = [authFirst.id, authSecond.id];
    const returnedCreatedAuthKeys = all.filter((key) =>
      createdAuthIds.includes(key.id),
    );

    expect(returnedCreatedAuthKeys).toHaveLength(2);
    expect(returnedCreatedAuthKeys[0]!.id).toBe(authSecond.id);
    expect(returnedCreatedAuthKeys[1]!.id).toBe(authFirst.id);
    expect(all.some((key) => key.id === nonAuth.id)).toBe(false);
  });
});
