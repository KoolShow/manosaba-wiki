import 'preact/compat';
import { create } from 'zustand';
import type { Item } from '@manosaba/types';

interface ItemStore {
  items: Item[],
  loading: boolean,
  error: string | null,
  fetchItems: () => Promise<void>,
}

export const useItemStore = create<ItemStore>((set, get) => ({
  items: [],
  loading: false,
  error: null,
  fetchItems: async () => {
    if (get().loading) return;
    if (get().error) return;
    if (get().items.length > 0) return;

    set({ loading: true, error: null });

    try {
      const response = await fetch('items.json');
      const items = await response.json();
      set({ items, loading: false });
    } catch (error) {
      set({ loading: false, error: (error as Error).message ?? JSON.stringify(error) });
      console.error(error);
    }
  }
}));
