import { create } from "zustand";
import type { PageSnapshot } from "@/extraction/page-extractor";

type AnalysisState = {
  snapshot: PageSnapshot | null;
  setSnapshot: (snapshot: PageSnapshot | null) => void;
};

export const useAnalysisStore = create<AnalysisState>((set) => ({
  snapshot: null,
  setSnapshot: (snapshot) => set({ snapshot }),
}));
