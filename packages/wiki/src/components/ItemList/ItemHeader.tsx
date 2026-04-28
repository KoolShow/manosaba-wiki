import type { ItemType } from '@manosaba/types';

type ItemCardHeaderProps = {
  name: string,
  types?: ItemType[],
  icon?: string,
};

export const ItemCardHeader = ({
  name,
  types,
  icon,
}: ItemCardHeaderProps) => {
  return (
    <div>
      <div class="text-xl truncate">{name}</div>
      {types && types.length > 0 && (
        <div class="text-gray-500 truncate">
          {types.map((type) => (
            <span>{type}</span>
          ))}
        </div>
      )}
    </div>
  );
};
