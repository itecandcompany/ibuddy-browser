import { isAutomaticallyLocked, isDomainLocked } from './assessment-lock';

describe('Assessment Lock domain policy', () => {
  it('locks Google Forms assessment pages', () => {
    expect(isAutomaticallyLocked('https://docs.google.com/forms/d/e/example/viewform')).toBe(true);
    expect(isAutomaticallyLocked('https://forms.gle/abc123')).toBe(true);
  });

  it('locks known proctoring domains and subdomains', () => {
    expect(isAutomaticallyLocked('https://app.honorlock.com/')).toBe(true);
    expect(isAutomaticallyLocked('https://exam.net/')).toBe(true);
  });

  it('does not match lookalike hostnames', () => {
    expect(isAutomaticallyLocked('https://notexam.net.attacker.example/')).toBe(false);
  });

  it('supports user-added domain locks', () => {
    expect(isDomainLocked('https://portal.example.org/exam', ['example.org'])).toBe(true);
    expect(isDomainLocked('https://example.org.evil.test/', ['example.org'])).toBe(false);
  });
});
