import { HttpStatusCode } from '@repo/http';
import {
  PaginationRequestMetaSchema,
  PaginationResultSchema,
  SortKeysSchema,
} from '@repo/pagination/validation';

import { PublicKeyCredentialDtoSchema } from './components/PublicKeyCredentialDtoSchema';

export const ListPublicKeyCredentialsQuerySchema =
  PaginationRequestMetaSchema(SortKeysSchema);

export const ListPublicKeyCredentialsResponseSchema = {
  [HttpStatusCode.OK_200]: PaginationResultSchema(PublicKeyCredentialDtoSchema),
};
