import { useState, useMemo, useCallback } from 'react';
import { Link } from 'react-router';
import { PHYSICIANS, TOTAL_MDS, APPS_SCRIPT_URL } from '../data/constants';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer,
  Cell, PieChart, Pie,
} from 'recharts';

const LS_KEY = 'nocturnist_opinions';

const SUPPORT_LABELS = { '5': 'Strongly support', '4': 'Somewhat support', '3': 'Neutral', '2': 'Somewhat oppose', '1': 'Strongly oppose' };
const SAT_LABELS = { '5': 'Very satisfied', '4': 'Mostly satisfied', '3': 'Neutral', '2': 'Mostly dissatisfied', '1': 'Very dissatisfied' };
const VACATION_LABELS = { all: 'All 21', most: 'Most (15-20)', some: 'Some (8-14)', few: 'Few (< 8)' };
const RETENTION_LABELS = {
  stay_same: 'No change',
  stay_reluctant: 'Stay dissatisfied',
  reduce: 'Reduce FTE',
  leave_nights: 'Leave nights',
  leave_group: 'Leave group',
};
const PROBLEM_LABELS = {
  no_problem: 'No problem',
  minor: 'Minor tweaks',
  moderate: 'Moderate change',
  major: 'Major restructuring',
};
const Q5_LABELS = {
  none: 'No problems', gaps: 'Coverage gaps', fairness: 'Unfair distribution',
  advance: 'Late notice', aca_wlb: 'ACA disrupting WLB', complexity: 'Too complex', other: 'Other',
  software: 'Bad software',
};
const Q9_LABELS = {
  none: 'Not acceptable', hpr_retain: 'Retain HPRs', shorter_blocks: 'Shorter blocks',
  trade_friendly: 'Flexible trades', vacation_preserve: 'Preserve vacation',
  couple_accommodation: 'Couples accomm.', fte_variation: 'FTE variation',
  trial_period: 'Trial period', compensation: 'Extra comp',
};
const Q14_LABELS = {
  none: 'No concerns', complexity: 'Too complex', fairness: 'Unfair teams',
  coverage: 'Low coverage', still_rigid: 'Still rigid', tech: 'Needs new tech',
};
const Q16_LABELS = {
  offramp: 'Off-ramp / vote', gradual: 'Gradual HPR reduction',
  data: 'Data-driven', none: 'Still oppose',
};
const BLOCK_LENGTH_LABELS = { '3': '3 months', '4': '4 months', '6': '6 months', none: 'Oppose' };
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
const CONCERN_LABELS = {
  hpr_loss: 'HPR loss', life_plan: 'Life planning', block_trade: 'Block trading',
  vacation: 'Vacation flex', wlb: 'Work-life balance', aca: 'ACA/supplemental',
  couples: 'Couples/family', weekend: 'Weekend flex',
};

const COLORS = ['#3ba4e0', '#12b886', '#fbbf24', '#ef4444', '#a855f7', '#f472b6', '#06b6d4', '#fb923c', '#84cc16'];
const PIE_COLORS = ['#12b886', '#fbbf24', '#ef4444', '#3ba4e0', '#a855f7'];

function loadResponses() {
  try { return JSON.parse(localStorage.getItem(LS_KEY)) || []; }
  catch { return []; }
}
function saveResponses(arr) { localStorage.setItem(LS_KEY, JSON.stringify(arr)); }

function decodePayload(code) {
  const json = decodeURIComponent(escape(atob(code.trim())));
  const data = JSON.parse(json);
  if (data.v !== 1 || data.type !== 'opinion' || !data.physician) throw new Error('Invalid');
  return data;
}

// ─── Styles ───
const s = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(180deg, #0a0a14 0%, #0e0e1a 50%, #12121e 100%)',
    color: '#e0e0f0',
    fontFamily: "'SF Pro Display', -apple-system, 'Segoe UI', sans-serif",
    padding: '24px 20px',
  },
  wrap: { maxWidth: 1000, margin: '0 auto' },
  card: {
    background: '#14142a', border: '1px solid #2a2a40', borderRadius: 12,
    padding: 20, marginBottom: 20,
  },
  textarea: {
    width: '100%', minHeight: 100, padding: 12, borderRadius: 10,
    border: '1px solid #2a2a40', background: '#0a0a14', color: '#e0e0f0',
    fontFamily: "'SF Mono', Consolas, monospace", fontSize: 13, resize: 'vertical',
  },
  btn: {
    padding: '12px 24px', borderRadius: 10, border: 'none',
    fontSize: 14, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s',
  },
  btnPrimary: { background: 'linear-gradient(135deg, #1b6ca8, #3ba4e0)', color: '#fff' },
  btnDanger: { background: '#2a1520', color: '#ef4444', border: '1px solid #3a2030' },
  btnSecondary: { background: '#1a1a2e', color: '#8888aa', border: '1px solid #2a2a40' },
  tag: { fontSize: 10, fontWeight: 700, letterSpacing: 2.5, textTransform: 'uppercase', color: '#3ba4e0', marginBottom: 6 },
  h2: { fontSize: 14, fontWeight: 700, color: '#8888aa', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 12 },
  h3: { fontSize: 13, fontWeight: 700, color: '#c0c0d0', marginBottom: 8 },
  th: {
    padding: '10px 12px', textAlign: 'center', color: '#a0b8d8',
    fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5, background: '#0f2744',
  },
  td: { padding: '10px 12px', textAlign: 'center', fontSize: 13 },
  select: {
    padding: '10px 12px', borderRadius: 8, border: '1px solid #2a2a40',
    background: '#0a0a14', color: '#e0e0f0', fontSize: 14, fontFamily: 'inherit',
  },
};

const tooltipStyle = { background: '#14142a', border: '1px solid #2a2a40', borderRadius: 8 };

// ─── Helper: count occurrences ───
function countField(responses, getter) {
  const counts = {};
  responses.forEach(r => {
    const v = getter(r);
    if (v !== undefined && v !== '' && v !== null) {
      counts[v] = (counts[v] || 0) + 1;
    }
  });
  return counts;
}

function countArrayField(responses, getter) {
  const counts = {};
  responses.forEach(r => {
    const arr = getter(r);
    if (Array.isArray(arr)) {
      arr.forEach(v => { counts[v] = (counts[v] || 0) + 1; });
    }
  });
  return counts;
}

function countsToChartData(counts, labels) {
  return Object.entries(counts)
    .map(([key, count]) => ({ name: labels[key] || key, value: count, key }))
    .sort((a, b) => b.value - a.value);
}

function avgRank(responses, getter, items) {
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
    name: MODEL_LABELS[k] || PRIORITY_LABELS[k] || k,
    avg: counts[k] ? +(sums[k] / counts[k]).toFixed(2) : null,
    key: k,
  })).filter(d => d.avg !== null).sort((a, b) => a.avg - b.avg);
}

// ─── Individual View ───
function IndividualView({ data }) {
  const Section = ({ title, children }) => (
    <div style={{ marginBottom: 16 }}>
      <h3 style={{ fontSize: 13, fontWeight: 700, color: '#c0c0d0', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>{title}</h3>
      {children}
    </div>
  );
  const Row = ({ label, value }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', fontSize: 13, borderBottom: '1px solid #1a1a30' }}>
      <span style={{ color: '#8888aa' }}>{label}</span>
      <span style={{ color: '#e0e8f0', fontWeight: 600, textAlign: 'right', maxWidth: '60%' }}>{value || '—'}</span>
    </div>
  );

  const cs = data.currentSystem || {};
  const tp = data.templateProposal || {};
  const alt = data.alternatives || {};
  const rk = data.rankings || {};

  return (
    <div style={s.card}>
      <div style={{ fontSize: 18, fontWeight: 800, color: '#f0f4fa', marginBottom: 4 }}>{data.physician}</div>
      <div style={{ fontSize: 11, color: '#6666aa', marginBottom: 16 }}>Submitted {new Date(data.timestamp).toLocaleDateString()}</div>

      <Section title="Demographics">
        <Row label="FTE" value={data.demographics?.fte} />
        <Row label="Couple" value={data.demographics?.couple} />
      </Section>

      <Section title="Current System">
        <Row label="Satisfaction" value={SAT_LABELS[cs.satisfaction] || cs.satisfaction} />
        <Row label="HPRs used/month" value={cs.hprs_used} />
        <Row label="LPRs used/month" value={cs.lprs_used} />
        <Row label="Vacation usage" value={VACATION_LABELS[cs.vacation_usage] || cs.vacation_usage} />
        <Row label="Problems" value={cs.problems?.map(p => Q5_LABELS[p] || p).join(', ') || 'None'} />
        {cs.problems_other && <Row label="Other problems" value={cs.problems_other} />}
      </Section>

      <Section title="7-on/10-off Template">
        <Row label="Support level" value={SUPPORT_LABELS[tp.support_level] || tp.support_level} />
        <Row label="If implemented" value={RETENTION_LABELS[tp.if_implemented] || tp.if_implemented} />
        <Row label="Acceptable if" value={tp.acceptable_if?.map(v => Q9_LABELS[v] || v).join(', ') || 'None'} />
        <Row label="Problem exists?" value={PROBLEM_LABELS[tp.problem_exists] || tp.problem_exists} />
        {tp.concerns && Object.entries(tp.concerns).map(([k, v]) => (
          <Row key={k} label={CONCERN_LABELS[k] || k} value={`${v}/5`} />
        ))}
      </Section>

      <Section title="Alternative Models">
        <Row label="Block Template" value={SUPPORT_LABELS[alt.block_template?.rating]} />
        <Row label="Preferred block length" value={BLOCK_LENGTH_LABELS[alt.block_template?.preferred_length] || alt.block_template?.preferred_length} />
        <Row label="Team Self-Schedule" value={SUPPORT_LABELS[alt.team_self_schedule?.rating]} />
        <Row label="Team concerns" value={alt.team_self_schedule?.concerns?.map(v => Q14_LABELS[v] || v).join(', ') || 'None'} />
        <Row label="Graduated Transition" value={SUPPORT_LABELS[alt.graduated?.rating]} />
        <Row label="Most important feature" value={Q16_LABELS[alt.graduated?.most_important] || alt.graduated?.most_important} />
        <Row label="Enhanced Status Quo" value={SUPPORT_LABELS[alt.enhanced_status_quo?.rating]} />
      </Section>

      <Section title="Rankings">
        {rk.model_ranks && Object.entries(rk.model_ranks).map(([k, v]) => (
          <Row key={k} label={MODEL_LABELS[k] || k} value={`#${v}`} />
        ))}
      </Section>

      <Section title="Priorities">
        {rk.priority_ranks && Object.entries(rk.priority_ranks).map(([k, v]) => (
          <Row key={k} label={PRIORITY_LABELS[k] || k} value={`#${v}`} />
        ))}
      </Section>

      <Row label="Job satisfaction" value={data.satisfaction ? `${data.satisfaction}/10` : undefined} />

      {data.open_response && (
        <Section title="Open Response">
          <div style={{ fontSize: 13, color: '#c0c8e0', fontStyle: 'italic', lineHeight: 1.5 }}>
            "{data.open_response}"
          </div>
        </Section>
      )}
    </div>
  );
}

// ─── Main Component ───
export default function AdminOpinion() {
  const [responses, setResponses] = useState(loadResponses);
  const [inputCode, setInputCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [viewPhysician, setViewPhysician] = useState('');
  const [tab, setTab] = useState('aggregate');
  const [fetching, setFetching] = useState(false);

  const addResponse = useCallback(() => {
    setError(''); setSuccess('');
    try {
      const data = decodePayload(inputCode);
      const existing = loadResponses();
      const dup = existing.findIndex(r => r.physician === data.physician);
      if (dup >= 0) {
        if (!window.confirm(`${data.physician} already submitted. Overwrite?`)) return;
        existing[dup] = data;
      } else {
        existing.push(data);
      }
      saveResponses(existing);
      setResponses(existing);
      setInputCode('');
      setSuccess(`${data.physician}'s opinion imported.`);
    } catch {
      setError('Invalid code. Please check and try again.');
    }
  }, [inputCode]);

  const clearAll = useCallback(() => {
    if (window.confirm('Delete all imported opinions? This cannot be undone.')) {
      saveResponses([]);
      setResponses([]);
    }
  }, []);

  const fetchFromSheet = useCallback(async () => {
    setError(''); setSuccess(''); setFetching(true);
    try {
      const res = await fetch(APPS_SCRIPT_URL + '?sheet=opinions');
      const json = await res.json();
      if (json.status !== 'ok') throw new Error(json.message || 'Fetch failed');
      if (!json.rows || !json.rows.length) {
        setSuccess('No rows found in the opinions sheet.');
        setFetching(false);
        return;
      }
      const existing = loadResponses();
      let added = 0, updated = 0;
      json.rows.forEach(row => {
        try {
          const data = decodePayload(row.payload);
          const dup = existing.findIndex(r => r.physician === data.physician);
          if (dup >= 0) {
            const existingTs = new Date(existing[dup].timestamp).getTime();
            const newTs = new Date(data.timestamp).getTime();
            if (newTs > existingTs) { existing[dup] = data; updated++; }
          } else { existing.push(data); added++; }
        } catch { /* skip invalid rows */ }
      });
      saveResponses(existing);
      setResponses([...existing]);
      setSuccess(`Fetched ${json.rows.length} rows from Google Sheet. ${added} new, ${updated} updated.`);
    } catch (err) {
      setError('Fetch failed: ' + err.message);
    }
    setFetching(false);
  }, []);

  const exportJSON = useCallback(() => {
    const blob = new Blob([JSON.stringify(responses, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'opinion_responses.json'; a.click();
    URL.revokeObjectURL(url);
  }, [responses]);

  const exportCSV = useCallback(() => {
    const header = [
      'Physician', 'Timestamp', 'FTE', 'Couple',
      'Current Satisfaction', 'HPRs Used', 'LPRs Used', 'Vacation Usage', 'Current Problems',
      'Template Support', 'If Implemented', 'Problem Exists',
      'Concern: HPR Loss', 'Concern: Life Plan', 'Concern: Block Trade', 'Concern: Vacation',
      'Concern: WLB', 'Concern: ACA', 'Concern: Couples', 'Concern: Weekend',
      'Acceptable If',
      'Block Template Rating', 'Block Length',
      'Team Rating', 'Team Concerns',
      'Graduated Rating', 'Graduated Important',
      'Status Quo Rating',
      'Rank: Current', 'Rank: 7on10off', 'Rank: Block', 'Rank: Team', 'Rank: Graduated',
      'Priority: Flexibility', 'Priority: Predictability', 'Priority: Fairness', 'Priority: Coverage', 'Priority: Autonomy',
      'Job Satisfaction',
      'Open Response',
    ];
    const rows = responses.map(r => {
      const cs = r.currentSystem || {};
      const tp = r.templateProposal || {};
      const alt = r.alternatives || {};
      const rk = r.rankings || {};
      const concerns = tp.concerns || {};
      return [
        r.physician, r.timestamp, r.demographics?.fte, r.demographics?.couple,
        cs.satisfaction, cs.hprs_used, cs.lprs_used, cs.vacation_usage, (cs.problems || []).join('; '),
        tp.support_level, tp.if_implemented, tp.problem_exists,
        concerns.hpr_loss, concerns.life_plan, concerns.block_trade, concerns.vacation,
        concerns.wlb, concerns.aca, concerns.couples, concerns.weekend,
        (tp.acceptable_if || []).join('; '),
        alt.block_template?.rating, alt.block_template?.preferred_length,
        alt.team_self_schedule?.rating, (alt.team_self_schedule?.concerns || []).join('; '),
        alt.graduated?.rating, alt.graduated?.most_important,
        alt.enhanced_status_quo?.rating,
        rk.model_ranks?.current, rk.model_ranks?.['7on10off'], rk.model_ranks?.block, rk.model_ranks?.team, rk.model_ranks?.graduated,
        rk.priority_ranks?.flexibility, rk.priority_ranks?.predictability, rk.priority_ranks?.fairness, rk.priority_ranks?.coverage, rk.priority_ranks?.autonomy,
        r.satisfaction,
        r.open_response,
      ];
    });
    const csv = [header, ...rows].map(r => r.map(c => `"${String(c ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'opinion_responses.csv'; a.click();
    URL.revokeObjectURL(url);
  }, [responses]);

  // ─── Aggregate calculations ───
  const submitted = useMemo(() => responses.map(r => r.physician), [responses]);
  const missing = useMemo(() => PHYSICIANS.filter(p => !submitted.includes(p.name)).map(p => p.name), [submitted]);

  // Current system satisfaction
  const satData = useMemo(() => countsToChartData(countField(responses, r => r.currentSystem?.satisfaction), SAT_LABELS), [responses]);
  const avgHPR = useMemo(() => {
    const vals = responses.map(r => parseFloat(r.currentSystem?.hprs_used)).filter(v => !isNaN(v));
    return vals.length ? (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1) : '—';
  }, [responses]);

  // Template support
  const templateSupportData = useMemo(() => countsToChartData(countField(responses, r => r.templateProposal?.support_level), SUPPORT_LABELS), [responses]);
  const retentionData = useMemo(() => countsToChartData(countField(responses, r => r.templateProposal?.if_implemented), RETENTION_LABELS), [responses]);
  const problemData = useMemo(() => countsToChartData(countField(responses, r => r.templateProposal?.problem_exists), PROBLEM_LABELS), [responses]);
  const q5Data = useMemo(() => countsToChartData(countArrayField(responses, r => r.currentSystem?.problems), Q5_LABELS), [responses]);
  const q9Data = useMemo(() => countsToChartData(countArrayField(responses, r => r.templateProposal?.acceptable_if), Q9_LABELS), [responses]);

  // Concern averages
  const concernAvgs = useMemo(() => {
    const keys = Object.keys(CONCERN_LABELS);
    return keys.map(k => {
      const vals = responses.map(r => parseFloat(r.templateProposal?.concerns?.[k])).filter(v => !isNaN(v));
      return { name: CONCERN_LABELS[k], avg: vals.length ? +(vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(2) : 0 };
    }).sort((a, b) => b.avg - a.avg);
  }, [responses]);

  // Alternative model ratings
  const modelRatings = useMemo(() => {
    const models = [
      { key: 'block_template', label: 'Block Template', getter: r => r.alternatives?.block_template?.rating },
      { key: 'team', label: 'Team Self-Schedule', getter: r => r.alternatives?.team_self_schedule?.rating },
      { key: 'graduated', label: 'Graduated', getter: r => r.alternatives?.graduated?.rating },
      { key: 'status_quo', label: 'Enhanced Status Quo', getter: r => r.alternatives?.enhanced_status_quo?.rating },
    ];
    return models.map(m => {
      const vals = responses.map(m.getter).map(Number).filter(v => !isNaN(v));
      return { name: m.label, avg: vals.length ? +(vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(2) : 0 };
    }).sort((a, b) => b.avg - a.avg);
  }, [responses]);

  // Model rankings (lower = more preferred)
  const modelRankAvg = useMemo(() => avgRank(responses, r => r.rankings?.model_ranks, Object.keys(MODEL_LABELS)), [responses]);
  const priorityRankAvg = useMemo(() => avgRank(responses, r => r.rankings?.priority_ranks, Object.keys(PRIORITY_LABELS)), [responses]);

  // Job satisfaction
  const avgJobSat = useMemo(() => {
    const vals = responses.map(r => parseFloat(r.satisfaction)).filter(v => !isNaN(v));
    return vals.length ? (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1) : '—';
  }, [responses]);

  const selectedData = useMemo(() => responses.find(r => r.physician === viewPhysician), [responses, viewPhysician]);

  const tabStyle = (active) => ({
    padding: '10px 20px', borderRadius: 8, border: 'none',
    fontSize: 13, fontWeight: 700, cursor: 'pointer',
    background: active ? '#1b3a5c' : 'transparent',
    color: active ? '#3ba4e0' : '#8888aa',
    transition: 'all 0.2s',
  });

  return (
    <div style={s.page}>
      <div style={s.wrap}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={s.tag}>NOCTURNIST SCHEDULING</div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: '#f0f4fa' }}>Opinion Survey — Admin</h1>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Link to="/" style={{ ...s.btn, ...s.btnSecondary, textDecoration: 'none' }}>Explorer</Link>
            <Link to="/admin/import" style={{ ...s.btn, ...s.btnSecondary, textDecoration: 'none' }}>Survey</Link>
            <Link to="/admin/preferences" style={{ ...s.btn, ...s.btnSecondary, textDecoration: 'none' }}>Preferences</Link>
          </div>
        </div>

        {/* Import section */}
        <div style={s.card}>
          <h2 style={s.h2}>Import Responses</h2>
          <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
            <button style={{ ...s.btn, ...s.btnPrimary }} onClick={fetchFromSheet} disabled={fetching}>
              {fetching ? 'Fetching...' : 'Fetch from Google Sheet'}
            </button>
            <button style={{ ...s.btn, ...s.btnSecondary }} onClick={exportJSON} disabled={!responses.length}>Export JSON</button>
            <button style={{ ...s.btn, ...s.btnSecondary }} onClick={exportCSV} disabled={!responses.length}>Export CSV</button>
            <button style={{ ...s.btn, ...s.btnDanger }} onClick={clearAll} disabled={!responses.length}>Clear All</button>
          </div>
          <textarea
            style={s.textarea}
            placeholder="Paste opinion survey code here..."
            value={inputCode}
            onChange={e => setInputCode(e.target.value)}
          />
          <button style={{ ...s.btn, ...s.btnPrimary, marginTop: 8 }} onClick={addResponse} disabled={!inputCode.trim()}>
            Import Code
          </button>
          {error && <div style={{ color: '#ef4444', fontSize: 13, marginTop: 8 }}>{error}</div>}
          {success && <div style={{ color: '#12b886', fontSize: 13, marginTop: 8 }}>{success}</div>}
        </div>

        {/* Tracker */}
        <div style={s.card}>
          <h2 style={s.h2}>Submission Tracker ({responses.length} of {TOTAL_MDS})</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {PHYSICIANS.map(p => {
              const done = submitted.includes(p.name);
              return (
                <span key={p.name} style={{
                  padding: '4px 10px', borderRadius: 6, fontSize: 12, fontWeight: 600,
                  background: done ? '#0d2a1b' : '#2a1520',
                  color: done ? '#12b886' : '#ef4444',
                  border: `1px solid ${done ? '#1b5c3a' : '#3a2030'}`,
                }}>{p.name}</span>
              );
            })}
          </div>
        </div>

        {responses.length > 0 && (
          <>
            {/* Tabs */}
            <div style={{ display: 'flex', gap: 4, marginBottom: 20 }}>
              <button style={tabStyle(tab === 'aggregate')} onClick={() => setTab('aggregate')}>Aggregate</button>
              <button style={tabStyle(tab === 'individual')} onClick={() => setTab('individual')}>Individual</button>
              <button style={tabStyle(tab === 'responses')} onClick={() => setTab('responses')}>Open Responses</button>
            </div>

            {tab === 'aggregate' && (
              <>
                {/* Current System Satisfaction */}
                <div style={s.card}>
                  <h2 style={s.h2}>Current System Satisfaction</h2>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
                    <div>
                      <h3 style={s.h3}>Satisfaction Distribution</h3>
                      <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={satData} layout="vertical">
                          <XAxis type="number" allowDecimals={false} tick={{ fill: '#8888aa', fontSize: 11 }} />
                          <YAxis type="category" dataKey="name" width={140} tick={{ fill: '#e0e0f0', fontSize: 11 }} />
                          <Tooltip contentStyle={tooltipStyle} />
                          <Bar dataKey="value" fill="#3ba4e0" radius={[0, 4, 4, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    <div>
                      <h3 style={s.h3}>Key Stats</h3>
                      <div style={{ fontSize: 13, color: '#c0c8e0', lineHeight: 2 }}>
                        <div>Avg HPRs used/month: <strong style={{ color: '#f0f4fa' }}>{avgHPR}</strong></div>
                        <div>Avg job satisfaction: <strong style={{ color: '#f0f4fa' }}>{avgJobSat}/10</strong></div>
                      </div>
                      <h3 style={{ ...s.h3, marginTop: 16 }}>Current System Problems</h3>
                      <ResponsiveContainer width="100%" height={180}>
                        <BarChart data={q5Data} layout="vertical">
                          <XAxis type="number" allowDecimals={false} tick={{ fill: '#8888aa', fontSize: 11 }} />
                          <YAxis type="category" dataKey="name" width={120} tick={{ fill: '#e0e0f0', fontSize: 11 }} />
                          <Tooltip contentStyle={tooltipStyle} />
                          <Bar dataKey="value" fill="#fbbf24" radius={[0, 4, 4, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                {/* Template Proposal */}
                <div style={s.card}>
                  <h2 style={s.h2}>7-on/10-off Template Proposal</h2>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
                    <div>
                      <h3 style={s.h3}>Support Level</h3>
                      <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={templateSupportData} layout="vertical">
                          <XAxis type="number" allowDecimals={false} tick={{ fill: '#8888aa', fontSize: 11 }} />
                          <YAxis type="category" dataKey="name" width={140} tick={{ fill: '#e0e0f0', fontSize: 11 }} />
                          <Tooltip contentStyle={tooltipStyle} />
                          <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                            {templateSupportData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    <div>
                      <h3 style={s.h3}>If Implemented — Retention Risk</h3>
                      <ResponsiveContainer width="100%" height={220}>
                        <PieChart>
                          <Pie data={retentionData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={40} outerRadius={70}
                            label={({ name, value }) => `${name}: ${value}`} labelLine={false}>
                            {retentionData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                          </Pie>
                          <Tooltip contentStyle={tooltipStyle} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                {/* Concerns */}
                <div style={s.card}>
                  <h2 style={s.h2}>Concern Levels (Avg 1-5)</h2>
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={concernAvgs} layout="vertical">
                      <XAxis type="number" domain={[0, 5]} tick={{ fill: '#8888aa', fontSize: 11 }} />
                      <YAxis type="category" dataKey="name" width={120} tick={{ fill: '#e0e0f0', fontSize: 11 }} />
                      <Tooltip contentStyle={tooltipStyle} />
                      <Bar dataKey="avg" fill="#ef4444" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* What would make it acceptable */}
                <div style={s.card}>
                  <h2 style={s.h2}>What Would Make Template Acceptable</h2>
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={q9Data} layout="vertical">
                      <XAxis type="number" allowDecimals={false} tick={{ fill: '#8888aa', fontSize: 11 }} />
                      <YAxis type="category" dataKey="name" width={130} tick={{ fill: '#e0e0f0', fontSize: 11 }} />
                      <Tooltip contentStyle={tooltipStyle} />
                      <Bar dataKey="value" fill="#12b886" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Alternative Models */}
                <div style={s.card}>
                  <h2 style={s.h2}>Alternative Model Ratings (Avg 1-5)</h2>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={modelRatings} layout="vertical">
                      <XAxis type="number" domain={[0, 5]} tick={{ fill: '#8888aa', fontSize: 11 }} />
                      <YAxis type="category" dataKey="name" width={150} tick={{ fill: '#e0e0f0', fontSize: 11 }} />
                      <Tooltip contentStyle={tooltipStyle} />
                      <Bar dataKey="avg" radius={[0, 4, 4, 0]}>
                        {modelRatings.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Rankings */}
                <div style={s.card}>
                  <h2 style={s.h2}>Model Rankings (Avg Rank — Lower = More Preferred)</h2>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
                    <div>
                      <h3 style={s.h3}>Model Preference Order</h3>
                      <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={modelRankAvg} layout="vertical">
                          <XAxis type="number" domain={[0, 5]} tick={{ fill: '#8888aa', fontSize: 11 }} />
                          <YAxis type="category" dataKey="name" width={150} tick={{ fill: '#e0e0f0', fontSize: 11 }} />
                          <Tooltip contentStyle={tooltipStyle} />
                          <Bar dataKey="avg" radius={[0, 4, 4, 0]}>
                            {modelRankAvg.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    <div>
                      <h3 style={s.h3}>Priority Rankings</h3>
                      <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={priorityRankAvg} layout="vertical">
                          <XAxis type="number" domain={[0, 5]} tick={{ fill: '#8888aa', fontSize: 11 }} />
                          <YAxis type="category" dataKey="name" width={120} tick={{ fill: '#e0e0f0', fontSize: 11 }} />
                          <Tooltip contentStyle={tooltipStyle} />
                          <Bar dataKey="avg" radius={[0, 4, 4, 0]}>
                            {priorityRankAvg.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                {/* Problem perception */}
                <div style={s.card}>
                  <h2 style={s.h2}>Is There a Problem to Solve?</h2>
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={problemData} layout="vertical">
                      <XAxis type="number" allowDecimals={false} tick={{ fill: '#8888aa', fontSize: 11 }} />
                      <YAxis type="category" dataKey="name" width={140} tick={{ fill: '#e0e0f0', fontSize: 11 }} />
                      <Tooltip contentStyle={tooltipStyle} />
                      <Bar dataKey="value" fill="#a855f7" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </>
            )}

            {tab === 'individual' && (
              <div style={s.card}>
                <h2 style={s.h2}>Individual Responses</h2>
                <select style={s.select} value={viewPhysician} onChange={e => setViewPhysician(e.target.value)}>
                  <option value="">Select physician...</option>
                  {responses.map(r => <option key={r.physician} value={r.physician}>{r.physician}</option>)}
                </select>
                {selectedData && <div style={{ marginTop: 16 }}><IndividualView data={selectedData} /></div>}
              </div>
            )}

            {tab === 'responses' && (
              <div style={s.card}>
                <h2 style={s.h2}>Open Responses</h2>
                {responses.filter(r => r.open_response).map(r => (
                  <div key={r.physician} style={{ marginBottom: 16, padding: 14, background: '#0d1b2a', borderRadius: 10, border: '1px solid #1b3a5c' }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#3ba4e0', marginBottom: 4 }}>{r.physician}</div>
                    <div style={{ fontSize: 13, color: '#c0c8e0', fontStyle: 'italic', lineHeight: 1.5 }}>
                      "{r.open_response}"
                    </div>
                  </div>
                ))}
                {responses.filter(r => r.open_response).length === 0 && (
                  <div style={{ color: '#8888aa', fontSize: 13 }}>No open responses yet.</div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
