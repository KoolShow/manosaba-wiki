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
    <div class="p-4 border rounded-md item-list-card" onClick={showDetailDialog}>
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
