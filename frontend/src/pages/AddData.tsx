import { useState } from 'react';
import { submitQuickEntry, uploadBrainCSV, resetBrainSeed } from '../services/api';

const SAMPLE_PRODUCTS = `name,category,unit,cp,sp,stock
Aashirvaad Atta 5kg,Staples,pack,218,245,18
Fortune Soya Oil 1L,Staples,pouch,128,140,60
Tata Salt 1kg,Staples,pack,24,28,50
Sugar 1kg,Staples,kg,43,44,40
Maggi 70g,Snacks,pack,12.5,14,120
Amul Butter 100g,Dairy,pack,55,60,12`;

const SAMPLE_SALES = `date,product,qty
2026-10-28,Aashirvaad Atta 5kg,8
2026-10-28,Maggi 70g,22
2026-10-28,Amul Butter 100g,6
2026-10-27,Sugar 1kg,14
2026-10-27,Fortune Soya Oil 1L,5`;

const SAMPLE_EXPENSES = `date,category,amount,note
2026-10-28,wastage,350,Dahi and bread spoiled
2026-10-27,transport,400,Auto tempo freight
2026-10-25,electricity,2200,Store power bill
2026-10-20,misc,150,Cleaning items and tea`;

export default function AddData() {
  // Quick Entry State
  const [quickText, setQuickText] = useState('');
  const [quickResult, setQuickResult] = useState<{ ok: boolean; message: string } | null>(null);
  const [quickLoading, setQuickLoading] = useState(false);

  // CSV Upload State
  const [uploadKind, setUploadKind] = useState<'products' | 'sales' | 'expenses'>('products');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);

  // Reset State
  const [resetLoading, setResetLoading] = useState(false);
  const [resetStatus, setResetStatus] = useState<string | null>(null);

  const handleQuickSubmit = async (textToRun?: string) => {
    const text = textToRun || quickText;
    if (!text.trim() || quickLoading) return;
    setQuickLoading(true);
    setQuickResult(null);
    try {
      const res = await submitQuickEntry(text);
      setQuickResult(res);
      if (res.ok) setQuickText('');
    } catch (err: any) {
      setQuickResult({ ok: false, message: 'Failed: ' + err.message });
    } finally {
      setQuickLoading(false);
    }
  };

  const handleUploadCSV = async () => {
    if (!selectedFile || uploadLoading) return;
    setUploadLoading(true);
    setUploadStatus(null);
    try {
      const res = await uploadBrainCSV(uploadKind, selectedFile);
      setUploadStatus(`✅ Successfully imported ${res.inserted || 0} rows into ${uploadKind}!`);
      setSelectedFile(null);
    } catch (err: any) {
      setUploadStatus(`❌ Upload failed: ${err.message}`);
    } finally {
      setUploadLoading(false);
    }
  };

  const downloadSample = (filename: string, content: string) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleReset = async () => {
    if (!window.confirm('Restore complete 60-day Kirana simulation dataset? This will reset all demo stories.')) return;
    setResetLoading(true);
    setResetStatus(null);
    try {
      const res: any = await resetBrainSeed();
      setResetStatus(`✅ Seed data restored! Loaded ${res.products} products, ${res.sales_rows} sales and ${res.expense_rows} expense entries.`);
    } catch (err: any) {
      setResetStatus(`❌ Reset error: ${err.message}`);
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="page-content">
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
          ➕ Add Data & Sync Store
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginTop: 4 }}>
          Rozmarra ki entries Hinglish me likhein, CSV bulk data upload karein, ya 60-din ka simulated dataset load karein.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
        
        {/* Module 1: Hinglish Quick Entry */}
        <div className="card" style={{ padding: 24, display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <span style={{ fontSize: '1.4rem' }}>⚡</span>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Hinglish Quick Entry
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                Boliye ya likhein — automatic sales, restock ya expense detect hota hai
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
            <input
              type="text"
              placeholder="e.g. '2 atta becha', '50 maggi aaya', 'bijli bill 1800 diya'..."
              value={quickText}
              onChange={(e) => setQuickText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleQuickSubmit();
              }}
              style={{
                flex: 1, padding: '12px 14px', borderRadius: 8,
                border: '1px solid var(--border-medium)', background: 'var(--bg-primary)', fontSize: '0.9rem'
              }}
            />
            <button
              className="btn btn-primary"
              onClick={() => handleQuickSubmit()}
              disabled={!quickText.trim() || quickLoading}
              style={{ padding: '12px 20px', borderRadius: 8, fontSize: '0.88rem', fontWeight: 600 }}
            >
              {quickLoading ? 'Saving...' : 'Add ➔'}
            </button>
          </div>

          {/* Quick Click Samples */}
          <div style={{ marginBottom: 14 }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: 600, display: 'block', marginBottom: 6 }}>
              CLICK TO TEST EXAMPLE:
            </span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {[
                '2 atta becha',
                '50 maggi aaya',
                'bijli bill 1800 diya',
                'auto bhada 350',
                'wastage dahi 250',
              ].map((example, i) => (
                <button
                  key={i}
                  className="btn btn-secondary"
                  onClick={() => handleQuickSubmit(example)}
                  disabled={quickLoading}
                  style={{ fontSize: '0.75rem', padding: '4px 10px', borderRadius: 6 }}
                >
                  {example}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Result Feedback Card */}
          {quickResult && (
            <div style={{
              background: quickResult.ok ? 'var(--brand-50)' : '#FEF2F2',
              border: `1px solid ${quickResult.ok ? 'var(--brand-300)' : '#FECACA'}`,
              color: quickResult.ok ? 'var(--brand-800)' : '#DC2626',
              padding: '12px 16px', borderRadius: 8, fontSize: '0.88rem', fontWeight: 600, marginTop: 'auto'
            }}>
              {quickResult.message}
            </div>
          )}
        </div>

        {/* Module 2: CSV Upload */}
        <div className="card" style={{ padding: 24, display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <span style={{ fontSize: '1.4rem' }}>📁</span>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                CSV File Import
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                Apna khud ka products, sales ya expenses data import karein
              </p>
            </div>
          </div>

          {/* Tabs for Kind */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            {(['products', 'sales', 'expenses'] as const).map((k) => (
              <button
                key={k}
                className={`btn ${uploadKind === k ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => {
                  setUploadKind(k);
                  setSelectedFile(null);
                  setUploadStatus(null);
                }}
                style={{ fontSize: '0.78rem', padding: '5px 14px', textTransform: 'capitalize' }}
              >
                {k}
              </button>
            ))}
          </div>

          <div style={{
            border: '2px dashed var(--border-medium)', borderRadius: 10, padding: 18,
            textAlign: 'center', background: 'var(--bg-primary)', marginBottom: 14
          }}>
            <input
              type="file"
              accept=".csv"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              style={{ display: 'none' }}
              id="csv-file-input"
            />
            <label htmlFor="csv-file-input" style={{ cursor: 'pointer', display: 'block' }}>
              <div style={{ fontSize: '1.8rem', marginBottom: 4 }}>📄</div>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                {selectedFile ? selectedFile.name : `Select ${uploadKind.toUpperCase()} CSV File`}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: 2 }}>
                Click to browse from computer
              </div>
            </label>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
            <button
              className="btn btn-secondary"
              onClick={() => {
                if (uploadKind === 'products') downloadSample('sample_products.csv', SAMPLE_PRODUCTS);
                if (uploadKind === 'sales') downloadSample('sample_sales.csv', SAMPLE_SALES);
                if (uploadKind === 'expenses') downloadSample('sample_expenses.csv', SAMPLE_EXPENSES);
              }}
              style={{ fontSize: '0.75rem', padding: '6px 12px' }}
            >
              📥 Sample {uploadKind}.csv
            </button>

            <button
              className="btn btn-primary"
              onClick={handleUploadCSV}
              disabled={!selectedFile || uploadLoading}
              style={{ fontSize: '0.82rem', padding: '6px 16px' }}
            >
              {uploadLoading ? 'Uploading...' : 'Upload & Process'}
            </button>
          </div>

          {uploadStatus && (
            <div style={{ marginTop: 12, fontSize: '0.82rem', fontWeight: 600 }}>
              {uploadStatus}
            </div>
          )}
        </div>

      </div>

      {/* Module 3: Full 60-Day Kirana Dataset Reset */}
      <div className="card" style={{ padding: 24, borderLeft: '4px solid var(--brand-600)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ maxWidth: 700 }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              🔄 Reset to Simulated 60-Day Kirana Dataset
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: 4, lineHeight: 1.5 }}>
              Agar judges ko live presentation me fresh demo dikhana ho, to ye button daba kar instant 60-din ka realistic data reload karein.
              Isme 4 realistic stories shaamil hain: <strong>Atta/Butter Reorder</strong>, <strong>Corn Flakes 45-day Dead Stock</strong>, <strong>Sugar 2% Margin Leak</strong>, aur <strong>Wastage Spoilage Anomaly</strong>.
            </p>
          </div>

          <button
            className="btn btn-secondary"
            onClick={handleReset}
            disabled={resetLoading}
            style={{ padding: '10px 20px', fontSize: '0.85rem', fontWeight: 700 }}
          >
            {resetLoading ? 'Restoring...' : '🚀 Reload 60-Day Demo Data'}
          </button>
        </div>

        {resetStatus && (
          <div style={{
            background: 'var(--brand-50)', border: '1px solid var(--brand-300)', color: 'var(--brand-800)',
            padding: '10px 14px', borderRadius: 8, fontSize: '0.82rem', fontWeight: 600, marginTop: 14
          }}>
            {resetStatus}
          </div>
        )}
      </div>
    </div>
  );
}
