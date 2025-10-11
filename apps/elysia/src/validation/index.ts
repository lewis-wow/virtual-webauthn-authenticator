import {
  AuthenticatorTransport,
  PublicKeyCredentialType,
  ResidentKeyRequirement,
  UserVerificationRequirement,
} from '@repo/enums';
import type {
  IAuthenticatorAssertionResponse,
  IAuthenticatorAttestationResponse,
  IAuthenticatorSelectionCriteria,
  IPublicKeyCredential,
  IPublicKeyCredentialCreationOptions,
  IPublicKeyCredentialDescriptor,
  IPublicKeyCredentialParameters,
  IPublicKeyCredentialRpEntity,
  IPublicKeyCredentialUserEntity,
} from '@repo/types';
import {
  Base64URLBufferSchema,
  COSEAlgorithmIdentifierSchema,
  PublicKeyCredentialTypeSchema,
  AuthenticatorAttachmentSchema,
} from '@repo/validation';
import { z } from 'zod';

// Represents the Relying Party (your application)
const PublicKeyCredentialRpEntitySchema = z.object({
  name: z.string(),
  id: z.string().optional(),
}) satisfies z.ZodType<IPublicKeyCredentialRpEntity>;

// Represents the user creating the credential
const PublicKeyCredentialUserEntitySchema = z.object({
  id: Base64URLBufferSchema,
  name: z.string(),
  displayName: z.string(),
}) satisfies z.ZodType<IPublicKeyCredentialUserEntity>;

// Describes the cryptographic algorithms to be supported
const PublicKeyCredentialParametersSchema = z.object({
  type: PublicKeyCredentialTypeSchema,
  alg: COSEAlgorithmIdentifierSchema,
}) satisfies z.ZodType<IPublicKeyCredentialParameters>;

// Used to exclude existing credentials for a user
const PublicKeyCredentialDescriptorSchema = z.object({
  type: z.enum(PublicKeyCredentialType),
  id: Base64URLBufferSchema,
  transports: z.array(z.enum(AuthenticatorTransport)).optional(),
}) satisfies z.ZodType<IPublicKeyCredentialDescriptor>;

// Specifies requirements for the authenticator
const AuthenticatorSelectionCriteriaSchema = z.object({
  authenticatorAttachment: AuthenticatorAttachmentSchema.optional(),
  requireResidentKey: z.boolean().optional(),
  residentKey: z.enum(ResidentKeyRequirement).optional(),
  userVerification: z.enum(UserVerificationRequirement).optional(),
}) satisfies z.ZodType<IAuthenticatorSelectionCriteria>;

/**
 * Zod schema for WebAuthn's PublicKeyCredentialCreationOptions.
 * This is sent from the server to the client to initiate passkey registration.
 */
export const PublicKeyCredentialCreationOptionsSchema = z.object({
  rp: PublicKeyCredentialRpEntitySchema,
  user: PublicKeyCredentialUserEntitySchema,
  challenge: Base64URLBufferSchema,
  pubKeyCredParams: z.array(PublicKeyCredentialParametersSchema),
  timeout: z.number().optional(),
  excludeCredentials: z.array(PublicKeyCredentialDescriptorSchema).optional(),
  authenticatorSelection: AuthenticatorSelectionCriteriaSchema.optional(),
  attestation: z.enum(['none', 'indirect', 'direct', 'enterprise']).optional(),
  // Extensions can be complex; a generic record is often sufficient for validation
  extensions: z.record(z.string(), z.unknown()).optional(),
}) satisfies z.ZodType<IPublicKeyCredentialCreationOptions>;

/**
 * Corresponds to: `AuthenticationExtensionsClientOutputs`
 */
export const AuthenticationExtensionsClientOutputsSchema = z
  .record(z.string(), z.unknown())
  .describe('A generic dictionary representing the client extension results.');

/**
 * Corresponds to: `IAuthenticatorAttestationResponse`
 * This represents the JSON payload for a registration verification.
 */
export const AuthenticatorAttestationResponseSchema = z.object({
  clientDataJSON: Base64URLBufferSchema,
  attestationObject: Base64URLBufferSchema,
}) satisfies z.ZodType<IAuthenticatorAttestationResponse>;

/**
 * Corresponds to: `IAuthenticatorAssertionResponse`
 * This represents the JSON payload for an authentication verification.
 */
export const AuthenticatorAssertionResponseSchema = z.object({
  clientDataJSON: Base64URLBufferSchema,
  authenticatorData: Base64URLBufferSchema,
  signature: Base64URLBufferSchema,
  userHandle: Base64URLBufferSchema.nullable(),
}) satisfies z.ZodType<IAuthenticatorAssertionResponse>;

/**
 * Corresponds to: `IPublicKeyCredential`
 *
 * This is the primary schema for validating the incoming credential object from
 * the client during registration or authentication verification. The `response`
 * is a union type to handle both ceremonies.
 */
export const PublicKeyCredentialSchema = z.object({
  id: z.string().describe('The Base64URL-encoded credential ID.'),
  rawId: Base64URLBufferSchema,
  type: PublicKeyCredentialTypeSchema,
  response: z.union([
    AuthenticatorAttestationResponseSchema,
    AuthenticatorAssertionResponseSchema,
  ]),
  clientExtensionResults: AuthenticationExtensionsClientOutputsSchema,
  authenticatorAttachment: AuthenticatorAttachmentSchema.nullable(),
}) satisfies z.ZodType<IPublicKeyCredential>;
