import { MCRichText } from '../MCRichText/MCRichText';
import { ItemCardHeader } from './ItemHeader';
import { ItemDialog } from './ItemDialog';
import * as dialog from '../../dialog';
import type { Item } from '@manosaba/types';

type ItemCardProps = {
  item: Item
};

export const ItemCard = ({ item }: ItemCardProps) => {
  const showDetailDialog = () => {
    dialog.show(<ItemDialog item={item} />);
  };

  return (
    <div
      class={[
        'p-4',
        'transition',
        'transition-linear',
        'duration-100',
        'border',
        'border-gray-600',
        'hover:border-gray-500',
        'rounded-md',
        'bg-gray-800',
        'hover:bg-gray-700',
        'cursor-pointer',
        'item-list-card',
      ].join(' ')}
      onClick={showDetailDialog}
    >
      <div class="pb-2">
        <ItemCardHeader
          name={item.name}
          types={item.types}
        />
      </div>

      <div>
        <MCRichText document={item.descriptionRich ?? null} />
      </div>
    </div>
  );
};
