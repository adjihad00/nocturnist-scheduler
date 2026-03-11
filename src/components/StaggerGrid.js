import { TOTAL_MDS } from '../data/constants';
import calc from '../utils/calc';

export default function StaggerGrid({ pattern }) {
  const c = calc(pattern);
  const actualGroups = Math.min(c.staggerGroups, TOTAL_MDS);
  const rows = [];
  const daysToShow = Math.min(c.cycle * 2, 42);

  for (let g = 0; g < Math.min(actualGroups, 8); g++) {
    const offset = g;
    const cells = [];
    for (let d = 0; d < daysToShow; d++) {
      const posInCycle = ((d - offset) % c.cycle + c.cycle) % c.cycle;
      const isOn = posInCycle < pattern.on;
      cells.push(
        <div key={d} style={{
          width: 16, height: 16, borderRadius: 2,
          background: isOn ? '#1b6ca8' : '#1e1e30',
          border: isOn ? '1px solid #3ba4e088' : '1px solid #2a2a40',
          transition: 'all 0.2s',
        }} />,
      );
    }
    rows.push(
      <div key={g} style={{ display: 'flex', gap: 2, alignItems: 'center' }}>
        <span style={{ width: 30, fontSize: 10, color: '#6666aa', textAlign: 'right', marginRight: 4 }}>G{g + 1}</span>
        {cells}
      </div>,
    );
  }

  return (
    <div style={{ marginTop: 12 }}>
      <div style={{ fontSize: 11, color: '#8888aa', marginBottom: 6 }}>
        Stagger visualization &mdash; {actualGroups} groups, showing {daysToShow} days:
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>{rows}</div>
      <div style={{ display: 'flex', gap: 12, marginTop: 6, fontSize: 10, color: '#6666aa' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <div style={{ width: 10, height: 10, background: '#1b6ca8', borderRadius: 2 }} /> On duty
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <div style={{ width: 10, height: 10, background: '#1e1e30', border: '1px solid #2a2a40', borderRadius: 2 }} /> Off
        </span>
      </div>
    </div>
  );
}
