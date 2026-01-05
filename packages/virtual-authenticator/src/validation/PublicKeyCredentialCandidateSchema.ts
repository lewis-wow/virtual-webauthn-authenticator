import z from 'zod';

export const PublicKeyCredentialCandidateSchema = z.object({
  id: z.string(),
  name: z.string().nullable(),
  userId: z.string(),
  userDisplayName: z.string(),
  userEmail: z.string(),
});

export type PublicKeyCredentialCandidate = z.infer<
  typeof PublicKeyCredentialCandidateSchema
>;
