import { useEffect } from 'preact/hooks';
import { useItemStore } from './store/item';
import { ItemList } from './components/ItemList/ItemList';
import { DialogProvider } from './providers/dialog';

export function App() {
  const loading = useItemStore(e => e.error);
  const fetchItems = useItemStore(e => e.fetchItems);

  useEffect(() => {
    fetchItems();
  }, []);

  return (
    <>
      {!loading ? (
        <ItemList />
      ) : (
        <div>Loading</div>
      )}
      <DialogProvider />
    </>
  )
}
