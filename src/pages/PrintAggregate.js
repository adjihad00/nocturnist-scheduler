import { useMemo, useEffect } from 'react';

const LS_KEY = 'nocturnist_opinions';

const SUPPORT_LABELS = { '5': 'Strongly support', '4': 'Somewhat support', '3': 'Neutral', '2': 'Somewhat oppose', '1': 'Strongly oppose' };
const SAT_LABELS = { '5': 'Very satisfied', '4': 'Mostly satisfied', '3': 'Neutral', '2': 'Mostly dissatisfied', '1': 'Very dissatisfied' };
const RETENTION_LABELS = {
  stay_same: 'No change',
  stay_reluctant: 'Stay dissatisfied',
  reduce: 'Reduce FTE',
  leave_nights: 'Leave nights',
  leave_group: 'Leave group',
};
const PROBLEM_LABELS = {
  no_problem: 'No problem',
  minor: 'Minor tweaks needed',
  moderate: 'Moderate change needed',
  major: 'Major restructuring needed',
};
const Q5_LABELS = {
  none: 'No problems', gaps: 'Coverage gaps', fairness: 'Unfair distribution',
  advance: 'Late notice', aca_wlb: 'ACA disrupting WLB', complexity: 'Too complex', other: 'Other',
  software: 'Bad software',
};
const Q9_LABELS = {
  none: 'Not acceptable', hpr_retain: 'Retain HPRs', shorter_blocks: 'Shorter blocks',
  trade_friendly: 'Flexible trades', vacation_preserve: 'Preserve vacation',
  couple_accommodation: 'Couples accommodation', fte_variation: 'FTE variation',
  trial_period: 'Trial period', compensation: 'Extra compensation',
};
const CONCERN_LABELS = {
  hpr_loss: 'HPR loss', life_plan: 'Life planning', block_trade: 'Block trading',
  vacation: 'Vacation flexibility', wlb: 'Work-life balance', aca: 'ACA/supplemental',
  couples: 'Couples/family', weekend: 'Weekend flexibility',
};
const MODEL_LABELS = {
  current: 'Current System',
  '7on10off': '7-on/10-off Template',
  block: 'Block Template',
  team: 'Team Self-Schedule',
  graduated: 'Graduated Transition',
};
const PRIORITY_LABELS = {
  flexibility: 'Flexibility',
  predictability: 'Predictability',
  fairness: 'Fairness',
  coverage: 'Coverage',
  autonomy: 'Autonomy',
};

function loadResponses() {
  try { return JSON.parse(localStorage.getItem(LS_KEY)) || []; }
  catch { return []; }
}

function countField(responses, getter) {
  const counts = {};
  responses.forEach(r => {
    const v = getter(r);
    if (v !== undefined && v !== '' && v !== null) counts[v] = (counts[v] || 0) + 1;
  });
  return counts;
}

function countArrayField(responses, getter) {
  const counts = {};
  responses.forEach(r => {
    const arr = getter(r);
    if (Array.isArray(arr)) arr.forEach(v => { counts[v] = (counts[v] || 0) + 1; });
  });
  return counts;
}

function countsToSorted(counts, labels) {
  return Object.entries(counts)
    .map(([key, count]) => ({ name: labels[key] || key, value: count, key }))
    .sort((a, b) => b.value - a.value);
}

function avgRank(responses, getter, items, labels) {
  const sums = {};
  const counts = {};
  items.forEach(k => { sums[k] = 0; counts[k] = 0; });
  responses.forEach(r => {
    const ranks = getter(r);
    if (!ranks) return;
    Object.entries(ranks).forEach(([k, v]) => {
      const n = parseInt(v);
      if (!isNaN(n)) { sums[k] = (sums[k] || 0) + n; counts[k] = (counts[k] || 0) + 1; }
    });
  });
  return items.map(k => ({
    name: labels[k] || k,
    avg: counts[k] ? +(sums[k] / counts[k]).toFixed(2) : null,
  })).filter(d => d.avg !== null).sort((a, b) => a.avg - b.avg);
}

// Simple horizontal bar for print
function PrintBar({ value, max, color = '#2563eb', width = 300 }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ width, height: 18, background: '#e5e7eb', borderRadius: 3, overflow: 'hidden', border: '1px solid #d1d5db' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 3 }} />
      </div>
      <span style={{ fontSize: 12, fontWeight: 600, minWidth: 30 }}>{value}</span>
    </div>
  );
}

function PrintBarAvg({ value, max = 5, color = '#2563eb', width = 300 }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ width, height: 18, background: '#e5e7eb', borderRadius: 3, overflow: 'hidden', border: '1px solid #d1d5db' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 3 }} />
      </div>
      <span style={{ fontSize: 12, fontWeight: 600, minWidth: 40 }}>{value}</span>
    </div>
  );
}

function Section({ number, question, description, children }) {
  return (
    <div style={{ marginBottom: 28, pageBreakInside: 'avoid' }}>
      <h2 style={{ fontSize: 16, fontWeight: 700, color: '#111', margin: '0 0 4px 0', borderBottom: '2px solid #2563eb', paddingBottom: 4 }}>
        {number && <span style={{ color: '#2563eb' }}>Q{number}. </span>}{question}
      </h2>
      {description && <p style={{ fontSize: 11, color: '#666', margin: '4px 0 10px 0', fontStyle: 'italic' }}>{description}</p>}
      {children}
    </div>
  );
}

export default function PrintAggregate() {
  const responses = useMemo(() => loadResponses(), []);
  const n = responses.length;

  useEffect(() => {
    document.title = 'Opinion Survey — Aggregate Results';
  }, []);

  // Satisfaction
  const satData = useMemo(() => countsToSorted(countField(responses, r => r.currentSystem?.satisfaction), SAT_LABELS), [responses]);
  const satMax = useMemo(() => Math.max(...satData.map(d => d.value), 1), [satData]);

  // HPR, job satisfaction
  const avgHPR = useMemo(() => {
    const vals = responses.map(r => parseFloat(r.currentSystem?.hprs_used)).filter(v => !isNaN(v));
    return vals.length ? (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1) : '—';
  }, [responses]);
  const avgLPR = useMemo(() => {
    const vals = responses.map(r => parseFloat(r.currentSystem?.lprs_used)).filter(v => !isNaN(v));
    return vals.length ? (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1) : '—';
  }, [responses]);
  const avgJobSat = useMemo(() => {
    const vals = responses.map(r => parseFloat(r.satisfaction)).filter(v => !isNaN(v));
    return vals.length ? (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1) : '—';
  }, [responses]);

  // Current system problems
  const q5Data = useMemo(() => countsToSorted(countArrayField(responses, r => r.currentSystem?.problems), Q5_LABELS), [responses]);
  const q5Max = useMemo(() => Math.max(...q5Data.map(d => d.value), 1), [q5Data]);

  // Vacation usage
  const vacationData = useMemo(() => {
    const VACATION_LABELS = { all: 'All 21 days', most: 'Most (15-20)', some: 'Some (8-14)', few: 'Few (< 8)' };
    return countsToSorted(countField(responses, r => r.currentSystem?.vacation_usage), VACATION_LABELS);
  }, [responses]);
  const vacMax = useMemo(() => Math.max(...vacationData.map(d => d.value), 1), [vacationData]);

  // Template support
  const templateSupportData = useMemo(() => countsToSorted(countField(responses, r => r.templateProposal?.support_level), SUPPORT_LABELS), [responses]);
  const tsMax = useMemo(() => Math.max(...templateSupportData.map(d => d.value), 1), [templateSupportData]);

  // Retention risk
  const retentionData = useMemo(() => countsToSorted(countField(responses, r => r.templateProposal?.if_implemented), RETENTION_LABELS), [responses]);
  const retMax = useMemo(() => Math.max(...retentionData.map(d => d.value), 1), [retentionData]);

  // Concerns
  const concernAvgs = useMemo(() => {
    const keys = Object.keys(CONCERN_LABELS);
    return keys.map(k => {
      const vals = responses.map(r => parseFloat(r.templateProposal?.concerns?.[k])).filter(v => !isNaN(v));
      return { name: CONCERN_LABELS[k], avg: vals.length ? +(vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(2) : 0 };
    }).sort((a, b) => b.avg - a.avg);
  }, [responses]);

  // Acceptable conditions
  const q9Data = useMemo(() => countsToSorted(countArrayField(responses, r => r.templateProposal?.acceptable_if), Q9_LABELS), [responses]);
  const q9Max = useMemo(() => Math.max(...q9Data.map(d => d.value), 1), [q9Data]);

  // Problem perception
  const problemData = useMemo(() => countsToSorted(countField(responses, r => r.templateProposal?.problem_exists), PROBLEM_LABELS), [responses]);
  const probMax = useMemo(() => Math.max(...problemData.map(d => d.value), 1), [problemData]);

  // Alternative model ratings
  const modelRatings = useMemo(() => {
    const models = [
      { key: 'block_template', label: 'Block Template', getter: r => r.alternatives?.block_template?.rating },
      { key: 'team', label: 'Team Self-Schedule', getter: r => r.alternatives?.team_self_schedule?.rating },
      { key: 'graduated', label: 'Graduated Transition', getter: r => r.alternatives?.graduated?.rating },
      { key: 'status_quo', label: 'Enhanced Status Quo', getter: r => r.alternatives?.enhanced_status_quo?.rating },
    ];
    return models.map(m => {
      const vals = responses.map(m.getter).map(Number).filter(v => !isNaN(v));
      return { name: m.label, avg: vals.length ? +(vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(2) : 0 };
    }).sort((a, b) => b.avg - a.avg);
  }, [responses]);

  // Rankings
  const modelRankAvg = useMemo(() => avgRank(responses, r => r.rankings?.model_ranks, Object.keys(MODEL_LABELS), MODEL_LABELS), [responses]);
  const priorityRankAvg = useMemo(() => avgRank(responses, r => r.rankings?.priority_ranks, Object.keys(PRIORITY_LABELS), PRIORITY_LABELS), [responses]);

  if (!n) return <div style={{ padding: 40, fontFamily: 'Arial, sans-serif' }}>No responses loaded. Visit the admin page first to import data.</div>;

  return (
    <div style={{ fontFamily: "'Segoe UI', Arial, sans-serif", color: '#111', maxWidth: 800, margin: '0 auto', padding: '20px 24px', fontSize: 13, lineHeight: 1.5 }}>
      <style>{`
        body { background: #fff !important; margin: 0; }
        @media print {
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .no-print { display: none !important; }
          @page { margin: 0.5in; size: letter; }
        }
      `}</style>

      <div style={{ textAlign: 'center', marginBottom: 24, borderBottom: '3px solid #111', paddingBottom: 12 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, margin: '0 0 4px 0' }}>Nocturnist Opinion Survey — Aggregate Results</h1>
        <p style={{ fontSize: 12, color: '#666', margin: 0 }}>{n} of 20 physicians responded &bull; Generated {new Date().toLocaleDateString()}</p>
      </div>

      <button className="no-print" onClick={() => window.print()} style={{
        padding: '8px 20px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 6,
        fontSize: 13, fontWeight: 600, cursor: 'pointer', marginBottom: 20, display: 'block',
      }}>Print / Save as PDF</button>

      {/* ─── Section 1: Current System Satisfaction ─── */}
      <Section number={1} question="How satisfied are you with the current scheduling system?" description="Scale: 1 (Very dissatisfied) to 5 (Very satisfied)">
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <tbody>
            {satData.map(d => (
              <tr key={d.key}>
                <td style={{ padding: '4px 8px 4px 0', fontSize: 12, width: 160 }}>{d.name}</td>
                <td style={{ padding: '4px 0' }}><PrintBar value={d.value} max={satMax} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>

      {/* ─── Key Stats ─── */}
      <Section question="Key Statistics" description="Average values across all respondents">
        <table style={{ borderCollapse: 'collapse', fontSize: 13 }}>
          <tbody>
            <tr><td style={{ padding: '3px 20px 3px 0', color: '#555' }}>Avg HPRs used/month:</td><td style={{ fontWeight: 700 }}>{avgHPR}</td></tr>
            <tr><td style={{ padding: '3px 20px 3px 0', color: '#555' }}>Avg LPRs used/month:</td><td style={{ fontWeight: 700 }}>{avgLPR}</td></tr>
            <tr><td style={{ padding: '3px 20px 3px 0', color: '#555' }}>Avg job satisfaction:</td><td style={{ fontWeight: 700 }}>{avgJobSat} / 10</td></tr>
          </tbody>
        </table>
      </Section>

      {/* ─── Section 2: Current System Problems ─── */}
      <Section number={2} question="What problems exist with the current scheduling system?" description="Multi-select; respondents could choose multiple options">
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <tbody>
            {q5Data.map(d => (
              <tr key={d.key}>
                <td style={{ padding: '4px 8px 4px 0', fontSize: 12, width: 160 }}>{d.name}</td>
                <td style={{ padding: '4px 0' }}><PrintBar value={d.value} max={q5Max} color="#d97706" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>

      {/* ─── Section 3: Vacation Usage ─── */}
      <Section number={3} question="How much of your 21 vacation days do you typically use?" description="Single select">
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <tbody>
            {vacationData.map(d => (
              <tr key={d.name}>
                <td style={{ padding: '4px 8px 4px 0', fontSize: 12, width: 160 }}>{d.name}</td>
                <td style={{ padding: '4px 0' }}><PrintBar value={d.value} max={vacMax} color="#059669" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>

      {/* ─── Section 4: Template Support ─── */}
      <Section number={4} question="How do you feel about implementing a 7-on/10-off template schedule?" description="Scale: 1 (Strongly oppose) to 5 (Strongly support)">
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <tbody>
            {templateSupportData.map((d, i) => (
              <tr key={d.key}>
                <td style={{ padding: '4px 8px 4px 0', fontSize: 12, width: 160 }}>{d.name}</td>
                <td style={{ padding: '4px 0' }}><PrintBar value={d.value} max={tsMax} color={['#2563eb', '#059669', '#d97706', '#dc2626', '#7c3aed'][i % 5]} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>

      {/* ─── Section 5: Retention Risk ─── */}
      <Section number={5} question="If the 7-on/10-off template were implemented, what would you do?" description="Single select">
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <tbody>
            {retentionData.map(d => (
              <tr key={d.key}>
                <td style={{ padding: '4px 8px 4px 0', fontSize: 12, width: 160 }}>{d.name}</td>
                <td style={{ padding: '4px 0' }}><PrintBar value={d.value} max={retMax} color="#dc2626" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>

      {/* ─── Section 6: Concern Levels ─── */}
      <Section number={6} question="How concerned are you about each of the following aspects of a template schedule?" description="Scale: 1 (Not concerned) to 5 (Extremely concerned). Values shown are group averages.">
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <tbody>
            {concernAvgs.map(d => (
              <tr key={d.name}>
                <td style={{ padding: '4px 8px 4px 0', fontSize: 12, width: 160 }}>{d.name}</td>
                <td style={{ padding: '4px 0' }}><PrintBarAvg value={d.avg} max={5} color="#dc2626" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>

      {/* ─── Section 7: Acceptable Conditions ─── */}
      <Section number={7} question="What would make a template schedule acceptable to you?" description="Multi-select; respondents could choose multiple options">
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <tbody>
            {q9Data.map(d => (
              <tr key={d.key}>
                <td style={{ padding: '4px 8px 4px 0', fontSize: 12, width: 180 }}>{d.name}</td>
                <td style={{ padding: '4px 0' }}><PrintBar value={d.value} max={q9Max} color="#059669" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>

      {/* ─── Section 8: Problem Perception ─── */}
      <Section number={8} question="How significant is the scheduling problem that needs to be solved?" description="Single select">
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <tbody>
            {problemData.map(d => (
              <tr key={d.key}>
                <td style={{ padding: '4px 8px 4px 0', fontSize: 12, width: 180 }}>{d.name}</td>
                <td style={{ padding: '4px 0' }}><PrintBar value={d.value} max={probMax} color="#7c3aed" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>

      {/* ─── Section 9: Alternative Model Ratings ─── */}
      <Section number={9} question="Rate each alternative scheduling model" description="Scale: 1 (Strongly oppose) to 5 (Strongly support). Values shown are group averages.">
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <tbody>
            {modelRatings.map((d, i) => (
              <tr key={d.name}>
                <td style={{ padding: '4px 8px 4px 0', fontSize: 12, width: 180 }}>{d.name}</td>
                <td style={{ padding: '4px 0' }}><PrintBarAvg value={d.avg} max={5} color={['#2563eb', '#059669', '#d97706', '#7c3aed'][i % 4]} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>

      {/* ─── Section 10: Model Rankings ─── */}
      <Section number={10} question="Rank the scheduling models in order of preference" description="Average rank across respondents. Lower = more preferred (1 = first choice).">
        <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #d1d5db' }}>
          <thead>
            <tr style={{ background: '#f3f4f6' }}>
              <th style={{ padding: '6px 12px', textAlign: 'left', fontSize: 11, fontWeight: 700, borderBottom: '2px solid #d1d5db' }}>Rank</th>
              <th style={{ padding: '6px 12px', textAlign: 'left', fontSize: 11, fontWeight: 700, borderBottom: '2px solid #d1d5db' }}>Model</th>
              <th style={{ padding: '6px 12px', textAlign: 'right', fontSize: 11, fontWeight: 700, borderBottom: '2px solid #d1d5db' }}>Avg Rank</th>
            </tr>
          </thead>
          <tbody>
            {modelRankAvg.map((d, i) => (
              <tr key={d.name} style={{ background: i % 2 ? '#f9fafb' : '#fff' }}>
                <td style={{ padding: '5px 12px', fontSize: 12, fontWeight: 700, color: '#2563eb' }}>#{i + 1}</td>
                <td style={{ padding: '5px 12px', fontSize: 12 }}>{d.name}</td>
                <td style={{ padding: '5px 12px', fontSize: 12, textAlign: 'right', fontWeight: 600 }}>{d.avg}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>

      {/* ─── Section 11: Priority Rankings ─── */}
      <Section number={11} question="Rank these scheduling priorities in order of importance to you" description="Average rank across respondents. Lower = higher priority (1 = most important).">
        <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #d1d5db' }}>
          <thead>
            <tr style={{ background: '#f3f4f6' }}>
              <th style={{ padding: '6px 12px', textAlign: 'left', fontSize: 11, fontWeight: 700, borderBottom: '2px solid #d1d5db' }}>Rank</th>
              <th style={{ padding: '6px 12px', textAlign: 'left', fontSize: 11, fontWeight: 700, borderBottom: '2px solid #d1d5db' }}>Priority</th>
              <th style={{ padding: '6px 12px', textAlign: 'right', fontSize: 11, fontWeight: 700, borderBottom: '2px solid #d1d5db' }}>Avg Rank</th>
            </tr>
          </thead>
          <tbody>
            {priorityRankAvg.map((d, i) => (
              <tr key={d.name} style={{ background: i % 2 ? '#f9fafb' : '#fff' }}>
                <td style={{ padding: '5px 12px', fontSize: 12, fontWeight: 700, color: '#2563eb' }}>#{i + 1}</td>
                <td style={{ padding: '5px 12px', fontSize: 12 }}>{d.name}</td>
                <td style={{ padding: '5px 12px', fontSize: 12, textAlign: 'right', fontWeight: 600 }}>{d.avg}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>

      {/* ─── Section 12: Job Satisfaction ─── */}
      <Section number={12} question="Overall, how satisfied are you with your job as a nocturnist?" description="Scale: 1 to 10">
        <div style={{ fontSize: 20, fontWeight: 800, color: '#2563eb' }}>{avgJobSat} <span style={{ fontSize: 13, color: '#666', fontWeight: 400 }}>/ 10 average</span></div>
      </Section>

      <div style={{ marginTop: 30, paddingTop: 10, borderTop: '1px solid #d1d5db', fontSize: 10, color: '#999', textAlign: 'center' }}>
        Nocturnist Scheduling — Opinion Survey Aggregate Report &bull; {n} respondents &bull; {new Date().toLocaleDateString()}
      </div>
    </div>
  );
}
