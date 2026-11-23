import { useState } from "react";
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useAnalysisStore } from "@/state/analysis-store";
import { askPage, explainPage, summarizePage } from "@/analysis/ai-client";
import { classifyQuestion } from "@/analysis/question-classifier";
import { extractPageHighlights } from "@/highlights/highlight-extractor";
import { palette } from "@/theme/palette";

type Message = { role: "user" | "assistant"; content: string };

export default function AssistantScreen() {
  const snapshot = useAnalysisStore((state) => state.snapshot);
  const [summary, setSummary] = useState("");
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [busy, setBusy] = useState(false);
  const [assessmentNotice, setAssessmentNotice] = useState(false);

  if (!snapshot) {
    return <SafeAreaView style={styles.safe}><Text style={styles.title}>No page context</Text><Text style={styles.muted}>Read an unlocked page first, then open iBuddy Study.</Text><Pressable style={styles.primary} onPress={() => router.back()}><Text style={styles.primaryText}>Back to browser</Text></Pressable></SafeAreaView>;
  }

  const run = async (task: () => Promise<{ text: string }>, onSuccess: (text: string) => void) => {
    if (busy) return;
    setBusy(true);
    try { const result = await task(); onSuccess(result.text); }
    catch (error) { Alert.alert("iBuddy AI", error instanceof Error ? error.message : "The request failed."); }
    finally { setBusy(false); }
  };

  const send = async () => {
    const prompt = question.trim();
    if (!prompt || busy) return;
    setQuestion("");
    const next = [...messages, { role: "user" as const, content: prompt }];
    setMessages(next);
    await run(
      () => askPage(snapshot, prompt, messages),
      (text) => setMessages((current) => [...current, { role: "assistant", content: text }]),
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}><Text style={styles.back}>‹ Browser</Text></Pressable>
        <View style={styles.headerText}><Text style={styles.title}>iBuddy Study</Text><Text style={styles.muted} numberOfLines={1}>{snapshot.title || snapshot.url}</Text></View>
      </View>
      <KeyboardAvoidingView style={styles.body} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.notice}>Grounded in the page you deliberately read. No page content is saved by this request.</Text>
          <Pressable disabled={busy} style={styles.secondary} onPress={() => run(() => summarizePage(snapshot), setSummary)}>
            <Text style={styles.secondaryText}>Summarize this page</Text>
          </Pressable>
          {summary ? <View style={styles.response}><Text style={styles.section}>PAGE SUMMARY</Text><Text style={styles.responseText}>{summary}</Text></View> : null}
          <Text style={styles.section}>KEY TERMS FROM THIS PAGE</Text>
          {extractPageHighlights(snapshot).map((item) => <View key={item.term} style={styles.highlight}><Text style={styles.highlightTerm}>{item.term}</Text><Text style={styles.highlightExcerpt}>{item.excerpt}</Text></View>)}
          {assessmentNotice ? <Text style={styles.assessmentNotice}>This looks assessment-related. iBuddy will teach concepts and general methods, not supply a direct answer.</Text> : null}
          <Text style={styles.section}>ASK ABOUT THE PAGE</Text>
          <TextInput value={question} onChangeText={setQuestion} placeholder="Ask for a concept explanation…" placeholderTextColor={palette.muted} multiline style={styles.input} />
          <Pressable disabled={busy || !question.trim()} style={styles.primary} onPress={send}><Text style={styles.primaryText}>Ask iBuddy</Text></Pressable>
          <Text style={styles.section}>CONVERSATION</Text>
          {messages.map((message, index) => <View key={index} style={[styles.message, message.role === "user" ? styles.userMessage : styles.assistantMessage]}><Text style={styles.messageLabel}>{message.role === "user" ? "YOU" : "iBUDDY"}</Text><Text style={styles.responseText}>{message.content}</Text></View>)}
          {busy ? <View style={styles.loading}><ActivityIndicator color={palette.blue} /><Text style={styles.muted}>Thinking…</Text></View> : null}
          <Text style={styles.footer}>iBuddy will not provide direct answers to live graded or proctored assessments. If the page is protected or unreadable, analysis is unavailable.</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: palette.background, paddingHorizontal: 16 },
  header: { flexDirection: "row", alignItems: "center", paddingVertical: 12, gap: 14 },
  back: { color: palette.blue, fontWeight: "700", fontSize: 15 },
  headerText: { flex: 1 },
  title: { color: palette.text, fontSize: 21, fontWeight: "800" },
  muted: { color: palette.muted, fontSize: 12, marginTop: 4 },
  body: { flex: 1 },
  content: { paddingBottom: 36, gap: 12 },
  notice: { color: "#B7C9E8", backgroundColor: "#172846", padding: 12, borderRadius: 12, lineHeight: 18, fontSize: 12 },
  highlight: { backgroundColor: palette.surface, borderColor: palette.border, borderWidth: 1, borderRadius: 10, padding: 10 },
  highlightTerm: { color: palette.blue, fontWeight: "900", textTransform: "capitalize" },
  highlightExcerpt: { color: palette.textSecondary, fontSize: 12, lineHeight: 18, marginTop: 3 },
  assessmentNotice: { color: "#FFD39B", backgroundColor: "#392A20", borderRadius: 10, padding: 11, fontSize: 12, lineHeight: 18 },
  secondary: { borderWidth: 1, borderColor: palette.blue, borderRadius: 12, padding: 13, alignItems: "center" },
  secondaryText: { color: palette.blue, fontWeight: "800" },
  primary: { backgroundColor: palette.blue, borderRadius: 12, padding: 14, alignItems: "center" },
  primaryText: { color: "#FFFFFF", fontWeight: "800" },
  section: { color: palette.blue, fontSize: 10, fontWeight: "800", letterSpacing: 1.3, marginTop: 8 },
  response: { backgroundColor: palette.surface, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: palette.border },
  responseText: { color: palette.text, fontSize: 14, lineHeight: 21, marginTop: 6 },
  input: { minHeight: 90, backgroundColor: palette.surface, borderColor: palette.border, borderWidth: 1, borderRadius: 12, padding: 12, color: palette.text, textAlignVertical: "top" },
  message: { borderRadius: 14, padding: 12, marginBottom: 4 },
  userMessage: { backgroundColor: "#1B3159", alignSelf: "flex-end", maxWidth: "92%" },
  assistantMessage: { backgroundColor: palette.surface, alignSelf: "stretch", borderWidth: 1, borderColor: palette.border },
  messageLabel: { color: palette.muted, fontSize: 9, fontWeight: "800", letterSpacing: 1 },
  loading: { flexDirection: "row", gap: 10, alignItems: "center", padding: 8 },
  footer: { color: palette.muted, fontSize: 10, lineHeight: 15, marginTop: 12 },
});
