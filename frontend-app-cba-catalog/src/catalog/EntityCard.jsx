import React from 'react';
import { Link } from 'react-router-dom';

/**
 * @param {{
 *   badge: string,
 *   title: string,
 *   description: string,
 *   meta: string[],
 *   priceLabel: string,
 *   imageUrl: string,
 *   detailTo?: string,
 *   detailHref?: string,
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
  detailTo,
  detailHref,
  detailLabel = 'View details',
  classNamePrefix = 'cba-mfe-catalog',
}) {
  const cx = (suffix) => `${classNamePrefix}__${suffix}`;
  const cta = detailTo ? (
    <Link className={cx('card-link')} to={detailTo}>
      {detailLabel}
    </Link>
  ) : (
    <a className={cx('card-link')} href={detailHref}>
      {detailLabel}
    </a>
  );

  return (
    <article className={cx('card')}>
      <img className={cx('card-media')} src={imageUrl} alt="" loading="lazy" decoding="async" />
      <div className={cx('card-body')}>
        <span className={cx('badge')}>{badge}</span>
        <h3 className={cx('card-title')}>{title}</h3>
        <p className={cx('card-text')}>{description}</p>
        <div className={cx('meta')}>
          {meta.map((m) => (
            <span key={m} className={cx('meta-item')}>
              {m}
            </span>
          ))}
        </div>
        <div className={cx('card-footer')}>
          <span className={cx('price')}>{priceLabel}</span>
          {cta}
        </div>
      </div>
    </article>
  );
}
