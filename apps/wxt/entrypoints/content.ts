import { extensionMessaging } from '@/messaging/extensionMessaging';
import { mainWorldMessaging } from '@/messaging/mainWorldMessaging';
import type { ApplicablePublicKeyCredential } from '@repo/virtual-authenticator/validation';

const LOG_PREFIX = 'CONTENT';
console.log(`[${LOG_PREFIX}]`, 'Init');

// Helper function to show credential selector and wait for user choice
async function selectCredential(
  credentials: ApplicablePublicKeyCredential[],
): Promise<ApplicablePublicKeyCredential | null> {
  return new Promise((resolve) => {
    const requestId = `credential-selector-${Date.now()}-${Math.random()}`;

    const handleMessage = (event: MessageEvent) => {
      if (
        event.data &&
        event.data.requestId === requestId &&
        event.source === window
      ) {
        window.removeEventListener('message', handleMessage);

        if (event.data.type === 'CREDENTIAL_SELECTED') {
          resolve(event.data.credential);
        } else if (event.data.type === 'CREDENTIAL_CANCELLED') {
          resolve(null);
        }
      }
    };

    window.addEventListener('message', handleMessage);

    // Send message to show selector
    window.postMessage(
      {
        type: 'SHOW_CREDENTIAL_SELECTOR',
        credentials,
        requestId,
      },
      '*',
    );
  });
}

export default defineContentScript({
  matches: ['<all_urls>'],
  async main() {
    console.log(`[${LOG_PREFIX}]`, 'Injecting script...');

    await injectScript('/main-world.js', {
      keepInDom: true,
    });

    console.log(`[${LOG_PREFIX}]`, 'Injected.');

    mainWorldMessaging.onMessage('credentials.create', async (req) => {
      console.log(`[${LOG_PREFIX}]`, 'credentials.create request.');

      const publicKeyCredential = await extensionMessaging.sendMessage(
        'credentials.create',
        req.data,
      );

      console.log(`[${LOG_PREFIX}] PublicKeyCredential`, publicKeyCredential);

      return publicKeyCredential;
    });

    mainWorldMessaging.onMessage('credentials.get', async (req) => {
      console.log(`[${LOG_PREFIX}]`, 'credentials.get request.');

      const publicKeyCredentialOrApplicablePublicKeyCredentialsList =
        await extensionMessaging.sendMessage('credentials.get', req.data);

      if (
        Array.isArray(publicKeyCredentialOrApplicablePublicKeyCredentialsList)
      ) {
        console.log(
          `[${LOG_PREFIX}] Multiple credentials found, showing selector...`,
          publicKeyCredentialOrApplicablePublicKeyCredentialsList,
        );

        // Show credential selector and wait for user choice
        const selectedCredential = await selectCredential(
          publicKeyCredentialOrApplicablePublicKeyCredentialsList,
        );

        if (!selectedCredential) {
          console.log(`[${LOG_PREFIX}] User cancelled credential selection`);
          throw new Error('User cancelled credential selection');
        }

        console.log(
          `[${LOG_PREFIX}] User selected credential:`,
          selectedCredential,
        );

        // TODO: The backend needs to be updated to accept the selected credential ID
        // and return the actual PublicKeyCredential for that selection.
        // For now, we return the array as before, but the UI selection is logged.
        // This is a UI-only implementation that needs backend integration to be functional.

        return publicKeyCredentialOrApplicablePublicKeyCredentialsList;
      }

      console.log(
        `[${LOG_PREFIX}] PublicKeyCredential`,
        publicKeyCredentialOrApplicablePublicKeyCredentialsList,
      );

      return publicKeyCredentialOrApplicablePublicKeyCredentialsList;
    });
  },
});
