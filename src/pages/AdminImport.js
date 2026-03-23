import { useState, useMemo, useCallback } from 'react';
import { Link } from 'react-router';
import { PATTERNS, START_DAYS, APPS_SCRIPT_URL } from '../data/constants';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  Cell,
} from 'recharts';

const LS_KEY = 'nocturnist_survey_responses';

function loadResponses() {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY)) || [];
  } catch { return []; }
}

function saveResponses(arr) {
  localStorage.setItem(LS_KEY, JSON.stringify(arr));
}

function decodePayload(code) {
  const json = decodeURIComponent(escape(atob(code.trim())));
  const data = JSON.parse(json);
  // Support v2.1 (14 ratings, 9 patterns) and v2.0 (10 ratings, 5 patterns)
  if (data.surveyVersion === '2.1' || data.surveyVersion === '2.0') {
    if (!data.ratings || !data.top3) throw new Error('Invalid v2.x schema');
    return data;
  }
  // Legacy v1
  if (data.v === 1 && data.ratings && data.ranking) {
    return data;
  }
  throw new Error('Unknown schema');
}

function isV2(data) {
  return data.surveyVersion === '2.0' || data.surveyVersion === '2.1';
}

const COLORS = ['#3ba4e0', '#12b886', '#fbbf24', '#ef4444', '#a855f7', '#f97316', '#06b6d4', '#ec4899', '#84cc16'];

export default function AdminImport() {
  const [responses, setResponses] = useState(loadResponses);
  const [inputCode, setInputCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [fetching, setFetching] = useState(false);

  const addResponse = useCallback(() => {
    setError(''); setSuccess('');
    try {
      const data = decodePayload(inputCode);
      const existing = loadResponses();
      const ts = data.timestamp || data.ts;
      const dup = existing.find(r => (r.timestamp || r.ts) === ts);
      if (dup) {
        if (!window.confirm('A response with this timestamp already exists. Add anyway?')) return;
      }
      const updated = [...existing, data];
      saveResponses(updated);
      setResponses(updated);
      setInputCode('');
      setSuccess('Response #' + updated.length + ' imported (' + (data.surveyVersion || 'v1') + ').');
    } catch {
      setError('Invalid code. Please check and try again.');
    }
  }, [inputCode]);

  const clearAll = useCallback(() => {
    if (window.confirm('Delete all imported responses? This cannot be undone.')) {
      saveResponses([]);
      setResponses([]);
    }
  }, []);

  const fetchFromSheet = useCallback(async () => {
    setError(''); setSuccess(''); setFetching(true);
    try {
      const res = await fetch(APPS_SCRIPT_URL + '?sheet=survey');
      const json = await res.json();
      if (json.status !== 'ok') throw new Error(json.message || 'Fetch failed');
      if (!json.rows || !json.rows.length) {
        setSuccess('No rows found in the survey sheet.');
        setFetching(false);
        return;
      }
      const existing = loadResponses();
      let added = 0;
      json.rows.forEach(row => {
        try {
          const data = decodePayload(row.payload);
          const ts = data.timestamp || data.ts;
          const dup = existing.find(r => (r.timestamp || r.ts) === ts);
          if (!dup) {
            existing.push(data);
            added++;
          }
        } catch { /* skip invalid rows */ }
      });
      saveResponses(existing);
      setResponses([...existing]);
      setSuccess(`Fetched ${json.rows.length} rows from Google Sheet. ${added} new response(s) imported.`);
    } catch (err) {
      setError('Fetch failed: ' + err.message);
    }
    setFetching(false);
  }, []);

  const exportJSON = useCallback(() => {
    const blob = new Blob([JSON.stringify(responses, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'survey_responses.json'; a.click();
    URL.revokeObjectURL(url);
  }, [responses]);

  const exportCSV = useCallback(() => {
    const v2Responses = responses.filter(isV2);
    if (!v2Responses.length) return;
    const header = ['Response#', 'Version', 'Timestamp', 'VariantId', 'PatternId', 'StartDay', 'Overall', 'Accept', 'Comment', 'InTop3'];
    const rows = [];
    v2Responses.forEach((r, ri) => {
      r.ratings.forEach(rating => {
        rows.push([
          ri + 1, r.surveyVersion, r.timestamp,
          rating.variantId, rating.patternId, rating.startDay,
          rating.overall, rating.accept, rating.comment || '',
          r.top3.includes(rating.variantId) ? 'Yes' : 'No',
        ]);
      });
    });
    const csv = [header, ...rows].map(r => r.map(c => '"' + String(c).replace(/"/g, '""') + '"').join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'survey_results.csv'; a.click();
    URL.revokeObjectURL(url);
  }, [responses]);

  // ─── Aggregations (v2.x only) ───
  const agg = useMemo(() => {
    const v2Responses = responses.filter(isV2);
    if (!v2Responses.length) return null;
    const n = v2Responses.length;

    // Per-pattern aggregation
    const patternStats = {};
    PATTERNS.forEach(p => {
      patternStats[p.id] = { ratings: [], accepts: 0, rejects: 0, top3Count: 0, totalRatings: 0 };
    });

    // Per-variant aggregation
    const variantStats = {};

    v2Responses.forEach(r => {
      r.ratings.forEach(rating => {
        const pid = rating.patternId;
        if (patternStats[pid]) {
          patternStats[pid].ratings.push(rating.overall);
          patternStats[pid].totalRatings++;
          if (rating.accept) patternStats[pid].accepts++;
          else patternStats[pid].rejects++;
        }

        const vid = rating.variantId;
        if (!variantStats[vid]) {
          variantStats[vid] = { ratings: [], accepts: 0, rejects: 0, top3Count: 0, patternId: pid, startDay: rating.startDay };
        }
        variantStats[vid].ratings.push(rating.overall);
        if (rating.accept) variantStats[vid].accepts++;
        else variantStats[vid].rejects++;
      });

      r.top3.forEach(vid => {
        if (variantStats[vid]) variantStats[vid].top3Count++;
        // Also count pattern-level top3
        const rating = r.ratings.find(rt => rt.variantId === vid);
        if (rating && patternStats[rating.patternId]) {
          patternStats[rating.patternId].top3Count++;
        }
      });
    });

    // Pattern summary
    const patternSummary = PATTERNS.map(p => {
      const ps = patternStats[p.id];
      const avgRating = ps.ratings.length ? ps.ratings.reduce((a, b) => a + b, 0) / ps.ratings.length : 0;
      const acceptRate = ps.totalRatings ? ps.accepts / ps.totalRatings : 0;
      return { ...p, avgRating, acceptRate, top3Count: ps.top3Count, totalRatings: ps.totalRatings };
    });

    // Top variants by top3 count
    const topVariants = Object.entries(variantStats)
      .map(([vid, vs]) => ({ vid, ...vs, avgRating: vs.ratings.reduce((a, b) => a + b, 0) / vs.ratings.length }))
      .sort((a, b) => b.top3Count - a.top3Count || b.avgRating - a.avgRating)
      .slice(0, 10);

    // Comments
    const comments = [];
    v2Responses.forEach(r => {
      r.ratings.forEach(rating => {
        if (rating.comment) comments.push({ variant: rating.variantId, comment: rating.comment });
      });
    });

    // Version breakdown
    const v20Count = v2Responses.filter(r => r.surveyVersion === '2.0').length;
    const v21Count = v2Responses.filter(r => r.surveyVersion === '2.1').length;

    return { n, patternSummary, variantStats, topVariants, comments, v20Count, v21Count };
  }, [responses]);

  // ─── Chart data ───
  const avgRatingData = useMemo(() => {
    if (!agg) return [];
    return agg.patternSummary.map(p => ({ name: p.label, avg: Number(p.avgRating.toFixed(2)) }));
  }, [agg]);

  const acceptRateData = useMemo(() => {
    if (!agg) return [];
    return agg.patternSummary.map(p => ({ name: p.label, rate: Number((p.acceptRate * 100).toFixed(1)) }));
  }, [agg]);

  const top3Data = useMemo(() => {
    if (!agg) return [];
    return agg.patternSummary.map(p => ({ name: p.label, count: p.top3Count }));
  }, [agg]);

  // ─── Variant heatmap data (9 patterns × 7 days) ───
  const heatmapData = useMemo(() => {
    if (!agg) return null;
    return PATTERNS.map(p => {
      const row = { pattern: p.label, patternId: p.id };
      START_DAYS.forEach(day => {
        const vid = p.id + '__' + day;
        const vs = agg.variantStats[vid];
        row[day] = vs ? Number((vs.ratings.reduce((a, b) => a + b, 0) / vs.ratings.length).toFixed(1)) : null;
      });
      return row;
    });
  }, [agg]);

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
      fontFamily: "'SF Mono', Consolas, monospace", fontSize: 13,
      resize: 'vertical',
    },
    btn: {
      padding: '12px 24px', borderRadius: 10, border: 'none',
      fontSize: 14, fontWeight: 700, cursor: 'pointer',
      transition: 'all 0.2s',
    },
    btnPrimary: {
      background: 'linear-gradient(135deg, #1b6ca8, #3ba4e0)', color: '#fff',
    },
    btnDanger: {
      background: '#2a1520', color: '#ef4444', border: '1px solid #3a2030',
    },
    btnSecondary: {
      background: '#1a1a2e', color: '#8888aa', border: '1px solid #2a2a40',
    },
    tag: {
      fontSize: 10, fontWeight: 700, letterSpacing: 2.5,
      textTransform: 'uppercase', color: '#3ba4e0', marginBottom: 6,
    },
    h2: { fontSize: 14, fontWeight: 700, color: '#8888aa', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 12 },
    h3: { fontSize: 13, fontWeight: 700, color: '#c0c0d0', marginBottom: 12 },
    th: {
      padding: '10px 12px', textAlign: 'center', color: '#a0b8d8',
      fontWeight: 600, fontSize: 11, textTransform: 'uppercase',
      letterSpacing: 0.5, background: '#0f2744',
    },
    td: { padding: '10px 12px', textAlign: 'center', fontSize: 13 },
  };

  const dayLabel = d => d.charAt(0).toUpperCase() + d.slice(1, 3);

  return (
    <div style={s.page}>
      <div style={s.wrap}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={s.tag}>NOCTURNIST SCHEDULING</div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: '#f0f4fa' }}>Survey Import</h1>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Link to="/" style={{ ...s.btn, ...s.btnSecondary, textDecoration: 'none' }}>Explorer</Link>
            <Link to="/admin/preferences" style={{ ...s.btn, ...s.btnSecondary, textDecoration: 'none' }}>Preferences</Link>
            <Link to="/admin/opinions" style={{ ...s.btn, ...s.btnSecondary, textDecoration: 'none' }}>Opinions</Link>
          </div>
        </div>

        {/* Input card */}
        <div style={s.card}>
          <h2 style={s.h2}>Paste Response Code</h2>
          <textarea
            style={s.textarea}
            placeholder="Paste a physician's response code here..."
            value={inputCode}
            onChange={e => setInputCode(e.target.value)}
          />
          <div style={{ display: 'flex', gap: 12, marginTop: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            <button
              style={{ ...s.btn, ...s.btnPrimary }}
              onClick={addResponse}
              disabled={!inputCode.trim()}
            >
              Add Response
            </button>
            <button
              style={{ ...s.btn, ...s.btnSecondary, background: 'linear-gradient(135deg, #0f7b5f, #12b886)', color: '#fff', border: 'none', opacity: fetching ? 0.6 : 1 }}
              onClick={fetchFromSheet}
              disabled={fetching}
            >
              {fetching ? 'Fetching...' : '⬇ Fetch from Google Sheet'}
            </button>
            <span style={{ fontSize: 14, color: '#8888aa', fontWeight: 600 }}>
              {responses.length} responses imported
            </span>
          </div>
          {error && <div style={{ color: '#ef4444', fontSize: 13, marginTop: 8 }}>{error}</div>}
          {success && <div style={{ color: '#12b886', fontSize: 13, marginTop: 8 }}>{success}</div>}
        </div>

        {/* Dashboard */}
        {agg && (
          <>
            {/* Version info */}
            {(agg.v20Count > 0 && agg.v21Count > 0) && (
              <div style={{ ...s.card, padding: '12px 16px', background: '#1a1520', border: '1px solid #3a2a50' }}>
                <span style={{ fontSize: 12, color: '#a888cc' }}>
                  Mixed versions: {agg.v21Count} v2.1 + {agg.v20Count} v2.0 responses
                </span>
              </div>
            )}

            {/* Average Rating by Pattern */}
            <div style={s.card}>
              <h2 style={s.h2}>Pattern Ratings</h2>

              <h3 style={s.h3}>Average Rating (1-5)</h3>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={avgRatingData} layout="vertical">
                  <XAxis type="number" domain={[0, 5]} tick={{ fill: '#8888aa', fontSize: 11 }} />
                  <YAxis type="category" dataKey="name" tick={{ fill: '#8888aa', fontSize: 10 }} width={160} />
                  <Tooltip
                    contentStyle={{ background: '#14142a', border: '1px solid #2a2a40', borderRadius: 8 }}
                    labelStyle={{ color: '#e0e0f0' }}
                  />
                  <Bar dataKey="avg" radius={[0, 6, 6, 0]}>
                    {avgRatingData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>

              {/* Acceptance Rate */}
              <h3 style={{ ...s.h3, marginTop: 20 }}>Acceptance Rate (%)</h3>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={acceptRateData} layout="vertical">
                  <XAxis type="number" domain={[0, 100]} tick={{ fill: '#8888aa', fontSize: 11 }} />
                  <YAxis type="category" dataKey="name" tick={{ fill: '#8888aa', fontSize: 10 }} width={160} />
                  <Tooltip
                    contentStyle={{ background: '#14142a', border: '1px solid #2a2a40', borderRadius: 8 }}
                    labelStyle={{ color: '#e0e0f0' }}
                    formatter={v => v + '%'}
                  />
                  <Bar dataKey="rate" radius={[0, 6, 6, 0]}>
                    {acceptRateData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>

              {/* Top 3 Frequency */}
              <h3 style={{ ...s.h3, marginTop: 20 }}>Top 3 Picks by Pattern</h3>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={top3Data} layout="vertical">
                  <XAxis type="number" allowDecimals={false} tick={{ fill: '#8888aa', fontSize: 11 }} />
                  <YAxis type="category" dataKey="name" tick={{ fill: '#8888aa', fontSize: 10 }} width={160} />
                  <Tooltip
                    contentStyle={{ background: '#14142a', border: '1px solid #2a2a40', borderRadius: 8 }}
                    labelStyle={{ color: '#e0e0f0' }}
                  />
                  <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                    {top3Data.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Variant Heatmap */}
            <div style={s.card}>
              <h2 style={s.h2}>Variant Heatmap</h2>
              <p style={{ fontSize: 12, color: '#6666aa', marginBottom: 12 }}>
                Average rating by pattern &times; start day ({PATTERNS.length} &times; 7 = {PATTERNS.length * 7} variants)
              </p>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th style={s.th}>Pattern</th>
                      {START_DAYS.map(d => <th key={d} style={{ ...s.th, fontSize: 10 }}>{dayLabel(d)}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {heatmapData && heatmapData.map((row, i) => (
                      <tr key={row.patternId} style={{ background: i % 2 ? '#14142a' : '#16162c' }}>
                        <td style={{ ...s.td, textAlign: 'left', fontWeight: 600, color: '#e0e8f0', fontSize: 11 }}>{row.pattern}</td>
                        {START_DAYS.map(d => {
                          const val = row[d];
                          if (val === null) return <td key={d} style={{ ...s.td, color: '#333' }}>—</td>;
                          const intensity = val / 5;
                          const bg = `rgba(59, 164, 224, ${intensity * 0.6})`;
                          return (
                            <td key={d} style={{ ...s.td, background: bg, fontWeight: 700, color: '#f0f4fa' }}>
                              {val}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Top Variants */}
            <div style={s.card}>
              <h2 style={s.h2}>Top Variants (by Top-3 Picks)</h2>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      {['#', 'Variant', 'Avg Rating', 'Accept %', 'Top 3 Picks'].map(h => (
                        <th key={h} style={s.th}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {agg.topVariants.map((v, i) => {
                      const total = v.accepts + v.rejects;
                      const acceptPct = total ? ((v.accepts / total) * 100).toFixed(0) : '—';
                      const p = PATTERNS.find(pp => pp.id === v.patternId);
                      return (
                        <tr key={v.vid} style={{ background: i % 2 ? '#14142a' : '#16162c' }}>
                          <td style={{ ...s.td, fontWeight: 700, color: '#3ba4e0' }}>{i + 1}</td>
                          <td style={{ ...s.td, textAlign: 'left', fontWeight: 600, color: '#e0e8f0' }}>
                            {p ? p.label : v.patternId}
                            <span style={{ color: '#6666aa', fontWeight: 400 }}> — {v.startDay}</span>
                          </td>
                          <td style={{ ...s.td, fontWeight: 700, color: '#f0f4fa' }}>{v.avgRating.toFixed(1)}</td>
                          <td style={{ ...s.td, color: Number(acceptPct) >= 70 ? '#12b886' : Number(acceptPct) >= 40 ? '#fbbf24' : '#ef4444' }}>
                            {acceptPct}%
                          </td>
                          <td style={{ ...s.td, fontWeight: 800, color: '#12b886', fontSize: 16 }}>{v.top3Count}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pattern Summary Table */}
            <div style={s.card}>
              <h2 style={s.h2}>Pattern Summary</h2>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      {['Pattern', 'Type', 'Cycle', '~Nights/Yr', 'Avg Rating', 'Accept %', 'Top 3', 'Responses'].map(h => (
                        <th key={h} style={s.th}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {agg.patternSummary.map((p, i) => (
                      <tr key={p.id} style={{ background: i % 2 ? '#14142a' : '#16162c' }}>
                        <td style={{ ...s.td, textAlign: 'left', fontWeight: 600, color: '#e0e8f0' }}>{p.label}</td>
                        <td style={{ ...s.td, fontSize: 11 }}>
                          <span style={{
                            padding: '2px 8px', borderRadius: 10, fontSize: 10, fontWeight: 600,
                            background: p.type === 'split' ? '#3d352020' : '#1b6ca820',
                            color: p.type === 'split' ? '#b8a040' : '#3ba4e0',
                            border: p.type === 'split' ? '1px solid #7a6a3040' : '1px solid #3ba4e040',
                          }}>
                            {p.type}
                          </span>
                        </td>
                        <td style={s.td}>{p.cycle}d</td>
                        <td style={s.td}>{p.nightsPerYear}</td>
                        <td style={{ ...s.td, fontWeight: 700, color: '#f0f4fa' }}>{p.avgRating.toFixed(1)}</td>
                        <td style={{ ...s.td, color: p.acceptRate >= 0.7 ? '#12b886' : p.acceptRate >= 0.4 ? '#fbbf24' : '#ef4444' }}>
                          {(p.acceptRate * 100).toFixed(0)}%
                        </td>
                        <td style={{ ...s.td, fontWeight: 700, color: '#12b886' }}>{p.top3Count}</td>
                        <td style={{ ...s.td, color: '#8888aa' }}>{p.totalRatings}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Comments */}
            {agg.comments.length > 0 && (
              <div style={s.card}>
                <h2 style={s.h2}>Comments ({agg.comments.length})</h2>
                {agg.comments.slice(0, 20).map((c, i) => (
                  <div key={i} style={{
                    background: '#0d1b2a', border: '1px solid #1b3a5c', borderRadius: 8,
                    padding: '10px 14px', marginBottom: 6,
                  }}>
                    <div style={{ fontSize: 10, color: '#6666aa', marginBottom: 4 }}>{c.variant}</div>
                    <div style={{ fontSize: 13, color: '#c0c8e0', fontStyle: 'italic' }}>"{c.comment}"</div>
                  </div>
                ))}
              </div>
            )}

            {/* Response Summary + Actions */}
            <div style={s.card}>
              <h2 style={s.h2}>Response Summary</h2>
              <p style={{ fontSize: 15, color: '#e0e8f0', marginBottom: 12 }}>
                <strong>{agg.n}</strong> responses collected
              </p>

              <div style={{ display: 'flex', gap: 12, marginTop: 16, flexWrap: 'wrap' }}>
                <button style={{ ...s.btn, ...s.btnSecondary }} onClick={exportCSV}>
                  Export CSV
                </button>
                <button style={{ ...s.btn, ...s.btnSecondary }} onClick={exportJSON}>
                  Export Raw JSON
                </button>
                <button style={{ ...s.btn, ...s.btnDanger }} onClick={clearAll}>
                  Clear All Data
                </button>
              </div>
            </div>
          </>
        )}

        <div style={{ textAlign: 'center', marginTop: 24, fontSize: 11, color: '#444466' }}>
          Nocturnist Schedule Analysis &middot; v2.1 &middot; Admin Import Tool
        </div>
      </div>
    </div>
  );
}
