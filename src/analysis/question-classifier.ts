export type QuestionIntent = {
  kind: "definition" | "comparison" | "procedure" | "calculation" | "concept" | "assessment-like" | "general";
  assessmentLike: boolean;
  responseMode: "teach-concept" | "explain" | "general";
};

const patterns: Array<[QuestionIntent["kind"], RegExp]> = [
  ["definition", /\b(define|what is|what are|meaning of|describe)\b/i],
  ["comparison", /\b(compare|contrast|difference between|similarities|versus|vs\.)\b/i],
  ["procedure", /\b(how do i|how to|steps to|process of|procedure|method)\b/i],
  ["calculation", /\b(calculate|compute|solve|evaluate|find the value|work out)\b/i],
];

export function classifyQuestion(input: string): QuestionIntent {
  const value = input.trim();
  const assessmentLike = /\b(exam|examination|test|quiz|graded|assessment|midterm|final paper|proctored|continuous assessment)\b/i.test(value);
  if (assessmentLike) return { kind: "assessment-like", assessmentLike: true, responseMode: "teach-concept" };
  for (const [kind, pattern] of patterns) {
    if (pattern.test(value)) return { kind, assessmentLike: false, responseMode: kind === "calculation" ? "teach-concept" : "explain" };
  }
  if (/\b(why|explain|understand|concept|principle|reason)\b/i.test(value)) return { kind: "concept", assessmentLike: false, responseMode: "explain" };
  return { kind: "general", assessmentLike: false, responseMode: "general" };
}
