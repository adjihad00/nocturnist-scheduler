import { HOSPITALS } from '../data/constants';
import calc from '../utils/calc';
import HospitalBar from './HospitalBar';
import StaggerGrid from './StaggerGrid';

export default function DetailPanel({ pattern }) {
  const c = calc(pattern);
  return (
    <div>
      <h2 style={{ fontSize: 14, fontWeight: 700, color: '#8888aa', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 12 }}>
        {pattern.label} &mdash; Detail
      </h2>

      {/* Stats */}
      <div style={{
        background: '#14142a', border: '1px solid #2a2a40', borderRadius: 12,
        padding: 18, marginBottom: 16,
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {[
            { l: 'Cycle Length', v: `${c.cycle} days` },
            { l: 'Nights/Year', v: c.nightsYear },
            { l: 'On-Duty Fraction', v: `${(c.onFraction * 100).toFixed(1)}%` },
            { l: 'MDs on Duty/Night', v: c.mdsPerNight.toFixed(1) },
            { l: 'Annual Coverage', v: `${(c.coveragePct * 100).toFixed(1)}%` },
            { l: 'Stagger Groups', v: c.staggerGroups },
          ].map((s, i) => (
            <div key={i} style={{ padding: '6px 0' }}>
              <div style={{ fontSize: 10, color: '#6666aa', textTransform: 'uppercase', letterSpacing: 0.5 }}>{s.l}</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#e0e8f0', marginTop: 2 }}>{s.v}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Hospital Breakdown */}
      <div style={{
        background: '#14142a', border: '1px solid #2a2a40', borderRadius: 12,
        padding: 18, marginBottom: 16,
      }}>
        <h3 style={{ fontSize: 13, fontWeight: 700, color: '#c0c0d0', marginBottom: 12 }}>
          Hospital Coverage (Proportional Allocation)
        </h3>
        {HOSPITALS.map((h) => (
          <HospitalBar key={h.name} hospital={h} mdsPerNight={c.mdsPerNight} />
        ))}
      </div>

      {/* Stagger Grid */}
      <div style={{
        background: '#14142a', border: '1px solid #2a2a40', borderRadius: 12,
        padding: 18,
      }}>
        <h3 style={{ fontSize: 13, fontWeight: 700, color: '#c0c0d0', marginBottom: 4 }}>
          Stagger Preview
        </h3>
        <StaggerGrid pattern={pattern} />
      </div>
    </div>
  );
}
