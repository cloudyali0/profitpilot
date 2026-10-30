import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getBrainInventory, updateProduct, deleteProduct, addProduct } from '../services/api';
import { BrainInventoryItem } from '../types';

interface ProductFormData {
  name: string;
  category: string;
  unit: string;
  stock: number;
  cp: number;
  sp: number;
}

const CATEGORIES_LIST = [
  'Staples',
  'Dairy',
  'Bakery',
  'Beverages',
  'Snacks',
  'Breakfast',
  'Healthcare',
  'Household',
  'Personal Care',
  'General',
];

const UNITS_LIST = ['pack', 'kg', 'pouch', 'bottle', 'box', 'jar', 'pcs'];

export default function StockBrain() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [items, setItems] = useState<BrainInventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Modal States
  const [editingItem, setEditingItem] = useState<BrainInventoryItem | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    category: 'Staples',
    unit: 'pack',
    stock: 20,
    cp: 100,
    sp: 120,
  });

  const activeTab = searchParams.get('tab') || 'all';

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

  useEffect(() => {
    loadInventory();
    const onDataChanged = () => loadInventory();
    window.addEventListener('profitpilot-data-changed', onDataChanged);
    return () => window.removeEventListener('profitpilot-data-changed', onDataChanged);
  }, []);

  const categories = ['all', ...Array.from(new Set(items.map((i) => i.category)))];

  // Filtering based on active tab
  const filtered = items.filter((item) => {
    if (activeTab === 'reorder') {
      if (item.days_left === null || item.days_left > 5 || item.daily_demand <= 0.5) return false;
    } else if (activeTab === 'dead') {
      if (item.days_since_last_sale < 30 || item.stock <= 0) return false;
    } else if (activeTab === 'margin') {
      if (item.margin_pct >= 8 || item.qty_30d <= 0) return false;
    }

    if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;

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
    const text = `Namaste Ji,\nProfitPilot Hub se urgent stock order:\n📦 Product: ${item.name}\n🔢 Quantity: ${needed} ${item.unit}\nKripya kal subah tak delivery karwayein.\nDhanyawad!`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  // Open Edit Modal
  const openEditModal = (item: BrainInventoryItem) => {
    setEditingItem(item);
    setIsAddingNew(false);
    setFormData({
      name: item.name,
      category: item.category,
      unit: item.unit,
      stock: item.stock,
      cp: item.cp,
      sp: item.sp,
    });
  };

  // Open Add Product Modal
  const openAddModal = () => {
    setEditingItem(null);
    setIsAddingNew(true);
    setFormData({
      name: '',
      category: 'Staples',
      unit: 'pack',
      stock: 25,
      cp: 50,
      sp: 65,
    });
  };

  // Quick Stock Step
  const adjustStock = (delta: number) => {
    setFormData((prev) => ({
      ...prev,
      stock: Math.max(0, prev.stock + delta),
    }));
  };

  // Handle Save Edit or Add
  const handleSaveModal = async () => {
    if (!formData.name.trim()) {
      alert('Kripya product ka naam darj karein.');
      return;
    }
    setModalLoading(true);

    try {
      if (editingItem) {
        // Edit existing product
        await updateProduct(editingItem.product_id, {
          name: formData.name,
          category: formData.category,
          unit: formData.unit,
          stock: formData.stock,
          cp: formData.cp,
          sp: formData.sp,
        });
        setActionNotice(`✅ '${formData.name}' ka stock (${formData.stock} ${formData.unit}) aur details update ho gaye!`);
      } else {
        // Add new product
        await addProduct({
          name: formData.name,
          category: formData.category,
          unit: formData.unit,
          stock: formData.stock,
          cp: formData.cp,
          sp: formData.sp,
          daily_demand: 1.5,
        });
        setActionNotice(`✅ Naya product '${formData.name}' store inventory me add ho gaya!`);
      }
      setEditingItem(null);
      setIsAddingNew(false);
      await loadInventory();
    } catch (err: any) {
      alert('Save karne me dikkat aayi: ' + err.message);
    } finally {
      setModalLoading(false);
      setTimeout(() => setActionNotice(null), 4000);
    }
  };

  // Handle Delete Product
  const handleDeleteProduct = async (item: BrainInventoryItem) => {
    const ok = window.confirm(`Kya aap sach me '${item.name}' ko store inventory se delete karna chahte hain?`);
    if (!ok) return;

    try {
      await deleteProduct(item.product_id);
      setActionNotice(`🗑️ Product '${item.name}' store se delete kar diya gaya.`);
      await loadInventory();
    } catch (err: any) {
      alert('Delete failed: ' + err.message);
    } finally {
      setTimeout(() => setActionNotice(null), 4000);
    }
  };

  const reorderCount = items.filter((i) => i.days_left !== null && i.days_left <= 5 && i.daily_demand > 0.5).length;
  const deadCount = items.filter((i) => i.days_since_last_sale >= 30 && i.stock > 0).length;
  const marginCount = items.filter((i) => i.margin_pct < 8 && i.qty_30d > 0).length;
  const totalLocked = items.reduce((acc, i) => acc + (i.locked_cash || 0), 0);
  const deadLocked = items.filter((i) => i.days_since_last_sale >= 30).reduce((acc, i) => acc + (i.locked_cash || 0), 0);

  // Live margin preview in modal
  const marginPreview = formData.sp > 0 ? (((formData.sp - formData.cp) / formData.sp) * 100).toFixed(1) : '0.0';
  const profitPerUnit = (formData.sp - formData.cp).toFixed(1);

  return (
    <div className="page-content">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            📦 Stock Brain (Inventory & Products)
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginTop: 4 }}>
            Product add karein, stock quantity edit karein, delete karein, aur 7-din demand forecast dekhein.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            className="btn btn-primary"
            onClick={openAddModal}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', fontWeight: 700 }}
          >
            <span>➕</span>
            <span>Add New Product</span>
          </button>

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
                <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--text-secondary)', textAlign: 'right' }}>Actions</th>
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
                    Koi product nahi mila. <strong>"Add New Product"</strong> button se naya item jodein!
                  </td>
                </tr>
              ) : (
                filtered.map((item) => {
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
                            style={{ fontSize: '0.74rem', padding: '5px 8px', whiteSpace: 'nowrap' }}
                          >
                            {item.days_left !== null && item.days_left <= 5 ? '⚡ Reorder' :
                             item.days_since_last_sale >= 30 ? '🏷️ Discount' :
                             item.margin_pct < 8 ? '💹 +Price' : 'Action'}
                          </button>

                          {/* Edit Product & Stock Quantity Button */}
                          <button
                            className="btn btn-secondary"
                            onClick={() => openEditModal(item)}
                            style={{ fontSize: '0.74rem', padding: '5px 8px', fontWeight: 600 }}
                            title="Edit product details & stock quantity"
                          >
                            ✏️ Edit
                          </button>

                          {/* Delete Product Button */}
                          <button
                            className="btn"
                            onClick={() => handleDeleteProduct(item)}
                            style={{
                              fontSize: '0.74rem', padding: '5px 8px', background: '#FEE2E2',
                              color: '#DC2626', border: '1px solid #FECACA', borderRadius: 6, cursor: 'pointer'
                            }}
                            title="Delete product from store"
                          >
                            🗑️
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

      {/* Edit / Add Product Modal Dialog */}
      {(editingItem || isAddingNew) && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: 16
        }}>
          <div style={{
            background: 'var(--bg-primary, #ffffff)', borderRadius: 14, width: '100%', maxWidth: 520,
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)', overflow: 'hidden', border: '1px solid var(--border-medium)'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '16px 20px', borderBottom: '1px solid var(--border-light)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-secondary)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: '1.2rem' }}>{editingItem ? '✏️' : '➕'}</span>
                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {editingItem ? 'Edit Product & Stock Quantity' : 'Add New Store Product'}
                </h3>
              </div>
              <button
                onClick={() => { setEditingItem(null); setIsAddingNew(false); }}
                style={{ background: 'none', border: 'none', fontSize: '1.1rem', cursor: 'pointer', color: 'var(--text-secondary)' }}
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>
                  PRODUCT NAME (नाम) *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Aashirvaad Atta 5kg, Amul Butter 100g..."
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={{
                    width: '100%', padding: '10px 12px', borderRadius: 8,
                    border: '1px solid var(--border-medium)', background: 'var(--bg-primary)', fontSize: '0.9rem'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>
                    CATEGORY (कैटेगरी)
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    style={{
                      width: '100%', padding: '10px 12px', borderRadius: 8,
                      border: '1px solid var(--border-medium)', background: 'var(--bg-primary)', fontSize: '0.88rem'
                    }}
                  >
                    {CATEGORIES_LIST.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>
                    UNIT (इकाई)
                  </label>
                  <select
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    style={{
                      width: '100%', padding: '10px 12px', borderRadius: 8,
                      border: '1px solid var(--border-medium)', background: 'var(--bg-primary)', fontSize: '0.88rem'
                    }}
                  >
                    {UNITS_LIST.map((u) => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Stock Quantity Controls */}
              <div style={{
                background: 'var(--bg-secondary)', padding: '12px 14px', borderRadius: 10,
                border: '1px solid var(--border-light)'
              }}>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--brand-800)', marginBottom: 6 }}>
                  📦 STOCK QUANTITY (दुकान में कुल माल)
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <input
                    type="number"
                    min="0"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: Math.max(0, parseInt(e.target.value) || 0) })}
                    style={{
                      width: 100, padding: '10px 12px', borderRadius: 8,
                      border: '1px solid var(--border-medium)', background: 'var(--bg-primary)',
                      fontSize: '1.05rem', fontWeight: 800, textAlign: 'center'
                    }}
                  />
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{formData.unit}</span>

                  {/* Quick adjust buttons */}
                  <div style={{ display: 'flex', gap: 4, marginLeft: 'auto' }}>
                    {[-10, -5, -1, 1, 5, 10].map((delta) => (
                      <button
                        key={delta}
                        type="button"
                        onClick={() => adjustStock(delta)}
                        className="btn btn-secondary"
                        style={{
                          padding: '4px 8px', fontSize: '0.75rem', fontWeight: 700,
                          background: delta > 0 ? 'var(--brand-50)' : '#FEF2F2',
                          color: delta > 0 ? 'var(--brand-700)' : '#DC2626',
                          borderColor: delta > 0 ? 'var(--brand-200)' : '#FECACA',
                        }}
                      >
                        {delta > 0 ? `+${delta}` : delta}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Pricing & Margin */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>
                    COST PRICE (₹ खरीद दाम / CP)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={formData.cp}
                    onChange={(e) => setFormData({ ...formData, cp: parseFloat(e.target.value) || 0 })}
                    style={{
                      width: '100%', padding: '10px 12px', borderRadius: 8,
                      border: '1px solid var(--border-medium)', background: 'var(--bg-primary)', fontSize: '0.9rem'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>
                    SELLING PRICE (₹ बिक्री दाम / SP)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={formData.sp}
                    onChange={(e) => setFormData({ ...formData, sp: parseFloat(e.target.value) || 0 })}
                    style={{
                      width: '100%', padding: '10px 12px', borderRadius: 8,
                      border: '1px solid var(--border-medium)', background: 'var(--bg-primary)', fontSize: '0.9rem'
                    }}
                  />
                </div>
              </div>

              {/* Dynamic Live Margin Preview */}
              <div style={{
                background: parseFloat(marginPreview) >= 10 ? 'var(--brand-50)' : '#FEF3C7',
                border: `1px solid ${parseFloat(marginPreview) >= 10 ? 'var(--brand-200)' : '#FDE68A'}`,
                padding: '10px 14px', borderRadius: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center'
              }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Estimated Margin Preview:
                </span>
                <span style={{
                  fontSize: '0.88rem', fontWeight: 800,
                  color: parseFloat(marginPreview) >= 10 ? 'var(--brand-800)' : '#B45309'
                }}>
                  {marginPreview}% (₹{profitPerUnit} munafa / {formData.unit})
                </span>
              </div>
            </div>

            {/* Modal Footer */}
            <div style={{
              padding: '14px 20px', borderTop: '1px solid var(--border-light)',
              display: 'flex', justifyContent: 'flex-end', gap: 10, background: 'var(--bg-secondary)'
            }}>
              <button
                className="btn btn-secondary"
                onClick={() => { setEditingItem(null); setIsAddingNew(false); }}
                disabled={modalLoading}
                style={{ padding: '8px 16px', fontSize: '0.85rem' }}
              >
                Cancel
              </button>

              <button
                className="btn btn-primary"
                onClick={handleSaveModal}
                disabled={modalLoading}
                style={{ padding: '8px 20px', fontSize: '0.85rem', fontWeight: 700 }}
              >
                {modalLoading ? 'Saving...' : editingItem ? 'Save Changes' : 'Add to Inventory'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
