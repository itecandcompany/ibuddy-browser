import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type BrowserTab = {
  id: string;
  url: string;
  title: string;
  privateMode: boolean;
};

export type HistoryEntry = {
  id: string;
  url: string;
  title: string;
  visitedAt: number;
};

export type Bookmark = {
  id: string;
  url: string;
  title: string;
  createdAt: number;
};

type PersistedBrowserState = {
  history: HistoryEntry[];
  bookmarks: Bookmark[];
  lockedDomains: string[];
};

type BrowserState = PersistedBrowserState & {
  tabs: BrowserTab[];
  activeTabId: string;
  addTab: (privateMode?: boolean) => void;
  closeTab: (id: string) => void;
  setActiveTab: (id: string) => void;
  updateActiveTab: (patch: Partial<Pick<BrowserTab, 'url' | 'title'>>) => void;
  addHistory: (entry: Omit<HistoryEntry, 'id' | 'visitedAt'>) => void;
  toggleBookmark: (entry: Pick<Bookmark, 'url' | 'title'>) => void;
  toggleDomainLock: (domain: string) => void;
  clearBrowsingData: () => void;
  clearLocalData: () => void;
};

const makeId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
const initialTab: BrowserTab = {
  id: makeId(),
  url: 'https://duckduckgo.com/',
  title: 'New tab',
  privateMode: false,
};

export const useBrowserStore = create<BrowserState>()(
  persist(
    (set, get) => ({
      tabs: [initialTab],
      activeTabId: initialTab.id,
      history: [],
      bookmarks: [],
      lockedDomains: [],
      addTab: (privateMode = false) => {
        const tab: BrowserTab = {
          id: makeId(),
          url: 'https://duckduckgo.com/',
          title: privateMode ? 'Private tab' : 'New tab',
          privateMode,
        };
        set((state) => ({ tabs: [...state.tabs, tab], activeTabId: tab.id }));
      },
      closeTab: (id) => {
        const state = get();
        if (state.tabs.length <= 1) {
          const replacement: BrowserTab = {
            id: makeId(),
            url: 'https://duckduckgo.com/',
            title: 'New tab',
            privateMode: false,
          };
          set({ tabs: [replacement], activeTabId: replacement.id });
          return;
        }
        const nextTabs = state.tabs.filter((tab) => tab.id !== id);
        const nextActive = state.activeTabId === id ? nextTabs[nextTabs.length - 1] : nextTabs.find((tab) => tab.id === state.activeTabId);
        set({ tabs: nextTabs, activeTabId: nextActive?.id ?? nextTabs[0]!.id });
      },
      setActiveTab: (id) => set((state) => state.tabs.some((tab) => tab.id === id) ? { activeTabId: id } : {}),
      updateActiveTab: (patch) => set((state) => ({
        tabs: state.tabs.map((tab) => tab.id === state.activeTabId ? { ...tab, ...patch } : tab),
      })),
      addHistory: (entry) => {
        const active = get().tabs.find((tab) => tab.id === get().activeTabId);
        if (!active || active.privateMode || !entry.url.startsWith('https://')) return;
        set((state) => ({
          history: [
            { ...entry, id: makeId(), visitedAt: Date.now() },
            ...state.history.filter((item) => item.url !== entry.url),
          ].slice(0, 100),
        }));
      },
      toggleBookmark: (entry) => set((state) => {
        const exists = state.bookmarks.some((item) => item.url === entry.url);
        return {
          bookmarks: exists
            ? state.bookmarks.filter((item) => item.url !== entry.url)
            : [{ ...entry, id: makeId(), createdAt: Date.now() }, ...state.bookmarks],
        };
      }),
      toggleDomainLock: (domain) => set((state) => ({
        lockedDomains: state.lockedDomains.includes(domain)
          ? state.lockedDomains.filter((item) => item !== domain)
          : [...state.lockedDomains, domain],
      })),
    }),
    {
      name: 'ibuddy-browser-local-v1',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        history: state.history,
        bookmarks: state.bookmarks,
        lockedDomains: state.lockedDomains,
      }) satisfies PersistedBrowserState,
    },
  ),
);
