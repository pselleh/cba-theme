import React, { useEffect, useState } from 'react';
import EntityCard from '../../catalog/EntityCard';
import { fetchCatalogCourses, fetchCatalogPrograms } from '../../services/catalogApi';

const FEATURED_COUNT = 3;

export default function CatalogPage() {
  const [courses, setCourses] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    Promise.all([fetchCatalogCourses(1, FEATURED_COUNT), fetchCatalogPrograms(1, FEATURED_COUNT)])
      .then(([coursesRes, programsRes]) => {
        if (cancelled) {
          return;
        }
        setCourses(coursesRes.results || []);
        setPrograms(programsRes.results || []);
      })
      .catch((e) => {
        if (cancelled) {
          return;
        }
        setError(e);
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

  if (error) {
    return (
      <div className="cba-catalog-page">
        <p className="cba-catalog-page__empty" role="alert">
          Could not load catalog. Retry later.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="cba-catalog-page">
        <p className="cba-catalog-page__empty">Loading catalog...</p>
      </div>
    );
  }

  return (
    <main className="cba-catalog-page">
      <section className="cba-catalog-page__hero">
        <h1 className="cba-catalog-page__title">Catalog</h1>
        <p className="cba-catalog-page__lead">
          Explore our latest courses and certification programs. Start here, then go deeper into each
          collection.
        </p>
      </section>

      <section className="cba-catalog-page__section">
        <div className="cba-catalog-page__section-head">
          <h2 className="cba-catalog-page__section-title">Featured Courses</h2>
          <a className="cba-catalog-page__section-link" href="/courses/">
            View all courses →
          </a>
        </div>
        <div className="cba-catalog-page__grid">
          {courses.map((item) => (
            <EntityCard
              key={item.id}
              classNamePrefix="cba-catalog-page"
              badge={item.badge}
              title={item.title}
              description={item.description}
              meta={item.meta || []}
              priceLabel={item.priceLabel}
              imageUrl={item.imageUrl}
              detailTo={`/courses/${encodeURIComponent(item.id)}`}
              detailLabel="View course"
            />
          ))}
        </div>
      </section>

      <section className="cba-catalog-page__section">
        <div className="cba-catalog-page__section-head">
          <h2 className="cba-catalog-page__section-title">Certification Programs</h2>
          <a className="cba-catalog-page__section-link" href="/programs/">
            View all programs →
          </a>
        </div>
        <div className="cba-catalog-page__grid">
          {programs.map((item) => (
            <EntityCard
              key={item.id}
              classNamePrefix="cba-catalog-page"
              badge={item.badge}
              title={item.title}
              description={item.description}
              meta={item.meta || []}
              priceLabel={item.priceLabel}
              imageUrl={item.imageUrl}
              detailTo={`/programs/${item.id}`}
              detailLabel="View program"
            />
          ))}
        </div>
      </section>
    </main>
  );
}
