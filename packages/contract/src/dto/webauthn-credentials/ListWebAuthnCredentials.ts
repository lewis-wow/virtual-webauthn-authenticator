import {
  PaginationRequestMetaSchema,
  PaginationResultSchema,
  SortKeysSchema,
} from '@repo/pagination/zod-validation';

import { WebAuthnCredentialDtoSchema } from './components/WebAuthnCredentialDtoSchema';

// =============================================================================
// OPERATION: LIST
// =============================================================================

// -------------------------------------
// Inputs
// -------------------------------------

export const ListWebAuthnCredentialsQuerySchema =
  PaginationRequestMetaSchema(SortKeysSchema);

// -------------------------------------
// Outputs
// -------------------------------------

export const ListWebAuthnCredentialsResponseSchema = PaginationResultSchema(
  WebAuthnCredentialDtoSchema,
);
