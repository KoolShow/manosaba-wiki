import { MCRichText } from '../MCRichText/MCRichText';
import { ItemCardHeader } from './ItemHeader';
import { ItemTag } from './ItemTag';
import { ItemDialog } from './ItemDialog';
import * as dialog from '../../dialog';
import type { Item, LocationSource } from '@manosaba/types';

type ItemCardProps = {
  item: Item
  source?: LocationSource
};

export const ItemCard = ({ item, source }: ItemCardProps) => {
  const showDetailDialog = () => {
    dialog.show(<ItemDialog item={item} />);
  };

  const getRarityClasses = (): string => {
    let probability: number | undefined;

    if (source) {
      // 地点浏览：使用传入的 source 的概率
      probability = source.probability;
    } else {
      // 物品浏览：从所有 sources 中找最大概率
      if (item.sources && item.sources.length > 0) {
        const maxProb = Math.max(
          ...item.sources
            .filter(s => s.type === 'location')
            .map(s => (s as any).probability ?? 1)
        );
        probability = maxProb;
      }
    }

    const prob = probability ?? 1;

    // 概率为 0 使用灰色
    if (prob === 0) return 'bg-slate-950 border-slate-800 hover:bg-slate-900 hover:border-slate-700';
    if (prob < 0.01) return 'bg-red-950 border-red-800 hover:bg-red-900 hover:border-red-700';
    if (prob < 0.03) return 'bg-purple-950 border-purple-800 hover:bg-purple-900 hover:border-purple-700';
    if (prob < 0.05) return 'bg-indigo-950 border-indigo-800 hover:bg-indigo-900 hover:border-indigo-700';
    if (prob < 0.1) return 'bg-blue-950 border-blue-800 hover:bg-blue-900 hover:border-blue-700';
    if (prob < 0.2) return 'bg-cyan-950 border-cyan-800 hover:bg-cyan-900 hover:border-cyan-700';
    if (prob < 0.3) return 'bg-green-950 border-green-800 hover:bg-green-900 hover:border-green-700';
    return 'bg-slate-950 border-slate-800 hover:bg-slate-900 hover:border-slate-700';
  };

  return (
    <button
      type="button"
      class={`p-4 transition transition-linear duration-100 border rounded-md cursor-pointer item-list-card w-full text-left ${getRarityClasses()}`}
      onClick={showDetailDialog}
    >
      <div class="pb-2">
        {source ? (
          <div>
            <div class="flex items-center justify-between gap-2 pb-1">
              <div class="flex items-baseline gap-1 min-w-0">
                <div class="text-xl truncate">{item.name}</div>
                {source.count && source.count > 1 && (
                  <span class="text-xs text-gray-500 shrink-0">(x{source.count})</span>
                )}
              </div>
              <div class="rounded-full border border-gray-600 bg-gray-900 px-2 py-0.5 text-xs text-gray-300 shrink-0 whitespace-nowrap">
                {Math.round((source.probability ?? 1) * 1000) / 10}%
              </div>
            </div>
            {item.types && item.types.length > 0 && (
              <ItemTag tags={item.types} />
            )}
          </div>
        ) : (
          <ItemCardHeader
            name={item.name}
            types={item.types}
          />
        )}
      </div>

      <MCRichText document={item.descriptionRich} />
    </button>
  );
};
