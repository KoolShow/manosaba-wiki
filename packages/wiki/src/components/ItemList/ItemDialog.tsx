import { useState } from 'preact/hooks';
import { ItemCardHeader } from './ItemHeader';
import { MCRichText } from '../MCRichText/MCRichText';
import { getLocationName } from '../../const';
import type { Item, RichTextDocument } from '@manosaba/types';

type ItemDialogProps = {
  item: Item,
};

export const ItemDialog = ({ item }: ItemDialogProps) => {
  const [ name, setName ] = useState<string>(item.name);
  const [ description, setDiscription ] = useState<RichTextDocument | undefined>(item.descriptionRich);

  const {
    variant,
    sources,
  } = item;

  const switchVariant = (index: number) => {
    if (index < 0) {
      setName(item.name);
      setDiscription(item.descriptionRich);
    }

    if (!variant) return;

    const _variant = variant.variants[index];
    if (!_variant) return;

    if (_variant.name) setName(_variant.name);
    if (_variant.descriptionRich) setDiscription(_variant.descriptionRich);
  };

  return (
    <div class="p-4">
      <div class="pb-2">
        <ItemCardHeader
          name={name}
          types={item.types}
        />
      </div>

      {variant && variant.variants.length > 1 && (
        <div class="pb-2 flex flex-nowrap gap-2 overflow-y-hidden overflow-x-auto w-full">
          {variant.variants.map((variant, index) => (
            <button
              class={[
                'min-w-8',
                'px-2',
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
              ].join(' ')}
              onClick={() => switchVariant(index)}
            >{variant.stateValue ?? variant.slug}</button>
          ))}
        </div>
      )}

      <MCRichText document={description} />

      {sources && sources.length > 0 && (
        <div class="pt-2">
          {sources
            .filter(e => e.type === 'location')
            .sort((a, b) => (b.probability ?? 1) - (a.probability ?? 1))
            .map((source) => (
                <div class="text-gray-400">
                  <span class="text-gray-200">{Math.round((source.probability ?? 1) * 1000) / 10}% </span>
                  的概率可以从 <span class="text-gray-200">{getLocationName(source.name)}</span> 找到
                  {source.count && source.count > 1 && (
                    <> <span class="text-gray-200">{source.count} 个</span></>
                  )}
                  <div class="ml-10 text-gray-400">
                    平均需要尝试
                    <span class="text-gray-200"> {Math.round((1 / (source.probability ?? 1)) * 10) / 10} 次</span>
                  </div>
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
