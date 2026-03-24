import { useMemo, useEffect } from 'react';

const LS_KEY = 'nocturnist_opinions';

function loadResponses() {
  try { return JSON.parse(localStorage.getItem(LS_KEY)) || []; }
  catch { return []; }
}

export default function PrintOpenResponses() {
  const responses = useMemo(() => loadResponses(), []);
  const openResponses = useMemo(() => {
    // Shuffle to anonymize order (seeded by count so it's consistent per session)
    const withText = responses.filter(r => r.open_response && r.open_response.trim());
    // Sort alphabetically by response text to anonymize (removes name-order correlation)
    return withText
      .map(r => r.open_response.trim())
      .sort((a, b) => a.localeCompare(b));
  }, [responses]);

  useEffect(() => {
    document.title = 'Opinion Survey — Anonymous Open Responses';
  }, []);

  if (!responses.length) return <div style={{ padding: 40, fontFamily: 'Arial, sans-serif' }}>No responses loaded. Visit the admin page first to import data.</div>;

  return (
    <div style={{ fontFamily: "'Segoe UI', Arial, sans-serif", color: '#111', maxWidth: 800, margin: '0 auto', padding: '20px 24px', fontSize: 13, lineHeight: 1.6 }}>
      <style>{`
        body { background: #fff !important; margin: 0; }
        @media print {
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .no-print { display: none !important; }
          @page { margin: 0.6in; size: letter; }
        }
      `}</style>

      <div style={{ textAlign: 'center', marginBottom: 24, borderBottom: '3px solid #111', paddingBottom: 12 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, margin: '0 0 4px 0' }}>Nocturnist Opinion Survey — Open Responses</h1>
        <p style={{ fontSize: 12, color: '#666', margin: '0 0 2px 0' }}>Anonymous — physician names have been removed</p>
        <p style={{ fontSize: 12, color: '#666', margin: 0 }}>{openResponses.length} of {responses.length} respondents provided written feedback &bull; Generated {new Date().toLocaleDateString()}</p>
      </div>

      <button className="no-print" onClick={() => window.print()} style={{
        padding: '8px 20px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 6,
        fontSize: 13, fontWeight: 600, cursor: 'pointer', marginBottom: 20, display: 'block',
      }}>Print / Save as PDF</button>

      <h2 style={{ fontSize: 14, fontWeight: 700, color: '#2563eb', margin: '0 0 4px 0', borderBottom: '2px solid #2563eb', paddingBottom: 4 }}>
        Question: Please share any additional thoughts about scheduling, your job satisfaction, or changes you'd like to see.
      </h2>
      <p style={{ fontSize: 11, color: '#666', margin: '4px 0 16px 0', fontStyle: 'italic' }}>
        Free-text responses collected at the end of the opinion survey. Responses are sorted alphabetically to prevent identification by submission order.
      </p>

      {openResponses.length === 0 ? (
        <p style={{ color: '#888' }}>No open responses were provided.</p>
      ) : (
        openResponses.map((text, i) => (
          <div key={i} style={{
            marginBottom: 14,
            padding: '12px 16px',
            background: '#f9fafb',
            border: '1px solid #e5e7eb',
            borderRadius: 6,
            pageBreakInside: 'avoid',
          }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', marginBottom: 4 }}>Response {i + 1}</div>
            <div style={{ fontSize: 13, color: '#1f2937', lineHeight: 1.6 }}>{text}</div>
          </div>
        ))
      )}

      <div style={{ marginTop: 30, paddingTop: 10, borderTop: '1px solid #d1d5db', fontSize: 10, color: '#999', textAlign: 'center' }}>
        Nocturnist Scheduling — Anonymous Open Responses &bull; {openResponses.length} responses &bull; {new Date().toLocaleDateString()}
      </div>
    </div>
  );
}
