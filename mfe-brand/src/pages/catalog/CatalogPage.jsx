import React, { useEffect, useState } from 'react';
import EntityCard from '../../catalog/EntityCard';
import { fetchCatalogOverview } from '../../services/catalogApi';

export default function CatalogPage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    fetchCatalogOverview()
      .then((res) => {
        if (!cancelled) {
          setData(res);
        }
      })
      .catch((e) => {
        if (!cancelled) {
          setError(e);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (error) {
    return (
      <div className="cba-mfe-catalog">
        <p className="cba-mfe-catalog__error" role="alert">
          Could not load catalog. Retry later.
        </p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="cba-mfe-catalog">
        <p className="cba-mfe-catalog__loading">Loading catalog…</p>
      </div>
    );
  }

  return (
    <div className="cba-mfe-catalog">
      <section className="cba-mfe-catalog__hero">
        <h1 className="cba-mfe-catalog__title">Catalog</h1>
        <p className="cba-mfe-catalog__lead">
          Explore our latest courses and certification programs. Start here, then go deeper into each
          collection.
        </p>
      </section>

      <section className="cba-mfe-catalog__section">
        <div className="cba-mfe-catalog__section-head">
          <h2 className="cba-mfe-catalog__section-title">Featured courses</h2>
          <a className="cba-mfe-catalog__section-link" href="/courses">
            View all courses →
          </a>
        </div>
        <div className="cba-mfe-catalog__grid">
          {data.featuredCourses.map((c) => (
            <EntityCard
              key={c.id}
              badge={c.badge}
              title={c.title}
              description={c.description}
              meta={c.meta}
              priceLabel={c.priceLabel}
              imageUrl={c.imageUrl}
              detailHref={`/courses#${c.id}`}
              detailLabel="View course"
            />
          ))}
        </div>
      </section>

      <section className="cba-mfe-catalog__section">
        <div className="cba-mfe-catalog__section-head">
          <h2 className="cba-mfe-catalog__section-title">Certification programs</h2>
          <a className="cba-mfe-catalog__section-link" href="/programs">
            View all programs →
          </a>
        </div>
        <div className="cba-mfe-catalog__grid">
          {data.featuredPrograms.map((p) => (
            <EntityCard
              key={p.id}
              badge={p.badge}
              title={p.title}
              description={p.description}
              meta={p.meta}
              priceLabel={p.priceLabel}
              imageUrl={p.imageUrl}
              detailHref={`/programs#${p.id}`}
              detailLabel="View program"
            />
          ))}
        </div>
      </section>
    </div>
  );
}
