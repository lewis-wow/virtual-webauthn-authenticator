import { Settings } from '@/components/settings';
import '@repo/ui/globals.css';
import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { browser } from 'wxt/browser';

function Popup() {
  useEffect(() => {
    // Check if this is an OAuth callback
    const urlParams = new URLSearchParams(window.location.search);
    const hasCallbackParams = urlParams.has('code') || urlParams.has('state');

    if (hasCallbackParams) {
      // Signal that auth has completed
      browser.storage.local.set({ 'auth-completed': Date.now() }).then(() => {
        // Close this tab if it was opened for OAuth
        // Check if we're in a tab (not the popup)
        if (window.opener || window.location.search.includes('code')) {
          window.close();
        }
      });
    }
  }, []);

  return (
    <div className="w-96 h-96">
      <Settings />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Popup />
  </React.StrictMode>,
);
