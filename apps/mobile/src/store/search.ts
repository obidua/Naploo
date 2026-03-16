import { create } from 'zustand';
import type { SearchParams, FilterParams } from '@/types';

interface SearchState {
  params: SearchParams;
  filters: FilterParams;
  recentSearches: SearchParams[];
  
  setParams: (params: Partial<SearchParams>) => void;
  setFilters: (filters: Partial<FilterParams>) => void;
  clearFilters: () => void;
  addRecentSearch: (params: SearchParams) => void;
  clearRecentSearches: () => void;
}

export const useSearchStore = create<SearchState>((set, get) => ({
  params: {
    type: 'all',
    guests: 1,
    rooms: 1,
    pods: 1,
  },
  filters: {},
  recentSearches: [],

  setParams: (params) =>
    set((state) => ({ params: { ...state.params, ...params } })),

  setFilters: (filters) =>
    set((state) => ({ filters: { ...state.filters, ...filters } })),

  clearFilters: () => set({ filters: {} }),

  addRecentSearch: (params) =>
    set((state) => ({
      recentSearches: [params, ...state.recentSearches.slice(0, 9)],
    })),

  clearRecentSearches: () => set({ recentSearches: [] }),
}));
