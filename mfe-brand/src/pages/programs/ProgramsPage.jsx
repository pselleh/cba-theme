import React, { useEffect, useState, useCallback } from 'react';
import FilterSidebar from '../../catalog/FilterSidebar';
import EntityCard from '../../catalog/EntityCard';
import { fetchPrograms } from '../../services/catalogApi';

const emptyFilters = () => ({
  categories: [],
  formats: [],
  availability: [],
});

export default function ProgramsPage() {
  const [filters, setFilters] = useState(emptyFilters);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await fetchPrograms({
        categories: filters.categories,
        formats: filters.formats,
        availability: filters.availability,
      });
      setItems(list);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    load();
  }, [load]);

  const reset = () => setFilters(emptyFilters());

  return (
    <div className="cba-mfe-catalog">
      <section className="cba-mfe-catalog__hero">
        <h1 className="cba-mfe-catalog__title">Certification programs</h1>
        <p className="cba-mfe-catalog__lead">
          Explore certification pathways designed for resilience, leadership, and workforce capability.
          Data layer is mock today — connect programs API when ready.
        </p>
      </section>

      <section className="cba-mfe-catalog__section cba-mfe-catalog__layout">
        <FilterSidebar selected={filters} onChange={setFilters} />
        <div>
          <div className="cba-mfe-catalog__results-head">
            <p className="cba-mfe-catalog__results-count">
              {loading
                ? 'Loading…'
                : `Showing ${items.length} program${items.length === 1 ? '' : 's'}`}
            </p>
            <button type="button" className="cba-mfe-catalog__reset" onClick={reset}>
              Reset filters
            </button>
          </div>
          {error && (
            <p className="cba-mfe-catalog__error" role="alert">
              Could not load programs.
            </p>
          )}
          {!loading && !error && (
            <div className="cba-mfe-catalog__grid">
              {items.map((p) => (
                <div key={p.id} id={p.id}>
                  <EntityCard
                    badge={p.badge}
                    title={p.title}
                    description={p.description}
                    meta={p.meta}
                    priceLabel={p.priceLabel}
                    imageUrl={p.imageUrl}
                    detailHref={`/programs#${p.id}`}
                    detailLabel="View program"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
