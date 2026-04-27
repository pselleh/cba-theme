/**
 * LMS origin when the app runs on apps.<lms-host> (typical Tutor layout).
 */
export function getLmsOrigin() {
  if (typeof window === 'undefined') {
    return '';
  }
  const h = window.location.hostname || '';
  const lmsHost = h.indexOf('apps.') === 0 ? h.slice(5) : h;
  const port = window.location.port ? `:${window.location.port}` : '';
  return `${window.location.protocol}//${lmsHost}${port}`;
}

/**
 * Apps origin for MFEs (apps.<lms-host> in Tutor layout).
 */
export function getAppsOrigin() {
  if (typeof window === 'undefined') {
    return '';
  }
  const h = window.location.hostname || '';
  const appsHost = h.indexOf('apps.') === 0 ? h : `apps.${h}`;
  const port = window.location.port ? `:${window.location.port}` : '';
  return `${window.location.protocol}//${appsHost}${port}`;
}
