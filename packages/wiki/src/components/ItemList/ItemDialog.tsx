import { ItemCardHeader } from './ItemHeader';
import { MCRichText } from '../MCRichText/MCRichText';
import type { Item } from '@manosaba/types';

type ItemDialogProps = {
  item: Item,
};

export const ItemDialog = ({ item }: ItemDialogProps) => {
  const {
    descriptionRich,
    sources
  } = item;

  return (
    <div class="p-4">
      <div class="pb-2">
        <ItemCardHeader
          name={item.name}
          types={item.types}
        />
      </div>

      <div>
        <MCRichText document={descriptionRich} />
      </div>

      {sources && sources.length > 0 && (
        <div class="pt-2">
          {sources
            .filter(e => e.type === 'location')
            .sort((a, b) => (b.probability ?? 1) - (a.probability ?? 1))
            .map((source) => (
                <div>
                  有 {Math.round((source.probability ?? 1) * 100)}%
                  的概率可以从{source.name}找到
                  {source.count && source.count > 1 && (
                    <>{source.count}个</>
                  )}
                </div>
              )
            )
          }
          {sources.filter(e => e.type === 'crafting').length > 0 && (
            <div>本物品拥有合成配方</div>
          )}
        </div>
      )}
    </div>
  )
};
