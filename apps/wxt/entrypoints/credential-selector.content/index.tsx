import { CredentialSelector } from '@/components/CredentialSelector';
import '@repo/ui/globals.css';
import type { PublicKeyCredentialCandidate } from '@repo/virtual-authenticator/validation';
import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';

const LOG_PREFIX = 'CREDENTIAL-SELECTOR';

interface CredentialSelectionMessage {
  type: 'SHOW_CREDENTIAL_SELECTOR';
  credentials: PublicKeyCredentialCandidate[];
  requestId: string;
}

interface CredentialResponseMessage {
  type: 'CREDENTIAL_SELECTED' | 'CREDENTIAL_CANCELLED';
  requestId: string;
  credential?: PublicKeyCredentialCandidate;
}

function CredentialSelectorApp() {
  const [credentials, setCredentials] = useState<
    PublicKeyCredentialCandidate[]
  >([]);
  const [isOpen, setIsOpen] = useState(false);
  const [requestId, setRequestId] = useState<string>('');

  useEffect(() => {
    const handleMessage = (event: MessageEvent<CredentialSelectionMessage>) => {
      if (
        event.data &&
        event.data.type === 'SHOW_CREDENTIAL_SELECTOR' &&
        event.source === window
      ) {
        console.log(`[${LOG_PREFIX}] Received credentials:`, event.data);
        setCredentials(event.data.credentials);
        setRequestId(event.data.requestId);
        setIsOpen(true);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const handleSelect = (credential: PublicKeyCredentialCandidate) => {
    console.log(`[${LOG_PREFIX}] Credential selected:`, credential);

    const response: CredentialResponseMessage = {
      type: 'CREDENTIAL_SELECTED',
      requestId,
      credential,
    };

    window.postMessage(response, '*');
    setIsOpen(false);
    setCredentials([]);
  };

  const handleCancel = () => {
    console.log(`[${LOG_PREFIX}] Selection cancelled`);

    const response: CredentialResponseMessage = {
      type: 'CREDENTIAL_CANCELLED',
      requestId,
    };

    window.postMessage(response, '*');
    setIsOpen(false);
    setCredentials([]);
  };

  return (
    <CredentialSelector
      credentials={credentials}
      open={isOpen}
      onSelect={handleSelect}
      onCancel={handleCancel}
    />
  );
}

export default defineContentScript({
  matches: ['<all_urls>'],
  cssInjectionMode: 'ui',
  async main(ctx) {
    console.log(`[${LOG_PREFIX}] Initializing...`);

    const ui = await createShadowRootUi(ctx, {
      name: 'credential-selector-ui',
      position: 'inline',
      anchor: 'body',
      append: 'last',
      onMount: (container) => {
        console.log(`[${LOG_PREFIX}] Mounted UI`);
        const root = ReactDOM.createRoot(container);
        root.render(
          <React.StrictMode>
            <CredentialSelectorApp />
          </React.StrictMode>,
        );
        return root;
      },
      onRemove: (root) => {
        console.log(`[${LOG_PREFIX}] Removing UI`);
        root?.unmount();
      },
    });

    ui.mount();
  },
});
