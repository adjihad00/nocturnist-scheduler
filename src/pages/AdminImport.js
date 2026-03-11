import { useState, useMemo, useCallback } from 'react';
import { Link } from 'react-router';
import { PATTERNS, RATING_FACTORS, TOTAL_MDS } from '../data/constants';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer,
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
  if (data.v !== 1 || !data.ratings || !data.ranking) throw new Error('Invalid schema');
  return data;
}

const COLORS = ['#3ba4e0', '#12b886', '#fbbf24', '#ef4444', '#a855f7'];
const FACTOR_COLORS = ['#3ba4e0', '#12b886', '#fbbf24', '#ef4444', '#a855f7'];

export default function AdminImport() {
  const [responses, setResponses] = useState(loadResponses);
  const [inputCode, setInputCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const addResponse = useCallback(() => {
    setError(''); setSuccess('');
    try {
      const data = decodePayload(inputCode);
      const existing = loadResponses();
      const dup = existing.find(r => r.ts === data.ts);
      if (dup) {
        if (!window.confirm('A response with this timestamp already exists. Add anyway?')) return;
      }
      const updated = [...existing, data];
      saveResponses(updated);
      setResponses(updated);
      setInputCode('');
      setSuccess('Response #' + updated.length + ' imported.');
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

  const exportJSON = useCallback(() => {
    const blob = new Blob([JSON.stringify(responses, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'survey_responses.json'; a.click();
    URL.revokeObjectURL(url);
  }, [responses]);

  const exportCSV = useCallback(() => {
    const header = ['Response#', 'Timestamp', ...PATTERNS.flatMap(p =>
      RATING_FACTORS.map(f => p.label + ' - ' + f.label)
    ), ...PATTERNS.map((_, i) => 'Rank#' + (i + 1)), 'Comment'];
    const rows = responses.map((r, i) => {
      const ratingCells = PATTERNS.flatMap(p =>
        RATING_FACTORS.map(f => (r.ratings[p.id] && r.ratings[p.id][f.key]) || '')
      );
      const rankCells = r.ranking.map(id => {
        const p = PATTERNS.find(x => x.id === id);
        return p ? p.label : id;
      });
      return [i + 1, r.ts, ...ratingCells, ...rankCells, r.comment || ''];
    });
    const csv = [header, ...rows].map(r => r.map(c => '"' + String(c).replace(/"/g, '""') + '"').join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'survey_results.csv'; a.click();
    URL.revokeObjectURL(url);
  }, [responses]);

  // ─── Aggregations ───
  const agg = useMemo(() => {
    if (!responses.length) return null;
    const n = responses.length;

    // Rank distribution
    const rankDist = {};
    PATTERNS.forEach(p => {
      rankDist[p.id] = { first: 0, second: 0, third: 0, fourth: 0, fifth: 0, total: 0 };
    });
    responses.forEach(r => {
      r.ranking.forEach((id, idx) => {
        const slots = ['first', 'second', 'third', 'fourth', 'fifth'];
        if (rankDist[id]) {
          rankDist[id][slots[idx]]++;
          rankDist[id].total += (idx + 1);
        }
      });
    });

    // Average rank
    const avgRank = {};
    PATTERNS.forEach(p => { avgRank[p.id] = rankDist[p.id].total / n; });

    // Factor averages
    const factorAvg = {};
    PATTERNS.forEach(p => {
      factorAvg[p.id] = {};
      RATING_FACTORS.forEach(f => {
        const vals = responses.map(r => r.ratings[p.id] && r.ratings[p.id][f.key]).filter(Boolean);
        factorAvg[p.id][f.key] = vals.length ? (vals.reduce((a, b) => a + b, 0) / vals.length) : 0;
      });
    });

    // Per-factor winner
    const factorWinners = {};
    RATING_FACTORS.forEach(f => {
      let best = null, bestVal = 0;
      PATTERNS.forEach(p => {
        if (factorAvg[p.id][f.key] > bestVal) {
          bestVal = factorAvg[p.id][f.key];
          best = p;
        }
      });
      factorWinners[f.key] = { pattern: best, avg: bestVal };
    });

    // Comments
    const comments = responses.map(r => r.comment).filter(Boolean);

    return { n, rankDist, avgRank, factorAvg, factorWinners, comments };
  }, [responses]);

  // ─── Chart data ───
  const firstPlaceData = useMemo(() => {
    if (!agg) return [];
    return PATTERNS.map(p => ({
      name: p.label,
      votes: agg.rankDist[p.id].first,
    }));
  }, [agg]);

  const avgRankData = useMemo(() => {
    if (!agg) return [];
    return PATTERNS.map(p => ({
      name: p.label,
      avg: Number(agg.avgRank[p.id].toFixed(2)),
    }));
  }, [agg]);

  const factorChartData = useMemo(() => {
    if (!agg) return [];
    return PATTERNS.map(p => {
      const row = { name: p.label };
      RATING_FACTORS.forEach(f => { row[f.label] = Number(agg.factorAvg[p.id][f.key].toFixed(2)); });
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
    wrap: { maxWidth: 900, margin: '0 auto' },
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
    th: {
      padding: '10px 12px', textAlign: 'center', color: '#a0b8d8',
      fontWeight: 600, fontSize: 11, textTransform: 'uppercase',
      letterSpacing: 0.5, background: '#0f2744',
    },
    td: { padding: '10px 12px', textAlign: 'center', fontSize: 13 },
  };

  return (
    <div style={s.page}>
      <div style={s.wrap}>
        {/* Header */}
        <div style={{ marginBottom: 20 }}>
          <div style={s.tag}>ADMIN TOOLS</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: '#f0f4fa', margin: 0 }}>
              Survey Import
            </h1>
            <div style={{ display: 'flex', gap: 12 }}>
              <Link to="/admin/preferences" style={{ color: '#3ba4e0', fontSize: 13, textDecoration: 'none' }}>
                Preference Import
              </Link>
              <Link to="/" style={{ color: '#3ba4e0', fontSize: 13, textDecoration: 'none' }}>
                &larr; Explorer
              </Link>
            </div>
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
            <span style={{ fontSize: 14, color: '#8888aa', fontWeight: 600 }}>
              {responses.length} of {TOTAL_MDS} responses imported
            </span>
          </div>
          {error && <div style={{ color: '#ef4444', fontSize: 13, marginTop: 8 }}>{error}</div>}
          {success && <div style={{ color: '#12b886', fontSize: 13, marginTop: 8 }}>{success}</div>}
        </div>

        {/* Dashboard */}
        {agg && (
          <>
            {/* Overall Ranking */}
            <div style={s.card}>
              <h2 style={s.h2}>Overall Ranking</h2>

              {/* #1 Votes bar chart */}
              <h3 style={{ fontSize: 13, fontWeight: 700, color: '#c0c0d0', marginBottom: 12 }}>
                First-Place Votes
              </h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={firstPlaceData}>
                  <XAxis dataKey="name" tick={{ fill: '#8888aa', fontSize: 11 }} />
                  <YAxis allowDecimals={false} tick={{ fill: '#8888aa', fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ background: '#14142a', border: '1px solid #2a2a40', borderRadius: 8 }}
                    labelStyle={{ color: '#e0e0f0' }}
                  />
                  <Bar dataKey="votes" radius={[6, 6, 0, 0]}>
                    {firstPlaceData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>

              {/* Average rank */}
              <h3 style={{ fontSize: 13, fontWeight: 700, color: '#c0c0d0', margin: '20px 0 12px' }}>
                Average Rank (1 = best)
              </h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={avgRankData}>
                  <XAxis dataKey="name" tick={{ fill: '#8888aa', fontSize: 11 }} />
                  <YAxis domain={[0, 5]} tick={{ fill: '#8888aa', fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ background: '#14142a', border: '1px solid #2a2a40', borderRadius: 8 }}
                    labelStyle={{ color: '#e0e0f0' }}
                  />
                  <Bar dataKey="avg" radius={[6, 6, 0, 0]}>
                    {avgRankData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>

              {/* Rank distribution table */}
              <h3 style={{ fontSize: 13, fontWeight: 700, color: '#c0c0d0', margin: '20px 0 12px' }}>
                Rank Distribution
              </h3>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      {['Pattern', '1st', '2nd', '3rd', '4th', '5th', 'Avg Rank'].map(h => (
                        <th key={h} style={s.th}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {PATTERNS.map((p, i) => {
                      const rd = agg.rankDist[p.id];
                      return (
                        <tr key={p.id} style={{ background: i % 2 ? '#14142a' : '#16162c' }}>
                          <td style={{ ...s.td, textAlign: 'left', fontWeight: 600, color: '#e0e8f0' }}>{p.label}</td>
                          <td style={{ ...s.td, color: rd.first ? '#12b886' : '#444' }}>{rd.first}</td>
                          <td style={s.td}>{rd.second}</td>
                          <td style={s.td}>{rd.third}</td>
                          <td style={s.td}>{rd.fourth}</td>
                          <td style={{ ...s.td, color: rd.fifth ? '#ef4444' : '#444' }}>{rd.fifth}</td>
                          <td style={{ ...s.td, fontWeight: 700, color: '#e0e8f0' }}>{agg.avgRank[p.id].toFixed(2)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Factor Ratings */}
            <div style={s.card}>
              <h2 style={s.h2}>Factor Ratings</h2>

              {/* Heatmap */}
              <h3 style={{ fontSize: 13, fontWeight: 700, color: '#c0c0d0', marginBottom: 12 }}>
                Average Score Heatmap
              </h3>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th style={s.th}>Pattern</th>
                      {RATING_FACTORS.map(f => (
                        <th key={f.key} style={{ ...s.th, fontSize: 10 }}>{f.label}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {PATTERNS.map((p) => (
                      <tr key={p.id}>
                        <td style={{ ...s.td, textAlign: 'left', fontWeight: 600, color: '#e0e8f0' }}>{p.label}</td>
                        {RATING_FACTORS.map(f => {
                          const val = agg.factorAvg[p.id][f.key];
                          const intensity = val / 5;
                          const bg = `rgba(59, 164, 224, ${intensity * 0.6})`;
                          return (
                            <td key={f.key} style={{ ...s.td, background: bg, fontWeight: 700, color: '#f0f4fa' }}>
                              {val.toFixed(1)}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Grouped bar chart */}
              <h3 style={{ fontSize: 13, fontWeight: 700, color: '#c0c0d0', margin: '20px 0 12px' }}>
                Scores by Factor
              </h3>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={factorChartData}>
                  <XAxis dataKey="name" tick={{ fill: '#8888aa', fontSize: 10 }} />
                  <YAxis domain={[0, 5]} tick={{ fill: '#8888aa', fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ background: '#14142a', border: '1px solid #2a2a40', borderRadius: 8 }}
                    labelStyle={{ color: '#e0e0f0' }}
                  />
                  <Legend wrapperStyle={{ fontSize: 11, color: '#8888aa' }} />
                  {RATING_FACTORS.map((f, i) => (
                    <Bar key={f.key} dataKey={f.label} fill={FACTOR_COLORS[i]} radius={[4, 4, 0, 0]} />
                  ))}
                </BarChart>
              </ResponsiveContainer>

              {/* Per-factor winners */}
              <h3 style={{ fontSize: 13, fontWeight: 700, color: '#c0c0d0', margin: '20px 0 12px' }}>
                Best Pattern per Factor
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {RATING_FACTORS.map(f => {
                  const w = agg.factorWinners[f.key];
                  return (
                    <div key={f.key} style={{
                      background: '#0d1b2a', border: '1px solid #1b3a5c', borderRadius: 10,
                      padding: '10px 14px',
                    }}>
                      <div style={{ fontSize: 10, color: '#6666aa', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                        {f.label}
                      </div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: '#f0f4fa', marginTop: 2 }}>
                        {w.pattern ? w.pattern.label : '—'}
                      </div>
                      <div style={{ fontSize: 12, color: '#3ba4e0' }}>
                        avg {w.avg.toFixed(1)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Response Summary */}
            <div style={s.card}>
              <h2 style={s.h2}>Response Summary</h2>
              <p style={{ fontSize: 15, color: '#e0e8f0', marginBottom: 12 }}>
                <strong>{agg.n}</strong> of <strong>{TOTAL_MDS}</strong> responses collected
              </p>

              {agg.comments.length > 0 && (
                <>
                  <h3 style={{ fontSize: 13, fontWeight: 700, color: '#c0c0d0', marginBottom: 8 }}>Comments</h3>
                  {agg.comments.map((c, i) => (
                    <div key={i} style={{
                      background: '#0d1b2a', border: '1px solid #1b3a5c', borderRadius: 8,
                      padding: '10px 14px', marginBottom: 6,
                      fontSize: 13, color: '#c0c8e0', fontStyle: 'italic',
                    }}>
                      "{c}"
                    </div>
                  ))}
                </>
              )}

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
          Nocturnist Schedule Analysis &middot; v1.0 &middot; Admin Import Tool
        </div>
      </div>
    </div>
  );
}
