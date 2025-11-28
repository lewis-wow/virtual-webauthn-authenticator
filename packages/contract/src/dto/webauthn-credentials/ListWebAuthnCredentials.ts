import {
  PaginationRequestMetaSchema,
  PaginationResultSchema,
} from '@repo/pagination/zod-validation';

import { WebAuthnCredentialDtoSchema } from './components/WebAuthnCredentialDtoSchema';

// =============================================================================
// OPERATION: LIST
// =============================================================================

// -------------------------------------
// Inputs
// -------------------------------------

export const ListWebAuthnCredentialsQuerySchema = PaginationRequestMetaSchema;

// -------------------------------------
// Outputs
// -------------------------------------

export const ListWebAuthnCredentialsResponseSchema = PaginationResultSchema(
  WebAuthnCredentialDtoSchema,
);
