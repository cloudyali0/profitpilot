import { useEffect, useState } from 'react';
import { healthCheck, clearBrainData, resetBrainSeed, getDataMode } from '../services/api';

interface TopbarProps {
  onToggleSidebar: () => void;
}

export default function Topbar({ onToggleSidebar }: TopbarProps) {
  const [online, setOnline] = useState(false);
  const [storeName, setStoreName] = useState('ProfitPilot Hub');
  const [mode, setMode] = useState<'demo' | 'empty'>(getDataMode());
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  useEffect(() => {
    healthCheck()
      .then((data: any) => {
        setOnline(data.status === 'online');
        if (data.store) setStoreName(data.store);
      })
      .catch(() => setOnline(false));

    const onDataChanged = (e: any) => {
      if (e?.detail?.mode) setMode(e.detail.mode);
      else setMode(getDataMode());
    };

    window.addEventListener('profitpilot-data-changed', onDataChanged);
    return () => window.removeEventListener('profitpilot-data-changed', onDataChanged);
  }, []);

  const handleClear = async () => {
    await clearBrainData();
    setMode('empty');
    setActionMessage('🗑️ Store cleared to Empty Slate! Add live orders via WhatsApp Agent.');
    setTimeout(() => setActionMessage(null), 3500);
  };

  const handleLoadDemo = async () => {
    await resetBrainSeed();
    setMode('demo');
    setActionMessage('⚡ 60-Day Kirana Dataset loaded with forecasting & intelligence!');
    setTimeout(() => setActionMessage(null), 3500);
  };

  return (
    <header className="topbar" style={{ position: 'relative' }}>
      <button className="mobile-toggle" onClick={onToggleSidebar}>☰</button>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>
          {storeName}
        </span>
      </div>

      <div style={{ flex: 1 }} />

      {/* Live Judge Demo Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginRight: 8 }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          background: 'var(--gray-100, #F3F4F6)',
          border: '1px solid var(--border-color, #E5E7EB)',
          borderRadius: 8,
          padding: 2,
          gap: 2,
        }}>
          <button
            onClick={handleClear}
            style={{
              background: mode === 'empty' ? '#EF4444' : 'transparent',
              color: mode === 'empty' ? '#FFFFFF' : 'var(--text-secondary, #4B5563)',
              border: 'none',
              borderRadius: 6,
              padding: '4px 9px',
              fontSize: '0.74rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              transition: 'all 0.15s ease',
            }}
            title="Wipe data to 0 to do a live demo from scratch in front of judges"
          >
            <span>🗑️</span>
            <span>Clear Store (Demo)</span>
          </button>

          <button
            onClick={handleLoadDemo}
            style={{
              background: mode === 'demo' ? 'var(--brand-600, #0D9488)' : 'transparent',
              color: mode === 'demo' ? '#FFFFFF' : 'var(--text-secondary, #4B5563)',
              border: 'none',
              borderRadius: 6,
              padding: '4px 9px',
              fontSize: '0.74rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              transition: 'all 0.15s ease',
            }}
            title="Load full 60-day Kirana simulation dataset"
          >
            <span>⚡</span>
            <span>Load 60D Demo Data</span>
          </button>
        </div>
      </div>

      <span className={`status-badge ${online ? 'online' : ''}`}>
        <span className="dot" />
        {mode === 'empty' ? 'Live Demo Mode' : 'Dataset Active'}
      </span>

      <div style={{
        width: 32, height: 32, borderRadius: '50%',
        background: 'var(--brand-100)', color: 'var(--brand-700)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '0.85rem', fontWeight: 700,
      }}>
        🏪
      </div>

      {actionMessage && (
        <div style={{
          position: 'absolute',
          top: 54,
          right: 20,
          background: 'var(--gray-900, #111827)',
          color: '#FFFFFF',
          padding: '8px 14px',
          borderRadius: 8,
          fontSize: '0.78rem',
          fontWeight: 600,
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          zIndex: 9999,
          animation: 'fadeIn 0.2s ease',
        }}>
          {actionMessage}
        </div>
      )}
    </header>
  );
}
