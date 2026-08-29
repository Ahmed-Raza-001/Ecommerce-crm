import { create } from "zustand";

interface SelectionState {
  selectedProductIds: (number | string)[];
  toggleSelectProduct: (id: number | string) => void;
  selectProducts: (ids: (number | string)[]) => void;
  deselectProduct: (id: number | string) => void;
  clearSelection: () => void;
  isSelected: (id: number | string) => boolean;
}

export const useSelectionStore = create<SelectionState>((set, get) => ({
  selectedProductIds: [],

  toggleSelectProduct: (id: number | string) => {
    const { selectedProductIds } = get();
    const strId = String(id);
    if (selectedProductIds.some((item) => String(item) === strId)) {
      set({ selectedProductIds: selectedProductIds.filter((item) => String(item) !== strId) });
    } else {
      set({ selectedProductIds: [...selectedProductIds, id] });
    }
  },

  selectProducts: (ids: (number | string)[]) => {
    const current = get().selectedProductIds;
    const combined = [...current];
    for (const id of ids) {
      if (!combined.some((item) => String(item) === String(id))) {
        combined.push(id);
      }
    }
    set({ selectedProductIds: combined });
  },

  deselectProduct: (id: number | string) => {
    set({ selectedProductIds: get().selectedProductIds.filter((item) => String(item) !== String(id)) });
  },

  clearSelection: () => {
    set({ selectedProductIds: [] });
  },

  isSelected: (id: number | string) => {
    return get().selectedProductIds.some((item) => String(item) === String(id));
  },
}));
