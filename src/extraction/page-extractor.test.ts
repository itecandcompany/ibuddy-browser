import { buildPageExtractionScript, pageSnapshotSchema } from './page-extractor';

describe('page extraction contract', () => {
  it('validates a bounded page snapshot', () => {
    const result = pageSnapshotSchema.safeParse({
      type: 'IBUDDY_PAGE_SNAPSHOT',
      requestId: 'req-1',
      url: 'https://example.org/article',
      title: 'Example',
      headings: ['Heading'],
      paragraphs: ['Visible paragraph'],
      links: [{ label: 'Read more', url: 'https://example.org/more' }]
    });
    expect(result.success).toBe(true);
  });

  it('rejects unknown message types and malformed URLs', () => {
    expect(pageSnapshotSchema.safeParse({
      type: 'OTHER',
      requestId: 'req-1',
      url: 'javascript:alert(1)',
      title: '',
      headings: [],
      paragraphs: [],
      links: []
    }).success).toBe(false);
  });

  it('builds a user-triggered read-only extraction script', () => {
    const script = buildPageExtractionScript('request-123');
    expect(script).toContain('IBUDDY_PAGE_SNAPSHOT');
    expect(script).toContain("querySelectorAll('h1,h2,h3')");
    expect(script).toContain("querySelectorAll('p')");
    expect(script).not.toContain('input.value');
    expect(script).not.toContain('localStorage');
    expect(script).not.toContain('document.cookie');
  });
});
