/**
 * Catalog data access — replace mock implementations with Course API / Discovery
 * (or edx-enterprise programs) when backends are ready. Keep the same function
 * signatures so page components stay unchanged.
 */
import { getLmsOrigin } from '../utils/lmsOrigin';

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function heroImage() {
  const base = getLmsOrigin();
  return `${base}/static/cba-theme/images/hero-client-global-network.png`;
}

/** @typedef {{ id: string, kind: 'course'|'program', title: string, description: string, badge: string, meta: string[], priceLabel: string, tags: string[], imageUrl?: string }} CatalogItem */

/** @type {CatalogItem[]} */
const MOCK_COURSES = [
  {
    id: 'erm-foundations',
    kind: 'course',
    title: 'Enterprise Risk Management Foundations',
    description:
      'Create risk frameworks, ownership models, and mitigation plans for critical operations.',
    badge: 'Course',
    meta: ['Self-paced', '6 weeks', 'Intermediate'],
    priceLabel: '$249',
    tags: ['risk', 'leadership', 'self-paced', 'current'],
  },
  {
    id: 'business-continuity',
    kind: 'course',
    title: 'Business Continuity Planning',
    description: 'Develop business continuity playbooks, testing cycles, and incident roles.',
    badge: 'Course',
    meta: ['Instructor-led', '4 weeks', 'Beginner'],
    priceLabel: '$199',
    tags: ['business', 'quality', 'instructor-paced', 'current'],
  },
  {
    id: 'governance-leadership',
    kind: 'course',
    title: 'Governance and Leadership for Resilience',
    description:
      'Translate strategic objectives into resilient execution and measurable decisions.',
    badge: 'Course',
    meta: ['Self-paced', '5 weeks', 'Advanced'],
    priceLabel: '$279',
    tags: ['business', 'technology', 'self-paced', 'upcoming'],
  },
  {
    id: 'operational-risk',
    kind: 'course',
    title: 'Operational Risk and Incident Response',
    description:
      'Prepare response plans and coordination patterns for high-impact disruptions.',
    badge: 'Course',
    meta: ['Instructor-led', '3 weeks', 'Intermediate'],
    priceLabel: '$179',
    tags: ['risk', 'supply-chain', 'hybrid', 'current'],
  },
  {
    id: 'crisis-communication',
    kind: 'course',
    title: 'Crisis Communication and Stakeholder Trust',
    description:
      'Maintain confidence through clear communication during incidents and recovery.',
    badge: 'Course',
    meta: ['Self-paced', '2 weeks', 'Beginner'],
    priceLabel: '$159',
    tags: ['health-safety', 'business', 'self-paced', 'archived'],
  },
];

/** @type {CatalogItem[]} */
const MOCK_PROGRAMS = [
  {
    id: 'cba-resilience-cert',
    kind: 'program',
    title: 'CBA Resilience Certificate',
    description:
      'Structured learning path focused on governance, risk, and continuity capabilities.',
    badge: 'Program',
    meta: ['10 weeks', 'Certificate'],
    priceLabel: '$1,199',
    tags: ['business', 'risk', 'instructor-paced', 'current'],
  },
  {
    id: 'workplace-leadership',
    kind: 'program',
    title: 'Workplace Leadership Track',
    description:
      'Certificate track for managers building resilient teams and operational clarity.',
    badge: 'Program',
    meta: ['8 weeks', 'Certificate'],
    priceLabel: '$899',
    tags: ['business', 'quality', 'hybrid', 'current'],
  },
  {
    id: 'va-accelerator',
    kind: 'program',
    title: 'VA Accelerator Program',
    description:
      'Grant-supported pathway for veterans to develop practical resilience and leadership skills.',
    badge: 'Program',
    meta: ['Instructor-led', '12 weeks', 'Certificate'],
    priceLabel: 'Grant funded',
    tags: ['business', 'risk', 'instructor-paced', 'current'],
  },
];

function withImages(items) {
  const fallback = heroImage();
  return items.map((item) => ({
    ...item,
    imageUrl: item.imageUrl || fallback,
  }));
}

/**
 * @returns {Promise<{ featuredCourses: CatalogItem[], featuredPrograms: CatalogItem[] }>}
 */
export async function fetchCatalogOverview() {
  await delay(200);
  return {
    featuredCourses: withImages(MOCK_COURSES.slice(0, 3)),
    featuredPrograms: withImages(MOCK_PROGRAMS.slice(0, 2)),
  };
}

/**
 * @param {{ categories?: string[], formats?: string[], availability?: string[] }} filters
 * @returns {Promise<CatalogItem[]>}
 */
export async function fetchCourses(filters = {}) {
  await delay(200);
  let list = [...MOCK_COURSES];
  list = applyFilters(list, filters);
  return withImages(list);
}

/**
 * @param {{ categories?: string[], formats?: string[], availability?: string[] }} filters
 * @returns {Promise<CatalogItem[]>}
 */
export async function fetchPrograms(filters = {}) {
  await delay(200);
  let list = [...MOCK_PROGRAMS];
  list = applyFilters(list, filters);
  return withImages(list);
}

/**
 * @param {CatalogItem[]} items
 * @param {{ categories?: string[], formats?: string[], availability?: string[] }} filters
 */
function applyFilters(items, filters) {
  const { categories = [], formats = [], availability = [] } = filters;
  return items.filter((item) => {
    if (categories.length && !categories.some((c) => item.tags.includes(c))) {
      return false;
    }
    if (formats.length && !formats.some((f) => item.tags.includes(f))) {
      return false;
    }
    if (availability.length && !availability.some((a) => item.tags.includes(a))) {
      return false;
    }
    return true;
  });
}
