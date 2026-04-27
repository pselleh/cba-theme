import React, { useEffect, useState, useCallback, useMemo } from 'react';
import FilterSidebar from '../../catalog/FilterSidebar';
import EntityCard from '../../catalog/EntityCard';
import { fetchCourses } from '../../services/catalogApi';

const emptyFilters = () => ({
  categories: [],
  formats: [],
  availability: [],
});
const PAGE_SIZE = 6;

export default function CoursesPage() {
  const [filters, setFilters] = useState(emptyFilters);
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
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
      setPage(1);
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
  const totalPages = useMemo(() => Math.max(1, Math.ceil(items.length / PAGE_SIZE)), [items.length]);
  const visibleItems = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return items.slice(start, start + PAGE_SIZE);
  }, [items, page]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  return (
    <main className="cba-catalog-page">
      <section className="cba-catalog-page__hero">
        <h1 className="cba-catalog-page__title">Courses</h1>
        <p className="cba-catalog-page__lead">
          Browse individual courses by topic and delivery format. Use filters to narrow your list.
        </p>
      </section>

      <section className="cba-catalog-page__section cba-catalog-page__layout">
        <FilterSidebar selected={filters} onChange={setFilters} />
        <div>
          <div className="cba-catalog-page__results-head">
            <p className="cba-catalog-page__results-count">
              {loading
                ? 'Loading...'
                : `Showing ${visibleItems.length} of ${items.length} course${items.length === 1 ? '' : 's'}`}
            </p>
            <button type="button" className="cba-catalog-page__reset" onClick={reset}>
              Reset filters
            </button>
          </div>
          {error && (
            <p className="cba-catalog-page__empty" role="alert">
              Could not load courses.
            </p>
          )}
          {!loading && !error && (
            <div className="cba-catalog-page__grid">
              {visibleItems.map((c) => (
                <EntityCard
                  key={c.id}
                  classNamePrefix="cba-catalog-page"
                  badge={c.badge}
                  title={c.title}
                  description={c.description}
                  meta={c.meta}
                  priceLabel={c.priceLabel}
                  imageUrl={c.imageUrl}
                  detailTo={`/courses/${encodeURIComponent(c.id)}`}
                  detailLabel="View details"
                />
              ))}
            </div>
          )}
          {!loading && !error && totalPages > 1 && (
            <div className="cba-catalog-page__pagination">
              <button
                type="button"
                className="cba-catalog-page__page"
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                disabled={page === 1}
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  type="button"
                  className={`cba-catalog-page__page ${p === page ? 'is-active' : ''}`}
                  onClick={() => setPage(p)}
                >
                  {p}
                </button>
              ))}
              <button
                type="button"
                className="cba-catalog-page__page"
                onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={page === totalPages}
              >
                Next
              </button>
            </div>
          )}
          {!loading && !error && items.length === 0 && (
            <p className="cba-catalog-page__empty">No courses match your selected filters.</p>
          )}
        </div>
      </section>
    </main>
  );
}
