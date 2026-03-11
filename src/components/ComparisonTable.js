export default function ComparisonTable({ patterns, selected, onSelect }) {
  return (
    <div style={{ marginTop: 24 }}>
      <h2 style={{ fontSize: 14, fontWeight: 700, color: '#8888aa', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 12 }}>
        Side-by-Side Comparison
      </h2>
      <div style={{
        background: '#14142a', border: '1px solid #2a2a40', borderRadius: 12,
        overflow: 'hidden',
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: '#0f2744' }}>
              {['Pattern', 'Cycle', 'Nights/Yr', '\u0394156', 'MDs/Night', 'Coverage', 'Surplus'].map((h) => (
                <th key={h} style={{
                  padding: '10px 14px', textAlign: 'center', color: '#a0b8d8',
                  fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5,
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {patterns.map((p, i) => (
              <tr key={p.id} style={{
                background: selected === p.id ? '#0f274422' : i % 2 ? '#14142a' : '#16162c',
                borderLeft: selected === p.id ? '3px solid #3ba4e0' : '3px solid transparent',
                cursor: 'pointer',
              }} onClick={() => onSelect(p.id)}>
                <td style={{ padding: '10px 14px', fontWeight: 600, color: '#e0e8f0' }}>{p.label}</td>
                <td style={{ padding: '10px 14px', textAlign: 'center', color: '#8888aa' }}>{p.cycle}d</td>
                <td style={{ padding: '10px 14px', textAlign: 'center', color: '#e0e8f0', fontWeight: 700 }}>{p.nightsYear}</td>
                <td style={{
                  padding: '10px 14px', textAlign: 'center', fontWeight: 600,
                  color: p.delta === 0 ? '#12b886' : Math.abs(p.delta) <= 4 ? '#fbbf24' : '#ef4444',
                }}>{p.delta >= 0 ? '+' : ''}{p.delta}</td>
                <td style={{ padding: '10px 14px', textAlign: 'center', color: '#e0e8f0' }}>{p.mdsPerNight.toFixed(1)}</td>
                <td style={{ padding: '10px 14px', textAlign: 'center', color: '#e0e8f0' }}>{(p.coveragePct * 100).toFixed(1)}%</td>
                <td style={{
                  padding: '10px 14px', textAlign: 'center', fontWeight: 600,
                  color: p.surplus >= 0 ? '#12b886' : '#ef4444',
                }}>{p.surplus >= 0 ? '+' : ''}{p.surplus.toFixed(1)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
