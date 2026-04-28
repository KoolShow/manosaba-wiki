import { useEffect } from 'preact/hooks';
import { useItemStore } from './store/item';

export function App() {
  const loading = useItemStore(e => e.error);
  const error = useItemStore(e => e.error);
  const fetchItems = useItemStore(e => e.fetchItems);

  useEffect(() => {
    fetchItems();
  }, []);

  return (
    <>
      {!loading ? (
        <div>Loaded</div>
      ) : (
        <div>Loading</div>
      )}
    </>
  )
}
