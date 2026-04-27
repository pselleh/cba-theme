import React, { useEffect, useState } from 'react';
import { fetchTranscript } from '../../services/transcriptApi';

export default function TranscriptPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchTranscript()
      .then((data) => {
        if (!cancelled) {
          setRows(Array.isArray(data) ? data : []);
        }
      })
      .catch((e) => {
        if (!cancelled) {
          setError(e);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return <div className="cba-mfe-catalog"><p className="cba-mfe-catalog__loading">Loading transcript…</p></div>;
  }
  if (error) {
    return <div className="cba-mfe-catalog"><p className="cba-mfe-catalog__error">Unable to load transcript.</p></div>;
  }

  return (
    <div className="cba-mfe-catalog">
      <section className="cba-mfe-catalog__hero">
        <h1 className="cba-mfe-catalog__title">Transcript</h1>
        <p className="cba-mfe-catalog__lead">Rows loaded: {rows.length}</p>
      </section>
    </div>
  );
}
