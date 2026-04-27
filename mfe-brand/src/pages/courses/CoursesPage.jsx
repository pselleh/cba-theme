import React, { useEffect, useState, useCallback } from 'react';
import FilterSidebar from '../../catalog/FilterSidebar';
import EntityCard from '../../catalog/EntityCard';
import { fetchCourses } from '../../services/catalogApi';

const emptyFilters = () => ({
  categories: [],
  formats: [],
  availability: [],
});

export default function CoursesPage() {
  const [filters, setFilters] = useState(emptyFilters);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await fetchCourses({
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
        <h1 className="cba-mfe-catalog__title">Courses</h1>
        <p className="cba-mfe-catalog__lead">
          Browse courses powered by live catalog data (mock for now — swap in Course API in
          services/catalogApi.js).
        </p>
      </section>

      <section className="cba-mfe-catalog__section cba-mfe-catalog__layout">
        <FilterSidebar selected={filters} onChange={setFilters} />
        <div>
          <div className="cba-mfe-catalog__results-head">
            <p className="cba-mfe-catalog__results-count">
              {loading ? 'Loading…' : `Showing ${items.length} course${items.length === 1 ? '' : 's'}`}
            </p>
            <button type="button" className="cba-mfe-catalog__reset" onClick={reset}>
              Reset filters
            </button>
          </div>
          {error && (
            <p className="cba-mfe-catalog__error" role="alert">
              Could not load courses.
            </p>
          )}
          {!loading && !error && (
            <div className="cba-mfe-catalog__grid">
              {items.map((c) => (
                <div key={c.id} id={c.id}>
                  <EntityCard
                    badge={c.badge}
                    title={c.title}
                    description={c.description}
                    meta={c.meta}
                    priceLabel={c.priceLabel}
                    imageUrl={c.imageUrl}
                    detailHref={`/courses#${c.id}`}
                    detailLabel="View details"
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
