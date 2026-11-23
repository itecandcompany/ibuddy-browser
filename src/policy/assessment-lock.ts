const AUTOMATIC_LOCKED_HOSTS = [
  'exam.net',
  'respondus.com',
  'honorlock.com',
  'proctorio.com',
  'proctoru.com',
  'examity.com',
  'inspera.com',
  'testinvite.com',
  'safeexambrowser.org',
];

function hostMatches(hostname: string, domain: string): boolean {
  const normalizedHost = hostname.toLowerCase().replace(/^www\./, '');
  const normalizedDomain = domain.toLowerCase().replace(/^www\./, '');
  return normalizedHost === normalizedDomain || normalizedHost.endsWith(`.${normalizedDomain}`);
}

export function getHostname(url: string): string | null {
  try {
    return new URL(url).hostname.toLowerCase();
  } catch {
    return null;
  }
}

export function isAutomaticallyLocked(url: string): boolean {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.toLowerCase();
    if (hostMatches(host, 'forms.gle')) return true;
    if (hostMatches(host, 'docs.google.com') && /^\/forms(?:\/|$)/i.test(parsed.pathname)) return true;
    return AUTOMATIC_LOCKED_HOSTS.some((domain) => hostMatches(host, domain));
  } catch {
    return false;
  }
}

export function isDomainLocked(url: string, userLockedDomains: string[]): boolean {
  const hostname = getHostname(url);
  if (!hostname) return false;
  return isAutomaticallyLocked(url) || userLockedDomains.some((domain) => hostMatches(hostname, domain));
}
