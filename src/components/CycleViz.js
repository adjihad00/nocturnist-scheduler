import { buildCycleMap } from '../utils/calc';

export default function CycleViz({ pattern }) {
  const cycleMap = buildCycleMap(pattern);

  const segmentLabel = pattern.segments
    .map(s => `${s.nights}${s.type === 'on' ? 'N' : ' off'}`)
    .join(' → ');

  return (
    <div style={{ display: 'flex', gap: 3, alignItems: 'center', marginTop: 8, flexWrap: 'wrap' }}>
      {cycleMap.map((status, i) => {
        const isOn = status === 'on';
        const isMini = status === 'mini-break';
        return (
          <div key={i} style={{
            width: 28, height: 28, borderRadius: 4,
            background: isOn
              ? 'linear-gradient(135deg, #0f4c75, #1b6ca8)'
              : isMini
                ? '#3d3520'
                : 'linear-gradient(135deg, #2a2a3e, #1a1a2e)',
            border: isOn
              ? '2px solid #3ba4e0'
              : isMini
                ? '2px dashed #7a6a30'
                : '2px solid #333350',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 10, color: isOn ? '#a0d8ff' : isMini ? '#b8a040' : '#555570', fontWeight: 600,
          }}>
            {i + 1}
          </div>
        );
      })}
      <span style={{ marginLeft: 8, fontSize: 12, color: '#8888aa', fontStyle: 'italic' }}>
        {segmentLabel} → repeat
      </span>
    </div>
  );
}
