import type { RichTextSpan } from '@manosaba/types';
import type { CSSProperties } from 'preact';

export const MINECRAFT_COLOR_MAP: Record<string, string> = {
  'black': 'text-gray-900 dark:text-gray-300',
  'dark_blue': 'text-blue-900',
  'dark_green': 'text-green-700',
  'dark_aqua': 'text-cyan-700',
  'dark_red': 'text-red-800',
  'dark_purple': 'text-purple-800',
  'gold': 'text-yellow-600',
  'gray': 'text-gray-400',
  'dark_gray': 'text-gray-600',
  'blue': 'text-blue-500',
  'green': 'text-green-500',
  'aqua': 'text-cyan-400',
  'red': 'text-red-500',
  'light_purple': 'text-purple-400',
  'yellow': 'text-yellow-400',
  'white': 'text-gray-300 dark:text-gray-900',
};

type RichTextParagraphProps = {
  children: RichTextSpan[],
};

export const RichTextParagraph = ({
  children,
}: RichTextParagraphProps) => {
  return (
    <div class="mc-rich-text-paragraph">
      {children.map((i) => {
        const { text, marks } = i;
        const customCSS: CSSProperties = {};
        let classes = [ "mc-rich-text-span" ];
        if (marks) {
          if (marks.bold) classes.push('font-bold');
          if (marks.italic) classes.push('italic');
          if (marks.strikethrough) classes.push('line-through');
          if (marks.underlined) classes.push('underline');
          if (marks.color) {
            const color = marks.color.toLowerCase();
            if (Object.keys(MINECRAFT_COLOR_MAP).indexOf(color) !== -1)
              classes.push(MINECRAFT_COLOR_MAP[color]);
            else
              customCSS['color'] = color;
          }
        }

        return <span class={classes.join(' ')} style={customCSS}>{text}</span>
      })}
    </div>
  );
};
