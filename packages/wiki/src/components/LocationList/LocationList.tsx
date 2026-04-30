import { useMemo } from 'preact/hooks';
import { useItemStore } from '../../store/item';
import { getLocationName } from '../../const';
import { ItemCard } from '../ItemList/ItemCard';
import './style.css';
import type { Item, LocationSource } from '@manosaba/types';

type LocationEntry = {
  item: Item;
  source: LocationSource;
};

type LocationGroup = {
  id: string;
  name: string;
  entries: LocationEntry[];
};

export const LocationList = () => {
  const items = useItemStore(e => e.items);

  const groupedByLocation = useMemo<LocationGroup[]>(() => {
    const groups = new Map<string, LocationGroup>();

    for (const item of items) {
      for (const source of item.sources ?? []) {
        if (source.type !== 'location') continue;

        const group = groups.get(source.name) ?? {
          id: source.name,
          name: getLocationName(source.name),
          entries: [],
        };

        group.entries.push({ item, source });
        groups.set(source.name, group);
      }
    }

    return [...groups.values()].sort((left, right) => {
      const entryDelta = right.entries.length - left.entries.length;
      if (entryDelta !== 0) return entryDelta;
      return left.name.localeCompare(right.name, 'zh-Hans-CN');
    });
  }, [items]);

  if (groupedByLocation.length === 0) {
    return (
      <div class="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-6 text-zinc-400">
        暂无可用的地点来源数据。
      </div>
    );
  }

  return (
    <div class="space-y-8">
      {groupedByLocation.map((location) => {

        return (
          <section key={location.id}>
            <div class="mb-3 flex items-baseline justify-between gap-4">
              <h2 class="text-xl font-semibold text-zinc-50">{location.name}</h2>
              <div class="text-xs text-zinc-500">
                {location.entries.length} 个物品
              </div>
            </div>
            <div class="location-item-list">
              {location.entries
                .sort((left, right) => (right.source.probability ?? 1) - (left.source.probability ?? 1))
                .map(({ item, source }) => (
                  <ItemCard
                    key={`${location.id}:${item.id}:${source.probability ?? 'unknown'}`}
                    item={item}
                    source={source}
                  />
                ))}
            </div>
          </section>
        );
      })}
    </div>
  );
};
