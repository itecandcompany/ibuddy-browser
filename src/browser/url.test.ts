import { isHttpsUrl, resolveAddressInput } from './url';

describe('resolveAddressInput', () => {
  it('keeps secure HTTPS addresses', () => {
    expect(resolveAddressInput('https://example.com/path')).toEqual({
      ok: true,
      url: 'https://example.com/path',
    });
  });

  it('adds HTTPS to domain-like input', () => {
    expect(resolveAddressInput('example.com').ok).toBe(true);
    expect(resolveAddressInput('example.com')).toEqual({ ok: true, url: 'https://example.com/' });
  });

  it('treats ordinary text as a search query', () => {
    expect(resolveAddressInput('learn react native')).toEqual({
      ok: true,
      url: 'https://duckduckgo.com/?q=learn%20react%20native',
    });
  });

  it('blocks insecure HTTP instead of silently upgrading it', () => {
    expect(resolveAddressInput('http://example.com')).toEqual({ ok: false, reason: 'insecure-http' });
  });

  it('blocks URLs containing embedded credentials', () => {
    expect(resolveAddressInput('https://user:pass@example.com')).toEqual({ ok: false, reason: 'credential-url' });
    expect(isHttpsUrl('https://user:pass@example.com')).toBe(false);
  });

  it('blocks unsupported schemes', () => {
    expect(resolveAddressInput('javascript:alert(1)')).toEqual({ ok: false, reason: 'unsupported-scheme' });
    expect(resolveAddressInput('file:///etc/passwd')).toEqual({ ok: false, reason: 'unsupported-scheme' });
  });

  it('validates secure URLs', () => {
    expect(isHttpsUrl('https://example.com')).toBe(true);
    expect(isHttpsUrl('http://example.com')).toBe(false);
  });
});
