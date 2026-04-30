import { useEffect, useState } from 'preact/hooks';
import { useItemStore } from './store/item';
import { ItemList } from './components/ItemList/ItemList';
import { LocationList } from './components/LocationList/LocationList';
import { DialogProvider } from './providers/dialog';

export function App() {
  const loading = useItemStore(e => e.loading);
  const error = useItemStore(e => e.error);
  const fetchItems = useItemStore(e => e.fetchItems);
  const [activeTab, setActiveTab] = useState<'items' | 'locations'>('items');

  useEffect(() => {
    fetchItems();
  }, []);

  return (
    <>
        <div class="mb-6 flex flex-col gap-4 rounded-2xl border border-zinc-800 bg-zinc-900/80 p-4 shadow-lg shadow-black/20 backdrop-blur">
          <div>
            <div class="text-2xl font-semibold tracking-wide">Manosaba Wiki</div>
            <div class="mt-1 text-sm text-zinc-400">请输入文本</div>
          </div>

          <div class="inline-flex w-fit rounded-xl border border-zinc-800 bg-zinc-950 p-1">
            <button
              type="button"
              class={[
                'rounded-lg px-4 py-2 text-sm transition',
                activeTab === 'items'
                  ? 'bg-zinc-100 text-zinc-950'
                  : 'text-zinc-400 hover:text-zinc-100'
              ].join(' ')}
              onClick={() => setActiveTab('items')}
            >
              物品浏览
            </button>
            <button
              type="button"
              class={[
                'rounded-lg px-4 py-2 text-sm transition',
                activeTab === 'locations'
                  ? 'bg-zinc-100 text-zinc-950'
                  : 'text-zinc-400 hover:text-zinc-100'
              ].join(' ')}
              onClick={() => setActiveTab('locations')}
            >
              地点浏览
            </button>
          </div>
        </div>

        {loading ? (
          <div class="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-6 text-zinc-400">Loading</div>
        ) : error ? (
          <div class="rounded-2xl border border-red-900/60 bg-red-950/40 p-6 text-red-200">
            {error}
          </div>
        ) : activeTab === 'items' ? (
          <ItemList />
        ) : (
          <LocationList />
        )}
      <DialogProvider />
    </>
  )
}
