import { getLmsOrigin } from '../utils/lmsOrigin';

const DEFAULT_PAGE_SIZE = 15;

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
  {
    id: 'risk-metrics-monitoring',
    kind: 'course',
    title: 'Risk Metrics and Controls Monitoring',
    description: 'Track KRIs and controls health to improve decision quality across critical systems.',
    badge: 'Course',
    meta: ['Self-paced', '4 weeks', 'Intermediate'],
    priceLabel: '$219',
    tags: ['technology', 'quality', 'self-paced', 'upcoming'],
  },
  {
    id: 'supplier-resilience',
    kind: 'course',
    title: 'Supplier Resilience and Third-Party Risk',
    description: 'Assess vendor exposure and continuity posture for resilient supply operations.',
    badge: 'Course',
    meta: ['Hybrid', '5 weeks', 'Intermediate'],
    priceLabel: '$239',
    tags: ['supply-chain', 'risk', 'hybrid', 'current'],
  },
  {
    id: 'facility-readiness',
    kind: 'course',
    title: 'Facility Readiness and Continuity Drills',
    description: 'Plan and execute realistic readiness drills to reduce operational downtime.',
    badge: 'Course',
    meta: ['Instructor-led', '3 weeks', 'Beginner'],
    priceLabel: '$189',
    tags: ['facility', 'health-safety', 'instructor-paced', 'current'],
  },
  {
    id: 'leadership-under-pressure',
    kind: 'course',
    title: 'Leadership Under Pressure',
    description: 'Build leadership habits for high-stakes response, escalation, and communication.',
    badge: 'Course',
    meta: ['Hybrid', '6 weeks', 'Advanced'],
    priceLabel: '$299',
    tags: ['business', 'leadership', 'hybrid', 'upcoming'],
  },
  {
    id: 'environmental-compliance-risk',
    kind: 'course',
    title: 'Environmental Compliance and Risk Controls',
    description: 'Strengthen compliance processes while reducing environmental and regulatory risk.',
    badge: 'Course',
    meta: ['Self-paced', '5 weeks', 'Intermediate'],
    priceLabel: '$209',
    tags: ['environmental', 'quality', 'self-paced', 'current'],
  },
  {
    id: 'incident-command-essentials',
    kind: 'course',
    title: 'Incident Command Essentials',
    description: 'Define clear command structures for faster coordination during disruptions.',
    badge: 'Course',
    meta: ['Instructor-led', '2 weeks', 'Beginner'],
    priceLabel: '$149',
    tags: ['risk', 'health-safety', 'instructor-paced', 'current'],
  },
  {
    id: 'digital-resilience-basics',
    kind: 'course',
    title: 'Digital Resilience Basics',
    description: 'Improve service reliability and recovery planning for digital operations.',
    badge: 'Course',
    meta: ['Self-paced', '4 weeks', 'Beginner'],
    priceLabel: '$169',
    tags: ['technology', 'business', 'self-paced', 'archived'],
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
  {
    id: 'workplace-resilience-certificate',
    kind: 'program',
    title: 'Workplace Resilience Certificate',
    description: 'Team-focused program for continuity, governance, and risk discipline at scale.',
    badge: 'Program',
    meta: ['Cohort', '10 weeks', 'Certificate'],
    priceLabel: '$1,499',
    tags: ['quality', 'facility', 'instructor-paced', 'current'],
  },
  {
    id: 'personal-cert-track',
    kind: 'program',
    title: 'Personal Certification Track',
    description: 'Flexible certification journey for professionals advancing personal capability.',
    badge: 'Program',
    meta: ['Self-paced', '8 weeks', 'Digital badge'],
    priceLabel: '$899',
    tags: ['business', 'technology', 'self-paced', 'upcoming'],
  },
  {
    id: 'decision-excellence-program',
    kind: 'program',
    title: 'Governance and Decision Excellence',
    description: 'Program focused on decision quality, stakeholder trust, and strategic execution.',
    badge: 'Program',
    meta: ['Hybrid', '9 weeks', 'Certificate'],
    priceLabel: '$1,199',
    tags: ['business', 'risk', 'hybrid', 'current'],
  },
  {
    id: 'transition-leadership-pathway',
    kind: 'program',
    title: 'Transition-to-Leadership Pathway',
    description: 'Supports service members and employers with a structured transition framework.',
    badge: 'Program',
    meta: ['Hybrid', '11 weeks', 'Career-focused'],
    priceLabel: '$1,050',
    tags: ['supply-chain', 'health-safety', 'hybrid', 'archived'],
  },
  {
    id: 'organizational-continuity-program',
    kind: 'program',
    title: 'Organizational Continuity Program',
    description: 'Build repeatable continuity capability with tested scenarios and governance.',
    badge: 'Program',
    meta: ['Instructor-led', '14 weeks', 'Capstone'],
    priceLabel: '$1,790',
    tags: ['facility', 'risk', 'instructor-paced', 'upcoming'],
  },
  {
    id: 'enterprise-recovery-leadership',
    kind: 'program',
    title: 'Enterprise Recovery Leadership',
    description: 'Advanced leadership pathway for enterprise recovery strategy and execution.',
    badge: 'Program',
    meta: ['Hybrid', '12 weeks', 'Certificate'],
    priceLabel: '$1,650',
    tags: ['business', 'quality', 'hybrid', 'current'],
  },
];

function withImages(items) {
  const fallback = heroImage();
  return items.map((item) => ({
    ...item,
    imageUrl: item.imageUrl || fallback,
  }));
}

function mapCourse(item) {
  return {
    id: item.key || item.id,
    key: item.key || item.id,
    kind: 'course',
    title: item.title,
    description: item.shortDescription || item.short_description || item.description || '',
    badge: item.badge || 'Course',
    meta: [
      item.pacingType || item.pacing_type,
      item.durationText || item.duration_text || item.effort,
      item.availabilityText || item.availability_text,
    ].filter(Boolean),
    priceLabel: item.priceText || item.price_text || item.priceLabel || '',
    tags: item.tags || [],
    imageUrl: item.imageUrl || item.image_url,
    isAvailable: item.isAvailable,
    waitlistEnabled: item.waitlistEnabled,
    hubspotContext: item.hubspotContext,
  };
}

function mapProgram(item) {
  return {
    id: item.uuid || item.id,
    uuid: item.uuid || item.id,
    kind: 'program',
    title: item.title,
    description: item.subtitle || item.shortDescription || item.short_description || item.description || '',
    badge: item.badge || 'Program',
    meta: [
      item.durationText || item.duration_text,
      item.availabilityText || item.availability_text,
    ].filter(Boolean),
    priceLabel: item.priceText || item.price_text || item.priceLabel || '',
    tags: item.tags || [],
    imageUrl: item.imageUrl || item.image_url || item.card_image_url,
    waitlistEnabled: item.waitlistEnabled,
    hubspotContext: item.hubspotContext,
  };
}

function paginate(items, page = 1, pageSize = DEFAULT_PAGE_SIZE) {
  const count = items.length;
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  return {
    count,
    page,
    pageSize,
    results: items.slice(start, end),
  };
}

async function requestJson(url) {
  const res = await fetch(url, {
    credentials: 'include',
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) {
    throw new Error(`Request failed (${res.status}) for ${url}`);
  }
  return res.json();
}

export async function fetchCatalogCourses(page = 1, pageSize = DEFAULT_PAGE_SIZE) {
  const url = `/api/catalog/courses/?page=${page}&page_size=${pageSize}`;
  try {
    const data = await requestJson(url);
    return {
      count: data.count || 0,
      page: data.page || page,
      pageSize: data.pageSize || data.page_size || pageSize,
      results: withImages((data.results || []).map(mapCourse)),
    };
  } catch (_err) {
    return {
      ...paginate(withImages(MOCK_COURSES), page, pageSize),
      page,
    };
  }
}

export async function fetchCatalogPrograms(page = 1, pageSize = DEFAULT_PAGE_SIZE) {
  const url = `/api/catalog/programs/?page=${page}&page_size=${pageSize}`;
  try {
    const data = await requestJson(url);
    return {
      count: data.count || 0,
      page: data.page || page,
      pageSize: data.pageSize || data.page_size || pageSize,
      results: withImages((data.results || []).map(mapProgram)),
    };
  } catch (_err) {
    return {
      ...paginate(withImages(MOCK_PROGRAMS), page, pageSize),
      page,
    };
  }
}

export async function fetchCourseDetail(courseKey) {
  const encoded = encodeURIComponent(courseKey);
  const url = `/api/catalog/courses/${encoded}/`;
  try {
    const item = await requestJson(url);
    return mapCourse(item);
  } catch (_err) {
    return withImages(MOCK_COURSES).find((c) => c.id === courseKey) || null;
  }
}

export async function fetchProgramDetail(programUuid) {
  const url = `/api/catalog/programs/${programUuid}/`;
  try {
    const item = await requestJson(url);
    return mapProgram(item);
  } catch (_err) {
    return withImages(MOCK_PROGRAMS).find((p) => p.id === programUuid) || null;
  }
}

function matchesFilterTags(item, filters = {}) {
  const tags = item.tags || [];
  const categories = filters.categories || [];
  const formats = filters.formats || [];
  const availability = filters.availability || [];

  const categoryMatch = categories.length === 0 || categories.some((tag) => tags.includes(tag));
  const formatMatch = formats.length === 0 || formats.some((tag) => tags.includes(tag));
  const availabilityMatch = availability.length === 0 || availability.some((tag) => tags.includes(tag));

  return categoryMatch && formatMatch && availabilityMatch;
}

export async function fetchCourses(filters = {}) {
  const res = await fetchCatalogCourses(1, 200);
  return (res.results || []).filter((item) => matchesFilterTags(item, filters));
}

export async function fetchPrograms(filters = {}) {
  const res = await fetchCatalogPrograms(1, 200);
  return (res.results || []).filter((item) => matchesFilterTags(item, filters));
}
