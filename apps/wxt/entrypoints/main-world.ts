import { mainWorldMessaging } from '@/messaging/mainWorldMessaging';

const LOG_PREFIX = 'MAIN';
console.log(`[${LOG_PREFIX}]`, 'Init');

export default defineUnlistedScript(() => {
  navigator.credentials.create = async (opts?: CredentialCreationOptions) => {
    console.log(
      `[${LOG_PREFIX}] Intercepted navigator.credentials.create`,
      opts,
    );

    const publicKeyCredential = await mainWorldMessaging.sendMessage(
      'credentials.create',
      opts,
    );

    console.log(`[${LOG_PREFIX}] PublicKeyCredential`, publicKeyCredential);

    return publicKeyCredential;
  };

  const fallbackNavigatorCredentialsGet = navigator.credentials.get;
  navigator.credentials.get = async (opts?: CredentialRequestOptions) => {
    console.log(`[${LOG_PREFIX}] Intercepted navigator.credentials.get`, opts);

    const publicKeyCredentialOrPublicKeyCredentialCandidateList =
      await mainWorldMessaging.sendMessage('credentials.get', opts);

    if (Array.isArray(publicKeyCredentialOrPublicKeyCredentialCandidateList)) {
      return null;
    }

    console.log(
      `[${LOG_PREFIX}] PublicKeyCredential`,
      publicKeyCredentialOrPublicKeyCredentialCandidateList,
    );

    return publicKeyCredentialOrPublicKeyCredentialCandidateList;
  };
});
