import z from 'zod';

import { PublicKeyCredentialType } from '../enums/PublicKeyCredentialType';

/**
 * @see https://w3c.github.io/webauthn/#dictdef-publickeycredentialparameters
 */
export const PublicKeyCredentialParametersSchema = z.object({
  /**
   * This member specifies the type of credential to be created.
   */
  type: z.enum(PublicKeyCredentialType).meta({
    description: 'This member specifies the type of credential to be created.',
  }),
  /**
   * This member specifies the cryptographic signature algorithm with which the newly generated credential will be used, and thus also the type of asymmetric key pair to be generated, e.g., RSA or Elliptic Curve.
   */
  alg: z.number().meta({
    description:
      'This member specifies the cryptographic signature algorithm with which the newly generated credential will be used, and thus also the type of asymmetric key pair to be generated, e.g., RSA or Elliptic Curve.',
  }),
});

export type PublicKeyCredentialParameters = z.infer<
  typeof PublicKeyCredentialParametersSchema
>;
