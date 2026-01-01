import {
  PaginationRequestMetaSchema,
  PaginationResultSchema,
  SortKeysSchema,
} from '@repo/pagination/zod-validation';

import { WebAuthnPublicKeyCredentialDtoSchema } from './components/WebAuthnPublicKeyCredentialDtoSchema';

// =============================================================================
// OPERATION: LIST
// =============================================================================

// -------------------------------------
// Inputs
// -------------------------------------

export const ListWebAuthnPublicKeyCredentialsQuerySchema =
  PaginationRequestMetaSchema(SortKeysSchema);

// -------------------------------------
// Outputs
// -------------------------------------

export const ListWebAuthnPublicKeyCredentialsResponseSchema =
  PaginationResultSchema(WebAuthnPublicKeyCredentialDtoSchema);
