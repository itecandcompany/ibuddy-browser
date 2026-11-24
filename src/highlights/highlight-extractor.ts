import type { PageSnapshot } from "@/extraction/page-extractor";

export type PageHighlight = { term: string; excerpt: string; source: "heading" | "page-text" };

const STOP_WORDS = new Set(["about","after","again","also","among","because","before","being","between","could","does","during","each","from","have","into","more","most","other","over","same","some","such","than","that","their","there","these","they","this","those","through","under","using","very","what","when","where","which","while","with","would","your","will","were","been","were","them","then","only","page","read"]);

export function extractPageHighlights(snapshot: PageSnapshot, limit = 8): PageHighlight[] {
  const counts = new Map<string, number>();
  const corpus = [...snapshot.headings, ...snapshot.paragraphs].join(" ");
  for (const match of corpus.toLowerCase().matchAll(/[a-z][a-z-]{3,}/g)) {
    const word = match[0];
    if (STOP_WORDS.has(word)) continue;
    counts.set(word, (counts.get(word) ?? 0) + 1);
  }
  const ranked = [...counts.entries()].sort((a,b)=>b[1]-a[1]).slice(0,limit);
  return ranked.map(([term]) => {
    const heading = snapshot.headings.find((value) => value.toLowerCase().includes(term));
    const paragraph = snapshot.paragraphs.find((value) => value.toLowerCase().includes(term));
    const source: PageHighlight["source"] = heading ? "heading" : "page-text";
    const excerpt = (heading ?? paragraph ?? "").slice(0, 320);
    return { term, excerpt, source };
  }).filter((item) => item.excerpt.length > 0);
}
