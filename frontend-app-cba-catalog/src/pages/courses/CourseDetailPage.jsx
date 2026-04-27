import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchCourseDetail } from '../../services/catalogApi';

export default function CourseDetailPage() {
  const { courseKey } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchCourseDetail(courseKey)
      .then((item) => {
        if (!cancelled) {
          setCourse(item);
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
  }, [courseKey]);

  if (loading) {
    return <div className="cba-mfe-catalog"><p className="cba-mfe-catalog__loading">Loading course…</p></div>;
  }
  if (error || !course) {
    return <div className="cba-mfe-catalog"><p className="cba-mfe-catalog__error">Unable to load course.</p></div>;
  }

  return (
    <div className="cba-mfe-catalog">
      <section className="cba-mfe-catalog__hero">
        <h1 className="cba-mfe-catalog__title">{course.title}</h1>
        <p className="cba-mfe-catalog__lead">{course.description || 'Course detail page (phase 1).'}</p>
      </section>
    </div>
  );
}
