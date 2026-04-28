import { CardHeader } from './Header';
import { MCRichText } from '../MCRichText/MCRichText';
import type { Item } from '@manosaba/types';

type CardProps = {
  item: Item
};

export const Card = ({ item }: CardProps) => {
  return (
    <div class="p-4 border rounded-md">
      <CardHeader title={item.name} />
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
