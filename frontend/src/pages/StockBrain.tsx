import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getBrainInventory } from '../services/api';
import { BrainInventoryItem } from '../types';

export default function StockBrain() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [items, setItems] = useState<BrainInventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const activeTab = searchParams.get('tab') || 'all';

  useEffect(() => {
    loadInventory();
  }, []);

  const loadInventory = async () => {
    setLoading(true);
    try {
      const data = await getBrainInventory();
      setItems(data);
    } catch (err) {
      console.error('Failed to load inventory insights:', err);
    } finally {
      setLoading(false);
    }
  };

  const categories = ['all', ...Array.from(new Set(items.map((i) => i.category)))];

  // Filtering based on active tab
  const filtered = items.filter((item) => {
    // Tab filter
    if (activeTab === 'reorder') {
      if (item.days_left === null || item.days_left > 5 || item.daily_demand <= 0.5) return false;
    } else if (activeTab === 'dead') {
      if (item.days_since_last_sale < 30 || item.stock <= 0) return false;
    } else if (activeTab === 'margin') {
      if (item.margin_pct >= 8 || item.qty_30d <= 0) return false;
    }

    // Category filter
    if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;

    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase();
      return item.name.toLowerCase().includes(q) || item.category.toLowerCase().includes(q);
    }

    return true;
  });

  const handleAction = (item: BrainInventoryItem) => {
    if (item.days_left !== null && item.days_left <= 5) {
      const needed = Math.max(1, Math.ceil(item.daily_demand * 7 - item.stock));
      setActionNotice(`✅ PO Drafted: Reorder ${needed} ${item.unit} of ${item.name} from distributor.`);
    } else if (item.days_since_last_sale >= 30) {
      setActionNotice(`🏷️ Promo applied: 15% discount tag placed on ${item.name} to free ₹${item.locked_cash} cash.`);
    } else if (item.margin_pct < 8) {
      const delta = Math.max(1, Math.ceil(item.cp / 0.9 - item.sp));
      setActionNotice(`💹 Rate Updated: Suggested price increase +₹${delta} on ${item.name} to recover 10% target margin.`);
    } else {
      setActionNotice(`ℹ️ Stock record for ${item.name} updated.`);
    }
    setTimeout(() => setActionNotice(null), 4000);
  };

  const openWhatsAppPO = (item: BrainInventoryItem) => {
    const needed = Math.max(1, Math.ceil(item.daily_demand * 7 - item.stock));
    const text = `Namaste Ji,\nKirana Decision Hub se urgent stock order:\n📦 Product: ${item.name}\n🔢 Quantity: ${needed} ${item.unit}\nKripya kal subah tak delivery karwayein.\nDhanyawad!`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  const reorderCount = items.filter((i) => i.days_left !== null && i.days_left <= 5 && i.daily_demand > 0.5).length;
  const deadCount = items.filter((i) => i.days_since_last_sale >= 30 && i.stock > 0).length;
  const marginCount = items.filter((i) => i.margin_pct < 8 && i.qty_30d > 0).length;
  const totalLocked = items.reduce((acc, i) => acc + (i.locked_cash || 0), 0);
  const deadLocked = items.filter((i) => i.days_since_last_sale >= 30).reduce((acc, i) => acc + i.locked_cash, 0);

  return (
    <div className="page-content">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            📦 Stock Brain (Inventory Decisions)
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginTop: 4 }}>
            7-din demand forecast, days-of-stock-left, locked cash aur dead stock alerts.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{
            background: 'var(--bg-secondary)', border: '1px solid var(--border-light)',
            padding: '8px 16px', borderRadius: 10, fontSize: '0.8rem', textAlign: 'right'
          }}>
            <div style={{ color: 'var(--text-tertiary)', fontWeight: 600 }}>TOTAL INVENTORY VALUE</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              ₹{totalLocked.toLocaleString('en-IN')}
            </div>
          </div>
          <div style={{
            background: '#FEF2F2', border: '1px solid #FECACA',
            padding: '8px 16px', borderRadius: 10, fontSize: '0.8rem', textAlign: 'right'
          }}>
            <div style={{ color: '#DC2626', fontWeight: 600 }}>DEAD STOCK LOCKED</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#DC2626' }}>
              ₹{deadLocked.toLocaleString('en-IN')}
            </div>
          </div>
        </div>
      </div>

      {actionNotice && (
        <div style={{
          background: 'var(--brand-50)', border: '1px solid var(--brand-300)', color: 'var(--brand-800)',
          padding: '12px 18px', borderRadius: 10, marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
          <span>{actionNotice}</span>
          <button onClick={() => setActionNotice(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }}>✕</button>
        </div>
      )}

      {/* Tabs */}
      <div style={{
        display: 'flex', gap: 8, borderBottom: '1px solid var(--border-light)', paddingBottom: 12, marginBottom: 20, overflowX: 'auto'
      }}>
        <button
          className={`btn ${activeTab === 'all' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setSearchParams({ tab: 'all' })}
          style={{ fontSize: '0.82rem', padding: '6px 16px' }}
        >
          All Items ({items.length})
        </button>

        <button
          className={`btn ${activeTab === 'reorder' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setSearchParams({ tab: 'reorder' })}
          style={{ fontSize: '0.82rem', padding: '6px 16px', display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <span>⚠️ Reorder Now</span>
          <span style={{
            background: activeTab === 'reorder' ? '#fff' : '#DC2626',
            color: activeTab === 'reorder' ? 'var(--brand-700)' : '#fff',
            fontSize: '0.7rem', padding: '1px 6px', borderRadius: 10, fontWeight: 700
          }}>
            {reorderCount}
          </span>
        </button>

        <button
          className={`btn ${activeTab === 'dead' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setSearchParams({ tab: 'dead' })}
          style={{ fontSize: '0.82rem', padding: '6px 16px', display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <span>📦 Dead Stock (30d+)</span>
          <span style={{
            background: activeTab === 'dead' ? '#fff' : '#F59E0B',
            color: activeTab === 'dead' ? 'var(--brand-700)' : '#fff',
            fontSize: '0.7rem', padding: '1px 6px', borderRadius: 10, fontWeight: 700
          }}>
            {deadCount}
          </span>
        </button>

        <button
          className={`btn ${activeTab === 'margin' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setSearchParams({ tab: 'margin' })}
          style={{ fontSize: '0.82rem', padding: '6px 16px', display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <span>📉 Low Margin (&lt;8%)</span>
          <span style={{
            background: activeTab === 'margin' ? '#fff' : '#4B5563',
            color: activeTab === 'margin' ? 'var(--brand-700)' : '#fff',
            fontSize: '0.7rem', padding: '1px 6px', borderRadius: 10, fontWeight: 700
          }}>
            {marginCount}
          </span>
        </button>
      </div>

      {/* Search & Category Filter Toolbar */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Search by product name or brand..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            flex: 1, minWidth: 260, padding: '10px 14px', borderRadius: 8,
            border: '1px solid var(--border-medium)', background: 'var(--bg-secondary)', fontSize: '0.88rem'
          }}
        />

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          style={{
            padding: '10px 14px', borderRadius: 8,
            border: '1px solid var(--border-medium)', background: 'var(--bg-secondary)', fontSize: '0.88rem', fontWeight: 500
          }}
        >
          {categories.map((c) => (
            <option key={c} value={c}>
              {c === 'all' ? 'All Categories' : c}
            </option>
          ))}
        </select>
      </div>

      {/* Stock Table */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ background: 'var(--bg-tertiary)', borderBottom: '1px solid var(--border-light)' }}>
                <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--text-secondary)' }}>Product</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--text-secondary)' }}>Stock</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--text-secondary)' }}>Days Left</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--text-secondary)' }}>7d Forecast</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--text-secondary)' }}>Daily Demand</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--text-secondary)' }}>SP / CP</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--text-secondary)' }}>Margin %</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--text-secondary)' }}>Locked Cash</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--text-secondary)', textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} style={{ padding: 40, textAlign: 'center', color: 'var(--text-secondary)' }}>
                    Loading stock insights...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ padding: 40, textAlign: 'center', color: 'var(--text-secondary)' }}>
                    No products matching this filter.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => {
                  // Days left badge styling
                  let badgeBg = '#F3F4F6';
                  let badgeColor = '#4B5563';
                  let badgeLabel = 'Slow / Inactive';

                  if (item.days_left !== null) {
                    if (item.days_left <= 3) {
                      badgeBg = '#FEE2E2';
                      badgeColor = '#DC2626';
                      badgeLabel = `${item.days_left}d (Critical)`;
                    } else if (item.days_left <= 5) {
                      badgeBg = '#FEF3C7';
                      badgeColor = '#D97706';
                      badgeLabel = `${item.days_left}d (Reorder)`;
                    } else {
                      badgeBg = 'var(--brand-100)';
                      badgeColor = 'var(--brand-700)';
                      badgeLabel = `${item.days_left}d (Safe)`;
                    }
                  } else if (item.days_since_last_sale >= 30) {
                    badgeBg = '#F3F4F6';
                    badgeColor = '#9CA3AF';
                    badgeLabel = `${item.days_since_last_sale}d no sale`;
                  }

                  return (
                    <tr
                      key={item.product_id}
                      style={{ borderBottom: '1px solid var(--border-light)', transition: 'background 0.15s ease' }}
                    >
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{item.name}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>{item.category}</div>
                      </td>

                      <td style={{ padding: '14px 16px' }}>
                        <strong style={{ fontSize: '0.95rem' }}>{item.stock}</strong>{' '}
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{item.unit}</span>
                      </td>

                      <td style={{ padding: '14px 16px' }}>
                        <span style={{
                          background: badgeBg, color: badgeColor,
                          padding: '4px 8px', borderRadius: 6, fontSize: '0.75rem', fontWeight: 700
                        }}>
                          {badgeLabel}
                        </span>
                      </td>

                      <td style={{ padding: '14px 16px', fontWeight: 600 }}>
                        {item.forecast_7d} {item.unit}
                      </td>

                      <td style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>
                        ~{item.daily_demand} / day
                      </td>

                      <td style={{ padding: '14px 16px' }}>
                        <div>₹{item.sp} <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>SP</span></div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>₹{item.cp} CP</div>
                      </td>

                      <td style={{ padding: '14px 16px' }}>
                        <span style={{
                          fontWeight: 700,
                          color: item.margin_pct >= 12 ? 'var(--brand-600)' : item.margin_pct >= 8 ? '#D97706' : '#DC2626'
                        }}>
                          {item.margin_pct}%
                        </span>
                      </td>

                      <td style={{ padding: '14px 16px', fontWeight: 600 }}>
                        ₹{item.locked_cash?.toLocaleString('en-IN')}
                      </td>

                      <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end', alignItems: 'center' }}>
                          {item.days_left !== null && item.days_left <= 5 && (
                            <button
                              className="btn"
                              onClick={() => openWhatsAppPO(item)}
                              style={{
                                background: '#25D366', color: '#fff', fontSize: '0.72rem', padding: '4px 8px',
                                borderRadius: 6, display: 'inline-flex', alignItems: 'center', gap: 3, fontWeight: 700, border: 'none', cursor: 'pointer'
                              }}
                              title="Order from distributor via WhatsApp"
                            >
                              <span>📲 WA</span>
                            </button>
                          )}
                          <button
                            className="btn btn-secondary"
                            onClick={() => handleAction(item)}
                            style={{ fontSize: '0.75rem', padding: '5px 10px', whiteSpace: 'nowrap' }}
                          >
                            {item.days_left !== null && item.days_left <= 5 ? '⚡ Reorder' :
                             item.days_since_last_sale >= 30 ? '🏷️ Discount' :
                             item.margin_pct < 8 ? '💹 Price +₹' : 'Details'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
