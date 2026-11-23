import { z } from 'zod';

const safeHttpsUrl = z.string().url().refine((value) => {
  try { return new URL(value).protocol === 'https:'; } catch { return false; }
}, 'Only HTTPS URLs are accepted');

export const pageSnapshotSchema = z.object({
  type: z.literal('IBUDDY_PAGE_SNAPSHOT'),
  requestId: z.string().min(1).max(80),
  url: safeHttpsUrl,
  title: z.string().max(300),
  headings: z.array(z.string().max(500)).max(40),
  paragraphs: z.array(z.string().max(1200)).max(80),
  formLabels: z.array(z.string().max(300)).max(40),
  links: z.array(z.object({ label: z.string().max(300), url: safeHttpsUrl })).max(60),
  limitations: z.array(z.enum(['cross-origin-frames-not-read', 'canvas-or-image-text-not-read', 'pdf-content-may-not-be-readable'])).max(3),
});

export type PageSnapshot = z.infer<typeof pageSnapshotSchema>;

/** Read-only script invoked only after the user taps Read page. */
export function buildPageExtractionScript(requestId: string): string {
  const safeRequestId = JSON.stringify(requestId);
  return `(function () {
    try {
      const requestId = ${safeRequestId};
      const cleanText = (value, max = 1200) => String(value || '')
        .replace(/[\\u0000-\\u001F\\u007F]/g, ' ')
        .replace(/\\s+/g, ' ').trim().slice(0, max);
      const redact = (value, max = 1200) => cleanText(value, max)
        .replace(/\\b[A-Za-z0-9_-]{40,}\\b/g, '[redacted-token]')
        .replace(/(api[_-]?key|access[_-]?token|secret|password)\\s*[:=]\\s*[^\\s&]+/ig, '$1=[redacted]');
      const isVisible = (element) => {
        if (!element || !element.isConnected) return false;
        if (element.closest('script,style,noscript,template,[aria-hidden="true"],[hidden]')) return false;
        const style = window.getComputedStyle(element);
        const rect = element.getBoundingClientRect();
        return style.display !== 'none' && style.visibility !== 'hidden' &&
          Number(style.opacity || 1) > 0 && rect.width > 0 && rect.height > 0;
      };
      const textFrom = (selector, maxItems, maxLength) => Array.from(document.querySelectorAll(selector))
        .filter(isVisible)
        .map((node) => redact(node.innerText || node.textContent, maxLength))
        .filter(Boolean).slice(0, maxItems);
      const headings = textFrom('h1,h2,h3,h4', 40, 500);
      const paragraphs = textFrom('p,li,blockquote', 80, 1200);
      const formLabels = Array.from(document.querySelectorAll('label'))
        .filter(isVisible)
        .map((node) => redact(node.innerText || node.textContent, 300))
        .filter(Boolean).slice(0, 40);
      const links = Array.from(document.querySelectorAll('a[href]'))
        .filter(isVisible).map((node) => {
          try {
            const parsed = new URL(node.href, location.href);
            if (parsed.protocol !== 'https:') return null;
            parsed.search = ''; parsed.hash = '';
            return { label: redact(node.innerText || node.textContent, 300), url: parsed.toString() };
          } catch (_) { return null; }
        }).filter((item) => item && item.label).slice(0, 60);
      const limitations = [];
      if (document.querySelector('iframe')) limitations.push('cross-origin-frames-not-read');
      if (document.querySelector('canvas,img,svg')) limitations.push('canvas-or-image-text-not-read');
      if (location.pathname.toLowerCase().endsWith('.pdf')) limitations.push('pdf-content-may-not-be-readable');
      const snapshot = {
        type: 'IBUDDY_PAGE_SNAPSHOT', requestId,
        url: location.origin + location.pathname,
        title: redact(document.title, 300),
        headings, paragraphs, formLabels, links, limitations
      };
      const bounded = () => JSON.stringify(snapshot).length <= 24000;
      while (!bounded() && snapshot.paragraphs.length) snapshot.paragraphs.pop();
      while (!bounded() && snapshot.links.length) snapshot.links.pop();
      while (!bounded() && snapshot.formLabels.length) snapshot.formLabels.pop();
      while (!bounded() && snapshot.headings.length) snapshot.headings.pop();
      window.ReactNativeWebView.postMessage(JSON.stringify(snapshot));
    } catch (_) {
      window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'IBUDDY_PAGE_SNAPSHOT_ERROR', requestId }));
    }
  })();
  true;`;
}