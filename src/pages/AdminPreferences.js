import { useState, useMemo, useCallback } from 'react';
import { Link } from 'react-router';
import { PHYSICIANS, HOSPITALS, TOTAL_MDS } from '../data/constants';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer,
  Cell, PieChart, Pie,
} from 'recharts';

const LS_KEY = 'nocturnist_preferences';

const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
const START_TIMES = ['8 PM','9 PM','10 PM','11 PM'];
const END_TIMES = ['5 AM','6 AM','7 AM','8 AM'];
const HOLIDAYS = [
  "New Year's Eve","New Year's Day","Easter","Memorial Day",
  "Independence Day","Labor Day","Halloween","Veterans Day"
];
const SWAP_LABELS = { yes: 'Yes — anytime', conditional: 'Conditional', no: 'No — fixed' };
const PIE_COLORS = ['#12b886', '#fbbf24', '#ef4444'];
const COLORS = ['#3ba4e0','#12b886','#fbbf24','#ef4444','#a855f7','#f472b6','#06b6d4'];

const MOTIVATOR_KEYS = ['time_off', 'location', 'rhythm', 'money'];
const MOTIVATOR_LABELS = { time_off: 'Time Off', location: 'Location', rhythm: 'Rhythm', money: 'Money' };
const DESIR_KEYS = ['preferred_location', 'preferred_time', 'avoid_day', 'longer_off'];
const DESIR_LABELS = {
  preferred_location: 'Preferred Location',
  preferred_time: 'Preferred Time',
  avoid_day: 'Avoid Day',
  longer_off: 'Longer Off-stretch',
};
const THREE_PT_LABELS = { not_at_all: 'Not at all', somewhat: 'Somewhat', very_much: 'Very much' };
const HOSP_FLEX_LABELS = { same_only: 'Same only', assigned_only: 'Assigned', any: 'Any' };
const YMN_LABELS = { yes: 'Yes', maybe: 'Maybe', no: 'No' };
const TRADE_FLEX_LABELS = { equal_only: 'Equal only', flexible: 'Flexible' };
const WEEKEND_NIGHT_LABELS = { friday: 'Friday', saturday: 'Saturday', sunday: 'Sunday' };

function loadResponses() {
  try { return JSON.parse(localStorage.getItem(LS_KEY)) || []; }
  catch { return []; }
}
function saveResponses(arr) { localStorage.setItem(LS_KEY, JSON.stringify(arr)); }

function decodePayload(code) {
  const json = decodeURIComponent(escape(atob(code.trim())));
  const data = JSON.parse(json);
  if (data.v !== 1 || data.type !== 'preferences' || !data.physician) throw new Error('Invalid');
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
  wrap: { maxWidth: 960, margin: '0 auto' },
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
  callout: {
    background: '#0d1b2a', border: '1px solid #1b3a5c', borderRadius: 10,
    padding: '10px 14px', marginBottom: 8,
  },
  select: {
    padding: '10px 12px', borderRadius: 8, border: '1px solid #2a2a40',
    background: '#0a0a14', color: '#e0e0f0', fontSize: 14, fontFamily: 'inherit',
  },
};

const tooltipStyle = { background: '#14142a', border: '1px solid #2a2a40', borderRadius: 8 };

// ─── Individual View ───
function IndividualView({ data }) {
  const swapLabel = SWAP_LABELS[data.collaboration?.swap_willingness] || data.collaboration?.swap_willingness || '—';
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

  const collab = data.collaboration || {};
  const desir = collab.desirability || {};
  const constr = collab.constraints || {};
  const bs = collab.block_swap || {};
  const wknd = collab.weekend || {};

  return (
    <div style={s.card}>
      <div style={{ fontSize: 18, fontWeight: 800, color: '#f0f4fa', marginBottom: 4 }}>{data.physician}</div>
      <div style={{ fontSize: 11, color: '#6666aa', marginBottom: 16 }}>Submitted {new Date(data.ts).toLocaleDateString()}</div>

      <Section title="Block Preferences">
        <Row label="Nights on" value={data.block?.nights_on} />
        <Row label="Days off" value={data.block?.days_off} />
        <Row label="Max consecutive" value={data.block?.max_consecutive} />
        <Row label="Min recovery" value={data.block?.min_recovery} />
      </Section>

      <Section title="Day & Time">
        <Row label="Least desired day" value={data.days?.least_desired} />
        <Row label="Most desired day" value={data.days?.most_desired} />
        <Row label="Start time rank" value={data.times?.start_rank?.join(' > ')} />
        <Row label="End time rank" value={data.times?.end_rank?.join(' > ')} />
      </Section>

      <Section title="Location">
        <Row label="Top 3" value={data.locations?.top3?.join(', ')} />
        <Row label="Alternate" value={data.locations?.alternate} />
        {data.locations?.commute_minutes && Object.entries(data.locations.commute_minutes).map(([h, m]) => (
          <Row key={h} label={`Commute to ${h}`} value={`${m} min`} />
        ))}
      </Section>

      <Section title="Holidays & Availability">
        <Row label="Top 3 holidays" value={data.holidays?.top3?.join(', ')} />
        <Row label="Vacation/blackout" value={data.availability?.vacation_blackout || 'None'} />
        <Row label="Family obligations" value={data.availability?.family_obligations || 'None'} />
      </Section>

      <Section title="Swap & Collaboration">
        <Row label="Swap willingness" value={swapLabel} />
        <Row label="Motivator rank" value={collab.motivator_rank?.map(k => MOTIVATOR_LABELS[k] || k).join(' > ')} />
        {DESIR_KEYS.map(k => (
          <Row key={k} label={DESIR_LABELS[k]} value={THREE_PT_LABELS[desir[k]] || desir[k]} />
        ))}
        <Row label="Max extra consecutive" value={constr.max_extra_consecutive} />
        <Row label="Min notice days" value={constr.min_notice_days} />
        <Row label="Hospital flexibility" value={HOSP_FLEX_LABELS[constr.hospital_flexibility] || constr.hospital_flexibility} />
        <Row label="Extra shift premium" value={YMN_LABELS[constr.extra_shift_premium] || constr.extra_shift_premium} />
      </Section>

      <Section title="Block & Weekend Swaps">
        <Row label="Full block swap" value={YMN_LABELS[bs.willing_full_block] || bs.willing_full_block} />
        <Row label="Trade flexibility" value={TRADE_FLEX_LABELS[bs.trade_flexibility] || bs.trade_flexibility} />
        <Row label="Preferred block trade" value={YMN_LABELS[bs.preferred_block_trade] || bs.preferred_block_trade} />
        <Row label="Min weekends off/mo" value={wknd.min_weekends_off_per_month} />
        <Row label="Extra weeknight for weekend" value={YMN_LABELS[wknd.extra_weeknight_for_weekend] || wknd.extra_weeknight_for_weekend} />
        <Row label="Split block for weekend" value={YMN_LABELS[wknd.split_block_for_weekend] || wknd.split_block_for_weekend} />
        <Row label="Weekend night rank" value={wknd.weekend_night_rank?.map(k => WEEKEND_NIGHT_LABELS[k] || k).join(' > ')} />
        <Row label="Worse hospital for weekend" value={YMN_LABELS[wknd.worse_hospital_for_weekend] || wknd.worse_hospital_for_weekend} />
      </Section>
    </div>
  );
}

// ─── Helper: pie data from yes/maybe/no counts ───
function ymnPieData(counts) {
  return [
    { name: 'Yes', value: counts.yes || 0 },
    { name: 'Maybe', value: counts.maybe || 0 },
    { name: 'No', value: counts.no || 0 },
  ].filter(d => d.value > 0);
}

// ─── Helper: count yes/maybe/no for a field path ───
function countYMN(responses, getter) {
  const counts = { yes: 0, maybe: 0, no: 0 };
  responses.forEach(r => {
    const v = getter(r);
    if (v && counts[v] !== undefined) counts[v]++;
  });
  return counts;
}

// ─── Small pie chart component ───
function SmallPie({ data, title }) {
  return (
    <div>
      <h3 style={s.h3}>{title}</h3>
      <ResponsiveContainer width="100%" height={180}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={35}
            outerRadius={60}
            label={({ name, value }) => `${name}: ${value}`}
            labelLine={false}
          >
            {data.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
          </Pie>
          <Tooltip contentStyle={tooltipStyle} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─── Main Component ───
export default function AdminPreferences() {
  const [responses, setResponses] = useState(loadResponses);
  const [inputCode, setInputCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [viewPhysician, setViewPhysician] = useState('');
  const [tab, setTab] = useState('aggregate');

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
      setSuccess(`${data.physician}'s preferences imported.`);
    } catch {
      setError('Invalid code. Please check and try again.');
    }
  }, [inputCode]);

  const clearAll = useCallback(() => {
    if (window.confirm('Delete all imported preferences? This cannot be undone.')) {
      saveResponses([]);
      setResponses([]);
    }
  }, []);

  const exportJSON = useCallback(() => {
    const blob = new Blob([JSON.stringify(responses, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'preferences_responses.json'; a.click();
    URL.revokeObjectURL(url);
  }, [responses]);

  const exportCSV = useCallback(() => {
    const header = [
      'Physician','Timestamp','Nights On','Days Off','Max Consecutive','Min Recovery',
      'Least Desired Day','Most Desired Day','Start Rank','End Rank',
      'Hospital 1','Hospital 2','Hospital 3','Alternate',
      'Holiday 1','Holiday 2','Holiday 3',
      'Vacation/Blackout','Family Obligations',
      'Swap Willingness','Motivator Rank',
      'Desir: Location','Desir: Time','Desir: Avoid Day','Desir: Longer Off',
      'Max Extra Consec','Min Notice Days','Hospital Flexibility','Extra Shift Premium',
      'Full Block Swap','Trade Flexibility','Preferred Block Trade',
      'Min Weekends Off','Extra Weeknight','Split Block','Weekend Night Rank','Worse Hospital'
    ];
    const rows = responses.map(r => {
      const c = r.collaboration || {};
      const d = c.desirability || {};
      const con = c.constraints || {};
      const bs = c.block_swap || {};
      const w = c.weekend || {};
      return [
        r.physician, r.ts,
        r.block?.nights_on, r.block?.days_off, r.block?.max_consecutive, r.block?.min_recovery,
        r.days?.least_desired, r.days?.most_desired,
        r.times?.start_rank?.join(' > '), r.times?.end_rank?.join(' > '),
        r.locations?.top3?.[0], r.locations?.top3?.[1], r.locations?.top3?.[2], r.locations?.alternate,
        r.holidays?.top3?.[0], r.holidays?.top3?.[1], r.holidays?.top3?.[2],
        r.availability?.vacation_blackout, r.availability?.family_obligations,
        c.swap_willingness, c.motivator_rank?.join(' > '),
        d.preferred_location, d.preferred_time, d.avoid_day, d.longer_off,
        con.max_extra_consecutive, con.min_notice_days, con.hospital_flexibility, con.extra_shift_premium,
        bs.willing_full_block, bs.trade_flexibility, bs.preferred_block_trade,
        w.min_weekends_off_per_month, w.extra_weeknight_for_weekend, w.split_block_for_weekend,
        w.weekend_night_rank?.join(' > '), w.worse_hospital_for_weekend
      ];
    });
    const csv = [header, ...rows].map(r => r.map(c => '"' + String(c || '').replace(/"/g, '""') + '"').join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'preferences_results.csv'; a.click();
    URL.revokeObjectURL(url);
  }, [responses]);

  // ─── Aggregations ───
  const agg = useMemo(() => {
    if (!responses.length) return null;
    const n = responses.length;
    const submitted = responses.map(r => r.physician);
    const missing = PHYSICIANS.map(p => p.name).filter(name => !submitted.includes(name));

    const avg = arr => arr.length ? (arr.reduce((a, b) => a + b, 0) / arr.length) : 0;
    const median = arr => {
      if (!arr.length) return 0;
      const sorted = [...arr].sort((a, b) => a - b);
      const mid = Math.floor(sorted.length / 2);
      return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
    };
    const range = arr => arr.length ? [Math.min(...arr), Math.max(...arr)] : [0, 0];

    // Block stats
    const nightsOn = responses.map(r => r.block?.nights_on).filter(Boolean);
    const daysOff = responses.map(r => r.block?.days_off).filter(Boolean);
    const maxConsec = responses.map(r => r.block?.max_consecutive).filter(Boolean);
    const minRecovery = responses.map(r => r.block?.min_recovery).filter(Boolean);

    const nightsOnHist = histogram(nightsOn, 3, 10);
    const daysOffHist = histogram(daysOff, 5, 14);

    // Day heatmap
    const leastDayCounts = {};
    const mostDayCounts = {};
    DAYS.forEach(d => { leastDayCounts[d] = 0; mostDayCounts[d] = 0; });
    responses.forEach(r => {
      if (r.days?.least_desired && leastDayCounts[r.days.least_desired] !== undefined) leastDayCounts[r.days.least_desired]++;
      if (r.days?.most_desired && mostDayCounts[r.days.most_desired] !== undefined) mostDayCounts[r.days.most_desired]++;
    });

    let topLeast = '', topLeastCount = 0;
    let topMost = '', topMostCount = 0;
    DAYS.forEach(d => {
      if (leastDayCounts[d] > topLeastCount) { topLeast = d; topLeastCount = leastDayCounts[d]; }
      if (mostDayCounts[d] > topMostCount) { topMost = d; topMostCount = mostDayCounts[d]; }
    });

    // Time rankings — count how many picked each as #1
    const startFirstCounts = {};
    START_TIMES.forEach(t => { startFirstCounts[t] = 0; });
    responses.forEach(r => {
      const first = r.times?.start_rank?.[0];
      if (first && startFirstCounts[first] !== undefined) startFirstCounts[first]++;
    });

    const endFirstCounts = {};
    END_TIMES.forEach(t => { endFirstCounts[t] = 0; });
    responses.forEach(r => {
      const first = r.times?.end_rank?.[0];
      if (first && endFirstCounts[first] !== undefined) endFirstCounts[first]++;
    });

    // Hospital popularity
    const hospPopularity = {};
    HOSPITALS.forEach(h => { hospPopularity[h.name] = 0; });
    responses.forEach(r => {
      if (r.locations?.top3) r.locations.top3.forEach(h => { if (hospPopularity[h] !== undefined) hospPopularity[h]++; });
    });

    // Average commute
    const commuteSum = {};
    const commuteCount = {};
    HOSPITALS.forEach(h => { commuteSum[h.name] = 0; commuteCount[h.name] = 0; });
    responses.forEach(r => {
      if (r.locations?.commute_minutes) {
        Object.entries(r.locations.commute_minutes).forEach(([h, m]) => {
          if (m > 0 && commuteSum[h] !== undefined) { commuteSum[h] += m; commuteCount[h]++; }
        });
      }
    });
    const avgCommute = {};
    HOSPITALS.forEach(h => {
      avgCommute[h.name] = commuteCount[h.name] > 0 ? commuteSum[h.name] / commuteCount[h.name] : 0;
    });

    // Alternate distribution
    const altCounts = {};
    HOSPITALS.forEach(h => { altCounts[h.name] = 0; });
    responses.forEach(r => {
      if (r.locations?.alternate && altCounts[r.locations.alternate] !== undefined) altCounts[r.locations.alternate]++;
    });

    // Holiday rankings
    const holidayCounts = {};
    HOLIDAYS.forEach(h => { holidayCounts[h] = 0; });
    responses.forEach(r => {
      if (r.holidays?.top3) r.holidays.top3.forEach(h => { if (holidayCounts[h] !== undefined) holidayCounts[h]++; });
    });
    let topHoliday = '', topHolidayCount = 0;
    HOLIDAYS.forEach(h => {
      if (holidayCounts[h] > topHolidayCount) { topHoliday = h; topHolidayCount = holidayCounts[h]; }
    });

    // Swap willingness
    const swapCounts = { yes: 0, conditional: 0, no: 0 };
    responses.forEach(r => {
      if (r.collaboration?.swap_willingness && swapCounts[r.collaboration.swap_willingness] !== undefined) {
        swapCounts[r.collaboration.swap_willingness]++;
      }
    });

    // ─── Motivator Rankings — count by rank position ───
    const motivatorRankCounts = {};
    MOTIVATOR_KEYS.forEach(k => { motivatorRankCounts[k] = { 1: 0, 2: 0, 3: 0, 4: 0 }; });
    responses.forEach(r => {
      if (r.collaboration?.motivator_rank) {
        r.collaboration.motivator_rank.forEach((k, i) => {
          if (motivatorRankCounts[k]) motivatorRankCounts[k][i + 1]++;
        });
      }
    });

    // Find if any motivator is ranked #1 by majority
    let motivatorConsensus = null;
    MOTIVATOR_KEYS.forEach(k => {
      if (motivatorRankCounts[k][1] > n / 2) {
        motivatorConsensus = { key: k, count: motivatorRankCounts[k][1] };
      }
    });

    // ─── NEW: Desirability Factors ───
    const desirCounts = {};
    DESIR_KEYS.forEach(k => {
      desirCounts[k] = { not_at_all: 0, somewhat: 0, very_much: 0 };
    });
    responses.forEach(r => {
      if (r.collaboration?.desirability) {
        DESIR_KEYS.forEach(k => {
          const v = r.collaboration.desirability[k];
          if (v && desirCounts[k][v] !== undefined) desirCounts[k][v]++;
        });
      }
    });

    // Find strongest desirability factor
    let strongestDesir = null;
    let strongestDesirCount = 0;
    DESIR_KEYS.forEach(k => {
      if (desirCounts[k].very_much > strongestDesirCount) {
        strongestDesir = k;
        strongestDesirCount = desirCounts[k].very_much;
      }
    });

    // ─── NEW: Constraints ───
    const maxExtraVals = responses.map(r => r.collaboration?.constraints?.max_extra_consecutive).filter(v => v !== undefined && v !== null);
    const minNoticeVals = responses.map(r => r.collaboration?.constraints?.min_notice_days).filter(v => v !== undefined && v !== null);

    const hospFlexCounts = { same_only: 0, assigned_only: 0, any: 0 };
    responses.forEach(r => {
      const v = r.collaboration?.constraints?.hospital_flexibility;
      if (v && hospFlexCounts[v] !== undefined) hospFlexCounts[v]++;
    });

    const extraShiftCounts = countYMN(responses, r => r.collaboration?.constraints?.extra_shift_premium);

    // ─── NEW: Block Swap ───
    const fullBlockCounts = countYMN(responses, r => r.collaboration?.block_swap?.willing_full_block);
    const tradeFlexCounts = { equal_only: 0, flexible: 0 };
    responses.forEach(r => {
      const v = r.collaboration?.block_swap?.trade_flexibility;
      if (v && tradeFlexCounts[v] !== undefined) tradeFlexCounts[v]++;
    });
    const prefBlockCounts = countYMN(responses, r => r.collaboration?.block_swap?.preferred_block_trade);

    // ─── NEW: Weekend ───
    const minWeekendVals = responses.map(r => r.collaboration?.weekend?.min_weekends_off_per_month).filter(v => v !== undefined && v !== null);
    const weekendHist = histogram(minWeekendVals, 0, 4);

    const extraWeeknightCounts = countYMN(responses, r => r.collaboration?.weekend?.extra_weeknight_for_weekend);
    const splitBlockCounts = countYMN(responses, r => r.collaboration?.weekend?.split_block_for_weekend);
    const worseHospCounts = countYMN(responses, r => r.collaboration?.weekend?.worse_hospital_for_weekend);

    // Weekend night priority — count by rank position
    const weekendNightCounts = { friday: { 1: 0, 2: 0, 3: 0 }, saturday: { 1: 0, 2: 0, 3: 0 }, sunday: { 1: 0, 2: 0, 3: 0 } };
    responses.forEach(r => {
      if (r.collaboration?.weekend?.weekend_night_rank) {
        r.collaboration.weekend.weekend_night_rank.forEach((k, i) => {
          if (weekendNightCounts[k]) weekendNightCounts[k][i + 1]++;
        });
      }
    });
    // Find most valued weekend night (most #1 picks)
    let bestWeekendNight = 'saturday';
    let bestWeekendNightCount = 0;
    ['friday', 'saturday', 'sunday'].forEach(k => {
      if (weekendNightCounts[k][1] > bestWeekendNightCount) {
        bestWeekendNight = k;
        bestWeekendNightCount = weekendNightCounts[k][1];
      }
    });

    return {
      n, submitted, missing,
      nightsOnHist, daysOffHist,
      avgMaxConsec: avg(maxConsec), rangeMaxConsec: range(maxConsec),
      avgMinRecovery: avg(minRecovery), rangeMinRecovery: range(minRecovery),
      leastDayCounts, mostDayCounts, topLeast, topLeastCount, topMost, topMostCount,
      startFirstCounts, endFirstCounts,
      hospPopularity, avgCommute, altCounts,
      holidayCounts, topHoliday, topHolidayCount,
      swapCounts,
      // New
      motivatorRankCounts, motivatorConsensus,
      desirCounts, strongestDesir, strongestDesirCount,
      avgMaxExtra: avg(maxExtraVals), medianMaxExtra: median(maxExtraVals),
      avgMinNotice: avg(minNoticeVals), medianMinNotice: median(minNoticeVals),
      hospFlexCounts, extraShiftCounts,
      fullBlockCounts, tradeFlexCounts, prefBlockCounts,
      weekendHist, avgMinWeekends: avg(minWeekendVals),
      extraWeeknightCounts, splitBlockCounts, worseHospCounts,
      weekendNightCounts, bestWeekendNight, bestWeekendNightCount,
    };
  }, [responses]);

  const selectedData = useMemo(() => {
    return responses.find(r => r.physician === viewPhysician);
  }, [responses, viewPhysician]);

  // Chart data
  const startTimeData = useMemo(() => {
    if (!agg) return [];
    return START_TIMES.map(t => ({ name: t, count: agg.startFirstCounts[t] }))
      .sort((a, b) => b.count - a.count);
  }, [agg]);

  const endTimeData = useMemo(() => {
    if (!agg) return [];
    return END_TIMES.map(t => ({ name: t, count: agg.endFirstCounts[t] }))
      .sort((a, b) => b.count - a.count);
  }, [agg]);

  const hospPopData = useMemo(() => {
    if (!agg) return [];
    return HOSPITALS.map(h => ({ name: h.name, count: agg.hospPopularity[h.name] }))
      .sort((a, b) => b.count - a.count);
  }, [agg]);

  const holidayData = useMemo(() => {
    if (!agg) return [];
    return HOLIDAYS.map(h => ({ name: h.length > 12 ? h.slice(0, 12) + '.' : h, fullName: h, count: agg.holidayCounts[h] }))
      .sort((a, b) => b.count - a.count);
  }, [agg]);

  const swapPieData = useMemo(() => {
    if (!agg) return [];
    return [
      { name: 'Yes', value: agg.swapCounts.yes },
      { name: 'Conditional', value: agg.swapCounts.conditional },
      { name: 'No', value: agg.swapCounts.no },
    ].filter(d => d.value > 0);
  }, [agg]);

  const dayHeatData = useMemo(() => {
    if (!agg) return [];
    return DAYS.map(d => ({
      name: d.slice(0, 3),
      'Least Desired': agg.leastDayCounts[d],
      'Most Desired': agg.mostDayCounts[d],
    }));
  }, [agg]);

  const motivatorData = useMemo(() => {
    if (!agg) return [];
    return MOTIVATOR_KEYS.map(k => ({
      name: MOTIVATOR_LABELS[k],
      '#1': agg.motivatorRankCounts[k][1],
      '#2': agg.motivatorRankCounts[k][2],
      '#3': agg.motivatorRankCounts[k][3],
      '#4': agg.motivatorRankCounts[k][4],
    }));
  }, [agg]);

  const desirData = useMemo(() => {
    if (!agg) return [];
    return DESIR_KEYS.map(k => ({
      name: DESIR_LABELS[k],
      'Not at all': agg.desirCounts[k].not_at_all,
      'Somewhat': agg.desirCounts[k].somewhat,
      'Very much': agg.desirCounts[k].very_much,
    }));
  }, [agg]);

  const tradeFlexData = useMemo(() => {
    if (!agg) return [];
    return [
      { name: 'Equal only', count: agg.tradeFlexCounts.equal_only },
      { name: 'Flexible', count: agg.tradeFlexCounts.flexible },
    ];
  }, [agg]);

  const weekendNightData = useMemo(() => {
    if (!agg) return [];
    return ['friday', 'saturday', 'sunday'].map(k => ({
      name: WEEKEND_NIGHT_LABELS[k],
      '#1': agg.weekendNightCounts[k][1],
      '#2': agg.weekendNightCounts[k][2],
      '#3': agg.weekendNightCounts[k][3],
    }));
  }, [agg]);

  return (
    <div style={s.page}>
      <div style={s.wrap}>
        {/* Header */}
        <div style={{ marginBottom: 20 }}>
          <div style={s.tag}>ADMIN TOOLS</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: '#f0f4fa', margin: 0 }}>
              Preference Import
            </h1>
            <div style={{ display: 'flex', gap: 12 }}>
              <Link to="/admin/import" style={{ color: '#3ba4e0', fontSize: 13, textDecoration: 'none' }}>
                Survey Import
              </Link>
              <Link to="/" style={{ color: '#3ba4e0', fontSize: 13, textDecoration: 'none' }}>
                &larr; Explorer
              </Link>
            </div>
          </div>
        </div>

        {/* Input card */}
        <div style={s.card}>
          <h2 style={s.h2}>Paste Preference Code</h2>
          <textarea
            style={s.textarea}
            placeholder="Paste a physician's preference code here..."
            value={inputCode}
            onChange={e => setInputCode(e.target.value)}
          />
          <div style={{ display: 'flex', gap: 12, marginTop: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            <button style={{ ...s.btn, ...s.btnPrimary }} onClick={addResponse} disabled={!inputCode.trim()}>
              Import
            </button>
            <span style={{ fontSize: 14, color: '#8888aa', fontWeight: 600 }}>
              {responses.length} of {TOTAL_MDS} received
            </span>
          </div>
          {error && <div style={{ color: '#ef4444', fontSize: 13, marginTop: 8 }}>{error}</div>}
          {success && <div style={{ color: '#12b886', fontSize: 13, marginTop: 8 }}>{success}</div>}

          {agg && (
            <div style={{ marginTop: 12, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ fontSize: 11, color: '#12b886', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>
                  Submitted ({agg.submitted.length})
                </div>
                <div style={{ fontSize: 12, color: '#8888aa' }}>{agg.submitted.sort().join(', ')}</div>
              </div>
              {agg.missing.length > 0 && (
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ fontSize: 11, color: '#ef4444', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>
                    Missing ({agg.missing.length})
                  </div>
                  <div style={{ fontSize: 12, color: '#8888aa' }}>{agg.missing.join(', ')}</div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Tab Toggle */}
        {responses.length > 0 && (
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            {['aggregate', 'individual'].map(t => (
              <button
                key={t}
                style={{
                  ...s.btn,
                  background: tab === t ? '#1b6ca8' : '#1a1a2e',
                  color: tab === t ? '#fff' : '#8888aa',
                  border: '1px solid ' + (tab === t ? '#3ba4e0' : '#2a2a40'),
                  textTransform: 'capitalize',
                }}
                onClick={() => setTab(t)}
              >
                {t === 'aggregate' ? 'Aggregate Dashboard' : 'Individual View'}
              </button>
            ))}
          </div>
        )}

        {/* Individual View */}
        {tab === 'individual' && responses.length > 0 && (
          <>
            <div style={{ marginBottom: 16 }}>
              <select
                style={s.select}
                value={viewPhysician}
                onChange={e => setViewPhysician(e.target.value)}
              >
                <option value="">Select physician...</option>
                {responses.sort((a, b) => a.physician.localeCompare(b.physician)).map(r => (
                  <option key={r.physician} value={r.physician}>{r.physician}</option>
                ))}
              </select>
            </div>
            {selectedData && <IndividualView data={selectedData} />}
          </>
        )}

        {/* Aggregate Dashboard */}
        {tab === 'aggregate' && agg && (
          <>
            {/* Block Preferences */}
            <div style={s.card}>
              <h2 style={s.h2}>Block Preferences</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <h3 style={s.h3}>Preferred Nights On</h3>
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={agg.nightsOnHist}>
                      <XAxis dataKey="label" tick={{ fill: '#8888aa', fontSize: 11 }} />
                      <YAxis allowDecimals={false} tick={{ fill: '#8888aa', fontSize: 11 }} />
                      <Tooltip contentStyle={tooltipStyle} />
                      <Bar dataKey="count" fill="#3ba4e0" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div>
                  <h3 style={s.h3}>Preferred Days Off</h3>
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={agg.daysOffHist}>
                      <XAxis dataKey="label" tick={{ fill: '#8888aa', fontSize: 11 }} />
                      <YAxis allowDecimals={false} tick={{ fill: '#8888aa', fontSize: 11 }} />
                      <Tooltip contentStyle={tooltipStyle} />
                      <Bar dataKey="count" fill="#12b886" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 12 }}>
                <div style={s.callout}>
                  <div style={{ fontSize: 10, color: '#6666aa', textTransform: 'uppercase', letterSpacing: 0.5 }}>Max Consecutive Tolerance</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: '#f0f4fa' }}>avg {agg.avgMaxConsec.toFixed(1)}</div>
                  <div style={{ fontSize: 11, color: '#8888aa' }}>range {agg.rangeMaxConsec[0]}–{agg.rangeMaxConsec[1]}</div>
                </div>
                <div style={s.callout}>
                  <div style={{ fontSize: 10, color: '#6666aa', textTransform: 'uppercase', letterSpacing: 0.5 }}>Min Recovery Days</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: '#f0f4fa' }}>avg {agg.avgMinRecovery.toFixed(1)}</div>
                  <div style={{ fontSize: 11, color: '#8888aa' }}>range {agg.rangeMinRecovery[0]}–{agg.rangeMinRecovery[1]}</div>
                </div>
              </div>
            </div>

            {/* Day Preferences */}
            <div style={s.card}>
              <h2 style={s.h2}>Day Preferences</h2>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={dayHeatData}>
                  <XAxis dataKey="name" tick={{ fill: '#8888aa', fontSize: 11 }} />
                  <YAxis allowDecimals={false} tick={{ fill: '#8888aa', fontSize: 11 }} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend wrapperStyle={{ fontSize: 11, color: '#8888aa' }} />
                  <Bar dataKey="Least Desired" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Most Desired" fill="#12b886" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 8 }}>
                <div style={s.callout}>
                  <div style={{ fontSize: 10, color: '#ef4444', textTransform: 'uppercase', letterSpacing: 0.5 }}>Most Avoided Day</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: '#f0f4fa' }}>{agg.topLeast} ({agg.topLeastCount} of {agg.n})</div>
                </div>
                <div style={s.callout}>
                  <div style={{ fontSize: 10, color: '#12b886', textTransform: 'uppercase', letterSpacing: 0.5 }}>Most Desired Day</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: '#f0f4fa' }}>{agg.topMost} ({agg.topMostCount} of {agg.n})</div>
                </div>
              </div>
            </div>

            {/* Time Preferences */}
            <div style={s.card}>
              <h2 style={s.h2}>Time Preferences</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <h3 style={s.h3}>Preferred Start Time</h3>
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={startTimeData}>
                      <XAxis dataKey="name" tick={{ fill: '#8888aa', fontSize: 11 }} />
                      <YAxis allowDecimals={false} tick={{ fill: '#8888aa', fontSize: 11 }} />
                      <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${v} physician${v !== 1 ? 's' : ''}`, '#1 pick']} />
                      <Bar dataKey="count" fill="#a855f7" radius={[4, 4, 0, 0]}>
                        {startTimeData.map((entry, i) => (
                          <Cell key={i} fill={i === 0 ? '#a855f7' : '#4a3a6a'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div>
                  <h3 style={s.h3}>Preferred End Time</h3>
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={endTimeData}>
                      <XAxis dataKey="name" tick={{ fill: '#8888aa', fontSize: 11 }} />
                      <YAxis allowDecimals={false} tick={{ fill: '#8888aa', fontSize: 11 }} />
                      <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${v} physician${v !== 1 ? 's' : ''}`, '#1 pick']} />
                      <Bar dataKey="count" fill="#f472b6" radius={[4, 4, 0, 0]}>
                        {endTimeData.map((entry, i) => (
                          <Cell key={i} fill={i === 0 ? '#f472b6' : '#6a3a5a'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              {(() => {
                const startTop = startTimeData[0];
                const endTop = endTimeData[0];
                if (startTop?.count > 0 || endTop?.count > 0) {
                  return (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 8 }}>
                      {startTop?.count > 0 && (
                        <div style={s.callout}>
                          <div style={{ fontSize: 10, color: '#a855f7', textTransform: 'uppercase', letterSpacing: 0.5 }}>Top Start Time</div>
                          <div style={{ fontSize: 16, fontWeight: 700, color: '#f0f4fa' }}>{startTop.name} ({startTop.count} of {agg.n})</div>
                        </div>
                      )}
                      {endTop?.count > 0 && (
                        <div style={s.callout}>
                          <div style={{ fontSize: 10, color: '#f472b6', textTransform: 'uppercase', letterSpacing: 0.5 }}>Top End Time</div>
                          <div style={{ fontSize: 16, fontWeight: 700, color: '#f0f4fa' }}>{endTop.name} ({endTop.count} of {agg.n})</div>
                        </div>
                      )}
                    </div>
                  );
                }
                return null;
              })()}
            </div>

            {/* Location Preferences */}
            <div style={s.card}>
              <h2 style={s.h2}>Location Preferences</h2>
              <h3 style={s.h3}>Hospital Popularity (Top 3 Picks)</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={hospPopData}>
                  <XAxis dataKey="name" tick={{ fill: '#8888aa', fontSize: 11 }} />
                  <YAxis allowDecimals={false} tick={{ fill: '#8888aa', fontSize: 11 }} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {hospPopData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>

              <h3 style={{ ...s.h3, margin: '16px 0 8px' }}>Average Commute (minutes)</h3>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      {HOSPITALS.map(h => <th key={h.name} style={s.th}>{h.name}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      {HOSPITALS.map(h => (
                        <td key={h.name} style={{ ...s.td, fontWeight: 700, color: agg.avgCommute[h.name] > 0 ? '#f0f4fa' : '#444' }}>
                          {agg.avgCommute[h.name] > 0 ? agg.avgCommute[h.name].toFixed(0) : '—'}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>

              <h3 style={{ ...s.h3, margin: '16px 0 8px' }}>Alternate Location Distribution</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {HOSPITALS.filter(h => agg.altCounts[h.name] > 0).map(h => (
                  <div key={h.name} style={{ ...s.callout, padding: '6px 12px' }}>
                    <span style={{ fontWeight: 700, color: '#e0e8f0' }}>{h.name}</span>
                    <span style={{ marginLeft: 6, color: '#8888aa', fontSize: 12 }}>{agg.altCounts[h.name]}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Holiday Preferences */}
            <div style={s.card}>
              <h2 style={s.h2}>Holiday Preferences</h2>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={holidayData} layout="vertical">
                  <XAxis type="number" allowDecimals={false} tick={{ fill: '#8888aa', fontSize: 11 }} />
                  <YAxis type="category" dataKey="name" tick={{ fill: '#8888aa', fontSize: 11 }} width={100} />
                  <Tooltip
                    contentStyle={tooltipStyle}
                    formatter={(v, _, props) => [v, props.payload.fullName]}
                  />
                  <Bar dataKey="count" fill="#fbbf24" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
              <div style={s.callout}>
                <div style={{ fontSize: 10, color: '#fbbf24', textTransform: 'uppercase', letterSpacing: 0.5 }}>Most Requested Off</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#f0f4fa' }}>
                  {agg.topHoliday} ({agg.topHolidayCount} of {agg.n})
                </div>
              </div>
            </div>

            {/* Collaboration */}
            <div style={s.card}>
              <h2 style={s.h2}>Swap & Collaboration</h2>

              {/* Swap Willingness Pie */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <div>
                  <h3 style={s.h3}>Swap Willingness</h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={swapPieData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={70}
                        label={({ name, value }) => `${name}: ${value}`}
                        labelLine={false}
                      >
                        {swapPieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                      </Pie>
                      <Tooltip contentStyle={tooltipStyle} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div>
                  <h3 style={s.h3}>Motivator Rankings</h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={motivatorData} layout="vertical">
                      <XAxis type="number" allowDecimals={false} tick={{ fill: '#8888aa', fontSize: 11 }} />
                      <YAxis type="category" dataKey="name" tick={{ fill: '#8888aa', fontSize: 11 }} width={75} />
                      <Tooltip contentStyle={tooltipStyle} />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                      <Bar dataKey="#1" stackId="a" fill="#12b886" />
                      <Bar dataKey="#2" stackId="a" fill="#3ba4e0" />
                      <Bar dataKey="#3" stackId="a" fill="#fbbf24" />
                      <Bar dataKey="#4" stackId="a" fill="#ef4444" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                  {agg.motivatorConsensus && (
                    <div style={{ ...s.callout, borderColor: '#12b886' }}>
                      <div style={{ fontSize: 12, color: '#12b886', fontWeight: 600 }}>
                        Consensus: {MOTIVATOR_LABELS[agg.motivatorConsensus.key]} ranked #1 by {agg.motivatorConsensus.count} of {agg.n}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Desirability Stacked Bars */}
              <h3 style={s.h3}>Desirability Factors</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={desirData} layout="vertical">
                  <XAxis type="number" allowDecimals={false} tick={{ fill: '#8888aa', fontSize: 11 }} />
                  <YAxis type="category" dataKey="name" tick={{ fill: '#8888aa', fontSize: 10 }} width={110} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="Not at all" stackId="a" fill="#ef4444" />
                  <Bar dataKey="Somewhat" stackId="a" fill="#fbbf24" />
                  <Bar dataKey="Very much" stackId="a" fill="#12b886" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
              {agg.strongestDesir && (
                <div style={s.callout}>
                  <div style={{ fontSize: 12, color: '#12b886', fontWeight: 600 }}>
                    Strongest swap motivator: {DESIR_LABELS[agg.strongestDesir]} ({agg.strongestDesirCount} of {agg.n} said &quot;Very much&quot;)
                  </div>
                </div>
              )}

              {/* Constraints Summary */}
              <h3 style={{ ...s.h3, marginTop: 16 }}>Constraints Summary</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                <div style={s.callout}>
                  <div style={{ fontSize: 10, color: '#6666aa', textTransform: 'uppercase', letterSpacing: 0.5 }}>Max Extra Consecutive Nights</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: '#f0f4fa' }}>avg {agg.avgMaxExtra.toFixed(1)} / med {agg.medianMaxExtra.toFixed(1)}</div>
                </div>
                <div style={s.callout}>
                  <div style={{ fontSize: 10, color: '#6666aa', textTransform: 'uppercase', letterSpacing: 0.5 }}>Min Notice Days</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: '#f0f4fa' }}>avg {agg.avgMinNotice.toFixed(1)} / med {agg.medianMinNotice.toFixed(1)}</div>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <SmallPie
                  title="Hospital Flexibility"
                  data={[
                    { name: 'Same only', value: agg.hospFlexCounts.same_only },
                    { name: 'Assigned', value: agg.hospFlexCounts.assigned_only },
                    { name: 'Any', value: agg.hospFlexCounts.any },
                  ].filter(d => d.value > 0)}
                />
                <SmallPie title="Extra Shift Willingness" data={ymnPieData(agg.extraShiftCounts)} />
              </div>
            </div>

            {/* Block Swap Summary */}
            <div style={s.card}>
              <h2 style={s.h2}>Block Swap Summary</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <SmallPie title="Full Block Willingness" data={ymnPieData(agg.fullBlockCounts)} />
                <SmallPie title="Preferred Block Trade" data={ymnPieData(agg.prefBlockCounts)} />
              </div>
              <h3 style={s.h3}>Trade Flexibility</h3>
              <ResponsiveContainer width="100%" height={150}>
                <BarChart data={tradeFlexData}>
                  <XAxis dataKey="name" tick={{ fill: '#8888aa', fontSize: 11 }} />
                  <YAxis allowDecimals={false} tick={{ fill: '#8888aa', fontSize: 11 }} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    <Cell fill="#3ba4e0" />
                    <Cell fill="#12b886" />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Weekend Summary */}
            <div style={s.card}>
              <h2 style={s.h2}>Weekend Summary</h2>

              <h3 style={s.h3}>Minimum Weekends Off Distribution</h3>
              <ResponsiveContainer width="100%" height={150}>
                <BarChart data={agg.weekendHist}>
                  <XAxis dataKey="label" tick={{ fill: '#8888aa', fontSize: 11 }} />
                  <YAxis allowDecimals={false} tick={{ fill: '#8888aa', fontSize: 11 }} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="count" fill="#a855f7" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
              <div style={s.callout}>
                <div style={{ fontSize: 12, color: '#a855f7', fontWeight: 600 }}>
                  Average minimum weekends off: {agg.avgMinWeekends.toFixed(1)} per month
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginTop: 16 }}>
                <SmallPie title="Extra Weeknight for Weekend" data={ymnPieData(agg.extraWeeknightCounts)} />
                <SmallPie title="Split Block for Weekend" data={ymnPieData(agg.splitBlockCounts)} />
                <SmallPie title="Worse Hospital for Weekend" data={ymnPieData(agg.worseHospCounts)} />
              </div>

              <h3 style={{ ...s.h3, marginTop: 16 }}>Weekend Night Priority</h3>
              <ResponsiveContainer width="100%" height={150}>
                <BarChart data={weekendNightData}>
                  <XAxis dataKey="name" tick={{ fill: '#8888aa', fontSize: 11 }} />
                  <YAxis allowDecimals={false} tick={{ fill: '#8888aa', fontSize: 11 }} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="#1" stackId="a" fill="#12b886" />
                  <Bar dataKey="#2" stackId="a" fill="#3ba4e0" />
                  <Bar dataKey="#3" stackId="a" fill="#fbbf24" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
              <div style={s.callout}>
                <div style={{ fontSize: 12, color: '#f472b6', fontWeight: 600 }}>
                  Most valued weekend night: {WEEKEND_NIGHT_LABELS[agg.bestWeekendNight]} ({agg.bestWeekendNightCount} of {agg.n} ranked it #1)
                </div>
              </div>
            </div>

            {/* Tracking & Export */}
            <div style={s.card}>
              <h2 style={s.h2}>Data Management</h2>
              <p style={{ fontSize: 15, color: '#e0e8f0', marginBottom: 12 }}>
                <strong>{agg.n}</strong> of <strong>{TOTAL_MDS}</strong> preferences collected
              </p>
              {agg.missing.length > 0 && (
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 11, color: '#ef4444', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>
                    Missing Responses
                  </div>
                  <div style={{ fontSize: 13, color: '#c0c8e0' }}>{agg.missing.join(', ')}</div>
                </div>
              )}
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <button style={{ ...s.btn, ...s.btnSecondary }} onClick={exportCSV}>Export CSV</button>
                <button style={{ ...s.btn, ...s.btnSecondary }} onClick={exportJSON}>Export Raw JSON</button>
                <button style={{ ...s.btn, ...s.btnDanger }} onClick={clearAll}>Clear All Data</button>
              </div>
            </div>
          </>
        )}

        <div style={{ textAlign: 'center', marginTop: 24, fontSize: 11, color: '#444466' }}>
          Nocturnist Schedule Analysis &middot; v1.0 &middot; Preference Import Tool
        </div>
      </div>
    </div>
  );
}

// Helper: create histogram data
function histogram(values, min, max) {
  const bins = [];
  for (let i = min; i <= max; i++) {
    bins.push({ label: String(i), count: values.filter(v => v === i).length });
  }
  return bins;
}
