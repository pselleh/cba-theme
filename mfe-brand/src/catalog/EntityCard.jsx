import React from 'react';

/**
 * @param {{
 *   badge: string,
 *   title: string,
 *   description: string,
 *   meta: string[],
 *   priceLabel: string,
 *   imageUrl: string,
 *   detailHref: string,
 *   detailLabel?: string,
 * }} props
 */
export default function EntityCard({
  badge,
  title,
  description,
  meta,
  priceLabel,
  imageUrl,
  detailHref,
  detailLabel = 'View details',
}) {
  return (
    <article className="cba-mfe-catalog__card">
      <img className="cba-mfe-catalog__card-media" src={imageUrl} alt="" loading="lazy" decoding="async" />
      <div className="cba-mfe-catalog__card-body">
        <span className="cba-mfe-catalog__badge">{badge}</span>
        <h3 className="cba-mfe-catalog__card-title">{title}</h3>
        <p className="cba-mfe-catalog__card-text">{description}</p>
        <div className="cba-mfe-catalog__meta">
          {meta.map((m) => (
            <span key={m} className="cba-mfe-catalog__meta-item">
              {m}
            </span>
          ))}
        </div>
        <div className="cba-mfe-catalog__card-footer">
          <span className="cba-mfe-catalog__price">{priceLabel}</span>
          <a className="cba-mfe-catalog__card-link" href={detailHref}>
            {detailLabel}
          </a>
        </div>
      </div>
    </article>
  );
}
