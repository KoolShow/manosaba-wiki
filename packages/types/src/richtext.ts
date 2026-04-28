
export interface RichTextMarks {
  color?: string,
  bold?: boolean,
  italic?: boolean,
  underlined?: boolean,
  strikethrough?: boolean,
  obfuscated?: boolean,
}

export interface RichTextSpan {
  text: string,
  marks?: RichTextMarks,
}

export interface RichTextBlock {
  type: 'paragraph',
  children: RichTextSpan[],
}

export interface RichTextDocument {
  type: 'doc',
  blocks: RichTextBlock[],
}
