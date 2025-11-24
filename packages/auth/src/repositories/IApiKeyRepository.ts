import type { Permission } from '../enums/Permission';

export type ApiKeyData = {
  id: string;

  hashedKey: string;
  lookupKey: string;

  name: string | null;
  start: string | null;
  prefix: string | null;

  userId: string;

  enabled: boolean;
  expiresAt: Date | null;
  revokedAt: Date | null;
  permissions: Permission[] | null;

  createdAt: Date;
  updatedAt: Date;
};

export type ApiKeySelect = Partial<Record<keyof ApiKeyData, boolean>>;

export type ApiKeyDataArgs = Pick<
  ApiKeyData,
  | 'lookupKey'
  | 'hashedKey'
  | 'name'
  | 'permissions'
  | 'prefix'
  | 'start'
  | 'userId'
  | 'expiresAt'
  | 'enabled'
>;

export interface IApiKeyRepository {
  createApiKey(data: ApiKeyDataArgs): Promise<ApiKeyData>;

  updateApiKey(
    opts: { userId: string; id: string },
    data: Partial<ApiKeyDataArgs>,
  ): Promise<ApiKeyData>;

  findByLookupKey(opts: { lookupKey: string }): Promise<ApiKeyData | null>;

  findById(opts: {
    id: string;
    select?: ApiKeySelect;
  }): Promise<Partial<ApiKeyData> | null>;

  listApiKeys(opts: {
    userId: string;
    select?: ApiKeySelect;
  }): Promise<Partial<ApiKeyData>[]>;

  useApiKey(opts: { userId: string; id: string }): Promise<ApiKeyData>;

  revokeApiKey(opts: { userId: string; id: string }): Promise<ApiKeyData>;

  deleteApiKey(opts: { userId: string; id: string }): Promise<ApiKeyData>;
}
