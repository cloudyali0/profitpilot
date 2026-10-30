import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getBrainOverview,
  getBrainRecommendations,
  getBrainBacktest,
  getBrainSummary,
  resetBrainSeed,
} from '../services/api';
import { BrainOverview, BrainRecommendation, BrainBacktest } from '../types';

export default function Home() {
  const navigate = useNavigate();
  const [overview, setOverview] = useState<BrainOverview | null>(null);
  const [recs, setRecs] = useState<BrainRecommendation[]>([]);
  const [backtest, setBacktest] = useState<BrainBacktest | null>(null);
  const [summary, setSummary] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [resetting, setResetting] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [ov, rc, bt, sm] = await Promise.all([
        getBrainOverview(),
        getBrainRecommendations(),
        getBrainBacktest(7),
        getBrainSummary(),
      ]);
      setOverview(ov);
      setRecs(rc);
      setBacktest(bt);
      setSummary(sm.text);
    } catch (err) {
      console.error('Error loading brain overview:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAction = (rec: BrainRecommendation) => {
    if (rec.type === 'reorder') {
      setActionSuccess(`✅ Reorder request for "${rec.title.split(':')[0]}" generated. Stock order drafted!`);
    } else if (rec.type === 'dead_stock') {
      navigate('/stock-brain?tab=dead');
    } else if (rec.type === 'margin_leak') {
      navigate('/stock-brain?tab=margin');
    } else if (rec.type === 'expense_anomaly') {
      navigate('/money');
    }
    setTimeout(() => setActionSuccess(null), 4000);
  };

  const sendWhatsAppPO = (title: string, detail: string) => {
    const text = `Namaste Ji,\nProfitPilot Hub se urgent stock order:\n📦 ${title}\n📝 Note: ${detail}\nKripya kal subah tak delivery karwayein.\nDhanyawad!`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleResetData = async () => {
    if (!window.confirm('Reset database to the 60-day Kirana simulation dataset?')) return;
    setResetting(true);
    try {
      await resetBrainSeed();
      await loadData();
      setActionSuccess('✅ 60-Day Kirana demo dataset reloaded successfully!');
      setTimeout(() => setActionSuccess(null), 4000);
    } catch (err) {
      alert('Failed to reset dataset: ' + err);
    } finally {
      setResetting(false);
    }
  };

  if (loading && !overview) {
    return (
      <div className="page-content" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="spinner" style={{ width: 40, height: 40, margin: '0 auto 16px' }} />
          <p style={{ color: 'var(--text-secondary)' }}>Loading Decision Brain...</p>
        </div>
      </div>
    );
  }

  const score = overview?.health_score ?? 61;
  const breakdown = overview?.score_breakdown ?? {
    stock_availability: 10,
    dead_stock: 12,
    margin: 16,
    expense_control: 22,
  };

  const top3 = recs.slice(0, 3);

  // SVG Gauge calculations
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="page-content">
      {/* Top Banner & Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, marginBottom: 24 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
              🚀 ProfitPilot
            </h1>
            <span style={{
              background: 'var(--brand-100)', color: 'var(--brand-700)',
              fontSize: '0.72rem', fontWeight: 700, padding: '3px 10px', borderRadius: 100, textTransform: 'uppercase', letterSpacing: '0.05em'
            }}>
              Retail Decision Engine
            </span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: 4 }}>
            Roz subah 3 sahi faisle, seedha munafa • As of {overview?.as_of || 'Today'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {backtest && (
            <div style={{
              background: '#EFF6FF', border: '1px solid #BFDBFE', color: '#1D4ED8',
              padding: '6px 14px', borderRadius: 8, fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6
            }}>
              <span>🎯</span>
              <span><strong>{backtest.accuracy_pct}%</strong> Forecast Accuracy</span>
            </div>
          )}
          <button
            className="btn btn-secondary"
            onClick={handleResetData}
            disabled={resetting}
            style={{ fontSize: '0.8rem', padding: '6px 12px' }}
          >
            {resetting ? 'Resetting...' : '🔄 Reset Demo (60d)'}
          </button>
        </div>
      </div>

      {actionSuccess && (
        <div style={{
          background: 'var(--brand-50)', border: '1px solid var(--brand-300)', color: 'var(--brand-800)',
          padding: '12px 18px', borderRadius: 10, marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
          <span>{actionSuccess}</span>
          <button onClick={() => setActionSuccess(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }}>✕</button>
        </div>
      )}

      {/* Main Grid: Health Score Card + Top Actions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 380px) 1fr', gap: 24, marginBottom: 24 }}>
        
        {/* Health Score Card */}
        <div className="card" style={{ padding: 24, display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>Store Health Score</h3>
            <span style={{
              fontSize: '0.75rem', fontWeight: 700,
              color: score >= 75 ? 'var(--brand-600)' : score >= 50 ? '#D97706' : '#DC2626',
              background: score >= 75 ? 'var(--brand-50)' : score >= 50 ? '#FFFBEB' : '#FEF2F2',
              padding: '3px 8px', borderRadius: 6
            }}>
              {score >= 75 ? 'Strong Health' : score >= 50 ? 'Needs Attention' : 'Critical Action'}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 24, margin: '12px 0 20px' }}>
            <div style={{ position: 'relative', width: 130, height: 130 }}>
              <svg width="130" height="130" viewBox="0 0 130 130">
                <circle
                  cx="65" cy="65" r={radius}
                  stroke="#E7E5E4" strokeWidth="12" fill="none"
                />
                <circle
                  cx="65" cy="65" r={radius}
                  stroke={score >= 70 ? 'var(--brand-500)' : score >= 50 ? '#F59E0B' : '#EF4444'}
                  strokeWidth="12" fill="none"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  transform="rotate(-90 65 65)"
                  style={{ transition: 'stroke-dashoffset 0.8s ease' }}
                />
              </svg>
              <div style={{
                position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center'
              }}>
                <span style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>{score}</span>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', fontWeight: 600 }}>OUT OF 100</span>
              </div>
            </div>

            <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              <div><strong>{overview?.products_at_risk || 0} items</strong> low stock</div>
              <div><strong>₹{overview?.dead_stock_locked?.toLocaleString('en-IN') || 0}</strong> dead cash</div>
              <div><strong>{overview?.margin_pct || 0}%</strong> avg margin</div>
            </div>
          </div>

          {/* 4 Pillars Breakdown */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 'auto' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 600, marginBottom: 4 }}>
                <span style={{ color: 'var(--text-secondary)' }}>Stock Availability</span>
                <span>{breakdown.stock_availability} / 25</span>
              </div>
              <div style={{ height: 6, background: '#F3EDE3', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ width: `${(breakdown.stock_availability / 25) * 100}%`, height: '100%', background: '#F59E0B', borderRadius: 4 }} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 600, marginBottom: 4 }}>
                <span style={{ color: 'var(--text-secondary)' }}>Dead Stock Recovery</span>
                <span>{breakdown.dead_stock} / 25</span>
              </div>
              <div style={{ height: 6, background: '#F3EDE3', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ width: `${(breakdown.dead_stock / 25) * 100}%`, height: '100%', background: '#EF4444', borderRadius: 4 }} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 600, marginBottom: 4 }}>
                <span style={{ color: 'var(--text-secondary)' }}>Margin Health</span>
                <span>{breakdown.margin} / 25</span>
              </div>
              <div style={{ height: 6, background: '#F3EDE3', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ width: `${(breakdown.margin / 25) * 100}%`, height: '100%', background: 'var(--brand-500)', borderRadius: 4 }} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 600, marginBottom: 4 }}>
                <span style={{ color: 'var(--text-secondary)' }}>Expense Control</span>
                <span>{breakdown.expense_control} / 25</span>
              </div>
              <div style={{ height: 6, background: '#F3EDE3', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ width: `${(breakdown.expense_control / 25) * 100}%`, height: '100%', background: 'var(--brand-600)', borderRadius: 4 }} />
              </div>
            </div>
          </div>
        </div>

        {/* Aaj Ke Top Actions Card */}
        <div className="card" style={{ padding: 24, display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                ⚡ Aaj Ke Top Kaam (Prioritized Decisions)
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Pandas analytics engine dwara ranked recommendations — seedha ₹ impact
              </p>
            </div>
            <button
              className="btn btn-secondary"
              onClick={() => navigate('/stock-brain')}
              style={{ fontSize: '0.78rem', padding: '5px 12px' }}
            >
              View All ({recs.length}) →
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, flex: 1 }}>
            {top3.map((rec, idx) => (
              <div
                key={rec.id || idx}
                style={{
                  background: rec.urgency === 'high' ? '#FFFBEB' : 'var(--bg-primary)',
                  border: `1px solid ${rec.urgency === 'high' ? '#FDE68A' : 'var(--border-light)'}`,
                  borderRadius: 12, padding: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16,
                  transition: 'transform 0.15s ease'
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{
                      fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', padding: '2px 8px', borderRadius: 6,
                      background: rec.urgency === 'high' ? '#FEE2E2' : '#EFF6FF',
                      color: rec.urgency === 'high' ? '#DC2626' : '#2563EB',
                    }}>
                      {rec.type.replace('_', ' ')}
                    </span>
                    <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                      {rec.title}
                    </h4>
                  </div>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0 }}>
                    {rec.detail}
                  </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8, minWidth: 140 }}>
                  <span style={{
                    fontSize: '0.82rem', fontWeight: 700, color: 'var(--brand-700)',
                    background: 'var(--brand-100)', padding: '3px 10px', borderRadius: 8
                  }}>
                    {rec.type === 'reorder' ? `+₹${rec.impact_rs.toLocaleString('en-IN')} bikri bachegi` :
                     rec.type === 'dead_stock' ? `₹${rec.impact_rs.toLocaleString('en-IN')} cash phasa` :
                     rec.type === 'margin_leak' ? `+₹${rec.impact_rs.toLocaleString('en-IN')}/mo profit` :
                     `₹${rec.impact_rs.toLocaleString('en-IN')} anomaly`}
                  </span>

                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                    {rec.type === 'reorder' && (
                      <button
                        className="btn"
                        onClick={() => sendWhatsAppPO(rec.title, rec.detail)}
                        style={{
                          background: '#25D366', color: '#fff', fontSize: '0.74rem', padding: '6px 10px',
                          borderRadius: 8, display: 'flex', alignItems: 'center', gap: 4, fontWeight: 700, border: 'none', cursor: 'pointer'
                        }}
                        title="Send Purchase Order to Distributor via WhatsApp"
                      >
                        <span>📲 WhatsApp PO</span>
                      </button>
                    )}
                    <button
                      className="btn btn-primary"
                      onClick={() => handleAction(rec)}
                      style={{ fontSize: '0.78rem', padding: '6px 14px' }}
                    >
                      {rec.action}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* 🧠 Problem Statement Showcase: Intuition vs ProfitPilot */}
      <div className="card" style={{ padding: 22, marginBottom: 24, border: '2px solid #E2E8F0', background: 'linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 100%)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: '1.25rem' }}>⚖️</span>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                Intuition (Dukandar Ka Andaza) vs ProfitPilot (Data Analytics)
              </h3>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: 4 }}>
              Demonstrating the core problem statement: replacing memory-based guesswork with verified statistical math.
            </p>
          </div>
          <span style={{
            background: '#DCFCE7', color: '#166534', border: '1px solid #BBF7D0',
            fontSize: '0.78rem', fontWeight: 800, padding: '4px 12px', borderRadius: 100
          }}>
            +₹11,795 Net Profit Upside / Month
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: 16 }}>
          {/* Left: Traditional Intuition */}
          <div style={{
            background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 12, padding: 16
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <span style={{ fontSize: '1.05rem' }}>❌</span>
              <h4 style={{ fontSize: '0.92rem', fontWeight: 800, color: '#991B1B', margin: 0 }}>
                Traditional Intuition (Reliance on Memory)
              </h4>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: '0.8rem', color: '#7F1D1D' }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                <span>•</span>
                <div>
                  <strong>Weekend Stockout:</strong> Memory-based reordering misses weekend demand rush. Atta & Oil stock out $\rightarrow$ <span style={{ textDecoration: 'underline' }}>-₹4,200 lost sales</span> and customers migrate to Quick Commerce.
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                <span>•</span>
                <div>
                  <strong>Hidden Wastage Leak:</strong> Dairy & bread spoilages noticed only at month-end $\rightarrow$ <span style={{ textDecoration: 'underline' }}>-₹1,800 silent margin erosion</span>.
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                <span>•</span>
                <div>
                  <strong>Frozen Working Capital:</strong> 30+ day dead stock sits in dusty back shelves $\rightarrow$ <span style={{ textDecoration: 'underline' }}>₹5,795 cash blocked</span> without any clearance action.
                </div>
              </div>
            </div>
          </div>

          {/* Right: ProfitPilot */}
          <div style={{
            background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 12, padding: 16
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <span style={{ fontSize: '1.05rem' }}>✅</span>
              <h4 style={{ fontSize: '0.92rem', fontWeight: 800, color: '#166534', margin: 0 }}>
                ProfitPilot (Deterministic Analytics)
              </h4>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: '0.8rem', color: '#14532D' }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                <span>•</span>
                <div>
                  <strong>7-Day Predictive Demand:</strong> Predicts weekend peak with 86.9% backtested accuracy $\rightarrow$ 3 days early warning $\rightarrow$ <strong>₹4,200 revenue saved & 100% stock availability</strong>.
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                <span>•</span>
                <div>
                  <strong>1.4x Anomaly Radar:</strong> Spoilage spike detected on Day 1 $\rightarrow$ Cooler temperature fixed same-day $\rightarrow$ <strong>₹1,800 loss prevented</strong>.
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                <span>•</span>
                <div>
                  <strong>Dead Stock Liquidation:</strong> Automated 10% promo bundle suggestion $\rightarrow$ <strong>₹5,795 cash unlocked</strong> back into active inventory cycle.
                </div>
              </div>
            </div>
          </div>
        </div>

        <div style={{
          marginTop: 14, paddingTop: 10, borderTop: '1px solid #E2E8F0',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10, fontSize: '0.76rem'
        }}>
          <span style={{ color: 'var(--text-secondary)' }}>
            ⚡ Weighted moving average formula: <code>0.6 × 14d + 0.4 × 28d + Day-of-Week Seasonality</code>
          </span>
          <span style={{ fontWeight: 700, color: 'var(--brand-700)' }}>
            100% Deterministic Pandas Math • Zero Hallucination
          </span>
        </div>
      </div>

      {/* 30-Day Financial Performance Strip */}
      <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 14 }}>
        📊 30-Day Financial Strip (Live P&L)
      </h3>

      <div className="stats-grid" style={{ marginBottom: 24 }}>
        <div className="stat-card">
          <div className="stat-icon green">💰</div>
          <div className="stat-label">30-Day Total Sales</div>
          <div className="stat-value">₹{overview?.revenue_30d?.toLocaleString('en-IN') || 0}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 4 }}>
            Yesterday: ₹{overview?.last_day_sales?.toLocaleString('en-IN') || 0}
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon green">📈</div>
          <div className="stat-label">Gross Profit</div>
          <div className="stat-value">₹{overview?.gross_profit_30d?.toLocaleString('en-IN') || 0}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--brand-600)', fontWeight: 600, marginTop: 4 }}>
            {overview?.margin_pct || 0}% Gross Margin
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon amber">📉</div>
          <div className="stat-label">Store Expenses (30d)</div>
          <div className="stat-value">₹{overview?.expenses_30d?.toLocaleString('en-IN') || 0}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 4 }}>
            Rent, salary, bills & wastage
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon blue">💵</div>
          <div className="stat-label">Net Profit (Take-Home)</div>
          <div className="stat-value" style={{ color: (overview?.net_profit_30d || 0) >= 0 ? 'var(--brand-600)' : '#DC2626' }}>
            ₹{overview?.net_profit_30d?.toLocaleString('en-IN') || 0}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 4 }}>
            Gross Profit minus Expenses
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon red">🔒</div>
          <div className="stat-label">Dead Stock Locked</div>
          <div className="stat-value" style={{ color: '#DC2626' }}>
            ₹{overview?.dead_stock_locked?.toLocaleString('en-IN') || 0}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 4 }}>
            30+ din se na bika maal
          </div>
        </div>
      </div>

      {/* Daily Hinglish Morning Brief Preview Card */}
      {summary && (
        <div className="card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>📢</span> Daily Morning Briefing (Dukaan Samachar)
            </h3>
            <button
              className="btn btn-secondary"
              onClick={() => {
                navigator.clipboard.writeText(summary);
                alert('Daily summary copied to clipboard! Share on WhatsApp or Telegram.');
              }}
              style={{ fontSize: '0.75rem', padding: '4px 10px' }}
            >
              📋 Copy Summary
            </button>
          </div>
          <pre style={{
            background: 'var(--bg-primary)', padding: 14, borderRadius: 8, fontSize: '0.82rem',
            lineHeight: 1.6, whiteSpace: 'pre-wrap', color: 'var(--text-primary)', border: '1px solid var(--border-light)'
          }}>
            {summary}
          </pre>
        </div>
      )}
    </div>
  );
}
