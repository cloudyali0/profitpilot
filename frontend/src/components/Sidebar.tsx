import { useLocation, useNavigate } from 'react-router-dom';

const brainNavItems = [
  { path: '/', label: 'Home (Overview)', icon: '🏪' },
  { path: '/stock-brain', label: 'Stock Brain', icon: '📦' },
  { path: '/money', label: 'Money & Anomaly', icon: '💰' },
  { path: '/ask-brain', label: 'Ask Brain (AI)', icon: '💬' },
  { path: '/add-data', label: 'Add Data & Sync', icon: '➕' },
];

const opsNavItems = [
  { path: '/dashboard', label: 'AI Order Desk', icon: '⚡' },
  { path: '/orders', label: 'Orders', icon: '📋' },
  { path: '/customers', label: 'Customers', icon: '👥' },
  { path: '/activity', label: 'Agent Activity', icon: '📜' },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <>
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.3)',
            zIndex: 99,
            display: 'none',
          }}
          className="mobile-overlay"
          onClick={onClose}
        />
      )}
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <h1>
            <span className="brand-icon">🚀</span>
            ProfitPilot
          </h1>
          <div className="tagline">Roz subah 3 sahi faisle, seedha munafa.</div>
        </div>

        <nav className="sidebar-nav">
          <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', padding: '6px 12px 2px' }}>
            Decision Engine
          </div>
          {brainNavItems.map((item) => (
            <button
              key={item.path}
              className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
              onClick={() => {
                navigate(item.path);
                onClose();
              }}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.label}
            </button>
          ))}

          <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', padding: '14px 12px 2px' }}>
            Operations & Agent
          </div>
          {opsNavItems.map((item) => (
            <button
              key={item.path}
              className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
              onClick={() => {
                navigate(item.path);
                onClose();
              }}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
            Retail Decision Intelligence
          </div>
          <div style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)', marginTop: '2px' }}>
            ProfitPilot Platform v1.0
          </div>
        </div>
      </aside>
    </>
  );
}
