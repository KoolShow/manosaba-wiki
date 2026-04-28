import { parseSnbtLike } from '../utils/snbt';
import { splitTopLevelLoreEntries } from './lore';
import type { RichTextBlock, RichTextDocument, RichTextMarks, RichTextSpan } from '@manosaba/types';

const isEmptyTextNode = (value: unknown): boolean => {
  return typeof value === 'string'
    ? value.trim() === ''
    : value !== null
      && typeof value === 'object'
      && Reflect.get(value, 'text') === ''
      && !Reflect.get(value, 'extra');
};

const buildMarks = (value: Record<string, unknown>): RichTextMarks | undefined => {
  const marks: RichTextMarks = {};

  if (typeof value.color === 'string') marks.color = value.color;
  if (typeof value.bold === 'boolean') marks.bold = value.bold;
  if (typeof value.italic === 'boolean') marks.italic = value.italic;
  if (typeof value.underlined === 'boolean') marks.underlined = value.underlined;
  if (typeof value.strikethrough === 'boolean') marks.strikethrough = value.strikethrough;
  if (typeof value.obfuscated === 'boolean') marks.obfuscated = value.obfuscated;

  return Object.keys(marks).length > 0 ? marks : undefined;
};

const flattenComponent = (value: unknown): RichTextSpan[] => {
  if (typeof value === 'string') {
    return value.trim() ? [{ text: value }] : [];
  }

  if (Array.isArray(value)) {
    return value.flatMap(flattenComponent);
  }

  if (value !== null && typeof value === 'object') {
    const record = value as Record<string, unknown>;
    const spans: RichTextSpan[] = [];
    const text = typeof record.text === 'string' ? record.text : '';
    const marks = buildMarks(record);

    if (text) {
      spans.push({ text, marks });
    }

    if (record.extra) {
      spans.push(...flattenComponent(record.extra));
    }

    return spans;
  }

  return [];
};

const buildBlock = (entry: string): RichTextBlock | undefined => {
  const parsed = parseSnbtLike(entry) ?? entry;
  if (isEmptyTextNode(parsed)) {
    return undefined;
  }

  const children = flattenComponent(parsed);
  if (children.length === 0) {
    return undefined;
  }

  return {
    type: 'paragraph',
    children,
  };
};

export const buildRichTextFromLore = (loreRaw?: string): RichTextDocument | undefined => {
  if (!loreRaw) return undefined;

  const trimmed = loreRaw.trim();
  if (!trimmed.startsWith('[') || !trimmed.endsWith(']')) {
    return undefined;
  }

  const blocks = splitTopLevelLoreEntries(trimmed)
    .map(buildBlock)
    .filter((block): block is RichTextBlock => Boolean(block));

  const contentBlocks = blocks.length > 1 ? blocks.slice(0, -1) : blocks;

  if (contentBlocks.length === 0) {
    return undefined;
  }

  return {
    type: 'doc',
    blocks: contentBlocks,
  };
};
