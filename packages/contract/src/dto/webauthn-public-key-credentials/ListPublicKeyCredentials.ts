import { HttpStatusCode } from '@repo/http';
import {
  PaginationRequestMetaSchema,
  PaginationResultSchema,
  SortKeysSchema,
} from '@repo/pagination/validation';

import { PublicKeyCredentialDtoSchema } from './components/PublicKeyCredentialDtoSchema';

// =============================================================================
// OPERATION: LIST
// =============================================================================

// -------------------------------------
// Inputs
// -------------------------------------

export const ListPublicKeyCredentialsQuerySchema =
  PaginationRequestMetaSchema(SortKeysSchema);

// -------------------------------------
// Outputs
// -------------------------------------

export const ListPublicKeyCredentialsResponseSchema = {
  [HttpStatusCode.OK_200]: PaginationResultSchema(PublicKeyCredentialDtoSchema),
};
