import { useState, useEffect } from 'react';
import { getBrainFinance, getBrainExpenses } from '../services/api';
import { BrainFinance, BrainExpenseInsight } from '../types';

export default function Money() {
  const [finance, setFinance] = useState<BrainFinance | null>(null);
  const [expenses, setExpenses] = useState<BrainExpenseInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredWeek, setHoveredWeek] = useState<number | null>(null);

  useEffect(() => {
    loadFinance();
  }, []);

  const loadFinance = async () => {
    setLoading(true);
    try {
      const [fin, exp] = await Promise.all([getBrainFinance(), getBrainExpenses()]);
      setFinance(fin);
      setExpenses(exp);
    } catch (err) {
      console.error('Failed to load financial data:', err);
    } finally {
      setLoading(false);
    }
  };

  const anomalies = expenses.filter((e) => e.anomaly);
  const weekly = finance?.weekly || [];
  const categories = finance?.expense_by_category_30d || {};

  const totalExpense30d = Object.values(categories).reduce((a, b) => a + b, 0);

  // Chart scaling calculations
  const maxRev = Math.max(...weekly.map((w) => Math.max(w.revenue, w.gross_profit, w.expenses)), 10000);
  const chartHeight = 220;

  return (
    <div className="page-content">
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
          💰 Money & Expenses Brain
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginTop: 4 }}>
          8-hafte ka revenue, profit, kharcha trends aur automated anomaly detection.
        </p>
      </div>

      {/* Prominent Expense Anomaly Banner */}
      {anomalies.length > 0 ? (
        <div style={{
          background: '#FEF2F2', border: '2px solid #FCA5A5', borderRadius: 12, padding: 18, marginBottom: 24,
          display: 'flex', alignItems: 'flex-start', gap: 14, boxShadow: 'var(--shadow-sm)'
        }}>
          <span style={{ fontSize: '1.8rem', lineHeight: 1 }}>🚨</span>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#991B1B', margin: 0 }}>
                Expense Anomaly Alert Detected!
              </h3>
              <span style={{ background: '#DC2626', color: '#fff', fontSize: '0.72rem', fontWeight: 700, padding: '2px 8px', borderRadius: 6 }}>
                ATTENTION REQUIRED
              </span>
            </div>

            {anomalies.map((a, i) => (
              <p key={i} style={{ color: '#7F1D1D', fontSize: '0.9rem', margin: '6px 0 0', lineHeight: 1.5 }}>
                • <strong>{a.category.toUpperCase()} kharcha {a.ratio}x guna badha:</strong> Is hafte ₹{a.last_7d.toLocaleString('en-IN')} kharcha darj hua,
                jabki pichle 4 hafton ka normal average sirf ₹{a.normal_weekly.toLocaleString('en-IN')}/week tha.
                Dahi, bread aur short-expiry stock ki fizool kharchi ya damage check karein.
              </p>
            ))}
          </div>
        </div>
      ) : (
        <div style={{
          background: 'var(--brand-50)', border: '1px solid var(--brand-200)', borderRadius: 12, padding: 14, marginBottom: 24,
          display: 'flex', alignItems: 'center', gap: 12
        }}>
          <span>✅</span>
          <span style={{ fontSize: '0.88rem', color: 'var(--brand-800)', fontWeight: 600 }}>
            Saare kharche 4-hafte ke normal baseline ke andar chal rahe hain. Koi anomaly nahi mili.
          </span>
        </div>
      )}

      {/* 8-Week Financial Trend Chart */}
      <div className="card" style={{ padding: 24, marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              8-Week Financial Flow (Revenue vs Profit vs Expense)
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Har hafte ka bikri, munafa aur kharch comparison
            </p>
          </div>

          <div style={{ display: 'flex', gap: 16, fontSize: '0.78rem', fontWeight: 600 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 12, height: 12, background: 'var(--brand-500)', borderRadius: 2 }} />
              <span>Revenue</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 12, height: 12, background: '#3B82F6', borderRadius: 2 }} />
              <span>Gross Profit</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 12, height: 12, background: '#EF4444', borderRadius: 2 }} />
              <span>Expenses</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 12, height: 12, background: '#10B981', borderRadius: 2 }} />
              <span>Net Profit</span>
            </div>
          </div>
        </div>

        {/* SVG Multi-Bar Chart */}
        <div style={{ width: '100%', overflowX: 'auto' }}>
          <div style={{ minWidth: 640 }}>
            <svg width="100%" height={chartHeight + 40} viewBox={`0 0 640 ${chartHeight + 40}`}>
              {/* Background Grid Lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((p, idx) => {
                const y = chartHeight * (1 - p);
                return (
                  <g key={idx}>
                    <line x1="40" y1={y} x2="630" y2={y} stroke="#E7E5E4" strokeDasharray="3 3" />
                    <text x="35" y={y + 4} fontSize="10" fill="#A8A29E" textAnchor="end">
                      ₹{Math.round((maxRev * p) / 1000)}k
                    </text>
                  </g>
                );
              })}

              {/* Weekly Bars */}
              {weekly.map((w, i) => {
                const colWidth = 60;
                const gap = 14;
                const x0 = 50 + i * (colWidth + gap);

                const revH = (w.revenue / maxRev) * chartHeight;
                const gpH = (w.gross_profit / maxRev) * chartHeight;
                const expH = (w.expenses / maxRev) * chartHeight;
                const netH = (Math.max(0, w.net) / maxRev) * chartHeight;

                const isHovered = hoveredWeek === i;

                return (
                  <g
                    key={i}
                    onMouseEnter={() => setHoveredWeek(i)}
                    onMouseLeave={() => setHoveredWeek(null)}
                    style={{ cursor: 'pointer' }}
                  >
                    {/* Hover Highlight Background */}
                    {isHovered && (
                      <rect
                        x={x0 - 4} y="0" width={colWidth + 8} height={chartHeight}
                        fill="rgba(0,0,0,0.03)" rx="4"
                      />
                    )}

                    {/* Bars: Rev, GP, Exp, Net */}
                    <rect x={x0} y={chartHeight - revH} width="12" height={revH} fill="var(--brand-500)" rx="2" />
                    <rect x={x0 + 14} y={chartHeight - gpH} width="12" height={gpH} fill="#3B82F6" rx="2" />
                    <rect x={x0 + 28} y={chartHeight - expH} width="12" height={expH} fill="#EF4444" rx="2" />
                    <rect x={x0 + 42} y={chartHeight - netH} width="12" height={netH} fill="#10B981" rx="2" />

                    {/* Date label */}
                    <text x={x0 + colWidth / 2} y={chartHeight + 20} fontSize="10" fill="#78716C" textAnchor="middle">
                      {w.week_ending.slice(5)}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Hover Tooltip Box */}
            {hoveredWeek !== null && weekly[hoveredWeek] && (
              <div style={{
                background: '#1C1917', color: '#fff', padding: '10px 14px', borderRadius: 8,
                fontSize: '0.8rem', display: 'flex', gap: 16, marginTop: 10
              }}>
                <div><strong>Week Ending:</strong> {weekly[hoveredWeek].week_ending}</div>
                <div><strong>Revenue:</strong> ₹{weekly[hoveredWeek].revenue.toLocaleString('en-IN')}</div>
                <div><strong>Gross Profit:</strong> ₹{weekly[hoveredWeek].gross_profit.toLocaleString('en-IN')}</div>
                <div><strong>Expenses:</strong> ₹{weekly[hoveredWeek].expenses.toLocaleString('en-IN')}</div>
                <div style={{ color: '#34D399' }}><strong>Net Profit:</strong> ₹{weekly[hoveredWeek].net.toLocaleString('en-IN')}</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Expense Categories Breakdown & Anomaly Table */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        
        {/* Category Breakdown Card */}
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
            📊 30-Day Expense Distribution
          </h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 16 }}>
            Total 30-Day Expenses: ₹{totalExpense30d.toLocaleString('en-IN')}
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {Object.entries(categories).map(([cat, amt]) => {
              const pct = totalExpense30d > 0 ? Math.round((amt / totalExpense30d) * 100) : 0;
              const isFixed = ['rent', 'salary', 'electricity'].includes(cat.toLowerCase());

              return (
                <div key={cat}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: 4 }}>
                    <span style={{ textTransform: 'capitalize', fontWeight: 600 }}>
                      {cat} {isFixed && <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>(Fixed)</span>}
                    </span>
                    <span style={{ fontWeight: 700 }}>
                      ₹{amt.toLocaleString('en-IN')} <span style={{ color: 'var(--text-tertiary)', fontWeight: 500 }}>({pct}%)</span>
                    </span>
                  </div>
                  <div style={{ height: 8, background: 'var(--bg-tertiary)', borderRadius: 4, overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${pct}%`, height: '100%',
                        background: cat === 'wastage' ? '#EF4444' : isFixed ? 'var(--brand-600)' : '#3B82F6',
                        borderRadius: 4
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Expense Anomaly Detail Table */}
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
            🔍 Category Anomaly Scanner (vs 4-Wk Baseline)
          </h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 16 }}>
            Baseline se 1.4x+ badhe kharche highlight hote hain
          </p>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-light)', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '8px 10px' }}>Category</th>
                  <th style={{ padding: '8px 10px' }}>Last 7 Days</th>
                  <th style={{ padding: '8px 10px' }}>Normal / Wk</th>
                  <th style={{ padding: '8px 10px' }}>Ratio</th>
                  <th style={{ padding: '8px 10px', textAlign: 'right' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((e, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <td style={{ padding: '10px 10px', fontWeight: 600, textTransform: 'capitalize' }}>
                      {e.category}
                    </td>
                    <td style={{ padding: '10px 10px' }}>
                      ₹{e.last_7d.toLocaleString('en-IN')}
                    </td>
                    <td style={{ padding: '10px 10px', color: 'var(--text-secondary)' }}>
                      ₹{e.normal_weekly.toLocaleString('en-IN')}
                    </td>
                    <td style={{ padding: '10px 10px', fontWeight: 600 }}>
                      {e.ratio ? `${e.ratio}x` : '—'}
                    </td>
                    <td style={{ padding: '10px 10px', textAlign: 'right' }}>
                      <span style={{
                        fontSize: '0.72rem', fontWeight: 700, padding: '2px 8px', borderRadius: 6,
                        background: e.anomaly ? '#FEE2E2' : 'var(--brand-50)',
                        color: e.anomaly ? '#DC2626' : 'var(--brand-700)'
                      }}>
                        {e.anomaly ? '⚠️ Anomaly' : 'Normal'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
