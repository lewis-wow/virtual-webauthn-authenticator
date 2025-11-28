import { PaginationResultSchema } from '@repo/pagination/zod-validation';

import { WebAuthnCredentialDtoSchema } from './components/WebAuthnCredentialDtoSchema';

// =============================================================================
// OPERATION: LIST
// =============================================================================

// -------------------------------------
// Outputs
// -------------------------------------

export const ListWebAuthnCredentialsResponseSchema = PaginationResultSchema(
  WebAuthnCredentialDtoSchema,
);
