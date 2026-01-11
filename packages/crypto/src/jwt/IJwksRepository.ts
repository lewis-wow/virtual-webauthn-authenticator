export type Jwk = {
  id: string;
  publicKey: string;
  privateKey: string;
};

export interface IJwksRepository {
  create: (opts: { publicKey: string; privateKey: string }) => Promise<Jwk>;

  findLatest: () => Promise<Jwk | null>;

  findAll: () => Promise<Jwk[]>;
}
