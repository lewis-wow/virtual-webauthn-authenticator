import { mainWorldMessaging } from '@/messaging/mainWorldMessaging';
import {
  parsePublicKeyCredentialCreationResponse,
  parsePublicKeyCredentialGetResponse,
  serializeCredentialCreationOptions,
  serializeCredentialRequestOptions,
} from '@repo/browser/main-world';

const LOG_PREFIX = 'MAIN';
console.log(`[${LOG_PREFIX}]`, 'Init');

export default defineUnlistedScript(() => {
  navigator.credentials.create = async (opts?: CredentialCreationOptions) => {
    console.log(
      `[${LOG_PREFIX}] Intercepted navigator.credentials.create`,
      opts,
    );

    // Serialize browser options to DTO format
    const serialized = serializeCredentialCreationOptions(opts);

    // Send to content -> background -> API and get raw response
    const rawResponse = await mainWorldMessaging.sendMessage(
      'credentials.create',
      serialized,
    );

    // Parse raw response into PublicKeyCredential impl
    const publicKeyCredential =
      parsePublicKeyCredentialCreationResponse(rawResponse);

    console.log(`[${LOG_PREFIX}] PublicKeyCredential`, publicKeyCredential);

    return publicKeyCredential;
  };

  navigator.credentials.get = async (opts?: CredentialRequestOptions) => {
    console.log(`[${LOG_PREFIX}] Intercepted navigator.credentials.get`, opts);

    // Serialize browser options to DTO format
    const serialized = serializeCredentialRequestOptions(opts);

    // Send to content -> background -> API and get raw response
    const rawResponse = await mainWorldMessaging.sendMessage(
      'credentials.get',
      serialized,
    );

    // Parse raw response - may be credential or list of applicable credentials
    const publicKeyCredentialOrApplicablePublicKeyCredentialsList =
      parsePublicKeyCredentialGetResponse(rawResponse);

    if (
      Array.isArray(publicKeyCredentialOrApplicablePublicKeyCredentialsList)
    ) {
      return null;
    }

    console.log(
      `[${LOG_PREFIX}] PublicKeyCredential`,
      publicKeyCredentialOrApplicablePublicKeyCredentialsList,
    );

    return publicKeyCredentialOrApplicablePublicKeyCredentialsList;
  };
});
