import type {
  IJwksRepository,
  Jwk,
  JwksRepositoryCreateOptions,
} from '@repo/crypto';
import { randomUUID } from 'node:crypto';

export class InMemoryJwksRepository implements IJwksRepository {
  private readonly keys: Jwk[] = [];

  async create(opts: JwksRepositoryCreateOptions): Promise<Jwk> {
    const jwk: Jwk = {
      id: randomUUID(),
      publicKey: opts.publicKey,
      privateKey: opts.privateKey,
    };

    this.keys.push(jwk);

    return jwk;
  }

  async findLatest(): Promise<Jwk | null> {
    if (this.keys.length === 0) {
      return null;
    }

    return this.keys[this.keys.length - 1] as Jwk;
  }

  async findAll(): Promise<Jwk[]> {
    return this.keys;
  }
}
