import { HttpStatusCode } from '@repo/http';
import { AuthenticatorAgentCreateCredentialResponseDtoSchema } from '@repo/virtual-authenticator-agent/dto';
import { AuthenticatorAgentMetaArgsSchema } from '@repo/virtual-authenticator-agent/validation';
import { PublicKeyCredentialCreationOptionsDtoSchema } from '@repo/virtual-authenticator/dto';
import { RegistrationStateSchema } from '@repo/virtual-authenticator/state';
import z from 'zod';

export const CreatePublicKeyCredentialBodySchema = z.object({
  publicKeyCredentialCreationOptions:
    PublicKeyCredentialCreationOptionsDtoSchema,
  meta: AuthenticatorAgentMetaArgsSchema.pick({
    origin: true,
  }),
  nextState: RegistrationStateSchema.optional(),
  prevStateToken: z.string().optional(),
});

export const CreatePublicKeyCredentialResponseSchema = {
  [HttpStatusCode.OK_200]: AuthenticatorAgentCreateCredentialResponseDtoSchema,
};
