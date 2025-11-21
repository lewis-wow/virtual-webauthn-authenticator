import '@repo/ui/styles/globals.css';
import { useState } from 'react';

import Settings from './tabs/settings';

function Popup() {
  const [activeTab, setActiveTab] = useState('settings');

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        padding: 16,
        width: 400,
        height: 600,
      }}
    >
      <h1>Welcome to Plasmo!</h1>
      <div style={{ marginTop: 16 }}>
        <button onClick={() => setActiveTab('settings')}>Settings</button>
      </div>
      <div style={{ marginTop: 16 }}>
        {activeTab === 'settings' && <Settings />}
      </div>
    </div>
  );
}

export default Popup;
