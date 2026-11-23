export type AddressResult =
  | { ok: true; url: string }
  | { ok: false; reason: 'insecure-http' | 'unsupported-scheme' | 'invalid-url' | 'credential-url' };

const SEARCH_URL = 'https://duckduckgo.com/?q=';

export function resolveAddressInput(input: string): AddressResult {
  const value = input.trim();
  if (!value) return { ok: false, reason: 'invalid-url' };

  if (/^http:\/\//i.test(value)) {
    return { ok: false, reason: 'insecure-http' };
  }

  if (/^[a-z][a-z0-9+.-]*:/i.test(value) && !/^https:\/\//i.test(value)) {
    return { ok: false, reason: 'unsupported-scheme' };
  }

  const candidate = /^https:\/\//i.test(value)
    ? value
    : /^[\w-]+\.[a-z]{2,}([/:?#]|$)/i.test(value)
      ? `https://${value}`
      : null;

  if (!candidate) {
    return { ok: true, url: `${SEARCH_URL}${encodeURIComponent(value)}` };
  }

  try {
    const parsed = new URL(candidate);
    if (parsed.username || parsed.password) return { ok: false, reason: 'credential-url' };
    if (parsed.protocol !== 'https:' || !parsed.hostname) {
      return { ok: false, reason: 'unsupported-scheme' };
    }
    return { ok: true, url: parsed.toString() };
  } catch {
    return { ok: false, reason: 'invalid-url' };
  }
}

export function isHttpsUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'https:' && !parsed.username && !parsed.password;
  } catch {
    return false;
  }
}
