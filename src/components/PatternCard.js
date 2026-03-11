import calc from '../utils/calc';
import CycleViz from './CycleViz';

export default function PatternCard({ pattern, isSelected, onClick }) {
  const c = calc(pattern);
  const isViable = c.surplus >= 0;
  return (
    <button onClick={onClick} style={{
      background: isSelected
        ? 'linear-gradient(135deg, #0f2744, #132e52)'
        : 'linear-gradient(135deg, #12121e, #1a1a2e)',
      border: isSelected ? '2px solid #3ba4e0' : '2px solid #2a2a40',
      borderRadius: 12, padding: 16, textAlign: 'left', cursor: 'pointer',
      transition: 'all 0.25s ease', width: '100%',
      boxShadow: isSelected ? '0 0 20px #3ba4e022' : 'none',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 18, fontWeight: 700, color: '#e0e8f0', letterSpacing: '-0.3px' }}>
          {pattern.label}
        </span>
        <span style={{
          fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20,
          background: c.delta === 0 ? '#12b88622' : Math.abs(c.delta) <= 4 ? '#fbbf2422' : '#ef444422',
          color: c.delta === 0 ? '#12b886' : Math.abs(c.delta) <= 4 ? '#fbbf24' : '#ef4444',
        }}>
          {c.nightsYear} nights/yr ({c.delta >= 0 ? '+' : ''}{c.delta})
        </span>
      </div>
      <div style={{ display: 'flex', gap: 20, marginTop: 10, fontSize: 12, color: '#8888aa' }}>
        <span>{c.cycle}-day cycle</span>
        <span>{c.mdsPerNight.toFixed(1)} MDs/night</span>
        <span style={{ color: isViable ? '#12b886' : '#ef4444', fontWeight: 600 }}>
          {isViable ? `+${c.surplus.toFixed(1)} surplus` : `${c.surplus.toFixed(1)} deficit`}
        </span>
      </div>
      <CycleViz pattern={pattern} />
    </button>
  );
}
