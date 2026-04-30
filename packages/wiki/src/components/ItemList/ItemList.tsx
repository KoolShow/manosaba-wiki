import { useState } from 'preact/hooks';
import { getItemType, getLocationName, ItemTypeMap, LocationMap } from '../../const';
import { useItemStore } from '../../store/item';
import { ItemCard } from './ItemCard';
import type { TargetedEvent } from 'preact';
import './style.css';

export const ItemList = () => {
  const [ filterTypes, setFilterTypes ] = useState<string[]>([]);
  const [ filterLocations, setFilterLocations ] = useState<string[]>([]);
  const itemsOrig = useItemStore(e => e.items);

  const toggleFilterType = (type: string, enabled: boolean) => {
    setFilterTypes((old) => {
      if (!enabled) return old.filter(e => e !== type);
      return [ ...old, type ];
    });
  };

  const toggleFilterLocation = (id: string, enabled: boolean) => {
    setFilterLocations((old) => {
      if (!enabled) return old.filter(e => e !== id);
      return [ ...old, id ];
    });
  };

  const handleTypeFilter = (e: TargetedEvent, type: string) => {
    const target = e.target as HTMLInputElement;
    const { checked } = target;

    toggleFilterType(type, checked);
  };

  const handleLocationFilter = (e: TargetedEvent, locationId: string) => {
    const target = e.target as HTMLInputElement;
    const { checked } = target;

    toggleFilterLocation(locationId, checked);
  };

  const items = (
    itemsOrig
      .filter((item) => {
        if (filterTypes.length <= 0) return true;
        if (!item.types || item.types.length <= 0) return false;

        return (
          item.types.filter((e) => filterTypes.findIndex(i => i === e) !== -1).length > 0
        )
      })
      .filter((item) => {
        if (filterLocations.length <= 0) return true;
        if (!item.sources || item.sources.length <= 0) return false;
        return (
          item.sources.filter((e) => e.type === 'location' && filterLocations.findIndex(i => e.name === i) !== -1).length > 0
        );
      })
  );

  return (
    <>
      <div class="my-2 py-2 flex items-center gap-1 whitespace-nowrap w-full overflow-x-auto overflow-y-visible">
        <div>类别：</div>
        <div class="flex flex-1 gap-2">
          {Object.keys(ItemTypeMap).map((type) => (
            <label class="whitespace-nowrap shrink-0">
              <input class="peer sr-only" type='checkbox' onChange={(e) => handleTypeFilter(e, type)} />
              <span
                class={[
                  'min-w-8',
                  'px-3',
                  'py-1',
                  'transition',
                  'transition-linear',
                  'duration-100',
                  'border',
                  'border-gray-600',
                  'hover:border-gray-500',
                  'rounded-full',
                  'bg-transparent',
                  'hover:bg-gray-800',
                  'cursor-pointer',
                  'peer-checked:bg-blue-600',
                  'peer-checked:text-white',
                  'peer-checked:border-blue-400',
                  'box-border'
                ].join(' ')}
              >{getItemType(type)}</span>
            </label>
          ))}
        </div>
      </div>

      <div class="my-2 py-2 flex items-center gap-1 whitespace-nowrap w-full overflow-x-auto overflow-y-visible">
        <div>地点：</div>
        <div class="flex flex-1 gap-2">
          {Object.keys(LocationMap).map((locationId) => (
            <label class="whitespace-nowrap shrink-0">
              <input class="peer sr-only" type='checkbox' onChange={(e) => handleLocationFilter(e, locationId)} />
              <span
                class={[
                  'min-w-8',
                  'px-3',
                  'py-1',
                  'transition',
                  'transition-linear',
                  'duration-100',
                  'border',
                  'border-gray-600',
                  'hover:border-gray-500',
                  'rounded-full',
                  'bg-transparent',
                  'hover:bg-gray-800',
                  'cursor-pointer',
                  'peer-checked:bg-blue-600',
                  'peer-checked:text-white',
                  'peer-checked:border-blue-400',
                  'box-border'
                ].join(' ')}
              >{getLocationName(locationId)}</span>
            </label>
          ))}
        </div>
      </div>

      <div class="item-list">
        {items.map((item) => (
          <ItemCard item={item} key={item.id} />
        ))}
      </div>
    </>
  )
};
