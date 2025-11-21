import '@/assets/tailwindcss.css';
import Settings from '@/components/settings';
import React from 'react';
import ReactDOM from 'react-dom/client';

function Popup() {
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
