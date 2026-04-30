import { getItemType } from '../../const';

type ItemTagProps = {
  tags: string[],
}

export const ItemTag = ({
  tags
}: ItemTagProps) => {
  return (
    <div class="mt-1 text-sm text-gray-400 flex gap-2">
      {tags.map((tag) => (
        <span
          class="px-2 bg-gray-700 rounded-sm"
        >{getItemType(tag)}</span>
      ))}
    </div>
  )
};
