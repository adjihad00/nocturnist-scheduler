import { useState, useMemo } from 'react';
import { Link } from 'react-router';
import { PATTERNS, TOTAL_MDS, TOTAL_NEED, TARGET_NIGHTS, DAYS_YEAR } from './data/constants';
import calc from './utils/calc';
import PatternCard from './components/PatternCard';
import DetailPanel from './components/DetailPanel';
import ComparisonTable from './components/ComparisonTable';

export default function App() {
  const [selected, setSelected] = useState('6on8off');
  const pattern = PATTERNS.find((p) => p.id === selected);

  const summary = useMemo(() => PATTERNS.map((p) => ({ ...p, ...calc(p) })), []);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #0a0a14 0%, #0e0e1a 50%, #12121e 100%)',
      color: '#e0e0f0',
      fontFamily: "'SF Pro Display', -apple-system, 'Segoe UI', sans-serif",
      padding: '24px 20px',
    }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: 8 }}>
          <span style={{
            fontSize: 10, fontWeight: 700, letterSpacing: 2.5, textTransform: 'uppercase',
            color: '#3ba4e0', display: 'block', marginBottom: 6,
          }}>NOCTURNIST SCHEDULING</span>
          <h1 style={{
            fontSize: 28, fontWeight: 800, color: '#f0f4fa',
            margin: 0, letterSpacing: '-0.5px', lineHeight: 1.15,
          }}>Schedule Pattern Explorer</h1>
          <p style={{ fontSize: 13, color: '#6666aa', marginTop: 4, lineHeight: 1.4 }}>
            19 physicians &middot; 7 hospitals &middot; 12 nightly slots &middot; 156 target nights/year
          </p>
        </div>

        {/* Summary Bar */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12,
          margin: '20px 0',
        }}>
          {[
            { label: 'Nocturnist-Nights/Yr', value: (TOTAL_MDS * TARGET_NIGHTS).toLocaleString() },
            { label: 'Slots Needed/Yr', value: (TOTAL_NEED * DAYS_YEAR).toLocaleString() },
            { label: 'Max Coverage', value: `${((TOTAL_MDS * TARGET_NIGHTS) / (TOTAL_NEED * DAYS_YEAR) * 100).toFixed(1)}%` },
            { label: 'Gap (Other Staff)', value: `${(100 - (TOTAL_MDS * TARGET_NIGHTS) / (TOTAL_NEED * DAYS_YEAR) * 100).toFixed(1)}%` },
          ].map((item, i) => (
            <div key={i} style={{
              background: '#14142a', border: '1px solid #2a2a40', borderRadius: 10,
              padding: '12px 14px', textAlign: 'center',
            }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#f0f4fa' }}>{item.value}</div>
              <div style={{ fontSize: 10, color: '#6666aa', marginTop: 2, letterSpacing: 0.5, textTransform: 'uppercase' }}>{item.label}</div>
            </div>
          ))}
        </div>

        {/* Main Layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          {/* Left: Pattern Selection */}
          <div>
            <h2 style={{ fontSize: 14, fontWeight: 700, color: '#8888aa', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 12 }}>
              Select Pattern
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {PATTERNS.map((p) => (
                <PatternCard key={p.id} pattern={p} isSelected={selected === p.id} onClick={() => setSelected(p.id)} />
              ))}
            </div>
          </div>

          {/* Right: Detail Panel */}
          <DetailPanel pattern={pattern} />
        </div>

        {/* Comparison Table */}
        <ComparisonTable patterns={summary} selected={selected} onSelect={setSelected} />

        <div style={{ textAlign: 'center', marginTop: 24, fontSize: 11, color: '#444466' }}>
          Nocturnist Schedule Analysis &middot; v1.0 &middot; Phase 1: Pattern Exploration
          <span style={{ margin: '0 8px' }}>&middot;</span>
          <Link to="/admin/import" style={{ color: '#3ba4e0', textDecoration: 'none' }}>Survey Import</Link>
          <span style={{ margin: '0 8px' }}>&middot;</span>
          <Link to="/admin/preferences" style={{ color: '#3ba4e0', textDecoration: 'none' }}>Preference Import</Link>
        </div>
      </div>
    </div>
  );
}
