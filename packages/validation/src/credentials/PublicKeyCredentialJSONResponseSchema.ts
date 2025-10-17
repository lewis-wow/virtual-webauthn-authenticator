import type { IPublicKeyCredentialJSONResponse } from '@repo/types';
import z from 'zod';

export const PublicKeyCredentialJSONResponseSchema = z
  .object({
    clientDataJSON: z.string().meta({
      description: 'The client data for the credential operation.',
      examples: [
        'eyJ0eXBlIjoid2ViYXV0aG4uZ2V0IiwiY2hhbGxlbmdlIjoiSzBSb2Z4U3c3Y0J3V1B0TklHRlJvQSIsIm9yaWdpbiI6Imh0dHBzOi8vZXhhbXBsZS5jb20ifQ',
      ],
    }),
    attestationObject: z
      .string()
      .optional()
      .meta({
        description:
          'The attestation object, available during registration ceremonies.',
        examples: [
          'o2NmbXRkbm9uZWdhdHRTdG10oGhhdXRoRGF0YVjKSZYN5YgOjGh0NBcPZHZgW4_krrmihjLHmVzzuoMdl2NFpQECAyYgASFYIJV2_3542-m2eAY2y4b1qL-2TJOxHeT30a3dURB3wD-sIlgg-sA_2Ejv-MMB-S1kaccx22Fj-EJV5HjY4WL7FpE-4-A',
        ],
      }),
    authenticatorData: z
      .string()
      .optional()
      .meta({
        description: 'The authenticator data for the credential operation.',
        examples: ['SZYN5YgOjGh0NBcPZHZgW4_krrmihjLHmVzzuoMdl2MBAAAAew'],
      }),
    signature: z
      .string()
      .optional()
      .meta({
        description:
          'The signature, available during authentication ceremonies.',
        examples: [
          'MEUCIE-h45X_V_3Vup2enALcO2d3-2kUNd3_naO9K9uoA-ZgAiEA7a3v3hJ8yAso1iK52cTf3d2V1v7jG4nLq1sM3wH8o2I',
        ],
      }),
    userHandle: z
      .string()
      .optional()
      .meta({
        description: 'The user handle associated with the credential.',
        examples: ['dXNlci1pZC0xMjM'],
      }),
  })
  .meta({
    id: 'PublicKeyCredentialJSONResponse',
    description:
      'The response from a public key credential operation. For more information, see https://www.w3.org/TR/webauthn/#iface-pk-cred-json-response.',
  }) satisfies z.ZodType<IPublicKeyCredentialJSONResponse>;
