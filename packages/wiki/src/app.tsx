import { useEffect } from 'preact/hooks';
import { useItemStore } from './store/item';
import { ItemList } from './components/ItemList/ItemList';
import { DialogProvider } from './providers/dialog';

export function App() {
  const loading = useItemStore(e => e.loading);
  const error = useItemStore(e => e.error);
  const fetchItems = useItemStore(e => e.fetchItems);

  useEffect(() => {
    fetchItems();
  }, []);

  return (
    <>
        {loading ? (
          <div class="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-6 text-zinc-400">Loading</div>
        ) : error ? (
          <div class="rounded-2xl border border-red-900/60 bg-red-950/40 p-6 text-red-200">
            {error}
          </div>
        ) : (
          <ItemList />
        )}
      <DialogProvider />
    </>
  )
}
