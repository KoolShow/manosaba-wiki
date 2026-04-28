import { MCRichText } from '../MCRichText/MCRichText';
import type { Item } from '@manosaba/types';

type ItemCardProps = {
  item: Item
};

export const ItemCard = ({ item }: ItemCardProps) => {
  return (
    <div class="p-4 border rounded-md item-list-card">
      <div class="pb-2">
        <div>
          <div class="text-xl truncate">{item.name}</div>
        </div>
      </div>

      <div>
        <MCRichText document={item.descriptionRich ?? null} />
      </div>

      {item.types && (
        <div class="pt-2">
          <div class="text-gray-500">
            {item.types.map((type) => (
              <span>{type}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
