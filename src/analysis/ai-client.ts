import type { PageSnapshot } from "@/extraction/page-extractor";
import { getSupabaseClient } from "@/lib/supabase";

export type AIResponse = { text: string; sourceUrl?: string; saved?: false };

async function invoke<T>(name: string, body: unknown): Promise<T> {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error("iBuddy is not connected to Supabase. Configure the public Supabase URL and key, then restart the app.");
  const { data: sessionData } = await supabase.auth.getSession();
  if (!sessionData.session) throw new Error("Sign in to iBuddy before using AI features.");
  const { data, error } = await supabase.functions.invoke(name, { body });
  if (error) {
    const context = (error as { context?: { json?: () => Promise<unknown> } }).context;
    if (context?.json) {
      try {
        const payload = await context.json() as { error?: string };
        if (payload.error) throw new Error(payload.error);
      } catch (cause) {
        if (cause instanceof Error && cause.message !== "Unexpected end of JSON input") throw cause;
      }
    }
    throw new Error(error.message || "The AI request could not be completed.");
  }
  return data as T;
}

export async function summarizePage(snapshot: PageSnapshot): Promise<AIResponse> {
  return invoke("analyze-page", { mode: "summary", snapshot });
}

export async function explainPage(snapshot: PageSnapshot, question: string): Promise<AIResponse> {
  return invoke("analyze-page", { mode: "explain", snapshot, question });
}

export async function askPage(snapshot: PageSnapshot, question: string, history: Array<{ role: "user" | "assistant"; content: string }> = []): Promise<AIResponse> {
  return invoke("chat", {
    url: snapshot.url,
    title: snapshot.title,
    context: [
      ...snapshot.headings,
      ...snapshot.paragraphs,
      ...snapshot.formLabels.map((label) => "Form label: " + label),
    ].join("\n"),
    question,
    history: history.slice(-8),
  });
}

export async function requestServerOcr(url: string, mimeType: "image/jpeg" | "image/png" | "image/webp", imageBase64: string): Promise<AIResponse> {
  return invoke("ocr-fallback", { url, mimeType, imageBase64 });
}
