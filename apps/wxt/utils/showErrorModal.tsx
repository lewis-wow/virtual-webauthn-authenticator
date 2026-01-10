import React, { useEffect } from 'react';

export function showErrorModal({
  message,
  data,
}: {
  message: string;
  data?: unknown;
}) {
  // Create a container div for the modal if it doesn't exist
  let container = document.getElementById('wxt-shadcn-error-modal');
  if (!container) {
    container = document.createElement('div');
    container.id = 'wxt-shadcn-error-modal';
    document.body.appendChild(container);
  }

  // Render the modal using React (React 18+)
  import('react-dom/client').then(({ createRoot }) => {
    const root = createRoot(container!);
    root.render(
      <div
        style={{
          position: 'fixed',
          zIndex: 9999,
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            background: 'white',
            borderRadius: 8,
            padding: 24,
            minWidth: 320,
            maxWidth: 480,
            boxShadow: '0 2px 16px rgba(0,0,0,0.2)',
          }}
        >
          <h2 style={{ margin: 0, marginBottom: 12, color: '#dc2626' }}>
            Error
          </h2>
          <div style={{ marginBottom: 12 }}>{message}</div>
          {typeof data !== 'undefined' && (
            <pre
              style={{
                background: '#f3f4f6',
                padding: 8,
                borderRadius: 4,
                maxHeight: 200,
                overflow: 'auto',
                fontSize: 12,
              }}
            >
              {JSON.stringify(data as any, null, 2)}
            </pre>
          )}
          <button
            style={{
              marginTop: 16,
              background: '#dc2626',
              color: 'white',
              border: 'none',
              borderRadius: 4,
              padding: '8px 16px',
              cursor: 'pointer',
            }}
            onClick={() => {
              root.unmount();
              container?.remove();
            }}
          >
            Close
          </button>
        </div>
      </div>,
    );
  });
}
