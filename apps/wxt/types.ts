import {
  PublicKeyCredentialCreationOptionsDtoSchema,
  PublicKeyCredentialRequestOptionsDtoSchema,
} from '@repo/virtual-authenticator/dto';
import z from 'zod';

/** Serialized request format for credential creation (wraps DTO in publicKey) */
export type SerializedCredentialCreationRequest = {
  publicKey: z.input<typeof PublicKeyCredentialCreationOptionsDtoSchema>;
};

/** Serialized request format for credential get (wraps DTO in publicKey) */
export type SerializedCredentialGetRequest = {
  publicKey: z.input<typeof PublicKeyCredentialRequestOptionsDtoSchema>;
};

/**
 * Messaging protocol between main-world, content script, and background.
 * Data is serialized in main-world and passed through content to background.
 * Background returns raw API response (unknown) which is parsed in main-world.
 */
export type MessagingProtocol = {
  fetch: (req: { url: string; init: RequestInit }) => {
    status: number;
    json: unknown;
  }; // Proxy fetch from background -> content -> main-world
};
