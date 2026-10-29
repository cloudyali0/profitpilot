import { useEffect, useState } from 'react';
import { healthCheck } from '../services/api';

interface TopbarProps {
  onToggleSidebar: () => void;
}

export default function Topbar({ onToggleSidebar }: TopbarProps) {
  const [online, setOnline] = useState(false);
  const [storeName, setStoreName] = useState('Kirana Decision Hub');

  useEffect(() => {
    healthCheck()
      .then((data: any) => {
        setOnline(data.status === 'online');
        if (data.store) setStoreName(data.store);
      })
      .catch(() => setOnline(false));
  }, []);

  return (
    <header className="topbar">
      <button className="mobile-toggle" onClick={onToggleSidebar}>☰</button>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>
          {storeName}
        </span>
      </div>

      <div style={{ flex: 1 }} />

      <span className={`status-badge ${online ? 'online' : ''}`}>
        <span className="dot" />
        System {online ? 'Online' : 'Connecting'}
      </span>

      <span className={`status-badge ${online ? 'online' : ''}`}>
        <span className="dot" />
        Analytics Engine Active
      </span>

      <div style={{
        width: 32, height: 32, borderRadius: '50%',
        background: 'var(--brand-100)', color: 'var(--brand-700)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '0.85rem', fontWeight: 700,
      }}>
        🏪
      </div>
    </header>
  );
}
