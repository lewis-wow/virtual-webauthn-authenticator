export type Jwk = {
  id: string;
  publicKey: string;
  privateKey: string;
};

export type JwksRepositoryCreateOptions = {
  publicKey: string;
  privateKey: string;
  label?: string;
};

export type JwksRepositoryFindLatestOptions = {
  label?: string;
};

export type JwksRepositoryFindAllOptions = {
  label?: string;
};

export interface IJwksRepository {
  create: (opts: JwksRepositoryCreateOptions) => Promise<Jwk>;

  findLatest: (opts?: JwksRepositoryFindLatestOptions) => Promise<Jwk | null>;

  findAll: (opts?: JwksRepositoryFindAllOptions) => Promise<Jwk[]>;
}
