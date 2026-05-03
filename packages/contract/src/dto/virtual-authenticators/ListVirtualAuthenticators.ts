import { HttpStatusCode } from '@repo/http';
import {
  PaginationRequestMetaSchema,
  PaginationResultSchema,
  SortKeysSchema,
} from '@repo/pagination/validation';

import { VirtualAuthenticatorDtoSchema } from './components/VirtualAuthenticatorDtoSchema';

export const ListVirtualAuthenticatorsQuerySchema =
  PaginationRequestMetaSchema(SortKeysSchema);

export const ListVirtualAuthenticatorsResponseSchema = {
  [HttpStatusCode.OK_200]: PaginationResultSchema(
    VirtualAuthenticatorDtoSchema,
  ),
};
