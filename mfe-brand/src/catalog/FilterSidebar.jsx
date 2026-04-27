import React, { useCallback } from 'react';

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
  const toggle = useCallback(
    (groupKey, value) => {
      const map = {
        category: 'categories',
        format: 'formats',
        availability: 'availability',
      };
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
    [selected, onChange],
  );

  return (
    <aside className="cba-mfe-catalog__sidebar">
      <h2 className="cba-mfe-catalog__sidebar-title">Filter by</h2>
      {GROUPS.map((group) => (
        <section key={group.key} className="cba-mfe-catalog__group">
          <h3 className="cba-mfe-catalog__group-label">{group.label}</h3>
          <div className="cba-mfe-catalog__group-options">
            {group.options.map(([value, label]) => {
              const field =
                group.key === 'category'
                  ? 'categories'
                  : group.key === 'format'
                    ? 'formats'
                    : 'availability';
              const checked = selected[field].includes(value);
              return (
                <label key={value} className="cba-mfe-catalog__check">
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
