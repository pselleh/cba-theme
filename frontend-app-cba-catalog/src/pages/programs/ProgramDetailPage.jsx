import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchProgramDetail } from '../../services/catalogApi';

export default function ProgramDetailPage() {
  const { programUuid } = useParams();
  const [program, setProgram] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchProgramDetail(programUuid)
      .then((item) => {
        if (!cancelled) {
          setProgram(item);
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
  }, [programUuid]);

  if (loading) {
    return <div className="cba-mfe-catalog"><p className="cba-mfe-catalog__loading">Loading program…</p></div>;
  }
  if (error || !program) {
    return <div className="cba-mfe-catalog"><p className="cba-mfe-catalog__error">Unable to load program.</p></div>;
  }

  return (
    <div className="cba-mfe-catalog">
      <section className="cba-mfe-catalog__hero">
        <h1 className="cba-mfe-catalog__title">{program.title}</h1>
        <p className="cba-mfe-catalog__lead">{program.description || 'Program detail page (phase 1).'}</p>
      </section>
    </div>
  );
}
