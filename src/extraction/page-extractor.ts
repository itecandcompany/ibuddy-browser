import { z } from 'zod';

export const pageSnapshotSchema = z.object({
  type: z.literal('IBUDDY_PAGE_SNAPSHOT'),
  requestId: z.string().min(1).max(80),
  url: z.string().url(),
  title: z.string().max(300),
  headings: z.array(z.string().max(500)).max(40),
  paragraphs: z.array(z.string().max(1200)).max(80),
  links: z.array(z.object({
    label: z.string().max(300),
    url: z.string().url()
  })).max(60)
});

export type PageSnapshot = z.infer<typeof pageSnapshotSchema>;

/**
 * Creates a read-only, user-triggered extraction script.
 * It reads visible headings, paragraph text and link labels only.
 * It never reads input values, form controls, cookies or storage.
 */
export function buildPageExtractionScript(requestId: string): string {
  const safeRequestId = JSON.stringify(requestId);
  return `(function () {
    try {
      const requestId = ${safeRequestId};
      const cleanText = (value) => String(value || '')
        .replace(/[\\u0000-\\u001F\\u007F]/g, ' ')
        .replace(/\\s+/g, ' ')
        .trim()
        .slice(0, 1200);
      const isVisible = (element) => {
        if (!element || !element.isConnected) return false;
        if (element.closest('script,style,noscript,template,nav,footer,form,[aria-hidden="true"]')) return false;
        const style = window.getComputedStyle(element);
        const rect = element.getBoundingClientRect();
        return style.display !== 'none' && style.visibility !== 'hidden' &&
          Number(style.opacity || 1) > 0 && rect.width > 0 && rect.height > 0;
      };
      const redact = (text) => cleanText(text)
        .replace(/\\b[A-Za-z0-9_-]{32,}\\b/g, '[redacted-token]')
        .replace(/(api[_-]?key|access[_-]?token|secret|password)\\s*[:=]\\s*[^\\s&]+/ig, '$1=[redacted]');
      const headings = Array.from(document.querySelectorAll('h1,h2,h3'))
        .filter(isVisible).map((node) => redact(node.innerText)).filter(Boolean).slice(0, 40);
      const paragraphs = Array.from(document.querySelectorAll('p'))
        .filter(isVisible).map((node) => redact(node.innerText)).filter(Boolean).slice(0, 80);
      const links = Array.from(document.querySelectorAll('a[href]'))
        .filter(isVisible).map((node) => {
          try {
            const parsed = new URL(node.href, location.href);
            if (parsed.protocol !== 'https:') return null;
            parsed.search = '';
            parsed.hash = '';
            return { label: redact(node.innerText).slice(0, 300), url: parsed.toString() };
          } catch (_) { return null; }
        }).filter((item) => item && item.label).slice(0, 60);
      const snapshot = {
        type: 'IBUDDY_PAGE_SNAPSHOT',
        requestId,
        url: location.origin + location.pathname,
        title: redact(document.title).slice(0, 300),
        headings,
        paragraphs,
        links
      };
      while (JSON.stringify(snapshot).length > 18000 && snapshot.paragraphs.length > 0) snapshot.paragraphs.pop();
      while (JSON.stringify(snapshot).length > 18000 && snapshot.links.length > 0) snapshot.links.pop();
      while (JSON.stringify(snapshot).length > 18000 && snapshot.headings.length > 0) snapshot.headings.pop();
      window.ReactNativeWebView.postMessage(JSON.stringify(snapshot));
    } catch (_) {
      window.ReactNativeWebView.postMessage(JSON.stringify({
        type: 'IBUDDY_PAGE_SNAPSHOT_ERROR',
        requestId
      }));
    }
  })();
  true;`;
}
