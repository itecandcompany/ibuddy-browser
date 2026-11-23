import { classifyQuestion } from "./question-classifier";

describe("classifyQuestion", () => {
  it("recognizes definitions", () => expect(classifyQuestion("What is photosynthesis?").kind).toBe("definition"));
  it("recognizes comparisons", () => expect(classifyQuestion("Compare mitosis and meiosis").kind).toBe("comparison"));
  it("recognizes procedural learning", () => expect(classifyQuestion("How do I balance a chemical equation?").kind).toBe("procedure"));
  it("recognizes calculations as teach-concept", () => expect(classifyQuestion("Calculate the acceleration").responseMode).toBe("teach-concept"));
  it("marks assessment language as concept-only", () => {
    const result = classifyQuestion("I am taking a graded quiz, solve this");
    expect(result.assessmentLike).toBe(true);
    expect(result.responseMode).toBe("teach-concept");
  });
  it("does not classify ordinary study questions as assessments", () => expect(classifyQuestion("Explain Newton's first law").assessmentLike).toBe(false));
});
