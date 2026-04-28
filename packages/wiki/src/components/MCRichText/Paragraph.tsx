import type { RichTextSpan } from '@manosaba/types';

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
        let classes = [ "mc-rich-text-span" ];
        if (marks) {
          if (marks.bold) classes.push('mc-bold');
          if (marks.italic) classes.push('mc-italic');
          if (marks.strikethrough) classes.push('mc-delete');
          if (marks.underlined) classes.push('mc-underline');
          if (marks.color) classes.push(`mc-color-${marks.color.replaceAll('_', '-').toLowerCase()}`);
        }

        return <span class={classes.join(' ')}>{text}</span>
      })}
    </div>
  );
};
