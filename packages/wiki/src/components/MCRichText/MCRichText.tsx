import { RichTextParagraph } from './Paragraph';
import type { RichTextDocument } from '@manosaba/types';

type MCRichTextProps = {
  document?: RichTextDocument
};

export const MCRichText = ({
  document
}: MCRichTextProps) => {
  return (
    <>
      {!!document ? (
        <div class="mc-rich-text-container">
          {document.blocks.map((block) => {
            if (block.type === 'paragraph') return (
              <RichTextParagraph children={block.children} />
            );
          })}
        </div>
      ) : null}
    </>
  );
};
