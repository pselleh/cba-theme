import React, { useCallback, useMemo, useState } from 'react';

const GROUPS = [
  {
    key: 'category',
    label: 'Category',
    options: [
      ['business', 'Business'],
      ['environmental', 'Environmental'],
      ['facility', 'Facility'],
      ['health-safety', 'Health & Safety'],
      ['quality', 'Quality'],
      ['risk', 'Risk'],
      ['supply-chain', 'Supply Chain'],
      ['technology', 'Technology'],
    ],
  },
  {
    key: 'format',
    label: 'Learning format',
    options: [
      ['self-paced', 'Self-paced'],
      ['hybrid', 'Hybrid'],
      ['instructor-paced', 'Instructor-paced'],
    ],
  },
  {
    key: 'availability',
    label: 'Availability',
    options: [
      ['current', 'Current'],
      ['upcoming', 'Upcoming'],
      ['archived', 'Archived'],
    ],
  },
];

/**
 * @param {{
 *   selected: { categories: string[], formats: string[], availability: string[] },
 *   onChange: (next: { categories: string[], formats: string[], availability: string[] }) => void,
 * }} props
 */
export default function FilterSidebar({ selected, onChange }) {
  const [collapsed, setCollapsed] = useState(() => new Set(GROUPS.slice(1).map((g) => g.key)));
  const map = useMemo(
    () => ({
      category: 'categories',
      format: 'formats',
      availability: 'availability',
    }),
    [],
  );
  const classNamePrefix = 'cba-catalog-page';
  const cx = (suffix) => `${classNamePrefix}__${suffix}`;

  const toggle = useCallback(
    (groupKey, value) => {
      const field = map[groupKey];
      const set = new Set(selected[field]);
      if (set.has(value)) {
        set.delete(value);
      } else {
        set.add(value);
      }
      onChange({
        ...selected,
        [field]: Array.from(set),
      });
    },
    [map, selected, onChange],
  );

  return (
    <aside className={cx('sidebar')}>
      <h2 className={cx('sidebar-title')}>Filter by</h2>
      {GROUPS.map((group) => (
        <section
          key={group.key}
          className={`${cx('group')} ${collapsed.has(group.key) ? 'is-collapsed' : ''}`}
        >
          <button
            type="button"
            className={cx('group-toggle')}
            onClick={() =>
              setCollapsed((prev) => {
                const next = new Set(prev);
                if (next.has(group.key)) {
                  next.delete(group.key);
                } else {
                  next.add(group.key);
                }
                return next;
              })
            }
          >
            <span>{group.label}</span>
            <span className={cx('group-toggle-icon')}>▾</span>
          </button>
          <div className={cx('group-options')}>
            {group.options.map(([value, label]) => {
              const field = map[group.key];
              const checked = selected[field].includes(value);
              return (
                <label key={value} className={cx('check')}>
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggle(group.key, value)}
                  />
                  <span>{label}</span>
                </label>
              );
            })}
          </div>
        </section>
      ))}
    </aside>
  );
}
