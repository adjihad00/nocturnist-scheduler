import { TOTAL_NEED } from '../data/constants';

export default function HospitalBar({ hospital, mdsPerNight }) {
  const allocated = (hospital.need / TOTAL_NEED) * mdsPerNight;
  const filled = Math.min(allocated, hospital.need);
  const pct = (filled / hospital.need) * 100;
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
        <span style={{ fontSize: 13, color: '#c8c8e0', fontWeight: 600 }}>{hospital.name}</span>
        <span style={{ fontSize: 12, color: '#8888aa' }}>{allocated.toFixed(1)} / {hospital.need} slots</span>
      </div>
      <div style={{ background: '#1a1a2e', borderRadius: 6, height: 14, overflow: 'hidden', position: 'relative' }}>
        <div style={{
          width: `${pct}%`, height: '100%', borderRadius: 6,
          background: pct >= 90 ? 'linear-gradient(90deg, #0f7b5f, #12b886)'
            : pct >= 60 ? 'linear-gradient(90deg, #c79200, #fbbf24)'
            : 'linear-gradient(90deg, #a03030, #ef4444)',
          transition: 'width 0.5s ease',
        }} />
        <span style={{
          position: 'absolute', right: 6, top: 0, fontSize: 10,
          lineHeight: '14px', color: '#fff', fontWeight: 700,
        }}>{pct.toFixed(0)}%</span>
      </div>
    </div>
  );
}
