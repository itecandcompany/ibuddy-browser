import { buildPageExtractionScript, pageSnapshotSchema } from './page-extractor';

const validSnapshot = {
  type: 'IBUDDY_PAGE_SNAPSHOT',
  requestId: 'req-1',
  url: 'https://example.org/article',
  title: 'Example',
  headings: ['Heading'],
  paragraphs: ['Visible paragraph'],
  formLabels: ['Email address'],
  links: [{ label: 'Read more', url: 'https://example.org/more' }],
  limitations: ['cross-origin-frames-not-read'] as const,
};

describe('page extraction contract', () => {
  it('validates bounded HTTPS snapshots', () => {
    expect(pageSnapshotSchema.safeParse(validSnapshot).success).toBe(true);
  });
  it('rejects unknown message types, HTTP URLs and oversized arrays', () => {
    expect(pageSnapshotSchema.safeParse({ ...validSnapshot, type: 'OTHER' }).success).toBe(false);
    expect(pageSnapshotSchema.safeParse({ ...validSnapshot, url: 'http://example.org' }).success).toBe(false);
    expect(pageSnapshotSchema.safeParse({ ...validSnapshot, url: 'https://user:pass@example.org' }).success).toBe(false);
    expect(pageSnapshotSchema.safeParse({ ...validSnapshot, paragraphs: Array(81).fill('x') }).success).toBe(false);
  });
  it('rejects unexpected payload fields such as form values', () => {
    expect(pageSnapshotSchema.safeParse({ ...validSnapshot, formValues: ['must not be accepted'] }).success).toBe(false);
  });
  it('creates a user-triggered script that never reads field values or browser storage', () => {
    const script = buildPageExtractionScript('request-123');
    expect(script).toContain("querySelectorAll('h1,h2,h3,h4')");
    expect(script).toContain("querySelectorAll('label')");
    expect(script).not.toContain('input.value');
    expect(script).not.toContain('textarea.value');
    expect(script).not.toContain('localStorage');
    expect(script).not.toContain('document.cookie');
  });
});
